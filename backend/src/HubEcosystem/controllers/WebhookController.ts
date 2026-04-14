import { Request, Response } from "express";

import Queue from '../../models/Queue';
import Whatsapp from "../../models/Whatsapp";
import HubMessageListener from "../services/HubMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
	console.log('aaa', req.body, req.params);

	return res.send(req.query["hub.challenge"])
}

export const listen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const medias = req.files as Express.Multer.File[];
  const { channelId } = req.params;

  const connection = await Whatsapp.findOne({
    where: { token: channelId },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"],
      }
    ],
    order: [
      ["queues", "id", "ASC"],
    ]
  });

  try {
    await HubMessageListener(req.body, connection, medias);

    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
