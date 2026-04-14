import Whatsapp from "../../models/Whatsapp";
import { downloadFiles } from "../helpers/downloadFIles";
import CreateMessageService from "./CreateMessageService";
import CreateOrUpdateTicketService from "./CreateOrUpdateTicketService";
import FindOrCreateContactService from "./FindOrCreateContactService";
import { UpdateMessageAck } from "./UpdateMessageAck";

export interface HubInMessage {
  type: "MESSAGE";
  id: string;
  timestamp: string;
  subscriptionId: string;
  channel: "telegram" | "whatsapp" | "facebook" | "instagram" | "sms" | "email";
  direction: "IN";
  message: {
    id: string;
    from: string;
    to: string;
    direction: "IN";
    channel:
      | "telegram"
      | "whatsapp"
      | "facebook"
      | "instagram"
      | "sms"
      | "email";
    visitor: {
      name: string;
      firstName: string;
      lastName: string;
      picture: string;
    };
    contents: IContent[];
    timestamp: string;
  };
}

export interface IContent {
  type: "text" | "image" | "audio" | "video" | "file" | "location";
  text?: string;
  url?: string;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  filename?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface HubConfirmationSentMessage {
  type: "MESSAGE_STATUS";
  timestamp: string;
  subscriptionId: string;
  channel: "telegram" | "whatsapp" | "facebook" | "instagram" | "sms" | "email";
  messageId: string;
  contentIndex: number;
  messageStatus: {
    timestamp: string;
    code: "SENT" | "REJECTED";
    description: string;
  };
}

const verifySentMessageStatus = (message: HubConfirmationSentMessage) => {
  const {
    messageStatus: { code }
  } = message;

  const isMessageSent = code === "SENT";

  if (isMessageSent) {
    return true;
  }

  return false;
};

const HubMessageListener = async (
  message: any | HubInMessage | HubConfirmationSentMessage,
  connection: Whatsapp,
  medias: Express.Multer.File[]
) => {
  const ignoreEvent =
   ( message?.message.visitor?.name === "" || !message?.message.visitor?.name)
	 && (message?.message.visitor?.firstName === "" || !message?.message.visitor?.firstName);
  if (ignoreEvent || message.direction === "OUT") {
    return;
  }

  const isMessageFromMe = message.type === "MESSAGE_STATUS";

  if (isMessageFromMe) {
    const isMessageSent = verifySentMessageStatus(
      message as HubConfirmationSentMessage
    );

    if (isMessageSent) {
      console.log("HubMessageListener: message sent");
      UpdateMessageAck(message.messageId);
    } else {
      console.log(
        "HubMessageListener: message not sent",
        message.messageStatus.code,
        message.messageStatus.description
      );
    }

    return;
  }

  const {
    message: { id, from, channel, contents, visitor }
  } = message as HubInMessage;

  try {
    const contact = await FindOrCreateContactService({
      ...visitor,
      from,
      connection
    });

    const ticket = await CreateOrUpdateTicketService({
      contactId: contact.id,
      channel,
      contents,
      connection
    });

    if (contents[0]?.type === "text") {
      await CreateMessageService({
        contactId: contact.id,
        body: contents[0].text,
        ticketId: ticket.id,
        fromMe: false,
        companyId: connection.companyId
      });
    } else {
      const media = await downloadFiles({
				content: contents[0] as any,
				connection: connection,
			});

      await CreateMessageService({
        contactId: contact.id,
        body: contents[0].text,
        ticketId: ticket.id,
        fromMe: false,
        companyId: connection.companyId,
        fileName: `${media.filename}`,
        mediaType: media.mimeType.split("/")[0],
        originalName: media.originalname
      });
    }

  } catch (error: any) {
    console.log(error);
  }
};

export default HubMessageListener;
