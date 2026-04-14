import { Op } from "sequelize";
import moment from "moment";
import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import logger from "../../utils/logger";
import { processAutomationForContact } from "./ProcessAutomationService";

// Processar automações de tempo no Kanban (lead está X horas em uma fase)
export const processKanbanTimeAutomations = async (companyId: number): Promise<void> => {
  try {
    // Buscar automações de tempo no kanban ativas
    const automations = await Automation.findAll({
      where: {
        companyId,
        triggerType: "kanban_time",
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

    if (automations.length === 0) {
      return;
    }

    for (const automation of automations) {
      const { tagId, hoursInStage } = automation.triggerConfig || {};

      if (!tagId || !hoursInStage) {
        continue;
      }

      // Calcular data limite (tickets que estão na tag há mais de X horas)
      const limitDate = moment().subtract(hoursInStage, "hours").toDate();

      // Buscar tickets que estão na tag há mais tempo que o limite
      const ticketTags = await TicketTag.findAll({
        where: {
          tagId,
          createdAt: { [Op.lte]: limitDate }
        },
        include: [
          {
            model: Ticket,
            as: "ticket",
            where: {
              companyId,
              status: { [Op.notIn]: ["closed", "lgpd", "nps"] }
            },
            include: [
              { model: Contact, as: "contact" }
            ]
          }
        ]
      });

      for (const ticketTag of ticketTags) {
        const ticket = (ticketTag as any).ticket;
        if (!ticket || !ticket.contact) continue;

        try {
          await processAutomationForContact(automation, ticket.contact, ticket);
          logger.info(`[Automation KanbanTime] Automação ${automation.id} processada para ticket ${ticket.id}`);
        } catch (error: any) {
          logger.error(`[Automation KanbanTime] Erro: ${error.message}`);
        }
      }
    }
  } catch (error: any) {
    logger.error(`[Automation KanbanTime] Erro geral: ${error.message}`);
  }
};

// Processar automações quando lead entra em uma fase do Kanban
export const processKanbanStageAutomation = async (
  ticketId: number,
  tagId: number,
  companyId: number
): Promise<void> => {
  try {
    // Buscar automações para essa tag/fase
    const automations = await Automation.findAll({
      where: {
        companyId,
        triggerType: "kanban_stage",
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

    // Filtrar automações que correspondem à tag
    const matchingAutomations = automations.filter(a => {
      const config = a.triggerConfig || {};
      return config.tagId === tagId || config.tagIds?.includes(tagId);
    });

    if (matchingAutomations.length === 0) {
      return;
    }

    // Buscar ticket com contato
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Contact, as: "contact" }]
    });

    if (!ticket || !ticket.contact) {
      return;
    }

    for (const automation of matchingAutomations) {
      try {
        await processAutomationForContact(automation, ticket.contact, ticket);
        logger.info(`[Automation KanbanStage] Automação ${automation.id} processada para ticket ${ticketId}`);
      } catch (error: any) {
        logger.error(`[Automation KanbanStage] Erro: ${error.message}`);
      }
    }
  } catch (error: any) {
    logger.error(`[Automation KanbanStage] Erro geral: ${error.message}`);
  }
};

export default {
  processKanbanTimeAutomations,
  processKanbanStageAutomation
};
