import Mustache from "mustache";
import { Job } from "bull";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import ScheduledDispatchLog from "../../models/ScheduledDispatchLog";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";
import Ticket from "../../models/Ticket";
import Company from "../../models/Company";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import formatBody from "../../helpers/Mustache";
import { DispatchJobData, processDispatchQueue } from "../../queues/dispatchQueue";
import logger from "../../utils/logger";

const ensureTicket = async (
  contact: Contact,
  whatsapp: Whatsapp,
  companyId: number
): Promise<Ticket> => {
  return FindOrCreateTicketService(
    contact,
    whatsapp,
    0,
    companyId,
    null,
    null,
    undefined,
    undefined,
    false
  );
};

const renderMessage = (
  template: string,
  variables: Record<string, any>,
  ticket: Ticket
) => {
  const filledTemplate = Mustache.render(template, variables || {});
  return formatBody(filledTemplate, ticket);
};

const handleDispatchJob = async (job: Job<DispatchJobData>) => {
  const {
    logId,
    dispatcherId,
    companyId,
    contactId,
    whatsappId,
    template,
    variables
  } = job.data;

  const log = await ScheduledDispatchLog.findByPk(logId);
  if (!log) {
    logger.warn(`[DispatchQueue] Log ${logId} não encontrado, ignorando job`);
    return;
  }

  try {
    const dispatcher = await ScheduledDispatcher.findByPk(dispatcherId);
    if (!dispatcher) {
      throw new Error(`Dispatcher ${dispatcherId} não encontrado`);
    }

    const contact = await Contact.findByPk(contactId, {
      include: [Company]
    });
    if (!contact) {
      throw new Error(`Contato ${contactId} não encontrado`);
    }

    if (!contact.number) {
      throw new Error(`Contato ${contactId} sem número válido`);
    }

    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new Error(`WhatsApp ${whatsappId} não encontrado`);
    }

    const ticket = await ensureTicket(contact, whatsapp, companyId);

    const message = renderMessage(template, variables, ticket);
    if (!message || !message.trim()) {
      throw new Error("Template de mensagem vazio após renderização");
    }

    await SendWhatsAppMessage({
      body: message,
      ticket
    });

    await log.update({
      status: "sent",
      ticketId: ticket.id,
      sentAt: new Date(),
      errorMessage: null
    });
  } catch (err: any) {
    const errorMessage = err?.message || JSON.stringify(err);
    await log.update({
      status: "error",
      errorMessage
    });
    logger.error(`[DispatchQueue] Falha no job ${job.id}: ${errorMessage}`);
    throw err;
  }
};

const startDispatchProcessor = () => {
  processDispatchQueue(handleDispatchJob);
  logger.info("[DispatchQueue] Processor iniciado");
};

export default startDispatchProcessor;
