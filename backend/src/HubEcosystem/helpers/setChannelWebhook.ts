import Whatsapp from "../../models/Whatsapp";
import { IChannel } from "../controllers/ChannelController";
import { showHubToken } from "./showHubToken";
const {
  Client,
  MessageSubscription,
  WebhookController
} = require("notificamehubsdk");
require("dotenv").config();

export const setChannelWebhook = async (
  whatsapp: IChannel,
  whatsappId: string
) => {
  const notificameHubToken = await showHubToken(whatsapp.companyId.toString());

  const client = new Client(notificameHubToken);

  const url = `${process.env.BACKEND_URL}/hub-webhook/${whatsapp.token}`;

  const subscription = new MessageSubscription(
    {
      url
    },
    {
      channel: whatsapp.token
    }
  );

  // client
  // .updateSubscription("subscription-identifier", subscription)
  await client
    .createSubscription(subscription)
    .then((response: any) => {
      console.log("Webhook subscribed:", response);
    })
    .catch((error: any) => {
      console.log("Error:", error);
    });

  await Whatsapp.update(
    {
      status: "CONNECTED"
    },
    {
      where: {
        id: whatsappId
      }
    }
  );
};
