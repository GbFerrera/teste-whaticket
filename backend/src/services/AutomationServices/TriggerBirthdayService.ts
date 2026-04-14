import { Op } from "sequelize";
import moment from "moment";
import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import { processAutomationForContact } from "./ProcessAutomationService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";

// Buscar contatos que fazem aniversário hoje
const getBirthdayContacts = async (companyId: number): Promise<Contact[]> => {
  const today = moment();
  const day = today.date();
  const month = today.month() + 1; // moment usa 0-11

  // Buscar contatos com aniversário hoje
  const contacts = await Contact.findAll({
    where: {
      companyId,
      [Op.and]: [
        { birthday: { [Op.ne]: null } }
      ]
    }
  });

  // Filtrar por dia e mês
  return contacts.filter(contact => {
    if (!contact.birthday) return false;
    const bday = moment(contact.birthday);
    return bday.date() === day && (bday.month() + 1) === month;
  });
};

// Processar automações de aniversário para uma empresa
export const processBirthdayAutomations = async (companyId: number): Promise<void> => {
  try {
    // Buscar automações de aniversário ativas
    const automations = await Automation.findAll({
      where: {
        companyId,
        triggerType: "birthday",
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

    // Buscar contatos aniversariantes
    const contacts = await getBirthdayContacts(companyId);

    if (contacts.length === 0) {
      logger.info(`[Automation Birthday] Nenhum aniversariante hoje para empresa ${companyId}`);
      return;
    }

    logger.info(`[Automation Birthday] ${contacts.length} aniversariantes encontrados para empresa ${companyId}`);

    // Buscar WhatsApp padrão
    let whatsapp: Whatsapp | null = null;
    try {
      whatsapp = await GetDefaultWhatsApp(companyId);
    } catch (e) {
      logger.error(`[Automation Birthday] Erro ao buscar WhatsApp padrão: ${e}`);
      return;
    }

    // Processar cada contato
    for (const contact of contacts) {
      for (const automation of automations) {
        try {
          // Criar ou buscar ticket para o contato
          const ticket = await FindOrCreateTicketService(
            contact,
            whatsapp!,
            0, // unreadMessages
            companyId,
            0, // queueId
            null, // userId
            null, // groupContact
            "whatsapp", // channel
            null, // wbot
            false // isImported
          );

          await processAutomationForContact(automation, contact, ticket);

          logger.info(`[Automation Birthday] Automação ${automation.id} processada para contato ${contact.id}`);
        } catch (error: any) {
          logger.error(`[Automation Birthday] Erro ao processar automação ${automation.id} para contato ${contact.id}: ${error.message}`);
        }
      }
    }
  } catch (error: any) {
    logger.error(`[Automation Birthday] Erro geral: ${error.message}`);
  }
};

export default processBirthdayAutomations;
