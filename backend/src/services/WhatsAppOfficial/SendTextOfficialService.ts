import Whatsapp from "../../models/Whatsapp";
import Contact from "../../models/Contact";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { graphRequest, extractGraphError } from "../WhatsappCoexistence/graphApiHelper";

interface SendTextOfficialParams {
  body: string;
  ticketId: number;
  contact: Contact;
  connection: Whatsapp;
}

export const SendTextOfficialService = async ({
  body,
  ticketId,
  contact,
  connection
}: SendTextOfficialParams) => {
  if (!connection.coexistencePhoneNumberId || !connection.coexistencePermanentToken) {
    throw new Error("ERR_OFFICIAL_MISSING_CREDENTIALS");
  }

  console.log("[WhatsAppOfficial][SendTextOfficial] connection", {
    whatsappId: connection.id,
    phoneNumberId: connection.coexistencePhoneNumberId,
    wabaId: connection.coexistenceWabaId,
    companyId: connection.companyId
  });

  const payload = {
    messaging_product: "whatsapp",
    to: contact.number,
    text: { body }
  };

  try {
    const response = await graphRequest(
      connection.coexistencePermanentToken,
      "post",
      `${connection.coexistencePhoneNumberId}/messages`,
      payload
    );

    console.log("[WhatsAppOfficial][SendTextOfficial] graphResponse", {
      status: "success",
      messageId: response?.messages?.[0]?.id,
      raw: response
    });

    const messageId = response?.messages?.[0]?.id;

    if (!messageId) {
      throw new Error("ERR_OFFICIAL_NO_MESSAGE_ID");
    }

    const newMessage = await CreateMessageService({
      messageData: {
        wid: messageId,
        ticketId,
        body,
        fromMe: true,
        read: true,
        ack: 2
      },
      companyId: connection.companyId
    });

    return newMessage;
  } catch (error) {
    const graphError = extractGraphError(error);
    console.error("[WhatsAppOfficial][SendTextOfficial] graphError", {
      status: "error",
      message: graphError,
      payload
    });
    throw new Error(`ERR_OFFICIAL_SEND_TEXT: ${graphError}`);
  }
};
