import { Request, Response } from "express";

import ListSliderHomeService from "../services/SliderHomeService/ListSliderHomeService";
import CreateSliderHomeService from "../services/SliderHomeService/CreateSliderHomeService";
import ShowSliderHomeService from "../services/SliderHomeService/ShowSliderHomeService";
import UpdateSliderHomeService from "../services/SliderHomeService/UpdateSliderHomeService";
import DeleteSliderHomeService from "../services/SliderHomeService/DeleteSliderHomeService";
import AppError from "../errors/AppError";
import { getSliderRelativePath } from "../config/sliderUpload";

const MASTER_COMPANY_ID = 1;

export const index = async (_req: Request, res: Response): Promise<Response> => {
  const sliders = await ListSliderHomeService({ companyId: MASTER_COMPANY_ID });
  return res.json(sliders);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { sliderId } = req.params;
  const slider = await ShowSliderHomeService(sliderId);
  return res.json(slider);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;
  const file = req.file;

  if (companyId !== MASTER_COMPANY_ID) {
    throw new AppError("Apenas a empresa mestre pode criar banners", 403);
  }

  if (!file) {
    throw new AppError("Imagem do banner é obrigatória", 400);
  }

  const relativePath = getSliderRelativePath(file.filename);
  console.log("[SliderHome][CREATE]", {
    name,
    originalName: file.originalname,
    storedFile: file.filename,
    diskPath: file.path,
    relativePath
  });

  const slider = await CreateSliderHomeService({
    name,
    image: relativePath,
    companyId
  });

  return res.status(201).json(slider);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { sliderId } = req.params;
  const { name } = req.body;
  const file = req.file;

  let imagePath: string | undefined;
  if (file) {
    imagePath = getSliderRelativePath(file.filename);
    console.log("[SliderHome][UPDATE]", {
      sliderId,
      name,
      originalName: file.originalname,
      storedFile: file.filename,
      diskPath: file.path,
      relativePath: imagePath
    });
  } else {
    console.log("[SliderHome][UPDATE]", { sliderId, name, message: "No new image uploaded" });
  }

  const slider = await UpdateSliderHomeService({
    id: sliderId,
    name,
    image: imagePath,
    companyId
  });

  return res.json(slider);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { sliderId } = req.params;

  await DeleteSliderHomeService({ id: sliderId, companyId });

  return res.json({ message: "Banner removido com sucesso" });
};
