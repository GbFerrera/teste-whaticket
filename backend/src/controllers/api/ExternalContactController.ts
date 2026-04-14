import { Request, Response } from "express";
import AppError from "../../errors/AppError";

import ListContactsService from "../../services/ContactServices/ListContactsService";
import ShowContactService from "../../services/ContactServices/ShowContactService";
import CreateContactService from "../../services/ContactServices/CreateContactService";
import UpdateContactService from "../../services/ContactServices/UpdateContactService";
import DeleteContactService from "../../services/ContactServices/DeleteContactService";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { searchParam, pageNumber, limit, isGroup } = req.query as {
    searchParam?: string;
    pageNumber?: string;
    limit?: string;
    isGroup?: string;
  };

  const result = await ListContactsService({
    companyId,
    searchParam,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined,
    isGroup
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const contact = await ShowContactService(id, companyId);

  return res.json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const data = req.body;

  const contact = await CreateContactService({
    ...data,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "contact.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      contact
    }
  });

  return res.status(201).json(contact);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const data = req.body;

  const contact = await UpdateContactService({
    contactData: data,
    contactId: id,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "contact.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      contact
    }
  });

  return res.json(contact);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  await ShowContactService(id, externalAuth.companyId);
  await DeleteContactService(id);

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "contact.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      contactId: Number(id)
    }
  });

  return res.status(204).send();
};
