import { Request, Response } from "express";
import * as Yup from "yup";
import CompanyApiKey from "../models/CompanyApiKey";
import AppError from "../errors/AppError";
import generateApiToken from "../utils/generateApiToken";

const upsertSchema = Yup.object().shape({
  label: Yup.string().required("O nome do token é obrigatório."),
  webhookUrl: Yup.string().url("Webhook deve ser uma URL válida.").nullable(),
  webhookSecret: Yup.string().nullable(),
  active: Yup.boolean().optional(),
  regenerateToken: Yup.boolean().optional()
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const records = await CompanyApiKey.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]]
  });

  return res.json(records);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const payload = await upsertSchema.validate(req.body);

  const token = generateApiToken();

  const record = await CompanyApiKey.create({
    companyId,
    label: payload.label,
    webhookUrl: payload.webhookUrl,
    webhookSecret: payload.webhookSecret,
    token
  });

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = await upsertSchema.validate(req.body);

  const record = await CompanyApiKey.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("Token não encontrado.", 404);
  }

  if (payload.regenerateToken) {
    record.token = generateApiToken();
  }

  await record.update({
    label: payload.label,
    webhookUrl: payload.webhookUrl,
    webhookSecret: payload.webhookSecret,
    active: typeof payload.active === "boolean" ? payload.active : record.active
  });

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await CompanyApiKey.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("Token não encontrado.", 404);
  }

  await record.destroy();

  return res.status(204).send();
};
