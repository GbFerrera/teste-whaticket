import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { IContent } from "./HubMessageListener";

interface TicketData {
  contactId: number;
  channel: string;
  contents: IContent[];
  connection: Whatsapp;
}

const CreateOrUpdateTicketService = async (
  ticketData: TicketData
): Promise<Ticket> => {
  console.log("creating ticket");
  const { contactId, channel, contents, connection } = ticketData;
  const io = getIO();

  const ticketExists = await Ticket.findOne({
    where: {
      contactId,
      channel,
      whatsappId: connection.id,
      companyId: connection.companyId
    }
  });

  if (ticketExists) {
    console.log("ticket exists");

    let newStatus = ticketExists.status;
    let newQueueId = ticketExists.queueId;

    if (ticketExists.status === "closed") {
      newStatus = "pending";
      newQueueId = connection.sendIdQueue;
    }

    await ticketExists.update({
      lastMessage: contents[0].text,
      status: newStatus,
      queueId: newQueueId
    });

    console.log("ticket queue updated", newQueueId);

    await ticketExists.reload({
      include: [
        {
          association: "contact"
        },
        {
          association: "user"
        },
        {
          association: "queue"
        },
        {
          association: "tags"
        },
        {
          association: "whatsapp"
        }
      ]
    });

    io.to(ticketExists.status)
      .to("notification")
      .to(ticketExists.toString())
      .emit(`company-${connection.companyId}-ticket`, {
        action: "update",
        ticket: ticketExists
      });

    return ticketExists;
  }

  const newTicket = await Ticket.create({
    status: "pending",
    channel,
    lastMessage: contents[0].text,
    contactId,
    whatsappId: connection.id,
    companyId: connection.companyId
    // queueId: connection.sendIdQueue
  });

  await newTicket.reload({
    include: [
      {
        association: "contact"
      },
      {
        association: "user"
      },
      {
        association: "queue"
      },
      {
        association: "tags"
      },
      {
        association: "whatsapp"
      }
    ]
  });

  io.to(newTicket.status).emit(`company-${connection.companyId}-ticket`, {
    action: "create",
    ticket: newTicket
  });

  return newTicket;
};

export default CreateOrUpdateTicketService;
