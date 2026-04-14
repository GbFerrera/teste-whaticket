import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import WhatsappQueue from "../../models/WhatsappQueue";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";
import { getIO } from "../../libs/socket";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

const serializeWhatsapp = (whatsapp: Whatsapp) => ({
  id: whatsapp.id,
  name: whatsapp.name,
  number: whatsapp.number,
  status: whatsapp.status,
  channel: whatsapp.channel || "whatsapp",
  isDefault: whatsapp.isDefault,
  allowGroup: whatsapp.allowGroup,
  battery: whatsapp.battery,
  plugged: whatsapp.plugged,
  provider: whatsapp.provider,
  greetingMessage: whatsapp.greetingMessage,
  farewellMessage: whatsapp.farewellMessage,
  complationMessage: whatsapp.complationMessage,
  outOfHoursMessage: whatsapp.outOfHoursMessage,
  queues: whatsapp.queues?.map(q => ({
    id: q.id,
    name: q.name,
    color: q.color
  })) || [],
  createdAt: whatsapp.createdAt,
  updatedAt: whatsapp.updatedAt
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);

  const whatsapps = await Whatsapp.findAll({
    where: { 
      companyId,
      channel: "whatsapp"
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ],
    order: [["name", "ASC"]]
  });

  return res.json({
    whatsapps: whatsapps.map(serializeWhatsapp)
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId,
      channel: "whatsapp"
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  return res.json(serializeWhatsapp(whatsapp));
};

export const status = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  return res.json({
    id: whatsapp.id,
    name: whatsapp.name,
    number: whatsapp.number,
    status: whatsapp.status,
    battery: whatsapp.battery,
    plugged: whatsapp.plugged,
    qrcode: whatsapp.qrcode,
    retries: whatsapp.retries
  });
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const {
    name,
    greetingMessage,
    farewellMessage,
    complationMessage,
    outOfHoursMessage,
    isDefault,
    allowGroup,
    queueIds
  } = req.body;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId: externalAuth.companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (greetingMessage !== undefined) updateData.greetingMessage = greetingMessage;
  if (farewellMessage !== undefined) updateData.farewellMessage = farewellMessage;
  if (complationMessage !== undefined) updateData.complationMessage = complationMessage;
  if (outOfHoursMessage !== undefined) updateData.outOfHoursMessage = outOfHoursMessage;
  if (isDefault !== undefined) updateData.isDefault = isDefault;
  if (allowGroup !== undefined) updateData.allowGroup = allowGroup;

  await whatsapp.update(updateData);

  // Atualizar filas associadas
  if (queueIds !== undefined && Array.isArray(queueIds)) {
    await WhatsappQueue.destroy({ where: { whatsappId: whatsapp.id } });
    for (const queueId of queueIds) {
      const queue = await Queue.findOne({
        where: { id: queueId, companyId: externalAuth.companyId }
      });
      if (queue) {
        await WhatsappQueue.create({
          whatsappId: whatsapp.id,
          queueId
        });
      }
    }
  }

  await whatsapp.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "whatsapp.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      whatsapp: serializeWhatsapp(whatsapp)
    }
  });

  return res.json(serializeWhatsapp(whatsapp));
};

export const restart = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId: externalAuth.companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  // Resetar status para forçar reconexão
  await whatsapp.update({
    status: "OPENING",
    qrcode: "",
    retries: 0
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "whatsapp.restarting",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      whatsappId: whatsapp.id,
      name: whatsapp.name
    }
  });

  return res.json({
    message: "Conexão reiniciando...",
    whatsappId: whatsapp.id,
    status: "OPENING"
  });
};

export const disconnect = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId: externalAuth.companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  await whatsapp.update({
    status: "DISCONNECTED",
    session: "",
    qrcode: "",
    retries: 0
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "whatsapp.disconnected",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      whatsappId: whatsapp.id,
      name: whatsapp.name
    }
  });

  return res.json({
    message: "Conexão desconectada",
    whatsappId: whatsapp.id,
    status: "DISCONNECTED"
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const {
    name,
    greetingMessage,
    farewellMessage,
    complationMessage,
    outOfHoursMessage,
    isDefault,
    allowGroup,
    queueIds,
    provider
  } = req.body;

  if (!name) {
    throw new AppError("ERR_NAME_REQUIRED", 400);
  }

  // Verificar se já existe uma conexão com esse nome
  const existingWhatsapp = await Whatsapp.findOne({
    where: { name, companyId: externalAuth.companyId }
  });

  if (existingWhatsapp) {
    throw new AppError("ERR_WHATSAPP_NAME_ALREADY_EXISTS", 400);
  }

  // Se for default, remover default das outras
  if (isDefault) {
    await Whatsapp.update(
      { isDefault: false },
      { where: { companyId: externalAuth.companyId, isDefault: true } }
    );
  }

  const whatsapp = await Whatsapp.create({
    name,
    companyId: externalAuth.companyId,
    channel: "whatsapp",
    provider: provider || "stable",
    greetingMessage: greetingMessage || "",
    farewellMessage: farewellMessage || "",
    complationMessage: complationMessage || "",
    outOfHoursMessage: outOfHoursMessage || "",
    isDefault: isDefault || false,
    allowGroup: allowGroup || false,
    status: "OPENING",
    retries: 0
  });

  // Associar filas
  if (queueIds && Array.isArray(queueIds)) {
    for (const queueId of queueIds) {
      const queue = await Queue.findOne({
        where: { id: queueId, companyId: externalAuth.companyId }
      });
      if (queue) {
        await WhatsappQueue.create({
          whatsappId: whatsapp.id,
          queueId
        });
      }
    }
  }

  await whatsapp.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  // Emitir evento para iniciar conexão
  const io = getIO();
  io.to(`company-${externalAuth.companyId}-mainchannel`).emit(
    `company-${externalAuth.companyId}-whatsapp`,
    {
      action: "update",
      whatsapp
    }
  );

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "whatsapp.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      whatsapp: serializeWhatsapp(whatsapp)
    }
  });

  return res.status(201).json({
    ...serializeWhatsapp(whatsapp),
    message: "Conexão criada. Aguarde o QR Code ser gerado."
  });
};

export const qrcode = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  return res.json({
    id: whatsapp.id,
    name: whatsapp.name,
    status: whatsapp.status,
    qrcode: whatsapp.qrcode || null,
    retries: whatsapp.retries,
    message: whatsapp.qrcode 
      ? "QR Code disponível. Escaneie com o WhatsApp." 
      : whatsapp.status === "CONNECTED" 
        ? "Conexão já está ativa." 
        : "QR Code ainda não foi gerado. Aguarde alguns segundos."
  });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { 
      id: Number(id), 
      companyId: externalAuth.companyId,
      channel: "whatsapp"
    }
  });

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  // Remover associações
  await WhatsappQueue.destroy({ where: { whatsappId: whatsapp.id } });

  await whatsapp.destroy();

  // Emitir evento de remoção
  const io = getIO();
  io.to(`company-${externalAuth.companyId}-mainchannel`).emit(
    `company-${externalAuth.companyId}-whatsapp`,
    {
      action: "delete",
      whatsappId: Number(id)
    }
  );

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "whatsapp.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      whatsappId: Number(id)
    }
  });

  return res.json({ message: "Conexão removida com sucesso" });
};
