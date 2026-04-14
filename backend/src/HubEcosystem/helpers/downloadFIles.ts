import axios from "axios";
import { extname, join } from "path";
import { writeFile, rename } from "fs/promises";
import fileTypeLib from "file-type";
import { convertToMp3 } from "../../utils/convertFiles";
import Whatsapp from "../../models/Whatsapp";
import { showHubToken } from "./showHubToken";
const { Client, FileContent } = require("notificamehubsdk");

interface DownloadFilesProps {
	content: {
		fileMimeType: string;
		fileUrl: string;
		type: string;
		fileName: string
	};
	connection: Whatsapp
}

export const downloadFiles = async ({
	content,
	connection
}: DownloadFilesProps) => {
	const { fileUrl,
		fileMimeType,
		fileName,
		type: fileType } = content;

	const { channel, companyId } = connection


  try {
		if (channel.includes('whatsapp')) {
			const notificameHubToken = await showHubToken(
				connection.companyId.toString()
			);

			const client = new Client(notificameHubToken);

			const channelClient = await client.setChannel('whatsapp');

			const content = new FileContent(fileUrl, fileMimeType);

			const data = await channelClient.downloadMedia(connection.token, 'whatsapp', content);

			const previousfilename = `${new Date().getTime()}.${fileType}`;

			const path = join(__dirname, "..", "..", "..", "public", `company${companyId}`, previousfilename);

			await writeFile(path, data, "binary");

			let fileTypeResult = await fileTypeLib.fromFile(path);
			let mimeType = fileTypeResult.mime;

			const type = fileTypeResult.ext;

			let filename = `${new Date().getTime()}.${type}`;

			await rename(path, join(__dirname, "..", "..", "..", "public", `company${companyId}`, filename));

			let filePath = `${__dirname}/../../../public/company${companyId}/${filename}`;

			if (mimeType.includes('audio')) {
				filePath = await convertToMp3({
					path: filePath
				} as Express.Multer.File)
				fileTypeResult = await fileTypeLib.fromFile(filePath);
				mimeType = fileTypeResult.mime;
				filename = `${filename
					.split(".")
					.slice(0, -1)
					.join(".")}.mp3`;
			}

			const extension = extname(filePath);
			const originalname = fileName || fileUrl.split("/").pop();

			const media = {
				mimeType,
				extension,
				filename,
				data,
				originalname
			};

			return media;

		}

		const { data } = await axios.get(fileUrl, {
			responseType: "arraybuffer"
		});

		let type = fileUrl.split("?")[0].split(".").pop();

		type = type.replace(/\//g, '')

		let filename = `${new Date().getTime()}.${type}`;

		let filePath = `${__dirname}/../../../public/company${companyId}/${filename}`;


    await writeFile(
      join(__dirname, "..", "..", "..", "public", `company${companyId}`, filename),
      data,
      "base64"
    );

		let fileTypeResult = await fileTypeLib.fromBuffer(data);
    let mimeType = fileTypeResult.mime;

		if (mimeType.includes('audio')) {
			filePath = await convertToMp3({
				path: filePath
			} as Express.Multer.File)
			fileTypeResult = await fileTypeLib.fromFile(filePath);
			mimeType = fileTypeResult.mime;
			filename = `${filename
				.split(".")
				.slice(0, -1)
				.join(".")}.mp3`;
		}

    const extension = extname(filePath);
    const originalname = fileUrl.split("/").pop();

    const media = {
      mimeType,
      extension,
      filename,
      data,
      originalname
    };

    return media;
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    throw error; // Lança o erro para quem chama a função
  }
};
