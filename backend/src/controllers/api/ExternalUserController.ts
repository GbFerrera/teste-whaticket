import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import User from "../../models/User";
import Queue from "../../models/Queue";
import UserQueue from "../../models/UserQueue";
import Servico from "../../models/Servico";
import UserService from "../../models/UserService";
import UserSchedule from "../../models/UserSchedule";
import Appointment from "../../models/Appointment";
import CrmClient from "../../models/CrmClient";
import Contact from "../../models/Contact";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";
import { Op } from "sequelize";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

const serializeUser = (user: User, includeServices = false) => {
  const result: any = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    profileImage: user.profileImage,
    whatsappId: user.whatsappId,
    online: user.online,
    startWork: user.startWork,
    endWork: user.endWork,
    userType: user.userType,
    workDays: user.workDays,
    lunchStart: user.lunchStart,
    lunchEnd: user.lunchEnd,
    color: user.color,
    allTicket: user.allTicket,
    allowGroup: user.allowGroup,
    farewellMessage: user.farewellMessage,
    allHistoric: user.allHistoric,
    allUserChat: user.allUserChat,
    userClosePendingTicket: user.userClosePendingTicket,
    showDashboard: user.showDashboard,
    allowRealTime: user.allowRealTime,
    allowConnections: user.allowConnections,
    queues: user.queues?.map(q => ({ id: q.id, name: q.name, color: q.color })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  if (includeServices && user.services) {
    result.services = user.services.map(s => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao,
      valorOriginal: s.valorOriginal,
      possuiDesconto: s.possuiDesconto,
      valorComDesconto: s.valorComDesconto
    }));
  }

  return result;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { pageNumber, searchParam, profile } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const whereCondition: any = { companyId };

  if (searchParam) {
    const { Op } = require("sequelize");
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  if (profile) {
    whereCondition.profile = profile;
  }

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ],
    attributes: { exclude: ["passwordHash", "tokenVersion"] },
    order: [["name", "ASC"]],
    limit,
    offset
  });

  const hasMore = count > offset + users.length;

  return res.json({
    users: users.map(user => serializeUser(user)),
    count,
    hasMore
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const user = await User.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ],
    attributes: { exclude: ["passwordHash", "tokenVersion"] }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  return res.json(serializeUser(user));
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const {
    name,
    email,
    password,
    profile,
    whatsappId,
    startWork,
    endWork,
    userType,
    workDays,
    lunchStart,
    lunchEnd,
    color,
    allTicket,
    allowGroup,
    farewellMessage,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    allowRealTime,
    allowConnections,
    queueIds
  } = req.body;

  if (!name) {
    throw new AppError("ERR_USER_NAME_REQUIRED", 400);
  }

  if (!email) {
    throw new AppError("ERR_USER_EMAIL_REQUIRED", 400);
  }

  if (!password) {
    throw new AppError("ERR_USER_PASSWORD_REQUIRED", 400);
  }

  // Verificar se email já existe na empresa
  const existingUser = await User.findOne({
    where: { email, companyId: externalAuth.companyId }
  });

  if (existingUser) {
    throw new AppError("ERR_USER_EMAIL_ALREADY_EXISTS", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    profile: profile || "user",
    whatsappId: whatsappId || null,
    startWork: startWork || "00:00",
    endWork: endWork || "23:59",
    userType: userType || "attendant",
    workDays: workDays || "1,2,3,4,5",
    lunchStart: lunchStart || null,
    lunchEnd: lunchEnd || null,
    color: color || "",
    allTicket: allTicket || "disable",
    allowGroup: allowGroup || false,
    farewellMessage: farewellMessage || "",
    allHistoric: allHistoric || "disabled",
    allUserChat: allUserChat || "disabled",
    userClosePendingTicket: userClosePendingTicket || "enabled",
    showDashboard: showDashboard || "disabled",
    allowRealTime: allowRealTime || "disable",
    allowConnections: allowConnections || "disable",
    companyId: externalAuth.companyId
  });

  // Adicionar filas ao usuário
  if (queueIds && Array.isArray(queueIds)) {
    for (const queueId of queueIds) {
      await UserQueue.create({
        userId: user.id,
        queueId
      });
    }
  }

  await user.reload({
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ],
    attributes: { exclude: ["passwordHash", "tokenVersion"] }
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      user: serializeUser(user)
    }
  });

  return res.status(201).json(serializeUser(user));
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const {
    name,
    email,
    password,
    profile,
    whatsappId,
    startWork,
    endWork,
    userType,
    workDays,
    lunchStart,
    lunchEnd,
    color,
    allTicket,
    allowGroup,
    farewellMessage,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    allowRealTime,
    allowConnections,
    queueIds
  } = req.body;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Verificar se email já existe em outro usuário
  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      where: { email, companyId: externalAuth.companyId }
    });
    if (existingUser && existingUser.id !== user.id) {
      throw new AppError("ERR_USER_EMAIL_ALREADY_EXISTS", 400);
    }
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined) updateData.password = password;
  if (profile !== undefined) updateData.profile = profile;
  if (whatsappId !== undefined) updateData.whatsappId = whatsappId;
  if (startWork !== undefined) updateData.startWork = startWork;
  if (endWork !== undefined) updateData.endWork = endWork;
  if (userType !== undefined) updateData.userType = userType;
  if (workDays !== undefined) updateData.workDays = workDays;
  if (lunchStart !== undefined) updateData.lunchStart = lunchStart;
  if (lunchEnd !== undefined) updateData.lunchEnd = lunchEnd;
  if (color !== undefined) updateData.color = color;
  if (allTicket !== undefined) updateData.allTicket = allTicket;
  if (allowGroup !== undefined) updateData.allowGroup = allowGroup;
  if (farewellMessage !== undefined) updateData.farewellMessage = farewellMessage;
  if (allHistoric !== undefined) updateData.allHistoric = allHistoric;
  if (allUserChat !== undefined) updateData.allUserChat = allUserChat;
  if (userClosePendingTicket !== undefined) updateData.userClosePendingTicket = userClosePendingTicket;
  if (showDashboard !== undefined) updateData.showDashboard = showDashboard;
  if (allowRealTime !== undefined) updateData.allowRealTime = allowRealTime;
  if (allowConnections !== undefined) updateData.allowConnections = allowConnections;

  await user.update(updateData);

  // Atualizar filas se fornecido
  if (queueIds !== undefined && Array.isArray(queueIds)) {
    await UserQueue.destroy({ where: { userId: user.id } });
    for (const queueId of queueIds) {
      await UserQueue.create({
        userId: user.id,
        queueId
      });
    }
  }

  await user.reload({
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"], through: { attributes: [] } }
    ],
    attributes: { exclude: ["passwordHash", "tokenVersion"] }
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      user: serializeUser(user)
    }
  });

  return res.json(serializeUser(user));
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Remover filas do usuário
  await UserQueue.destroy({ where: { userId: user.id } });

  await user.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: Number(id)
    }
  });

  return res.status(204).send();
};

// ==================== SERVIÇOS DO USUÁRIO ====================

export const listServices = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const user = await User.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: Servico,
        as: "services",
        through: { attributes: [] }
      }
    ]
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  return res.json({
    services: user.services?.map(s => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao,
      valorOriginal: s.valorOriginal,
      possuiDesconto: s.possuiDesconto,
      valorComDesconto: s.valorComDesconto
    })) || []
  });
};

export const addServices = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { serviceIds } = req.body;

  if (!serviceIds || !Array.isArray(serviceIds)) {
    throw new AppError("ERR_SERVICE_IDS_REQUIRED", 400);
  }

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Verificar se serviços existem
  const services = await Servico.findAll({
    where: { id: { [Op.in]: serviceIds }, companyId: externalAuth.companyId }
  });

  if (services.length === 0) {
    throw new AppError("ERR_SERVICES_NOT_FOUND", 404);
  }

  // Adicionar serviços ao usuário
  for (const service of services) {
    const existing = await UserService.findOne({
      where: { userId: user.id, serviceId: service.id }
    });
    if (!existing) {
      await UserService.create({
        userId: user.id,
        serviceId: service.id
      });
    }
  }

  await user.reload({
    include: [
      { model: Servico, as: "services", through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.services.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
    }
  });

  return res.json({
    message: "Serviços adicionados com sucesso",
    services: user.services?.map(s => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao,
      valorOriginal: s.valorOriginal,
      possuiDesconto: s.possuiDesconto,
      valorComDesconto: s.valorComDesconto
    })) || []
  });
};

export const removeServices = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { serviceIds } = req.body;

  if (!serviceIds || !Array.isArray(serviceIds)) {
    throw new AppError("ERR_SERVICE_IDS_REQUIRED", 400);
  }

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  await UserService.destroy({
    where: { userId: user.id, serviceId: { [Op.in]: serviceIds } }
  });

  await user.reload({
    include: [
      { model: Servico, as: "services", through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.services.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
    }
  });

  return res.json({
    message: "Serviços removidos com sucesso",
    services: user.services?.map(s => ({
      id: s.id,
      nome: s.nome
    })) || []
  });
};

export const setServices = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { serviceIds } = req.body;

  if (!serviceIds || !Array.isArray(serviceIds)) {
    throw new AppError("ERR_SERVICE_IDS_REQUIRED", 400);
  }

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Remover todos os serviços atuais
  await UserService.destroy({ where: { userId: user.id } });

  // Adicionar novos serviços
  for (const serviceId of serviceIds) {
    const service = await Servico.findOne({
      where: { id: serviceId, companyId: externalAuth.companyId }
    });
    if (service) {
      await UserService.create({
        userId: user.id,
        serviceId: service.id
      });
    }
  }

  await user.reload({
    include: [
      { model: Servico, as: "services", through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.services.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
    }
  });

  return res.json({
    message: "Serviços atualizados com sucesso",
    services: user.services?.map(s => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao,
      valorOriginal: s.valorOriginal,
      possuiDesconto: s.possuiDesconto,
      valorComDesconto: s.valorComDesconto
    })) || []
  });
};

// ==================== AGENDA DO USUÁRIO ====================

export const getSchedule = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const user = await User.findOne({
    where: { id: Number(id), companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId }
  });

  if (!schedule) {
    return res.json({
      schedule: null,
      message: "Usuário não possui agenda configurada"
    });
  }

  return res.json({
    schedule: {
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      active: schedule.active,
      userId: schedule.userId,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }
  });
};

export const createSchedule = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { name, description, active } = req.body;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Verificar se já existe agenda
  const existingSchedule = await UserSchedule.findOne({
    where: { userId: user.id }
  });

  if (existingSchedule) {
    throw new AppError("ERR_USER_SCHEDULE_ALREADY_EXISTS", 400);
  }

  const schedule = await UserSchedule.create({
    name: name || `Agenda de ${user.name}`,
    description: description || "",
    active: active !== false,
    userId: user.id,
    companyId: externalAuth.companyId
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.schedule.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      schedule: {
        id: schedule.id,
        name: schedule.name,
        active: schedule.active
      }
    }
  });

  return res.status(201).json({
    schedule: {
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      active: schedule.active,
      userId: schedule.userId,
      createdAt: schedule.createdAt
    }
  });
};

export const updateSchedule = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { name, description, active } = req.body;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId: externalAuth.companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_USER_SCHEDULE_NOT_FOUND", 404);
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (active !== undefined) updateData.active = active;

  await schedule.update(updateData);

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.schedule.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      schedule: {
        id: schedule.id,
        name: schedule.name,
        active: schedule.active
      }
    }
  });

  return res.json({
    schedule: {
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      active: schedule.active,
      userId: schedule.userId,
      updatedAt: schedule.updatedAt
    }
  });
};

// ==================== COMPROMISSOS DO USUÁRIO ====================

export const listAppointments = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;
  const { status, startDate, endDate, pageNumber = "1" } = req.query as any;

  const user = await User.findOne({
    where: { id: Number(id), companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId }
  });

  if (!schedule) {
    return res.json({
      appointments: [],
      count: 0,
      message: "Usuário não possui agenda configurada"
    });
  }

  const whereCondition: any = { scheduleId: schedule.id };

  if (status) {
    whereCondition.status = status;
  }

  if (startDate) {
    whereCondition.startDatetime = {
      ...whereCondition.startDatetime,
      [Op.gte]: new Date(startDate)
    };
  }

  if (endDate) {
    whereCondition.startDatetime = {
      ...whereCondition.startDatetime,
      [Op.lte]: new Date(endDate)
    };
  }

  const limit = 50;
  const offset = (Number(pageNumber) - 1) * limit;

  const { count, rows: appointments } = await Appointment.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Servico, as: "service", attributes: ["id", "nome", "valorOriginal"] },
      { model: CrmClient, as: "client", attributes: ["id", "name", "email", "phone"] },
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] }
    ],
    order: [["startDatetime", "ASC"]],
    limit,
    offset
  });

  return res.json({
    appointments: appointments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      startDatetime: a.startDatetime,
      durationMinutes: a.durationMinutes,
      status: a.status,
      service: a.service ? { id: a.service.id, nome: a.service.nome, valor: a.service.valorOriginal } : null,
      client: a.client ? { id: a.client.id, name: a.client.name, email: a.client.email } : null,
      contact: a.contact ? { id: a.contact.id, name: a.contact.name, number: a.contact.number } : null,
      createdAt: a.createdAt
    })),
    count,
    hasMore: offset + appointments.length < count
  });
};

export const createAppointment = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const {
    title,
    description,
    startDatetime,
    durationMinutes,
    serviceId,
    clientId,
    contactId
  } = req.body;

  if (!startDatetime) {
    throw new AppError("ERR_START_DATETIME_REQUIRED", 400);
  }

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  let schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId: externalAuth.companyId }
  });

  // Criar agenda automaticamente se não existir
  if (!schedule) {
    schedule = await UserSchedule.create({
      name: `Agenda de ${user.name}`,
      description: "",
      active: true,
      userId: user.id,
      companyId: externalAuth.companyId
    });
  }

  const appointment = await Appointment.create({
    title: title || "Compromisso",
    description: description || "",
    startDatetime: new Date(startDatetime),
    durationMinutes: durationMinutes || 60,
    status: "scheduled",
    scheduleId: schedule.id,
    serviceId: serviceId || null,
    clientId: clientId || null,
    contactId: contactId || null,
    companyId: externalAuth.companyId
  });

  await appointment.reload({
    include: [
      { model: Servico, as: "service", attributes: ["id", "nome", "valorOriginal"] },
      { model: CrmClient, as: "client", attributes: ["id", "name", "email", "phone"] },
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.appointment.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startDatetime: appointment.startDatetime,
        status: appointment.status
      }
    }
  });

  return res.status(201).json({
    id: appointment.id,
    title: appointment.title,
    description: appointment.description,
    startDatetime: appointment.startDatetime,
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    service: appointment.service ? { id: appointment.service.id, nome: appointment.service.nome } : null,
    client: appointment.client ? { id: appointment.client.id, name: appointment.client.name } : null,
    contact: appointment.contact ? { id: appointment.contact.id, name: appointment.contact.name } : null,
    createdAt: appointment.createdAt
  });
};

export const updateAppointment = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id, appointmentId } = req.params;
  const {
    title,
    description,
    startDatetime,
    durationMinutes,
    status,
    serviceId,
    clientId,
    contactId
  } = req.body;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId: externalAuth.companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_USER_SCHEDULE_NOT_FOUND", 404);
  }

  const appointment = await Appointment.findOne({
    where: { id: Number(appointmentId), scheduleId: schedule.id }
  });

  if (!appointment) {
    throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (startDatetime !== undefined) updateData.startDatetime = new Date(startDatetime);
  if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
  if (status !== undefined) updateData.status = status;
  if (serviceId !== undefined) updateData.serviceId = serviceId;
  if (clientId !== undefined) updateData.clientId = clientId;
  if (contactId !== undefined) updateData.contactId = contactId;

  await appointment.update(updateData);

  await appointment.reload({
    include: [
      { model: Servico, as: "service", attributes: ["id", "nome", "valorOriginal"] },
      { model: CrmClient, as: "client", attributes: ["id", "name", "email", "phone"] },
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.appointment.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startDatetime: appointment.startDatetime,
        status: appointment.status
      }
    }
  });

  return res.json({
    id: appointment.id,
    title: appointment.title,
    description: appointment.description,
    startDatetime: appointment.startDatetime,
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    service: appointment.service ? { id: appointment.service.id, nome: appointment.service.nome } : null,
    client: appointment.client ? { id: appointment.client.id, name: appointment.client.name } : null,
    contact: appointment.contact ? { id: appointment.contact.id, name: appointment.contact.name } : null,
    updatedAt: appointment.updatedAt
  });
};

export const deleteAppointment = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id, appointmentId } = req.params;

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId: externalAuth.companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_USER_SCHEDULE_NOT_FOUND", 404);
  }

  const appointment = await Appointment.findOne({
    where: { id: Number(appointmentId), scheduleId: schedule.id }
  });

  if (!appointment) {
    throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
  }

  await appointment.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "user.appointment.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      appointmentId: Number(appointmentId)
    }
  });

  return res.json({ message: "Compromisso removido com sucesso" });
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id, appointmentId } = req.params;
  const { status } = req.body;

  const validStatuses = ["scheduled", "confirmed", "completed", "cancelled", "no_show"];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError("ERR_INVALID_STATUS", 400);
  }

  const user = await User.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const schedule = await UserSchedule.findOne({
    where: { userId: user.id, companyId: externalAuth.companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_USER_SCHEDULE_NOT_FOUND", 404);
  }

  const appointment = await Appointment.findOne({
    where: { id: Number(appointmentId), scheduleId: schedule.id }
  });

  if (!appointment) {
    throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
  }

  await appointment.update({ status });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: `user.appointment.${status}`,
    data: {
      apiKeyId: externalAuth.apiKeyId,
      userId: user.id,
      appointmentId: appointment.id,
      status
    }
  });

  return res.json({
    id: appointment.id,
    title: appointment.title,
    status: appointment.status,
    message: `Status atualizado para ${status}`
  });
};
