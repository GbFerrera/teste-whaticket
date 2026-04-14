import { Request, Response } from "express";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import Message from "../../models/Message";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

const serializeTicket = (ticket: Ticket) => ({
  id: ticket.id,
  uuid: ticket.uuid,
  status: ticket.status,
  channel: ticket.channel,
  lastMessage: ticket.lastMessage,
  isGroup: ticket.isGroup,
  unreadMessages: ticket.unreadMessages,
  contactId: ticket.contactId,
  contact: ticket.contact ? {
    id: ticket.contact.id,
    name: ticket.contact.name,
    number: ticket.contact.number,
    email: ticket.contact.email,
    profilePicUrl: ticket.contact.profilePicUrl
  } : null,
  userId: ticket.userId,
  user: ticket.user ? {
    id: ticket.user.id,
    name: ticket.user.name,
    email: ticket.user.email
  } : null,
  queueId: ticket.queueId,
  queue: ticket.queue ? {
    id: ticket.queue.id,
    name: ticket.queue.name,
    color: ticket.queue.color
  } : null,
  whatsappId: ticket.whatsappId,
  whatsapp: ticket.whatsapp ? {
    id: ticket.whatsapp.id,
    name: ticket.whatsapp.name
  } : null,
  tags: ticket.tags?.map(t => ({ id: t.id, name: t.name, color: t.color })) || [],
  isBot: ticket.isBot,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { 
    pageNumber, 
    status, 
    queueId, 
    userId, 
    contactId,
    whatsappId,
    isGroup,
    searchParam,
    startDate,
    endDate
  } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const whereCondition: any = { companyId };

  if (status) {
    whereCondition.status = status;
  }

  if (queueId) {
    whereCondition.queueId = Number(queueId);
  }

  if (userId) {
    whereCondition.userId = Number(userId);
  }

  if (contactId) {
    whereCondition.contactId = Number(contactId);
  }

  if (whatsappId) {
    whereCondition.whatsappId = Number(whatsappId);
  }

  if (isGroup !== undefined) {
    whereCondition.isGroup = isGroup === "true";
  }

  if (startDate && endDate) {
    whereCondition.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    whereCondition.createdAt = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    whereCondition.createdAt = {
      [Op.lte]: new Date(endDate)
    };
  }

  const includeCondition: any[] = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "email"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] }
    }
  ];

  // Filtrar por nome/número do contato
  if (searchParam) {
    includeCondition[0].where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { number: { [Op.iLike]: `%${searchParam}%` } }
      ]
    };
    includeCondition[0].required = true;
  }

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    order: [["updatedAt", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + tickets.length;

  return res.json({
    tickets: tickets.map(serializeTicket),
    count,
    hasMore
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "profilePicUrl"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  return res.json(serializeTicket(ticket));
};

export const messages = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;
  const { pageNumber } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  const { count, rows: messagesList } = await Message.findAndCountAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + messagesList.length;

  return res.json({
    messages: messagesList.map(m => ({
      id: m.id,
      body: m.body,
      read: m.read,
      mediaType: m.mediaType,
      mediaUrl: m.mediaUrl,
      fromMe: m.fromMe,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt
    })),
    count,
    hasMore
  });
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { status, userId, queueId, tagIds } = req.body;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  const updateData: any = {};

  if (status !== undefined) {
    const validStatuses = ["open", "pending", "closed"];
    if (!validStatuses.includes(status)) {
      throw new AppError("ERR_INVALID_STATUS", 400);
    }
    updateData.status = status;
  }

  if (userId !== undefined) {
    if (userId === null) {
      updateData.userId = null;
    } else {
      const user = await User.findOne({
        where: { id: userId, companyId: externalAuth.companyId }
      });
      if (!user) {
        throw new AppError("ERR_USER_NOT_FOUND", 404);
      }
      updateData.userId = userId;
    }
  }

  if (queueId !== undefined) {
    if (queueId === null) {
      updateData.queueId = null;
    } else {
      const queue = await Queue.findOne({
        where: { id: queueId, companyId: externalAuth.companyId }
      });
      if (!queue) {
        throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
      }
      updateData.queueId = queueId;
    }
  }

  await ticket.update(updateData);

  // Atualizar tags se fornecido
  if (tagIds !== undefined && Array.isArray(tagIds)) {
    await TicketTag.destroy({ where: { ticketId: ticket.id } });
    for (const tagId of tagIds) {
      await TicketTag.create({
        ticketId: ticket.id,
        tagId
      });
    }
  }

  await ticket.reload({
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "ticket.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      ticket: serializeTicket(ticket)
    }
  });

  return res.json(serializeTicket(ticket));
};

export const close = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  await ticket.update({ status: "closed" });

  await ticket.reload({
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "ticket.closed",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      ticket: serializeTicket(ticket)
    }
  });

  return res.json(serializeTicket(ticket));
};

export const reopen = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  await ticket.update({ status: "open" });

  await ticket.reload({
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "ticket.reopened",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      ticket: serializeTicket(ticket)
    }
  });

  return res.json(serializeTicket(ticket));
};

export const transfer = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { userId, queueId } = req.body;

  const ticket = await Ticket.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_NOT_FOUND", 404);
  }

  const updateData: any = { status: "pending" };

  if (userId) {
    const user = await User.findOne({
      where: { id: userId, companyId: externalAuth.companyId }
    });
    if (!user) {
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }
    updateData.userId = userId;
    updateData.status = "open";
  }

  if (queueId) {
    const queue = await Queue.findOne({
      where: { id: queueId, companyId: externalAuth.companyId }
    });
    if (!queue) {
      throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
    }
    updateData.queueId = queueId;
  }

  await ticket.update(updateData);

  await ticket.reload({
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "ticket.transferred",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      ticket: serializeTicket(ticket)
    }
  });

  return res.json(serializeTicket(ticket));
};
