import { Op } from "sequelize";
import moment from "moment";
import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import logger from "../../utils/logger";
import { processAutomationForContact } from "./ProcessAutomationService";

// Processar automações de "sem resposta" (lead não respondeu há X horas)
export const processNoResponseAutomations = async (companyId: number): Promise<void> => {
  try {
    // Buscar automações de no_response ativas
    const automations = await Automation.findAll({
      where: {
        companyId,
        triggerType: "no_response",
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
      const { hoursWithoutResponse, onlyOpenTickets } = automation.triggerConfig || {};

      if (!hoursWithoutResponse) {
        continue;
      }

      // Calcular data limite
      const limitDate = moment().subtract(hoursWithoutResponse, "hours").toDate();

      // Condição de status do ticket
      const statusCondition = onlyOpenTickets 
        ? { status: "open" }
        : { status: { [Op.notIn]: ["closed", "lgpd", "nps"] } };

      // Buscar tickets que não receberam resposta do cliente
      const tickets = await Ticket.findAll({
        where: {
          companyId,
          ...statusCondition,
          updatedAt: { [Op.lte]: limitDate }
        },
        include: [
          { model: Contact, as: "contact" }
        ]
      });

      for (const ticket of tickets) {
        // Verificar se a última mensagem foi enviada pela empresa (fromMe = true)
        const lastMessage = await Message.findOne({
          where: { ticketId: ticket.id },
          order: [["createdAt", "DESC"]]
        });

        // Se a última mensagem foi do cliente, não disparar
        if (lastMessage && !lastMessage.fromMe) {
          continue;
        }

        // Se a última mensagem foi da empresa e o cliente não respondeu
        if (lastMessage && lastMessage.fromMe) {
          const messageDate = moment(lastMessage.createdAt);
          const hoursSinceMessage = moment().diff(messageDate, "hours");

          if (hoursSinceMessage >= hoursWithoutResponse) {
            try {
              await processAutomationForContact(automation, ticket.contact, ticket);
              logger.info(`[Automation NoResponse] Automação ${automation.id} processada para ticket ${ticket.id}`);
            } catch (error: any) {
              logger.error(`[Automation NoResponse] Erro: ${error.message}`);
            }
          }
        }
      }
    }
  } catch (error: any) {
    logger.error(`[Automation NoResponse] Erro geral: ${error.message}`);
  }
};

export default processNoResponseAutomations;
