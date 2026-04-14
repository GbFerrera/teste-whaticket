import AppError from "../../errors/AppError";

import { Op } from "sequelize";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import GetDefaultWhatsAppByUser from "../../helpers/GetDefaultWhatsAppByUser";
import Ticket from "../../models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Queue from "../../models/Queue";
import User from "../../models/User";
import resolveLeadClientForContact from "./helpers/resolveLeadClientForContact";

import CreateLogTicketService from "./CreateLogTicketService";
import ShowTicketService from "./ShowTicketService";

interface Request {
  contactId: number;
  lid?: string | null;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  whatsappId: string;
}

const CreateTicketService = async ({
  contactId,
  lid,
  status,
  userId,
  queueId,
  companyId,
  whatsappId = ""
}: Request): Promise<Ticket> => {

  const io = getIO();
  const { leadId, clientId } = await resolveLeadClientForContact(contactId, companyId);
  const contact = await ShowContactService(contactId, companyId);

  let whatsapp;
  let defaultWhatsapp

  if (whatsappId !== "undefined" && whatsappId !== null && whatsappId !== "") {
    // console.log("GETTING WHATSAPP CREATE TICKETSERVICE", whatsappId)
    whatsapp = await ShowWhatsAppService(whatsappId, companyId)
  }


  defaultWhatsapp = await GetDefaultWhatsAppByUser(userId);

  if (whatsapp) {
    defaultWhatsapp = whatsapp;
  }
  if (!defaultWhatsapp)
    defaultWhatsapp = await GetDefaultWhatsApp(whatsapp.id, companyId);

  // Verificar se existe ticket aberto/pendente para este contato
  const existingTicket = await Ticket.findOne({
    where: { 
      contactId, 
      whatsappId: defaultWhatsapp.id, 
      companyId, 
      status: { [Op.or]: ["open", "pending", "group"] } 
    }
  });

  // Se existe ticket aberto, retorna ele (independente de qual usuário)
  if (existingTicket) {
    return await ShowTicketService(existingTicket.id, companyId);
  }

  const { isGroup } = contact;

  // Sempre que possível, reutiliza o último ticket do contato
  let ticket = await Ticket.findOne({
    where: {
      contactId,
      companyId,
      whatsappId: defaultWhatsapp.id
    },
    order: [["updatedAt", "DESC"]]
  });

  if (ticket && ["closed", "nps", "lgpd"].includes(ticket.status)) {
    await ticket.update({
      whatsappId: defaultWhatsapp.id,
      channel: defaultWhatsapp.channel,
      isGroup,
      userId,
      queueId,
      status: isGroup ? "group" : "open",
      isBot: true,
      isActiveDemand: true,
      crmLeadId: leadId ?? ticket.crmLeadId,
      crmClientId: clientId ?? ticket.crmClientId
    });
  } else if (ticket && (!ticket.crmLeadId || !ticket.crmClientId)) {
    await ticket.update({
      crmLeadId: leadId ?? ticket.crmLeadId,
      crmClientId: clientId ?? ticket.crmClientId
    });
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId,
      lid: contact?.lid || lid || null,
      companyId,
      whatsappId: defaultWhatsapp.id,
      channel: defaultWhatsapp.channel,
      isGroup,
      userId,
      isBot: true,
      queueId,
      status: isGroup ? "group" : "open",
      isActiveDemand: true,
      crmLeadId: leadId,
      crmClientId: clientId
    });
  }

  // await Ticket.update(
  //   { companyId, queueId, userId, status: isGroup? "group": "open", isBot: true },
  //   { where: { id } }
  // );

  ticket = await ShowTicketService(ticket.id, companyId);

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  const shouldUpdateLid =
    (contact?.lid && contact?.lid !== ticket.lid) ||
    (lid && lid !== ticket.lid);

  if (shouldUpdateLid) {
    await ticket.update({ lid: contact?.lid || lid || null });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  io.of(String(companyId))
    // .to(ticket.status)
    // .to("notification")
    // .to(ticket.id.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket
    });

  await CreateLogTicketService({
    userId,
    queueId,
    ticketId: ticket.id,
    type: "create"
  });

  return ticket;
};

export default CreateTicketService;
