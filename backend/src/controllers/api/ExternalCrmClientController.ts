import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import ListCrmClientsService from "../../services/CrmClientService/ListCrmClientsService";
import CreateCrmClientService from "../../services/CrmClientService/CreateCrmClientService";
import ShowCrmClientService from "../../services/CrmClientService/ShowCrmClientService";
import UpdateCrmClientService from "../../services/CrmClientService/UpdateCrmClientService";
import DeleteCrmClientService from "../../services/CrmClientService/DeleteCrmClientService";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const {
    searchParam,
    status,
    type,
    ownerUserId,
    pageNumber,
    limit
  } = req.query as any;

  const result = await ListCrmClientsService({
    companyId,
    searchParam,
    status,
    type,
    ownerUserId: ownerUserId ? Number(ownerUserId) : undefined,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const client = await ShowCrmClientService({
    id: Number(id),
    companyId
  });

  return res.json(client);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const data = req.body;

  const client = await CreateCrmClientService({
    ...data,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "client.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      client
    }
  });

  return res.status(201).json(client);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const data = req.body;

  const client = await UpdateCrmClientService({
    id: Number(id),
    companyId: externalAuth.companyId,
    ...data
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "client.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      client
    }
  });

  return res.json(client);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  await DeleteCrmClientService({
    id: Number(id),
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "client.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      clientId: Number(id)
    }
  });

  return res.status(204).send();
};
