import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ListCompanyIntegrationsService from "../services/CompanyIntegrationService/ListCompanyIntegrationsService";
import ShowCompanyIntegrationService from "../services/CompanyIntegrationService/ShowCompanyIntegrationService";
import UpsertCompanyIntegrationService from "../services/CompanyIntegrationService/UpsertCompanyIntegrationService";
import DeleteCompanyIntegrationService from "../services/CompanyIntegrationService/DeleteCompanyIntegrationService";
import UpsertFieldMapsService from "../services/CompanyIntegrationFieldMapService/UpsertFieldMapsService";

const ensureCompanyScope = (requestCompanyId: number, targetCompanyId?: number) => {
  if (targetCompanyId && targetCompanyId !== requestCompanyId) {
    throw new AppError("Acesso negado.", 403);
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const records = await ListCompanyIntegrationsService({
    companyId: Number(companyId)
  });

  return res.json(records);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await ShowCompanyIntegrationService({
    id: Number(id),
    companyId: Number(companyId)
  });

  return res.json(record);
};

export const upsert = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  ensureCompanyScope(Number(companyId));

  const record = await UpsertCompanyIntegrationService({
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

  await DeleteCompanyIntegrationService({
    id: Number(id),
    companyId: Number(companyId)
  });

  return res.status(204).send();
};

export const upsertFieldMaps = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const maps = await UpsertFieldMapsService({
    integrationId: Number(id),
    companyId: Number(companyId),
    fieldMaps: req.body?.fieldMaps || []
  });

  return res.json(maps);
};
