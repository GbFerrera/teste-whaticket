import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import Project from "../../models/Project";
import ProjectUser from "../../models/ProjectUser";
import ProjectTask from "../../models/ProjectTask";
import User from "../../models/User";
import CrmClient from "../../models/CrmClient";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  return req.externalAuth;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { pageNumber, searchParam, status, clientId } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition.name = {
      [require("sequelize").Op.iLike]: `%${searchParam}%`
    };
  }

  if (status) {
    whereCondition.status = status;
  }

  if (clientId) {
    whereCondition.clientId = Number(clientId);
  }

  const { count, rows: projects } = await Project.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email"]
      },
      {
        model: ProjectUser,
        as: "users",
        include: [{
          model: User,
          attributes: ["id", "name", "email"]
        }]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + projects.length;

  return res.json({ projects, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const project = await Project.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phoneNumber"]
      },
      {
        model: ProjectUser,
        as: "users",
        include: [{
          model: User,
          attributes: ["id", "name", "email"]
        }]
      },
      {
        model: ProjectTask,
        as: "tasks",
        include: [{
          model: User,
          as: "assignedUsers",
          attributes: ["id", "name", "email"],
          through: { attributes: [] }
        }]
      }
    ]
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  return res.json(project);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { 
    name, 
    description, 
    clientId, 
    status, 
    startDate, 
    endDate, 
    deliveryTime,
    warranty,
    terms,
    userIds 
  } = req.body;

  if (!name) {
    throw new AppError("ERR_PROJECT_NAME_REQUIRED", 400);
  }

  const project = await Project.create({
    name,
    description: description || null,
    clientId: clientId || null,
    status: status || "draft",
    startDate: startDate || null,
    endDate: endDate || null,
    deliveryTime: deliveryTime || null,
    warranty: warranty || null,
    terms: terms || null,
    companyId: externalAuth.companyId
  });

  // Adicionar usuários ao projeto
  if (userIds && Array.isArray(userIds)) {
    for (const userId of userIds) {
      await ProjectUser.create({
        projectId: project.id,
        userId,
        companyId: externalAuth.companyId
      });
    }
  }

  await project.reload({
    include: [
      { model: CrmClient, as: "client", attributes: ["id", "name", "email"] },
      { model: ProjectUser, as: "users", include: [{ model: User, attributes: ["id", "name", "email"] }] }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "project.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      project
    }
  });

  return res.status(201).json(project);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { 
    name, 
    description, 
    clientId, 
    status, 
    startDate, 
    endDate, 
    deliveryTime,
    warranty,
    terms,
    userIds 
  } = req.body;

  const project = await Project.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  await project.update({
    name: name !== undefined ? name : project.name,
    description: description !== undefined ? description : project.description,
    clientId: clientId !== undefined ? clientId : project.clientId,
    status: status !== undefined ? status : project.status,
    startDate: startDate !== undefined ? startDate : project.startDate,
    endDate: endDate !== undefined ? endDate : project.endDate,
    deliveryTime: deliveryTime !== undefined ? deliveryTime : project.deliveryTime,
    warranty: warranty !== undefined ? warranty : project.warranty,
    terms: terms !== undefined ? terms : project.terms
  });

  // Atualizar usuários se fornecido
  if (userIds !== undefined && Array.isArray(userIds)) {
    await ProjectUser.destroy({ where: { projectId: project.id } });
    for (const userId of userIds) {
      await ProjectUser.create({
        projectId: project.id,
        userId,
        companyId: externalAuth.companyId
      });
    }
  }

  await project.reload({
    include: [
      { model: CrmClient, as: "client", attributes: ["id", "name", "email"] },
      { model: ProjectUser, as: "users", include: [{ model: User, attributes: ["id", "name", "email"] }] }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "project.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      project
    }
  });

  return res.json(project);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const project = await Project.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  // Remover usuários e tarefas relacionadas
  await ProjectUser.destroy({ where: { projectId: project.id } });
  await ProjectTask.destroy({ where: { projectId: project.id } });

  await project.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "project.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      projectId: Number(id)
    }
  });

  return res.status(204).send();
};
