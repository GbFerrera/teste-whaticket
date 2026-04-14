import { Op } from "sequelize";
import Company from "../../models/Company";
import Automation from "../../models/Automation";
import AutomationExecution from "../../models/AutomationExecution";
import AutomationAction from "../../models/AutomationAction";
import AutomationLog from "../../models/AutomationLog";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import logger from "../../utils/logger";
import { executeAction, getCampaignSettings, isWithinDispatchHours, processAutomationForContact } from "./ProcessAutomationService";
import processBirthdayAutomations from "./TriggerBirthdayService";
import { processKanbanTimeAutomations } from "./TriggerKanbanService";
import processNoResponseAutomations from "./TriggerNoResponseService";

// Executar automações agendadas que estão pendentes
export const executeScheduledAutomations = async (): Promise<void> => {
  try {
    const now = new Date();

    // Buscar execuções agendadas que já passaram do horário
    const executions = await AutomationExecution.findAll({
      where: {
        status: "scheduled",
        scheduledAt: { [Op.lte]: now }
      },
      include: [
        { model: AutomationAction, as: "automationAction" },
        { model: Contact, as: "contact" },
        { model: Ticket, as: "ticket" }
      ],
      limit: 100,
      order: [["scheduledAt", "ASC"]]
    });

    if (executions.length === 0) {
      return;
    }

    logger.info(`[Automation Job] Processando ${executions.length} execuções agendadas`);

    for (const execution of executions) {
      try {
        // Marcar como em execução
        await execution.update({
          status: "running",
          attempts: execution.attempts + 1,
          lastAttemptAt: new Date()
        });

        const action = execution.automationAction;
        const contact = execution.contact;
        const ticket = execution.ticket;

        if (!action || !contact) {
          await execution.update({
            status: "failed",
            error: "Ação ou contato não encontrado"
          });
          continue;
        }

        // Executar a ação
        const result = await executeAction(action, contact, ticket, contact.companyId);

        // Atualizar execução
        await execution.update({
          status: result.success ? "completed" : "failed",
          completedAt: result.success ? new Date() : null,
          error: result.success ? null : result.message
        });

        // Atualizar log
        await AutomationLog.update(
          {
            status: result.success ? "completed" : "failed",
            executedAt: new Date(),
            result: result,
            error: result.success ? null : result.message
          },
          {
            where: {
              automationId: execution.automationId,
              contactId: contact.id,
              status: "pending"
            }
          }
        );

        logger.info(`[Automation Job] Execução ${execution.id} ${result.success ? "concluída" : "falhou"}: ${result.message}`);
      } catch (error: any) {
        await execution.update({
          status: "failed",
          error: error.message
        });
        logger.error(`[Automation Job] Erro na execução ${execution.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    logger.error(`[Automation Job] Erro geral: ${error.message}`);
  }
};

const getActiveCompanyIds = async (): Promise<number[]> => {
  const companies = await Company.findAll({
    where: { status: true },
    attributes: ["id"]
  });
  return companies.map(company => company.id);
};

const runPerCompany = async (
  jobLabel: string,
  triggerType: string,
  handler: (companyId: number) => Promise<void>
): Promise<void> => {
  const companyIds = await getActiveCompanyIds();

  for (const companyId of companyIds) {
    try {
      const settings = await getCampaignSettings(companyId);
      if (!isWithinDispatchHours(settings, triggerType)) {
        logger.debug(
          `[Automation Job] Empresa ${companyId} fora da janela para ${jobLabel} (${triggerType})`
        );
        continue;
      }
      await handler(companyId);
    } catch (error: any) {
      logger.error(`[Automation Job] Erro na empresa ${companyId} (${jobLabel}): ${error.message}`);
    }
  }
};

// Processar todos os tipos de automações (exceto as que já têm jobs específicos)
export const runAllAutomationsJob = async (): Promise<void> => {
  try {
    logger.info("[Automation Job] Processando todos os tipos de automações...");
    
    const companyIds = await getActiveCompanyIds();
    
    for (const companyId of companyIds) {
      try {
        const settings = await getCampaignSettings(companyId);
        
        // Buscar automações ativas que não são dos tipos já processados separadamente
        const automations = await Automation.findAll({
          where: {
            companyId,
            isActive: true,
            triggerType: {
              [Op.notIn]: ["birthday", "no_response", "kanban_time", "kanban_stage"]
            }
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

        if (automations.length > 0) {
          logger.info(`[Automation Job] ${automations.length} automações encontradas para empresa ${companyId}`);
          
          for (const automation of automations) {
            try {
              // Verificar janela de disparo
              if (!isWithinDispatchHours(settings, automation.triggerType)) {
                logger.debug(`[Automation Job] Automação ${automation.id} fora da janela de disparo`);
                continue;
              }
              
              // Buscar contatos baseado no trigger type
              let contacts = [];
              
              switch (automation.triggerType) {
                case "message_received":
                  // Buscar contatos com mensagens recentes não processadas
                  break;
                case "manual":
                  // Automações manuais são criadas sob demanda
                  continue;
                default:
                  logger.warn(`[Automation Job] Trigger type não implementado: ${automation.triggerType}`);
                  continue;
              }
              
              // Processar cada contato
              for (const contact of contacts) {
                try {
                  await processAutomationForContact(automation, contact, null);
                  logger.info(`[Automation Job] Automação ${automation.id} processada para contato ${contact.id}`);
                } catch (error: any) {
                  logger.error(`[Automation Job] Erro ao processar automação ${automation.id} para contato ${contact.id}: ${error.message}`);
                }
              }
            } catch (error: any) {
              logger.error(`[Automation Job] Erro na automação ${automation.id}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        logger.error(`[Automation Job] Erro na empresa ${companyId}: ${error.message}`);
      }
    }
    
    logger.info("[Automation Job] Processamento de todas as automações concluído");
  } catch (error: any) {
    logger.error(`[Automation Job] Erro geral: ${error.message}`);
  }
};

// Apenas processa execuções agendadas
export const runAutomationJob = async (): Promise<void> => {
  try {
    logger.info("[Automation Job] Executando fila de execuções agendadas...");
    await executeScheduledAutomations();
    logger.info("[Automation Job] Execuções agendadas concluídas");
  } catch (error: any) {
    logger.error(`[Automation Job] Erro geral: ${error.message}`);
  }
};

export const runBirthdayAutomationJob = async (): Promise<void> => {
  logger.info("[Automation Birthday Job] Iniciando processamento...");
  await runPerCompany("birthday", "birthday", processBirthdayAutomations);
  logger.info("[Automation Birthday Job] Processamento concluído");
};

export const runKanbanAutomationJob = async (): Promise<void> => {
  logger.info("[Automation Kanban Job] Iniciando processamento...");
  await runPerCompany("kanban_time", "kanban_time", processKanbanTimeAutomations);
  logger.info("[Automation Kanban Job] Processamento concluído");
};

export const runNoResponseAutomationJob = async (): Promise<void> => {
  logger.info("[Automation NoResponse Job] Iniciando processamento...");
  await runPerCompany("no_response", "no_response", processNoResponseAutomations);
  logger.info("[Automation NoResponse Job] Processamento concluído");
};

export default runAutomationJob;
