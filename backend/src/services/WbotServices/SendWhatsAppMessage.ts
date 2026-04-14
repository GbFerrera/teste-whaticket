import { WAMessage, delay } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { isNil } from "lodash";

import formatBody from "../../helpers/Mustache";
import { verifyMessage } from "./wbotMessageListener";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  msdelay?: number;
  vCard?: Contact;
  isForwarded?: boolean;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  msdelay,
  vCard,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  console.log("== BODY SEND MESSAGE ==", body);
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  let contactNumber = await Contact.findByPk(ticket.contactId);

  // **CORREÇÃO: Se o contato tem temp-, buscar o contato correto pelo LID ou número**
  if (contactNumber && contactNumber.remoteJid && contactNumber.remoteJid.startsWith("temp-")) {
    console.log("[SEND MESSAGE] Contato com temp- detectado, buscando contato correto...");
    
    // Buscar contato pelo LID (se tiver)
    if (contactNumber.lid) {
      const correctContact = await Contact.findOne({
        where: {
          companyId: ticket.companyId,
          lid: contactNumber.lid,
          remoteJid: {
            [require("sequelize").Op.notLike]: "temp-%"
          }
        }
      });
      
      if (correctContact) {
        console.log("[SEND MESSAGE] Contato correto encontrado por LID:", correctContact.remoteJid);
        contactNumber = correctContact;
        
        // Atualizar o ticket para apontar para o contato correto
        await ticket.update({ contactId: correctContact.id });
        console.log("[SEND MESSAGE] Ticket atualizado para contato ID:", correctContact.id);
      }
    }
    
    // Se ainda tem temp-, buscar por número
    if (contactNumber.remoteJid.startsWith("temp-") && contactNumber.number) {
      const correctContact = await Contact.findOne({
        where: {
          companyId: ticket.companyId,
          number: contactNumber.number,
          remoteJid: {
            [require("sequelize").Op.notLike]: "temp-%"
          }
        }
      });
      
      if (correctContact) {
        console.log("[SEND MESSAGE] Contato correto encontrado por número:", correctContact.remoteJid);
        contactNumber = correctContact;
        
        // Atualizar o ticket para apontar para o contato correto
        await ticket.update({ contactId: correctContact.id });
        console.log("[SEND MESSAGE] Ticket atualizado para contato ID:", correctContact.id);
      }
    }
  }

  let number: string;

  console.log("[SEND MESSAGE] Ticket isGroup:", ticket.isGroup);
  console.log("[SEND MESSAGE] Contact remoteJid:", contactNumber.remoteJid);
  console.log("[SEND MESSAGE] Contact number:", contactNumber.number);
  console.log("[SEND MESSAGE] Contact LID:", contactNumber.lid);

  /// verificar se a mensagem é vazia, para não enviar mensagem vazia
  if (body === "" || body === undefined || formatBody(body, ticket) === "") {
    console.log("== BODY SEND MESSAGE == vazio");
    console.log("Mensagem vazia, não enviar");
    return {} as WAMessage;
  }

  // **CORREÇÃO BAILEYS 6.8.0: Sempre usar PN (Phone Number) em vez de LID**
  // LID não é confiável para envio de mensagens individuais
  if (ticket.isGroup) {
    // Para grupos, usar o remoteJid do grupo
    number = contactNumber.remoteJid;
    console.log("[SEND MESSAGE] Grupo - Usando remoteJid:", number);
  } else {
    // Para contatos individuais, SEMPRE usar o número (PN)
    if (contactNumber.number && contactNumber.number !== "") {
      // Construir JID com o número de telefone
      number = `${contactNumber.number}@s.whatsapp.net`;
      console.log("[SEND MESSAGE] Individual - Usando PN (Phone Number):", number);
    } else if (contactNumber.remoteJid && contactNumber.remoteJid.includes("@s.whatsapp.net")) {
      // Fallback: Se não tem number mas tem remoteJid válido com @s.whatsapp.net
      number = contactNumber.remoteJid;
      console.log("[SEND MESSAGE] Individual - Usando remoteJid (fallback):", number);
    } else {
      console.error("[SEND MESSAGE] ERRO: Contato sem número válido!");
      console.error("[SEND MESSAGE] Contact data:", {
        id: contactNumber.id,
        number: contactNumber.number,
        remoteJid: contactNumber.remoteJid,
        lid: contactNumber.lid
      });
      throw new Error("Contato sem número válido para envio de mensagem");
    }
  }

  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);

      if (msgFound.message.extendedTextMessage !== undefined) {
        options = {
          quoted: {
            key: msgFound.key,
            message: {
              extendedTextMessage: msgFound.message.extendedTextMessage
            }
          }
        };
      } else {
        options = {
          quoted: {
            key: msgFound.key,
            message: {
              conversation: msgFound.message.conversation
            }
          }
        };
      }
    }
  }

  if (!isNil(vCard)) {
    const numberContact = vCard.number;
    const firstName = vCard.name.split(" ")[0];
    const lastName = String(vCard.name).replace(vCard.name.split(" ")[0], "");

    const vcard =
      `BEGIN:VCARD\n` +
      `VERSION:3.0\n` +
      `N:${lastName};${firstName};;;\n` +
      `FN:${vCard.name}\n` +
      `TEL;type=CELL;waid=${numberContact}:+${numberContact}\n` +
      `END:VCARD`;

    try {
      await delay(msdelay);
      const sentMessage = await wbot.sendMessage(number, {
        contacts: {
          displayName: `${vCard.name}`,
          contacts: [{ vcard }]
        }
      });
      await ticket.update({
        lastMessage: formatBody(vcard, ticket),
        imported: null
      });
      // **Salvar mensagem enviada no banco**
      await verifyMessage(sentMessage, ticket, contactNumber);
      return sentMessage;
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }
  try {
    await delay(msdelay);
    const sentMessage = await wbot.sendMessage(
      number,
      {
        text: formatBody(body, ticket),
        contextInfo: {
          forwardingScore: isForwarded ? 2 : 0,
          isForwarded: isForwarded ? true : false
        }
      },
      {
        ...options
      }
    );
    await ticket.update({
      lastMessage: formatBody(body, ticket),
      imported: null
    });
    // **Salvar mensagem enviada no banco e emitir socket**
    await verifyMessage(sentMessage, ticket, contactNumber, undefined, false, false, false, true, ticket.userId);
    return sentMessage;
  } catch (err) {
    console.log(
      `erro ao enviar mensagem na company ${ticket.companyId} - `,
      body,
      ticket,
      quotedMsg,
      msdelay,
      vCard,
      isForwarded
    );
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
