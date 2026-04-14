import { Op } from "sequelize";
import { sub } from "date-fns";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import { isNil } from "lodash";
import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "./CreateLogTicketService";
import AppError from "../../errors/AppError";
import UpdateTicketService from "./UpdateTicketService";
import resolveLeadClientForContact from "./helpers/resolveLeadClientForContact";
import { FindDuplicateContact } from "../ContactServices/ContactDeduplicationService";

// interface Response {
//   ticket: Ticket;
//   // isCreated: boolean;
// }

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsapp: Whatsapp,
  unreadMessages: number,
  companyId: number,
  queueId: number = null,
  userId: number = null,
  groupContact?: Contact,
  channel?: string,
  isImported?: boolean,
  isForward?: boolean,
  settings?: any,
  isTransfered?: boolean,
  isCampaign: boolean = false
): Promise<Ticket> => {
  // try {
  // let isCreated = false;

  let openAsLGPD = false;
  if (settings.enableLGPD) {
    //adicionar lgpdMessage

    openAsLGPD =
      !isCampaign &&
      !isTransfered &&
      settings.enableLGPD === "enabled" &&
      settings.lgpdMessage !== "" &&
      (settings.lgpdConsent === "enabled" ||
        (settings.lgpdConsent === "disabled" &&
          isNil(contact?.lgpdAcceptedAt)));
  }

  const io = getIO();

  // 🔍 Verificar se contato tem duplicado mais adequado antes de criar ticket
  const betterContact = await FindDuplicateContact({
    number: contact.number,
    lid: contact.lid,
    remoteJid: contact.remoteJid,
    companyId,
    excludeId: contact.id
  });
  
  if (betterContact && betterContact.id !== contact.id) {
    logger.info(`Using better contact for ticket: ${betterContact.id} instead of ${contact.id}`);
    contact = betterContact;
  }

  const DirectTicketsToWallets = settings.DirectTicketsToWallets;
  const baseContactId = groupContact ? groupContact.id : contact.id;
  const { leadId, clientId } = await resolveLeadClientForContact(
    baseContactId,
    companyId
  );

  // 🔍 BUSCA INTELIGENTE DE TICKETS (RESOLVE @lid)
  let ticket = null;
  
  // 1️⃣ Busca principal por contactId
  ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "group", "nps", "lgpd"]
      },
      contactId: baseContactId,
      companyId,
      whatsappId: whatsapp.id
    },
    order: [["id", "DESC"]]
  });

  // 2️⃣ Se não encontrou E contato tem LID, busca por LID
  if (!ticket && contact.lid) {
    logger.info(`🔍 Buscando ticket por LID: ${contact.lid}`);
    
    // Buscar outros contatos com mesmo LID
    const contactsWithSameLid = await Contact.findAll({
      where: {
        lid: contact.lid,
        companyId,
        id: { [Op.ne]: contact.id } // Excluir contato atual
      }
    });

    // Para cada contato com mesmo LID, buscar tickets
    for (const lidContact of contactsWithSameLid) {
      const lidTicket = await Ticket.findOne({
        where: {
          status: {
            [Op.or]: ["open", "pending", "group", "nps", "lgpd"]
          },
          contactId: lidContact.id,
          companyId,
          whatsappId: whatsapp.id
        },
        order: [["id", "DESC"]]
      });

      if (lidTicket) {
        logger.info(`✅ Ticket encontrado por LID: ${lidTicket.id} (contactId: ${lidContact.id})`);
        ticket = lidTicket;
        
        // 🔄 ATUALIZAR TICKET para usar o contato correto
        await ticket.update({
          contactId: baseContactId // Usa o contactId correto
        });
        
        break; // Encontrou, para de buscar
      }
    }
  }

  // 3️⃣ Se ainda não encontrou, busca por remoteJid (contatos @lid)
  if (!ticket && contact.remoteJid && contact.remoteJid.includes("@lid")) {
    logger.info(`🔍 Buscando ticket por remoteJid @lid: ${contact.remoteJid}`);
    
    const lidDigits = contact.remoteJid.split("@")[0];
    const contactsByRemoteJid = await Contact.findAll({
      where: {
        remoteJid: { [Op.like]: `%${lidDigits}@%` },
        companyId,
        id: { [Op.ne]: contact.id }
      }
    });

    for (const remoteJidContact of contactsByRemoteJid) {
      const remoteJidTicket = await Ticket.findOne({
        where: {
          status: {
            [Op.or]: ["open", "pending", "group", "nps", "lgpd"]
          },
          contactId: remoteJidContact.id,
          companyId,
          whatsappId: whatsapp.id
        },
        order: [["id", "DESC"]]
      });

      if (remoteJidTicket) {
        logger.info(`✅ Ticket encontrado por remoteJid: ${remoteJidTicket.id} (contactId: ${remoteJidContact.id})`);
        ticket = remoteJidTicket;
        
        // 🔄 ATUALIZAR TICKET para usar o contato correto
        await ticket.update({
          contactId: baseContactId
        });
        
        break;
      }
    }
  }

  if (ticket) {
    if (isCampaign) {
      await ticket.update({
        userId: userId !== ticket.userId ? ticket.userId : userId,
        queueId: queueId !== ticket.queueId ? ticket.queueId : queueId
      });
    } else {
      await ticket.update({
        unreadMessages,
        isBot: false,
        crmLeadId: leadId ?? ticket.crmLeadId,
        crmClientId: clientId ?? ticket.crmClientId
      });
    }

    ticket = await ShowTicketService(ticket.id, companyId);
    // console.log(ticket.id)

    if (!isCampaign && !isForward) {
      // @ts-ignore: Unreachable code error
      if (
        (Number(ticket?.userId) !== Number(userId) &&
          Number(userId) !== 0 &&
          !isNil(userId) &&
          !ticket.isGroup) ||
        // @ts-ignore: Unreachable code error
        (Number(ticket?.queueId) !== Number(queueId) &&
          Number(queueId) !== 0 &&
          !isNil(queueId))
      ) {
        throw new AppError(
          `Ticket em outro atendimento. ${
            "Atendente: " + ticket?.user?.name
          } - ${"Fila: " + ticket?.queue?.name}`
        );
      }
    }

    // isCreated = true;

    return ticket;
  }

  // REAPROVEITA SEMPRE O TICKET MAIS RECENTE (EVITA DUPLICAR CONVERSAS)
  const shouldOpenAsLGPD =
    !isImported &&
    !isNil(settings.enableLGPD) &&
    openAsLGPD &&
    !groupContact;

  const defaultStatus = shouldOpenAsLGPD
    ? "lgpd"
    : whatsapp.groupAsTicket === "enabled" || !groupContact
    ? "pending"
    : "group";

  const ticketData: any = {
    contactId: baseContactId,
    status: defaultStatus,
    isGroup: !!groupContact,
    unreadMessages,
    whatsappId: whatsapp.id,
    companyId,
    isBot: groupContact ? false : true,
    channel,
    imported: isImported ? new Date() : null,
    isActiveDemand: false,
    crmLeadId: leadId,
    crmClientId: clientId
  };

  if (DirectTicketsToWallets && contact.id) {
    const wallet: any = contact;
    const wallets = await wallet.getWallets();
    if (wallets && wallets[0]?.id) {
      ticketData.status = shouldOpenAsLGPD
        ? "lgpd"
        : whatsapp.groupAsTicket === "enabled" || !groupContact
        ? "open"
        : "group";
      ticketData.userId = wallets[0].id;
    }
  }

  let reusedTicket = false;

  if (!ticket) {
    // Reabertura de ticket quando não há nenhum aberto
    // Para Facebook/Instagram, não dependemos de whatsappId, usamos channel
    const baseWhere: any = {
      contactId: contact.id,
      companyId
    };

    if (channel === "facebook" || channel === "instagram") {
      baseWhere.channel = channel;
    } else {
      baseWhere.whatsappId = whatsapp.id;
    }

    ticket = await Ticket.findOne({
      where: baseWhere,
      order: [["updatedAt", "DESC"]]
    });

    if (ticket && ["closed", "nps", "lgpd"].includes(ticket.status)) {
      const reopenData: any = {
        status: "pending",
        unreadMessages,
        companyId,
        isBot: false,
        crmLeadId: leadId ?? ticket.crmLeadId,
        crmClientId: clientId ?? ticket.crmClientId
      };

      // Tratar queueId = 0 como "sem fila" para não violar FK
      if (queueId != 0 && !isNil(queueId)) {
        reopenData.queueId = queueId;
      }

      // Tratar userId = 0 como "sem usuário" para não violar FK
      if (userId != 0 && !isNil(userId)) {
        reopenData.userId = userId;
      }

      await ticket.update(reopenData);
      await ticket.reload();
      reusedTicket = true;
    }
  }

  if (!ticket) {
    ticket = await Ticket.findOne({
      where: {
        contactId: baseContactId,
        companyId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      const reopenData: any = {
        ...ticketData,
        status: ticketData.status === "group" && !ticket.isGroup ? "pending" : ticketData.status,
        isBot: groupContact ? false : false
      };

      if (!isNil(queueId)) {
        reopenData.queueId = queueId;
      }

      if (!isNil(userId)) {
        reopenData.userId = userId;
      }

      await ticket.update(reopenData);
      await ticket.reload();
      reusedTicket = true;
    }
  }

  if (!ticket) {
    console.log("Criando ticket", ticketData);

    ticket = await Ticket.create(ticketData);

    // await FindOrCreateATicketTrakingService({
    //   ticketId: ticket.id,
    //   companyId,
    //   whatsappId: whatsapp.id,
    //   userId: userId ? userId : ticket.userId
    // });
  }

  if (queueId != 0 && !isNil(queueId)) {
    //Determina qual a fila esse ticket pertence.
    await ticket.update({ queueId: queueId });
  }

  if (userId != 0 && !isNil(userId)) {
    //Determina qual a fila esse ticket pertence.
    await ticket.update({ userId: userId });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  await CreateLogTicketService({
    ticketId: ticket.id,
    type: shouldOpenAsLGPD ? "lgpd" : reusedTicket ? "reopen" : "create"
  });

  return ticket;
};

export default FindOrCreateTicketService;
