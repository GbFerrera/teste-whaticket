import { Request, Response } from "express";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { SendTextMessageService } from "../services/SendTextMessageService";
import Whatsapp from "../../models/Whatsapp";
import { SendMediaMessageService } from "../services/SendMediaMessageService";

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { body: message } = req.body;
  const { ticketId } = req.params;
  const medias = req.files as Express.Multer.File[];

  console.log("sending hub message controller");

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["number"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["token", "channel", "companyId"]
      }
    ]
  });

  try {
    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendMediaMessageService(
            media,
            message,
            ticket.id,
            ticket.contact,
            ticket.whatsapp
          );
        })
      );
    } else {
      await SendTextMessageService(
        message,
        ticket.id,
        ticket.contact,
        ticket.whatsapp
      );
    }

    return res.status(200).json({ message: "Message sent" });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ message: error });
  }
};
