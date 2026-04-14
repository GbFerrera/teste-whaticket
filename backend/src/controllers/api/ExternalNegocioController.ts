import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import Negocio from "../../models/Negocio";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { pageNumber, searchParam } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition.name = {
      [require("sequelize").Op.iLike]: `%${searchParam}%`
    };
  }

  const { count, rows: negocios } = await Negocio.findAndCountAll({
    where: whereCondition,
    order: [["name", "ASC"]],
    limit,
    offset
  });

  const hasMore = count > offset + negocios.length;

  return res.json({ negocios, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const negocio = await Negocio.findOne({
    where: { id: Number(id), companyId }
  });

  if (!negocio) {
    throw new AppError("ERR_NEGOCIO_NOT_FOUND", 404);
  }

  return res.json(negocio);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { name, description, kanbanBoards, users } = req.body;

  if (!name) {
    throw new AppError("ERR_NEGOCIO_NAME_REQUIRED", 400);
  }

  // Verificar se já existe negócio com mesmo nome na empresa
  const existingNegocio = await Negocio.findOne({
    where: { name, companyId: externalAuth.companyId }
  });

  if (existingNegocio) {
    throw new AppError("ERR_NEGOCIO_NAME_ALREADY_EXISTS", 400);
  }

  const negocio = await Negocio.create({
    name,
    description: description || null,
    kanbanBoards: kanbanBoards || [],
    users: users || [],
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "negocio.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      negocio
    }
  });

  return res.status(201).json(negocio);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { name, description, kanbanBoards, users } = req.body;

  const negocio = await Negocio.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!negocio) {
    throw new AppError("ERR_NEGOCIO_NOT_FOUND", 404);
  }

  // Verificar se já existe outro negócio com mesmo nome
  if (name && name !== negocio.name) {
    const existingNegocio = await Negocio.findOne({
      where: { name, companyId: externalAuth.companyId }
    });
    if (existingNegocio) {
      throw new AppError("ERR_NEGOCIO_NAME_ALREADY_EXISTS", 400);
    }
  }

  await negocio.update({
    name: name !== undefined ? name : negocio.name,
    description: description !== undefined ? description : negocio.description,
    kanbanBoards: kanbanBoards !== undefined ? kanbanBoards : negocio.kanbanBoards,
    users: users !== undefined ? users : negocio.users
  });

  await negocio.reload();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "negocio.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      negocio
    }
  });

  return res.json(negocio);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const negocio = await Negocio.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!negocio) {
    throw new AppError("ERR_NEGOCIO_NOT_FOUND", 404);
  }

  await negocio.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "negocio.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      negocioId: Number(id)
    }
  });

  return res.status(204).send();
};
