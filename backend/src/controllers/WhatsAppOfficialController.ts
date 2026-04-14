import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import { SendTextOfficialService } from "../services/WhatsAppOfficial/SendTextOfficialService";
import { SendMediaOfficialService } from "../services/WhatsAppOfficial/SendMediaOfficialService";
import { OfficialMessageListener } from "../services/WhatsAppOfficial/OfficialMessageListener";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import multer from "multer";
import uploadConfig from "../config/upload";
import { graphRequest, extractGraphError } from "../services/WhatsappCoexistence/graphApiHelper";

const upload = multer(uploadConfig);

interface OfficialConnectionData {
  name: string;
  companyId: number;
  queueIds?: number[];
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  status?: string;
  isDefault?: boolean;
  allowGroup?: boolean;
  sendIdQueue?: number;
  timeSendQueue?: number;
  timeInactiveMessage?: string;
  inactiveMessage?: string;
  maxUseBotQueuesNPS?: number;
  expiresTicketNPS?: number;
  whenExpiresTicket?: string;
  expiresInactiveMessage?: string;
  groupAsTicket?: string;
  importOldMessages?: string;
  importRecentMessages?: string;
  closedTicketsPostImported?: boolean;
  importOldMessagesGroups?: boolean;
  timeCreateNewTicket?: number;
  schedules?: any[];
  promptId?: number;
  collectiveVacationMessage?: string;
  collectiveVacationStart?: string;
  collectiveVacationEnd?: string;
  queueIdImportMessages?: number;
  flowIdNotPhrase?: number;
  flowIdWelcome?: number;
  // Campos oficiais
  coexistencePhoneNumberId: string;
  coexistenceWabaId: string;
  coexistencePermanentToken: string;
  messageRoutingMode?: "automatic" | "manual" | "balanced";
  routingRules?: any[] | null;
}

interface ValidateOfficialCredentialsParams {
  phoneNumberId?: string;
  token?: string;
}

const validateOfficialCredentials = async ({ phoneNumberId, token }: ValidateOfficialCredentialsParams) => {
  if (!phoneNumberId || !token) {
    throw new AppError("ERR_OFFICIAL_MISSING_CREDENTIALS", 400);
  }

  try {
    await graphRequest(token, "get", `${phoneNumberId}?fields=id`);
  } catch (error) {
    const graphError = extractGraphError(error);
    throw new AppError(`ERR_OFFICIAL_CREDENTIALS_INVALID: ${graphError}`, 400);
  }
};

export const storeOfficial = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    queueIds = [],
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    isDefault = false,
    allowGroup = false,
    sendIdQueue,
    timeSendQueue,
    timeInactiveMessage,
    inactiveMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    groupAsTicket,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome,
    coexistencePhoneNumberId,
    coexistenceWabaId,
    coexistencePermanentToken,
    messageRoutingMode = "automatic",
    routingRules = null
  }: OfficialConnectionData = req.body;

  const { companyId } = req.user;

  await validateOfficialCredentials({
    phoneNumberId: coexistencePhoneNumberId,
    token: coexistencePermanentToken
  });

  const { whatsapp } = await CreateWhatsAppService({
    name,
    status: "CONNECTED",
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    queueIds,
    companyId,
    channel: "whatsapp_official",
    allowGroup,
    sendIdQueue,
    timeSendQueue,
    timeInactiveMessage,
    inactiveMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    groupAsTicket,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome
  });

  // Atualiza campos específicos da API oficial
  await whatsapp.update({
    coexistenceEnabled: true,
    coexistencePhoneNumberId,
    coexistenceWabaId,
    coexistencePermanentToken,
    messageRoutingMode,
    routingRules,
    businessAppConnected: false // Apenas API oficial, sem app
  });

  return res.status(200).json(whatsapp);
};

export const updateOfficial = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
    throw new AppError("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
  }

  const { whatsapp: updated } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  // Atualiza campos específicos se enviados
  const {
    coexistencePhoneNumberId,
    coexistenceWabaId,
    coexistencePermanentToken,
    messageRoutingMode,
    routingRules
  } = req.body;

  if (coexistencePhoneNumberId || coexistenceWabaId || coexistencePermanentToken || messageRoutingMode || routingRules) {
    if (coexistencePhoneNumberId || coexistencePermanentToken) {
      await validateOfficialCredentials({
        phoneNumberId: coexistencePhoneNumberId || whatsapp.coexistencePhoneNumberId,
        token: coexistencePermanentToken || whatsapp.coexistencePermanentToken
      });
    }
    await updated.update({
      ...(coexistencePhoneNumberId && { coexistencePhoneNumberId }),
      ...(coexistenceWabaId && { coexistenceWabaId }),
      ...(coexistencePermanentToken && { coexistencePermanentToken }),
      ...(messageRoutingMode && { messageRoutingMode }),
      ...(routingRules && { routingRules })
    });
  }

  return res.status(200).json(updated);
};

export const removeOfficial = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
    throw new AppError("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
  }

  await DeleteWhatsAppService(whatsappId);

  return res.status(200).json({ message: "WhatsApp Oficial removido" });
};

export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  const { body: message } = req.body;
  const { ticketId } = req.params;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      { model: Contact, as: "contact", attributes: ["number"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "token", "channel", "companyId", "coexistencePhoneNumberId", "coexistencePermanentToken"] }
    ]
  });

  if (!ticket || ticket.whatsapp.channel !== "whatsapp_official") {
    throw new AppError("ERR_OFFICIAL_TICKET_NOT_FOUND", 404);
  }

  try {
    if (medias && medias.length > 0) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendMediaOfficialService({
            media,
            body: message,
            ticketId: ticket.id,
            contact: ticket.contact,
            connection: ticket.whatsapp
          });
        })
      );
    } else {
      await SendTextOfficialService({
        body: message,
        ticketId: ticket.id,
        contact: ticket.contact,
        connection: ticket.whatsapp
      });
    }

    return res.status(200).json({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error });
  }
};

export const webhookOfficial = async (req: Request, res: Response): Promise<Response> => {
  const { "hub.verify-token": verifyToken, "hub.challenge": challenge } = req.query;

  // Webhook verification
  if (verifyToken) {
    const expectedToken = process.env.VERIFY_TOKEN || "meu_token_secreto";
    if (verifyToken !== expectedToken) {
      return res.status(403).send("Invalid verify token");
    }
    return res.status(200).send(challenge);
  }

  // Handle incoming messages
  try {
    await OfficialMessageListener(req.body);
    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("ERROR");
  }
};
