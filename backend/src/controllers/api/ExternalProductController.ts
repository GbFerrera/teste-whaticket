import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import ListService from "../../services/ProdutoService/ListService";
import ShowService from "../../services/ProdutoService/ShowService";
import CreateService from "../../services/ProdutoService/CreateService";
import UpdateService from "../../services/ProdutoService/UpdateService";
import DeleteService from "../../services/ProdutoService/DeleteService";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { tipo, categoriaId } = req.query as { tipo?: string; categoriaId?: string };

  const products = await ListService({
    companyId,
    tipo,
    categoriaId: categoriaId ? Number(categoriaId) : undefined
  });

  return res.json({ products });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const product = await ShowService(id, companyId);

  return res.json(product);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const data = req.body;

  const product = await CreateService({
    ...data,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "product.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      product
    }
  });

  return res.status(201).json(product);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const data = req.body;

  const product = await UpdateService(id, externalAuth.companyId, data);

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "product.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      product
    }
  });

  return res.json(product);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  await DeleteService(id, externalAuth.companyId);

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "product.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      productId: Number(id)
    }
  });

  return res.status(204).send();
};
