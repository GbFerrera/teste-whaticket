import { Op } from "sequelize";
import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import AutomationExecution from "../../models/AutomationExecution";
import AutomationLog from "../../models/AutomationLog";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import ContactTag from "../../models/ContactTag";
import CampaignSetting from "../../models/CampaignSetting";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import moment from "moment";

interface AutomationWindowConfig {
  startHour?: string;
  endHour?: string;
  sabado?: boolean;
  domingo?: boolean;
}

interface CampaignSettings {
  messageInterval: number;
  longerIntervalAfter: number;
  greaterInterval: number;
  sabado: boolean;
  domingo: boolean;
  startHour: string;
  endHour: string;
  automationWindows: Record<string, AutomationWindowConfig>;
}

const AUTOMATION_WINDOW_REGEX = /^automation_(.+)_(startHour|endHour|sabado|domingo)$/;

const INSTANT_ACTIONS = new Set([
  "add_tag",
  "remove_tag",
  "move_kanban",
  "transfer_queue",
  "transfer_user",
  "close_ticket"
]);

// Buscar configurações de disparo da empresa
export const getCampaignSettings = async (companyId: number): Promise<CampaignSettings> => {
  const settings = await CampaignSetting.findAll({
    where: { companyId },
    attributes: ["key", "value"]
  });

  let config: CampaignSettings = {
    messageInterval: 20,
    longerIntervalAfter: 20,
    greaterInterval: 60,
    sabado: false,
    domingo: false,
    startHour: "08:00",
    endHour: "18:00",
    automationWindows: {}
  };

  settings.forEach(setting => {
    try {
      const automationMatch = setting.key.match(AUTOMATION_WINDOW_REGEX);
      if (automationMatch) {
        const [, triggerType, field] = automationMatch;
        const windowConfig =
          config.automationWindows[triggerType] ||
          (config.automationWindows[triggerType] = {});

        if (field === "startHour" || field === "endHour") {
          windowConfig[field] = setting.value;
        } else {
          windowConfig[field] = JSON.parse(setting.value);
        }
        return;
      }

      if (setting.key === "messageInterval") config.messageInterval = JSON.parse(setting.value);
      if (setting.key === "longerIntervalAfter") config.longerIntervalAfter = JSON.parse(setting.value);
      if (setting.key === "greaterInterval") config.greaterInterval = JSON.parse(setting.value);
      if (setting.key === "sabado") config.sabado = JSON.parse(setting.value);
      if (setting.key === "domingo") config.domingo = JSON.parse(setting.value);
      if (setting.key === "startHour") config.startHour = setting.value;
      if (setting.key === "endHour") config.endHour = setting.value;
    } catch (e) {}
  });

  return config;
};

const resolveWindow = (
  settings: CampaignSettings,
  triggerType?: string
): Required<AutomationWindowConfig> => {
  const windowConfig = (triggerType && settings.automationWindows[triggerType]) || {};

  return {
    startHour: windowConfig.startHour ?? settings.startHour,
    endHour: windowConfig.endHour ?? settings.endHour,
    sabado: windowConfig.sabado ?? settings.sabado,
    domingo: windowConfig.domingo ?? settings.domingo
  };
};

// Verificar se está dentro do horário de disparo
export const isWithinDispatchHours = (
  settings: CampaignSettings,
  triggerType?: string
): boolean => {
  const windowConfig = resolveWindow(settings, triggerType);
  const now = moment();
  const dayOfWeek = now.day();

  // Verificar sábado e domingo
  if (dayOfWeek === 6 && !windowConfig.sabado) return false;
  if (dayOfWeek === 0 && !windowConfig.domingo) return false;

  // Verificar horário
  const currentTime = now.format("HH:mm");
  return currentTime >= windowConfig.startHour && currentTime <= windowConfig.endHour;
};

export const getNextDispatchDate = (
  settings: CampaignSettings,
  triggerType?: string
): Date => {
  const windowConfig = resolveWindow(settings, triggerType);
  const next = moment();

  const [startHour, startMinute] = windowConfig.startHour.split(":").map(Number);
  const [endHour, endMinute] = windowConfig.endHour.split(":").map(Number);

  while (true) {
    const day = next.day();
    if ((day === 6 && !windowConfig.sabado) || (day === 0 && !windowConfig.domingo)) {
      next.add(1, "day").startOf("day");
      continue;
    }

    const startOfWindow = next.clone().startOf("day").add(startHour, "hours").add(startMinute, "minutes");
    const endOfWindow = next.clone().startOf("day").add(endHour, "hours").add(endMinute, "minutes");

    if (next.isBefore(startOfWindow)) {
      return startOfWindow.toDate();
    }

    if (next.isBefore(endOfWindow)) {
      return next.toDate();
    }

    next.add(1, "day").startOf("day");
  }
};

// Calcular delay baseado nas configurações
const calculateDelay = (settings: CampaignSettings, messageCount: number): number => {
  if (messageCount >= settings.longerIntervalAfter) {
    return settings.greaterInterval;
  }
  return settings.messageInterval;
};

// Executar ação de enviar mensagem
const executeActionSendMessage = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { message, mediaUrl } = action.actionConfig;

    if (!ticket) {
      return { success: false, message: "Ticket não encontrado" };
    }

    // Substituir variáveis na mensagem
    let finalMessage = message || "";
    finalMessage = finalMessage.replace(/\{\{nome\}\}/gi, contact.name || "");
    finalMessage = finalMessage.replace(/\{\{numero\}\}/gi, contact.number || "");
    finalMessage = finalMessage.replace(/\{\{email\}\}/gi, contact.email || "");

    await SendWhatsAppMessage({ body: finalMessage, ticket });

    return { success: true, message: "Mensagem enviada com sucesso" };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao enviar mensagem: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de adicionar tag
const executeActionAddTag = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { tagId } = action.actionConfig;

    if (!tagId) {
      return { success: false, message: "Tag não especificada" };
    }

    const tag = await Tag.findOne({ where: { id: tagId, companyId } });
    if (!tag) {
      return { success: false, message: "Tag não encontrada" };
    }

    // Adicionar tag ao contato
    await ContactTag.findOrCreate({
      where: { contactId: contact.id, tagId: tag.id },
      defaults: { contactId: contact.id, tagId: tag.id }
    });

    // Adicionar tag ao ticket se existir
    if (ticket) {
      await TicketTag.findOrCreate({
        where: { ticketId: ticket.id, tagId: tag.id },
        defaults: { ticketId: ticket.id, tagId: tag.id }
      });
    }

    return { success: true, message: `Tag "${tag.name}" adicionada` };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao adicionar tag: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de remover tag
const executeActionRemoveTag = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { tagId } = action.actionConfig;

    if (!tagId) {
      return { success: false, message: "Tag não especificada" };
    }

    await ContactTag.destroy({
      where: { contactId: contact.id, tagId }
    });

    if (ticket) {
      await TicketTag.destroy({
        where: { ticketId: ticket.id, tagId }
      });
    }

    return { success: true, message: "Tag removida" };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao remover tag: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de mover no Kanban
const executeActionMoveKanban = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { tagId } = action.actionConfig; // tagId representa a lane do kanban

    if (!ticket) {
      return { success: false, message: "Ticket não encontrado" };
    }

    const tag = await Tag.findOne({ where: { id: tagId, companyId } });
    if (!tag) {
      return { success: false, message: "Lane do Kanban não encontrada" };
    }

    // Remover tags kanban anteriores
    await TicketTag.destroy({
      where: { ticketId: ticket.id }
    });

    // Adicionar nova tag kanban
    await TicketTag.create({
      ticketId: ticket.id,
      tagId: tag.id
    });

    return { success: true, message: `Movido para "${tag.name}"` };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao mover no Kanban: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de transferir para fila
const executeActionTransferQueue = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { queueId } = action.actionConfig;

    if (!ticket) {
      return { success: false, message: "Ticket não encontrado" };
    }

    await UpdateTicketService({
      ticketData: { queueId },
      ticketId: ticket.id,
      companyId
    });

    return { success: true, message: "Transferido para fila" };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao transferir para fila: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de transferir para usuário
const executeActionTransferUser = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { userId } = action.actionConfig;

    if (!ticket) {
      return { success: false, message: "Ticket não encontrado" };
    }

    await UpdateTicketService({
      ticketData: { userId, status: "open" },
      ticketId: ticket.id,
      companyId
    });

    return { success: true, message: "Transferido para atendente" };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao transferir para usuário: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar ação de fechar ticket
const executeActionCloseTicket = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!ticket) {
      return { success: false, message: "Ticket não encontrado" };
    }

    await UpdateTicketService({
      ticketData: { status: "closed" },
      ticketId: ticket.id,
      companyId
    });

    return { success: true, message: "Ticket fechado" };
  } catch (error: any) {
    logger.error(`[Automation] Erro ao fechar ticket: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Executar uma ação específica
export const executeAction = async (
  action: AutomationAction,
  contact: Contact,
  ticket: Ticket | null,
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  switch (action.actionType) {
    case "send_message":
      return executeActionSendMessage(action, contact, ticket, companyId);
    case "add_tag":
      return executeActionAddTag(action, contact, ticket, companyId);
    case "remove_tag":
      return executeActionRemoveTag(action, contact, ticket, companyId);
    case "move_kanban":
      return executeActionMoveKanban(action, contact, ticket, companyId);
    case "transfer_queue":
      return executeActionTransferQueue(action, contact, ticket, companyId);
    case "transfer_user":
      return executeActionTransferUser(action, contact, ticket, companyId);
    case "close_ticket":
      return executeActionCloseTicket(action, contact, ticket, companyId);
    case "wait":
      return { success: true, message: "Aguardando..." };
    default:
      return { success: false, message: `Ação desconhecida: ${action.actionType}` };
  }
};

// Processar automação completa para um contato
export const processAutomationForContact = async (
  automation: Automation,
  contact: Contact,
  ticket: Ticket | null
): Promise<void> => {
  const companyId = automation.companyId;
  const settings = await getCampaignSettings(companyId);

  const actions = await AutomationAction.findAll({
    where: { automationId: automation.id },
    order: [["order", "ASC"]]
  });

  let messageCount = 0;

  for (const action of actions) {
    const isInstantAction = INSTANT_ACTIONS.has(action.actionType);

    if (isInstantAction) {
      const result = await executeAction(action, contact, ticket, companyId);

      await AutomationLog.create({
        automationId: automation.id,
        contactId: contact.id,
        ticketId: ticket?.id,
        status: result.success ? "completed" : "failed",
        executedAt: new Date(),
        result,
        error: result.success ? null : result.message
      });

      if (!result.success) {
        logger.warn(`[Automation] Ação instantânea ${action.actionType} falhou: ${result.message}`);
      }
      continue;
    }

    const anchorMoment = isWithinDispatchHours(settings, automation.triggerType)
      ? moment()
      : moment(getNextDispatchDate(settings, automation.triggerType));

    const delaySeconds =
      action.delayMinutes > 0
        ? action.delayMinutes * 60
        : calculateDelay(settings, messageCount);

    const scheduledAt = anchorMoment.clone().add(delaySeconds, "seconds").toDate();

    const execution = await AutomationExecution.create({
      automationId: automation.id,
      automationActionId: action.id,
      contactId: contact.id,
      ticketId: ticket?.id,
      scheduledAt,
      status: "scheduled",
      metadata: { actionType: action.actionType }
    });

    await AutomationLog.create({
      automationId: automation.id,
      contactId: contact.id,
      ticketId: ticket?.id,
      status: "pending",
      result: { executionId: execution.id, actionType: action.actionType }
    });

    if (action.actionType === "send_message") {
      messageCount++;
    }
  }

  logger.info(`[Automation] ${actions.length} ações agendadas para automação ${automation.id}, contato ${contact.id}`);
};

// Buscar automações por gatilho
export const getAutomationsByTrigger = async (
  companyId: number,
  triggerType: string
): Promise<Automation[]> => {
  return Automation.findAll({
    where: {
      companyId,
      triggerType,
      isActive: true
    },
    include: [
      {
        model: AutomationAction,
        as: "actions",
        separate: true,
        order: [["order", "ASC"]]
      }
    ]
  });
};

