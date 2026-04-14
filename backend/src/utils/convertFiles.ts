import ffmpeg from "fluent-ffmpeg";
import { rm } from 'fs/promises';

const deleteFile = async (path: string) => {
	await rm(path);
}

export const convertToMp3 = async (
  media: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputFilePath = `${media.path
      .split(".")
      .slice(0, -1)
      .join(".")}.mp3`;

    ffmpeg(media.path)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", async () => {
				await deleteFile(media.path)
        resolve(outputFilePath);
      })
      .on("error", err => {
        reject(err);
      })
      .save(outputFilePath);
  });
};

export const convertToMp4 = async (
	media: Express.Multer.File
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const outputFilePath = `${media.path
			.split(".")
			.slice(0, -1)
			.join(".")}.mp4`;

		ffmpeg(media.path)
			.videoCodec("libx264")
			.format("mp4")
			.on("end", async () => {
				await deleteFile(media.path)
				resolve(outputFilePath);
			})
			.on("error", err => {
				reject(err);
			})
			.save(outputFilePath);
	});
}
