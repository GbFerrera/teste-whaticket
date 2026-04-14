require("dotenv").config();
const { Client, TextContent } = require("notificamehubsdk");

import Contact from "../../models/Contact";
import { showHubToken } from "../helpers/showHubToken";
import CreateMessageService from "./CreateMessageService";

export const SendTextMessageService = async (
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any
) => {
  const notificameHubToken = await showHubToken(
    connection.companyId.toString()
  );

  const client = new Client(notificameHubToken);

  const channelClient = client.setChannel(connection.channel === 'whatsapp_business_account' ? 'whatsapp' : connection.channel);

  const content = new TextContent(message);

  try {
    console.log({
      token: connection.token,
      number: contact.number,
      content,
      message
    });

    let response = await channelClient.sendMessage(
      connection.token,
      contact.number,
      content
    );

    let data: any;

    try {
      const jsonStart = response.indexOf("{");
      const jsonResponse = response.substring(jsonStart);
      data = JSON.parse(jsonResponse);
    } catch (error) {
      data = response;
    }

    const newMessage = await CreateMessageService({
      contactId: contact.id,
      body: message,
      ticketId,
      fromMe: true,
      companyId: connection.companyId,
			ack: 2
    });

    return newMessage;
  } catch (error) {
    console.log("Error:", error);
  }
};
