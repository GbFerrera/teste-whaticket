import { Request, Response } from "express";
import AppError from "../../errors/AppError";

import ListService from "../../services/TagServices/ListService";
import ShowService from "../../services/TagServices/ShowService";
import CreateService from "../../services/TagServices/CreateService";
import UpdateService from "../../services/TagServices/UpdateService";
import DeleteService from "../../services/TagServices/DeleteService";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { searchParam, pageNumber, limit, kanban, tagId } = req.query as {
    searchParam?: string;
    pageNumber?: string;
    limit?: string;
    kanban?: string;
    tagId?: string;
  };

  const result = await ListService({
    companyId,
    searchParam,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined,
    kanban: kanban ? Number(kanban) : undefined,
    tagId: tagId ? Number(tagId) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const tag = await ShowService(id, companyId);

  return res.json(tag);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const {
    name,
    color,
    kanban,
    timeLane,
    nextLaneId,
    greetingMessageLane,
    rollbackLaneId
  } = req.body;

  const tag = await CreateService({
    name,
    color,
    kanban,
    companyId: externalAuth.companyId,
    timeLane,
    nextLaneId,
    greetingMessageLane,
    rollbackLaneId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "tag.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      tag
    }
  });

  return res.status(201).json(tag);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const tagData = req.body;

  const tag = await UpdateService({
    tagData,
    id,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "tag.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      tag
    }
  });

  return res.json(tag);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  await ShowService(id, externalAuth.companyId);
  await DeleteService({ id, companyId: externalAuth.companyId });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "tag.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      tagId: Number(id)
    }
  });

  return res.status(204).send();
};
