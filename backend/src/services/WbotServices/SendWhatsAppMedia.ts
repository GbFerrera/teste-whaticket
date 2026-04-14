import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs, { unlink, unlinkSync } from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import CreateMessageService from "../MessageServices/CreateMessageService";
import formatBody from "../../helpers/Mustache";
interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId?: number;
  body?: string;
  isPrivate?: boolean;
  isForwarded?: boolean;
}
const os = require("os");

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.ogg`;
  console.log(`[processAudio] Processando áudio: ${audio} -> ${outputAudio}`);
  
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -c:a libopus -b:a 32k -ar 48000 -ac 1 "${outputAudio}" -y`,
      (error, _stdout, _stderr) => {
        if (error) {
          console.error("[processAudio] Erro no processamento de áudio PTT:", error);
          reject(error);
        } else {
          console.log("[processAudio] Áudio PTT processado com sucesso:", outputAudio);
          resolve(outputAudio);
        }
      }
    );
  });
};

const processAudioFile = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.m4a`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -c:a aac -b:a 128k -ar 44100 -ac 2 -f mp4 "${outputAudio}" -y`,
      (error, _stdout, _stderr) => {
        if (error) {
          console.error("Erro no processamento de arquivo de áudio:", error);
          reject(error);
        } else {
          console.log("Arquivo de áudio processado com sucesso:", outputAudio);
          resolve(outputAudio);
        }
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  companyId?: string,
  body: string = " "
): Promise<any> => {
  const mimeType = String(mime.lookup(pathMedia));
  const typeMessage = mimeType.split("/")[0];

  try {
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: { url: pathMedia },
        caption: body ? body : null,
        fileName: fileName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = true; //fileName.includes("audio-record-site");
      const convert = await processAudio(pathMedia, companyId);
      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/ogg; codecs=opus" : mimeType,
          ptt: true
        };
      }
      // Limpar arquivo temporário
      fs.unlinkSync(convert);
    } else if (typeMessage === "document") {
      options = {
        document: { url: pathMedia },
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: { url: pathMedia },
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: { url: pathMedia },
        caption: body ? body : null,
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.log(e);
    return null;
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body = "",
  isPrivate = false,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  try {
    console.log(`[SendWhatsAppMedia] Iniciando envio de mídia - Ticket: ${ticket.id}, Tipo: ${media.mimetype}, Arquivo: ${media.originalname}`);
    
    const wbot = await getWbot(ticket.whatsappId);
    const companyId = ticket.companyId.toString()

    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    let options: AnyMessageContent;
    let bodyTicket = "";
    const bodyMedia = ticket ? formatBody(body, ticket) : body;

    console.log(`[SendWhatsAppMedia] Processando tipo: ${typeMessage}, isPrivate: ${isPrivate}`);

    // console.log(media.mimetype)
    if (typeMessage === "video") {
      options = {
        video: { url: pathMedia },
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "🎥 Arquivo de vídeo"
    } else if (typeMessage === "audio") {
      console.log(`[SendWhatsAppMedia] Processando áudio - Path: ${pathMedia}, Company: ${companyId}`);
      
      // Verificar se o arquivo existe e não está corrompido
      try {
        const stats = fs.statSync(pathMedia);
        console.log(`[SendWhatsAppMedia] Tamanho do arquivo: ${stats.size} bytes`);
        
        // Áudios válidos geralmente têm pelo menos 1KB (1024 bytes) - reduzido temporariamente para debug
        if (stats.size < 1024) {
          throw new Error(`Arquivo de áudio muito pequeno (${stats.size} bytes), mínimo necessário: 1024 bytes. Gravação foi interrompida.`);
        }
        
        // Verificar se o arquivo pode ser lido (não corrompido)
        try {
          const testRead = fs.readFileSync(pathMedia, { encoding: null });
          if (testRead.length !== stats.size) {
            throw new Error(`Arquivo corrompido - tamanho lido (${testRead.length}) diferente do esperado (${stats.size})`);
          }
        } catch (readError) {
          throw new Error(`Arquivo de áudio corrompido ou ilegível: ${readError.message}`);
        }
        
      } catch (error) {
        console.error(`[SendWhatsAppMedia] Erro ao verificar arquivo: ${error.message}`);
        throw new AppError(`Arquivo de áudio inválido: ${error.message}`);
      }
      
      const convert = await processAudio(media.path, companyId);
      console.log(`[SendWhatsAppMedia] Áudio convertido: ${convert}`);
      
      options = {
        audio: fs.readFileSync(convert),
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        caption: bodyMedia,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      unlinkSync(convert);
      bodyTicket = "🎵 Arquivo de áudio"
      console.log(`[SendWhatsAppMedia] Opções de áudio criadas, tamanho: ${(options as any).audio?.length || 0} bytes`);
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: { url: pathMedia },
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "📂 Documento"
    } else if (typeMessage === "application") {
      options = {
        document: { url: pathMedia },
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "📎 Outros anexos"
    } else {
      if (media.mimetype.includes("gif")) {
        options = {
          image: { url: pathMedia },
          caption: bodyMedia,
          mimetype: "image/gif",
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
          gifPlayback: true

        };
      } else {
        options = {
          image: { url: pathMedia },
          caption: bodyMedia,
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
        };
      }
      bodyTicket = "📎 Outros anexos"
    }

    const contactNumber = await Contact.findByPk(ticket.contactId)

    if (isPrivate === true) {
      const messageData = {
        wid: `PVT${companyId}${ticket.id}${body.substring(0, 6)}`,
        ticketId: ticket.id,
        contactId: undefined,
        body: bodyMedia,
        fromMe: true,
        mediaUrl: media.filename,
        mediaType: media.mimetype.split("/")[0],
        read: true,
        quotedMsgId: null,
        ack: 2,
        remoteJid: null,
        participant: null,
        dataJson: null,
        ticketTrakingId: null,
        isPrivate
      };

      await CreateMessageService({ messageData, companyId: ticket.companyId });

      console.log(`[SendWhatsAppMedia] Mensagem privada criada: ${messageData.wid}`);
      
      // Retornar objeto de mensagem válido para compatibilidade
      const resultMessage = {
        key: {
          remoteJid: contactNumber?.remoteJid || `${contactNumber.number}@s.whatsapp.net`,
          id: messageData.wid,
          fromMe: true
        },
        message: { conversation: bodyMedia },
        messageTimestamp: Math.floor(Date.now() / 1000),
        status: 1
      } as WAMessage;
      
      console.log(`[SendWhatsAppMedia] Retornando mensagem privada:`, resultMessage);
      return resultMessage;
    }

    let number: string;

    if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
      number = contactNumber.remoteJid;
    } else {
      number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
        }`;
    }

    console.log(`[SendWhatsAppMedia] Enviando para número: ${number}`);
    console.log(`[SendWhatsAppMedia] Opções finais:`, JSON.stringify(options, null, 2));

    const sentMessage = await wbot.sendMessage(
      number,
      {
        ...options
      }
    );

    console.log(`[SendWhatsAppMedia] Mensagem enviada com sucesso:`, sentMessage.key.id);

    await ticket.update({ lastMessage: body !== media.filename ? body : bodyMedia, imported: null });

    return sentMessage;
  } catch (err) {
    console.log(`[SendWhatsAppMedia] ERRO AO ENVIAR MIDIA ${ticket.id} media ${media.originalname}`);
    console.log(`[SendWhatsAppMedia] Erro completo:`, err);
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;