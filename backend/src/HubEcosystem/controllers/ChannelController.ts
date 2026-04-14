import { Request, Response } from "express";

import { getIO } from "../../libs/socket";
import { setChannelWebhook } from "../helpers/setChannelWebhook";
import CreateChannelsService from "../services/CreateChannelsService";
import ListChannels from "../services/ListChannels";
import { StartWhatsAppSession } from "../../services/WbotServices/StartWhatsAppSession";

export interface IChannel {
  name: string;
  status?: string;
  isDefault?: boolean;
  companyId: number;
  token: string;
  channel: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { channels = [] } = req.body;
  const { companyId } = req.user;

  const { whatsapps } = await CreateChannelsService({
    companyId,
    channels
  });

  whatsapps.forEach(whatsapp => {
    setTimeout(() => {
      setChannelWebhook(whatsapp, whatsapp.id.toString());
    }, 2000);
  });

  const io = getIO();

  whatsapps.forEach(whatsapp => {
    StartWhatsAppSession(whatsapp, companyId);

    whatsapp.status = "CONNECTED";

    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      });
  });

  return res.status(200).json(whatsapps);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const channels = await ListChannels(companyId.toString());
    return res.status(200).json(channels);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
