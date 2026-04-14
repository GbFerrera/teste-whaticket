import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import ProjectTask from "../../models/ProjectTask";
import ProjectTaskUser from "../../models/ProjectTaskUser";
import Project from "../../models/Project";
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
  const { pageNumber, projectId, status, assignedUserId } = req.query as any;

  const limit = 50;
  const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;

  const whereCondition: any = { companyId };

  if (projectId) {
    whereCondition.projectId = Number(projectId);
  }

  if (status) {
    whereCondition.status = status;
  }

  const includeCondition: any[] = [
    {
      model: Project,
      as: "project",
      attributes: ["id", "name", "status"]
    },
    {
      model: User,
      as: "assignedUsers",
      attributes: ["id", "name", "email"],
      through: { attributes: [] }
    }
  ];

  // Filtrar por usuário atribuído
  if (assignedUserId) {
    includeCondition[1].where = { id: Number(assignedUserId) };
    includeCondition[1].required = true;
  }

  const { count, rows: tasks } = await ProjectTask.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    order: [["order", "ASC"], ["createdAt", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + tasks.length;

  return res.json({ tasks, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const task = await ProjectTask.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status", "clientId"]
      },
      {
        model: User,
        as: "assignedUsers",
        attributes: ["id", "name", "email"],
        through: { attributes: [] }
      }
    ]
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND", 404);
  }

  return res.json(task);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { 
    projectId,
    title, 
    description, 
    status, 
    order,
    startDate, 
    dueDate,
    assignedUserIds 
  } = req.body;

  if (!projectId) {
    throw new AppError("ERR_TASK_PROJECT_REQUIRED", 400);
  }

  if (!title) {
    throw new AppError("ERR_TASK_TITLE_REQUIRED", 400);
  }

  // Verificar se o projeto existe e pertence à empresa
  const project = await Project.findOne({
    where: { id: projectId, companyId: externalAuth.companyId }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  const task = await ProjectTask.create({
    projectId,
    title,
    description: description || null,
    status: status || "pending",
    order: order || 0,
    startDate: startDate || null,
    dueDate: dueDate || null,
    companyId: externalAuth.companyId
  });

  // Adicionar usuários atribuídos
  if (assignedUserIds && Array.isArray(assignedUserIds)) {
    for (const userId of assignedUserIds) {
      await ProjectTaskUser.create({
        projectTaskId: task.id,
        userId
      });
    }
  }

  await task.reload({
    include: [
      { model: Project, as: "project", attributes: ["id", "name", "status"] },
      { model: User, as: "assignedUsers", attributes: ["id", "name", "email"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "projectTask.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      task
    }
  });

  return res.status(201).json(task);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { 
    title, 
    description, 
    status, 
    order,
    startDate, 
    dueDate,
    completedAt,
    assignedUserIds 
  } = req.body;

  const task = await ProjectTask.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND", 404);
  }

  // Se status mudou para completed, definir completedAt
  let newCompletedAt = completedAt;
  if (status === "completed" && task.status !== "completed" && !completedAt) {
    newCompletedAt = new Date();
  }

  await task.update({
    title: title !== undefined ? title : task.title,
    description: description !== undefined ? description : task.description,
    status: status !== undefined ? status : task.status,
    order: order !== undefined ? order : task.order,
    startDate: startDate !== undefined ? startDate : task.startDate,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    completedAt: newCompletedAt !== undefined ? newCompletedAt : task.completedAt
  });

  // Atualizar usuários atribuídos se fornecido
  if (assignedUserIds !== undefined && Array.isArray(assignedUserIds)) {
    await ProjectTaskUser.destroy({ where: { projectTaskId: task.id } });
    for (const userId of assignedUserIds) {
      await ProjectTaskUser.create({
        projectTaskId: task.id,
        userId
      });
    }
  }

  await task.reload({
    include: [
      { model: Project, as: "project", attributes: ["id", "name", "status"] },
      { model: User, as: "assignedUsers", attributes: ["id", "name", "email"], through: { attributes: [] } }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "projectTask.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      task
    }
  });

  return res.json(task);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const task = await ProjectTask.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND", 404);
  }

  // Remover usuários atribuídos
  await ProjectTaskUser.destroy({ where: { projectTaskId: task.id } });

  await task.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "projectTask.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      taskId: Number(id)
    }
  });

  return res.status(204).send();
};
