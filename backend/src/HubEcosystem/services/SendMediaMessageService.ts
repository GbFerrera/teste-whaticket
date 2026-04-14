require("dotenv").config();
const { Client, FileContent } = require("notificamehubsdk");
import fileType from "file-type";
import { rename } from "fs/promises";
import { join } from "path";

import Contact from "../../models/Contact";
import { convertToMp4 } from "../../utils/convertFiles";
import { showHubToken } from "../helpers/showHubToken";
import CreateMessageService from "./CreateMessageService";

const verifyExtensionFile = async (media: Express.Multer.File) => {
	const resultFile = await fileType.fromFile(media.path);

	const havePoint = media.filename.includes(".");
	const actualExtension = media.filename.split(".").pop();
	const extension = resultFile?.ext || havePoint ? actualExtension : "withoutExtension";

	let newFilename = media.filename;

	if (actualExtension && actualExtension !== extension && havePoint) {
		newFilename = media.filename.replace(actualExtension, extension);

		const newPath = join(media.destination, newFilename);

		await rename(media.path, newPath);

	} else if (!havePoint) {
		newFilename = `${media.filename}.${extension}`;

		const newPath = join(media.destination, newFilename);

		await rename(media.path, newPath);

	}

	media.filename = newFilename;
	media.originalname = newFilename;
}

const verifyFileIsMp4 = async (media: Express.Multer.File) => {
	const extension = (await fileType.fromFile(media.path))?.ext;

	if (!extension || extension !== "mp4") {
		media.path = await convertToMp4(media);
		media.filename = `${media.filename.split(".").slice(0, -1).join(".")}.mp4`;
		media.originalname = media.filename;
	}
}

export const SendMediaMessageService = async (
  media: Express.Multer.File,
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any,
  passVerification?: boolean,
) => {

  if (!passVerification) await verifyExtensionFile(media);

  const notificameHubToken = await showHubToken(
    connection.companyId.toString()
  );

  const client = new Client(notificameHubToken);

  const channelClient = client.setChannel(connection.channel === 'whatsapp_business_account' ? 'whatsapp' : connection.channel);

  message = message.replace(/\n/g, " ");

  const backendUrl = process.env.BACKEND_URL;

  if (media.mimetype.includes("image")) {

    if (connection.channel === "telegram") {
      media.mimetype = "photo";
    } else {
      media.mimetype = "image";
    }
  } else if (media.mimetype.includes("audio")) {

		if (connection.channel.includes("facebook")) {
			await verifyFileIsMp4(media);
		}

    media.mimetype = "audio";
  } else if (media.mimetype.includes("video")) {

		if (connection.channel.includes("whatsapp") || connection.channel.includes("facebook")) {
			await verifyFileIsMp4(media)
		}

    media.mimetype = "video";
  } else if (connection.channel === "telegram") {
    media.mimetype = "document";
  } else {
		if (connection.channel.includes("whatsapp")) {
			media.mimetype = "document";
		}
	}

	const mediaUrl = `${backendUrl}/public/company${connection?.companyId}/${media.filename}`;

  try {
    const content = new FileContent(
      mediaUrl,
      media.mimetype,
      media.originalname,
      media.originalname
    );

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
      fileName: `${media.filename}`,
      mediaType: media.mimetype.split("/")[0],
      originalName: media.originalname,
			ack: 2
    });

    return newMessage;
  } catch (error) {
    console.log("Error:", error);
  }
};
