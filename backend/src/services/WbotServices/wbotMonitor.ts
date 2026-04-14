// @ts-nocheck
import {
  WASocket,
  BinaryNode,
  Contact as BContact,
  isJidBroadcast,
  isJidStatusBroadcast,
  isLidUser,
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import CallRecord from "../../models/CallRecord";
import logger from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import CompaniesSettings from "../../models/CompaniesSettings";
import { getIO } from "../../libs/socket";
import path from "path";
import { verifyMessage } from "./wbotMessageListener";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

let i = 0;

setInterval(() => {
  i = 0
}, 5000);

type Session = WASocket & {
  id?: number;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    // Map para rastrear chamadas em andamento (callId -> startTime)
    const activeCalls = new Map<string, Date>();

    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;
      const callId = content?.attrs?.["call-id"];
      const fromJid = node.attrs.from;

      if (!fromJid || fromJid.includes("@call")) return;

      await new Promise(r => setTimeout(r, i * 650));
      i++;

      const number = fromJid.split(":")[0].replace(/\D/g, "");
      const io = getIO();

      try {
        // Buscar contato
        const contact = await Contact.findOne({
          where: { companyId, number },
        });

        // === OFFER: Chamada recebida (tocando) ===
        if (content.tag === "offer") {
          const callType = content.attrs?.["call-type"] === "video" ? "video" : "voice";
          activeCalls.set(callId, new Date());

          logger.info(`[CallRecord] Chamada ${callType} recebida de ${number} (callId: ${callId})`);

          // Criar registro da chamada como "ringing"
          const callRecord = await CallRecord.create({
            callId,
            type: "incoming",
            status: "ringing",
            fromNumber: number,
            toNumber: whatsapp.number || "",
            duration: 0,
            contactId: contact?.id || null,
            whatsappId: whatsapp.id,
            companyId,
            callStartedAt: new Date(),
          });

          // Emitir evento socket para atualização em tempo real
          io.of(String(companyId)).emit(`company-${companyId}-call`, {
            action: "ringing",
            callRecord: {
              ...callRecord.toJSON(),
              contact: contact ? { id: contact.id, name: contact.name, number: contact.number, profilePicUrl: contact.profilePicUrl } : null,
            },
          });
        }

        // === TERMINATE: Chamada encerrada ===
        if (content.tag === "terminate") {
          const startTime = activeCalls.get(callId);
          const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0;
          activeCalls.delete(callId);

          // Determinar status da chamada
          const reason = content.attrs?.reason;
          let callStatus = "missed";
          if (reason === "busy") callStatus = "busy";
          else if (reason === "timeout") callStatus = "missed";
          else if (duration > 3) callStatus = "answered";

          logger.info(`[CallRecord] Chamada encerrada de ${number} - status: ${callStatus}, duração: ${duration}s (callId: ${callId})`);

          // Atualizar ou criar registro da chamada
          const existingRecord = await CallRecord.findOne({ where: { callId, companyId } });
          if (existingRecord) {
            await existingRecord.update({
              status: callStatus,
              duration,
              callEndedAt: new Date(),
            });
          } else {
            await CallRecord.create({
              callId,
              type: "incoming",
              status: callStatus,
              fromNumber: number,
              toNumber: whatsapp.number || "",
              duration,
              contactId: contact?.id || null,
              whatsappId: whatsapp.id,
              companyId,
              callStartedAt: startTime || new Date(),
              callEndedAt: new Date(),
            });
          }

          // Buscar registro atualizado para emitir
          const updatedRecord = await CallRecord.findOne({
            where: { callId, companyId },
            include: [{ model: Contact, as: "contact", attributes: ["id", "name", "number", "profilePicUrl"] }],
          });

          io.of(String(companyId)).emit(`company-${companyId}-call`, {
            action: "ended",
            callRecord: updatedRecord,
          });

          // Manter comportamento existente: enviar mensagem automática
          const settings = await CompaniesSettings.findOne({
            where: { companyId },
          });

          if (settings?.acceptCallWhatsapp === "enabled") {
            const sentMessage = await wbot.sendMessage(fromJid, {
              text: `\u200e ${settings.AcceptCallWhatsappMessage}`,
            });

            if (!contact) return;

            const ticket = await FindOrCreateTicketService(
              contact,
              whatsapp,
              0,
              companyId,
              undefined,
              undefined,
              undefined,
              "whatsapp",
              false,
              false,
              settings
            );

            if (!ticket) return;

            // Vincular ticket ao registro de chamada
            if (updatedRecord) {
              await updatedRecord.update({ ticketId: ticket.id });
            }

            await verifyMessage(sentMessage, ticket, contact);

            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();

            const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
            const messageData = {
              wid: callId,
              ticketId: ticket.id,
              contactId: contact.id,
              body,
              fromMe: false,
              mediaType: "call_log",
              read: true,
              quotedMsgId: null,
              ack: 1,
            };

            await ticket.update({ lastMessage: body });
            return CreateMessageService({ messageData, companyId });
          }
        }
      } catch (err) {
        logger.error(`[CallRecord] Erro ao processar chamada: ${err.message}`);
        Sentry.captureException(err);
      }
    });

    function cleanStringForJSON(str) {
      // Remove caracteres de controle, ", \ e '
      return str.replace(/[\x00-\x1F"\\']/g, "");
    }

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {

      console.log('📥 [CONTACTS.UPSERT] Evento disparado! Total de contatos recebidos:', contacts?.length || 0);

      const filteredContacts: any[] = [];

      try {
        Promise.all(
          contacts.map(async contact => {
            console.log('🔍 [CONTACT CHECK] Analisando contato:', {
              id: contact.id,
              name: contact.name,
              isBroadcast: isJidBroadcast(contact.id),
              isStatusBroadcast: isJidStatusBroadcast(contact.id),
              isLid: isLidUser(contact.id)
            });

            if (
              !isJidBroadcast(contact.id) &&
              !isJidStatusBroadcast(contact.id) &&
              !isLidUser(contact.id) // **CORREÇÃO: Remover dupla negação para EXCLUIR LID users**
            ) {

              const contactArray = {
                'id': contact.id,
                'name': contact.name ? cleanStringForJSON(contact.name) : contact.id.split('@')[0].split(':')[0]
              }

              console.log('✅ [CONTACT ACCEPTED] Contato aceito:', contactArray);
              filteredContacts.push(contactArray);

            }
          })
        );

        const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
        if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
          fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true })
          fs.chmodSync(path.join(publicFolder, `company${companyId}`), 0o777)
        }
        const contatcJson = path.join(publicFolder, `company${companyId}`, "contactJson.txt");
        if (fs.existsSync(contatcJson)) {
          await fs.unlinkSync(contatcJson);
        }

        await fs.promises.writeFile(contatcJson, JSON.stringify(filteredContacts, null, 2));
        
        console.log('💾 [CONTACTS SAVED] Contatos salvos em arquivo:', {
          total: filteredContacts.length,
          path: contatcJson
        });
      } catch (err) {
        Sentry.captureException(err);
        logger.error(`Erro contacts.upsert: ${JSON.stringify(err)}`);
      }

      try {
        console.log('📤 [BAILEYS SAVE] Salvando contatos no banco Baileys...', {
          whatsappId: whatsapp.id,
          totalContacts: filteredContacts.length
        });

        await createOrUpdateBaileysService({
          whatsappId: whatsapp.id,
          contacts: filteredContacts,
        });
        
        console.log('✅ [BAILEYS SAVED] Contatos salvos com sucesso no banco Baileys!');
      } catch (err) {
        console.log('❌ [BAILEYS ERROR] Erro ao salvar contatos:', err);
        console.log('Contatos que tentaram ser salvos:', filteredContacts);
        logger.error(err)
      }
    });


  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;