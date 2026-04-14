import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import ListServicosService from "../../services/ServicoService/ListServicosService";
import ShowServicoService from "../../services/ServicoService/ShowServicoService";
import CreateServicoService from "../../services/ServicoService/CreateServicoService";
import UpdateServicoService from "../../services/ServicoService/UpdateServicoService";
import DeleteServicoService from "../../services/ServicoService/DeleteServicoService";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);

  const services = await ListServicosService({ companyId });

  return res.json({ services });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const service = await ShowServicoService({ id, companyId });

  return res.json(service);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const data = req.body;

  const service = await CreateServicoService({
    ...data,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "service.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      service
    }
  });

  return res.status(201).json(service);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const data = req.body;

  const service = await UpdateServicoService({
    id,
    companyId: externalAuth.companyId,
    ...data
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "service.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      service
    }
  });

  return res.json(service);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  await DeleteServicoService({
    id,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "service.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      serviceId: Number(id)
    }
  });

  return res.status(204).send();
};
