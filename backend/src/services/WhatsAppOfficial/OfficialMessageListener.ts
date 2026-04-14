import Whatsapp from "../../models/Whatsapp";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import CreateOrUpdateTicketService from "../../HubEcosystem/services/CreateOrUpdateTicketService";
import FindOrCreateContactService from "../../HubEcosystem/services/FindOrCreateContactService";

interface OfficialWebhookMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: "messages";
      value: {
        messaging_product: "whatsapp";
        metadata: {
          phone_number_id: string;
          display_phone_number: string;
        };
        messages: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: "text" | "image" | "video" | "audio" | "document";
          text?: { body: string };
          image?: { id: string; caption?: string };
          video?: { id: string; caption?: string };
          audio?: { id: string };
          document?: { id: string; caption?: string; filename?: string };
        }>;
      };
    }>;
  }>;
}

export const OfficialMessageListener = async (body: OfficialWebhookMessage) => {
  if (!body.entry || !Array.isArray(body.entry)) return;

  for (const entryItem of body.entry) {
    const { changes } = entryItem;
    if (!changes || !Array.isArray(changes)) continue;

    for (const change of changes) {
      if (change.field !== "messages") continue;

      const { value } = change;
      if (!value.messages || !Array.isArray(value.messages)) continue;

      // Find connection by phone number ID
      const connection = await Whatsapp.findOne({
        where: {
          coexistencePhoneNumberId: value.metadata.phone_number_id,
          channel: "whatsapp_official"
        }
      });

      if (!connection) {
        console.warn("Connection not found for phone number ID:", value.metadata.phone_number_id);
        continue;
      }

      for (const message of value.messages) {
        // Ignore outgoing messages
        if (!message.from) continue;

        const from = message.from;
        const messageId = message.id;
        const timestamp = new Date(parseInt(message.timestamp) * 1000);

        // Extract content based on type
        let body = "";
        let mediaUrl = "";
        let mediaType = "";
        let fileName = "";

        switch (message.type) {
          case "text":
            body = message.text?.body || "";
            break;
          case "image":
            body = message.image?.caption || "";
            mediaUrl = message.image?.id || "";
            mediaType = "image";
            break;
          case "video":
            body = message.video?.caption || "";
            mediaUrl = message.video?.id || "";
            mediaType = "video";
            break;
          case "audio":
            mediaUrl = message.audio?.id || "";
            mediaType = "audio";
            break;
          case "document":
            body = message.document?.caption || "";
            mediaUrl = message.document?.id || "";
            mediaType = "document";
            fileName = message.document?.filename || "";
            break;
        }

        try {
          // Find or create contact
          const contact = await FindOrCreateContactService({
            name: "",
            firstName: "",
            lastName: "",
            picture: "",
            from,
            connection
          });

          // Create or update ticket
          const ticket = await CreateOrUpdateTicketService({
            contactId: contact.id,
            channel: "whatsapp_official",
            contents: [{ type: message.type as any, text: body }],
            connection
          });

          // Create message record
          const messageData: any = {
            contactId: contact.id,
            body: body || `Mídia ${message.type}`,
            ticketId: ticket.id,
            fromMe: false,
            companyId: connection.companyId,
            messageId,
            ack: 1,
            read: false
          };

          if (mediaUrl) {
            messageData.mediaUrl = mediaUrl;
            messageData.mediaType = mediaType;
            if (fileName) messageData.fileName = fileName;
          }

          await CreateMessageService(messageData);

          console.log("Official message processed:", { from, body, messageId, ticketId: ticket.id });
        } catch (error) {
          console.error("Error processing official message:", error);
        }
      }
    }
  }
};
