import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import User from "../../models/User";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { pageNumber } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const { count, rows: queues } = await Queue.findAndCountAll({
    where: { companyId },
    attributes: ["id", "name", "color", "greetingMessage", "outOfHoursMessage", "schedules", "orderQueue", "createdAt", "updatedAt"],
    order: [["orderQueue", "ASC"], ["name", "ASC"]],
    limit,
    offset
  });

  const hasMore = count > offset + queues.length;

  return res.json({ queues, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const queue = await Queue.findOne({
    where: { id: Number(id), companyId },
    attributes: ["id", "name", "color", "greetingMessage", "outOfHoursMessage", "schedules", "orderQueue", "createdAt", "updatedAt"],
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name", "email"],
        through: { attributes: [] }
      }
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
  }

  return res.json(queue);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { name, color, greetingMessage, outOfHoursMessage, schedules, orderQueue } = req.body;

  if (!name || !color) {
    throw new AppError("ERR_QUEUE_NAME_COLOR_REQUIRED", 400);
  }

  // Verificar se já existe fila com mesmo nome na empresa
  const existingQueue = await Queue.findOne({
    where: { name, companyId: externalAuth.companyId }
  });

  if (existingQueue) {
    throw new AppError("ERR_QUEUE_NAME_ALREADY_EXISTS", 400);
  }

  // Verificar se já existe fila com mesma cor na empresa
  const existingColor = await Queue.findOne({
    where: { color, companyId: externalAuth.companyId }
  });

  if (existingColor) {
    throw new AppError("ERR_QUEUE_COLOR_ALREADY_EXISTS", 400);
  }

  const queue = await Queue.create({
    name,
    color,
    greetingMessage: greetingMessage || "",
    outOfHoursMessage: outOfHoursMessage || "",
    schedules: schedules || [],
    orderQueue: orderQueue || 0,
    companyId: externalAuth.companyId,
    ativarRoteador: false,
    tempoRoteador: 0
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "queue.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      queue
    }
  });

  return res.status(201).json(queue);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { name, color, greetingMessage, outOfHoursMessage, schedules, orderQueue } = req.body;

  const queue = await Queue.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
  }

  // Verificar se já existe outra fila com mesmo nome
  if (name && name !== queue.name) {
    const existingQueue = await Queue.findOne({
      where: { name, companyId: externalAuth.companyId }
    });
    if (existingQueue) {
      throw new AppError("ERR_QUEUE_NAME_ALREADY_EXISTS", 400);
    }
  }

  // Verificar se já existe outra fila com mesma cor
  if (color && color !== queue.color) {
    const existingColor = await Queue.findOne({
      where: { color, companyId: externalAuth.companyId }
    });
    if (existingColor) {
      throw new AppError("ERR_QUEUE_COLOR_ALREADY_EXISTS", 400);
    }
  }

  await queue.update({
    name: name !== undefined ? name : queue.name,
    color: color !== undefined ? color : queue.color,
    greetingMessage: greetingMessage !== undefined ? greetingMessage : queue.greetingMessage,
    outOfHoursMessage: outOfHoursMessage !== undefined ? outOfHoursMessage : queue.outOfHoursMessage,
    schedules: schedules !== undefined ? schedules : queue.schedules,
    orderQueue: orderQueue !== undefined ? orderQueue : queue.orderQueue
  });

  await queue.reload();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "queue.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      queue
    }
  });

  return res.json(queue);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const queue = await Queue.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
  }

  await queue.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "queue.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      queueId: Number(id)
    }
  });

  return res.status(204).send();
};
