import { Request, Response } from "express";
import ListCompanyPaymentSettingsService from "../services/CompanyPaymentSettingService/ListCompanyPaymentSettingsService";
import UpsertCompanyPaymentSettingService from "../services/CompanyPaymentSettingService/UpsertCompanyPaymentSettingService";
import DeleteCompanyPaymentSettingService from "../services/CompanyPaymentSettingService/DeleteCompanyPaymentSettingService";
import AppError from "../errors/AppError";

const ensureCompanyScope = (requestCompanyId: number, targetCompanyId?: number) => {
  if (targetCompanyId && targetCompanyId !== requestCompanyId) {
    throw new AppError("Acesso negado.", 403);
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const records = await ListCompanyPaymentSettingsService({
    companyId: Number(companyId)
  });

  return res.json(records);
};

export const upsert = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  ensureCompanyScope(Number(companyId));

  const record = await UpsertCompanyPaymentSettingService({
    id: id ? Number(id) : undefined,
    companyId: Number(companyId),
    ...req.body
  });

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  ensureCompanyScope(Number(companyId));

  await DeleteCompanyPaymentSettingService({
    id: Number(id),
    companyId: Number(companyId)
  });

  return res.status(204).send();
};
