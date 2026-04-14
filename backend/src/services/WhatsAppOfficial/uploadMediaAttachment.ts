import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import path from "path";
import fs from "fs";
import { head } from "lodash";

export const officialMediaUpload = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  if (!file) {
    throw new AppError("ERR_OFFICIAL_MEDIA_REQUIRED");
  }

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
    throw new AppError("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
  }

  try {
    whatsapp.greetingMediaAttachment = file.filename;
    await whatsapp.save();
    return res.status(200).json({ message: "Mídia oficial atualizada" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteOfficialMedia = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
    throw new AppError("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
  }

  const filePath = path.resolve("public", whatsapp.greetingMediaAttachment || "" );
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    fs.unlinkSync(filePath);
  }

  whatsapp.greetingMediaAttachment = null;
  await whatsapp.save();

  return res.status(200).json({ message: "Arquivo oficial excluído" });
};
