import { Request, Response } from "express";
import ListProjectsService from "../services/ProjectServices/ListProjectsService";
import ListUserTasksService from "../services/ProjectServices/ListUserTasksService";
import CreateProjectService from "../services/ProjectServices/CreateProjectService";
import ShowProjectService from "../services/ProjectServices/ShowProjectService";
import UpdateProjectService from "../services/ProjectServices/UpdateProjectService";
import DeleteProjectService from "../services/ProjectServices/DeleteProjectService";
import CreateProjectTaskService from "../services/ProjectServices/CreateProjectTaskService";
import UpdateProjectTaskService from "../services/ProjectServices/UpdateProjectTaskService";
import DeleteProjectTaskService from "../services/ProjectServices/DeleteProjectTaskService";
import {
  addServiceToProject,
  removeServiceFromProject,
  addProductToProject,
  removeProductFromProject,
  addUserToProject,
  removeUserFromProject,
  addUserToTask,
  removeUserFromTask
} from "../services/ProjectServices/ManageProjectItemsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, status, clientId, pageNumber, limit } = req.query as any;

  const result = await ListProjectsService({
    companyId,
    searchParam,
    status,
    clientId: clientId ? Number(clientId) : undefined,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  return res.json(result);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { userIds, serviceIds, productIds, ...data } = req.body;

  const project = await CreateProjectService({
    ...data,
    companyId
  });

  // Adicionar usuários ao projeto
  if (userIds && Array.isArray(userIds)) {
    for (const userId of userIds) {
      try {
        await addUserToProject({
          companyId,
          projectId: project.id,
          userId: Number(userId)
        });
      } catch (err) {
        console.error(`Erro ao adicionar usuário ${userId}:`, err);
      }
    }
  }

  // Adicionar serviços ao projeto
  if (serviceIds && Array.isArray(serviceIds)) {
    for (const item of serviceIds) {
      try {
        const serviceId = typeof item === "object" ? item.serviceId : item;
        const quantity = typeof item === "object" ? item.quantity : 1;
        await addServiceToProject({
          companyId,
          projectId: project.id,
          serviceId: Number(serviceId),
          quantity
        });
      } catch (err) {
        console.error(`Erro ao adicionar serviço:`, err);
      }
    }
  }

  // Adicionar produtos ao projeto
  if (productIds && Array.isArray(productIds)) {
    for (const item of productIds) {
      try {
        const productId = typeof item === "object" ? item.productId : item;
        const quantity = typeof item === "object" ? item.quantity : 1;
        await addProductToProject({
          companyId,
          projectId: project.id,
          productId: Number(productId),
          quantity
        });
      } catch (err) {
        console.error(`Erro ao adicionar produto:`, err);
      }
    }
  }

  // Retornar projeto com associações
  const fullProject = await ShowProjectService({ id: project.id, companyId });
  return res.status(201).json(fullProject);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;

  const project = await ShowProjectService({
    id: Number(projectId),
    companyId
  });

  return res.json(project);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;
  const { userIds, serviceIds, productIds, ...data } = req.body;

  const project = await UpdateProjectService({
    id: Number(projectId),
    companyId,
    ...data
  });

  // Atualizar usuários - remover todos e adicionar novamente
  if (userIds !== undefined && Array.isArray(userIds)) {
    // Buscar usuários atuais
    const currentProject = await ShowProjectService({ id: Number(projectId), companyId });
    const currentUserIds = (currentProject.users || []).map((pu: any) => pu.user?.id || pu.userId);
    
    // Remover usuários que não estão mais na lista
    for (const userId of currentUserIds) {
      if (!userIds.includes(userId)) {
        try {
          await removeUserFromProject(companyId, Number(projectId), Number(userId));
        } catch (err) {
          console.error(`Erro ao remover usuário ${userId}:`, err);
        }
      }
    }
    
    // Adicionar novos usuários
    for (const userId of userIds) {
      if (!currentUserIds.includes(userId)) {
        try {
          await addUserToProject({
            companyId,
            projectId: Number(projectId),
            userId: Number(userId)
          });
        } catch (err) {
          console.error(`Erro ao adicionar usuário ${userId}:`, err);
        }
      }
    }
  }

  // Atualizar serviços
  if (serviceIds !== undefined && Array.isArray(serviceIds)) {
    const currentProject = await ShowProjectService({ id: Number(projectId), companyId });
    const currentServiceIds = (currentProject.services || []).map((ps: any) => ps.service?.id || ps.serviceId);
    const newServiceIds = serviceIds.map((item: any) => typeof item === "object" ? item.serviceId : item);
    
    // Remover serviços que não estão mais na lista
    for (const serviceId of currentServiceIds) {
      if (!newServiceIds.includes(serviceId)) {
        try {
          await removeServiceFromProject(companyId, Number(projectId), Number(serviceId));
        } catch (err) {
          console.error(`Erro ao remover serviço ${serviceId}:`, err);
        }
      }
    }
    
    // Adicionar novos serviços
    for (const item of serviceIds) {
      const serviceId = typeof item === "object" ? item.serviceId : item;
      if (!currentServiceIds.includes(serviceId)) {
        try {
          const quantity = typeof item === "object" ? item.quantity : 1;
          await addServiceToProject({
            companyId,
            projectId: Number(projectId),
            serviceId: Number(serviceId),
            quantity
          });
        } catch (err) {
          console.error(`Erro ao adicionar serviço ${serviceId}:`, err);
        }
      }
    }
  }

  // Atualizar produtos
  if (productIds !== undefined && Array.isArray(productIds)) {
    const currentProject = await ShowProjectService({ id: Number(projectId), companyId });
    const currentProductIds = (currentProject.products || []).map((pp: any) => pp.product?.id || pp.productId);
    const newProductIds = productIds.map((item: any) => typeof item === "object" ? item.productId : item);
    
    // Remover produtos que não estão mais na lista
    for (const productId of currentProductIds) {
      if (!newProductIds.includes(productId)) {
        try {
          await removeProductFromProject(companyId, Number(projectId), Number(productId));
        } catch (err) {
          console.error(`Erro ao remover produto ${productId}:`, err);
        }
      }
    }
    
    // Adicionar novos produtos
    for (const item of productIds) {
      const productId = typeof item === "object" ? item.productId : item;
      if (!currentProductIds.includes(productId)) {
        try {
          const quantity = typeof item === "object" ? item.quantity : 1;
          await addProductToProject({
            companyId,
            projectId: Number(projectId),
            productId: Number(productId),
            quantity
          });
        } catch (err) {
          console.error(`Erro ao adicionar produto ${productId}:`, err);
        }
      }
    }
  }

  // Retornar projeto com associações atualizadas
  const fullProject = await ShowProjectService({ id: Number(projectId), companyId });
  return res.json(fullProject);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;

  await DeleteProjectService({
    id: Number(projectId),
    companyId
  });

  return res.status(204).send();
};

// Tasks
export const storeTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;
  const data = req.body;

  const task = await CreateProjectTaskService({
    ...data,
    projectId: Number(projectId),
    companyId
  });

  return res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;
  const data = req.body;

  const task = await UpdateProjectTaskService({
    id: Number(taskId),
    companyId,
    ...data
  });

  return res.json(task);
};

export const removeTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  await DeleteProjectTaskService({
    id: Number(taskId),
    companyId
  });

  return res.status(204).send();
};

// Services
export const addService = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;
  const { serviceId, quantity, unitPrice, notes } = req.body;

  const projectService = await addServiceToProject({
    companyId,
    projectId: Number(projectId),
    serviceId: Number(serviceId),
    quantity,
    unitPrice,
    notes
  });

  return res.status(201).json(projectService);
};

export const removeService = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId, serviceId } = req.params;

  await removeServiceFromProject(companyId, Number(projectId), Number(serviceId));

  return res.status(204).send();
};

// Products
export const addProduct = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;
  const { productId, quantity, unitPrice, notes } = req.body;

  const projectProduct = await addProductToProject({
    companyId,
    projectId: Number(projectId),
    productId: Number(productId),
    quantity,
    unitPrice,
    notes
  });

  return res.status(201).json(projectProduct);
};

export const removeProduct = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId, productId } = req.params;

  await removeProductFromProject(companyId, Number(projectId), Number(productId));

  return res.status(204).send();
};

// Users
export const addUser = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;
  const { userId, role, effortAllocation } = req.body;

  const projectUser = await addUserToProject({
    companyId,
    projectId: Number(projectId),
    userId: Number(userId),
    role,
    effortAllocation
  });

  return res.status(201).json(projectUser);
};

export const removeUser = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId, userId } = req.params;

  await removeUserFromProject(companyId, Number(projectId), Number(userId));

  return res.status(204).send();
};

// Task Users
export const addTaskUser = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;
  const { userId, responsibility } = req.body;

  const taskUser = await addUserToTask({
    companyId,
    taskId: Number(taskId),
    userId: Number(userId),
    responsibility
  });

  return res.status(201).json(taskUser);
};

export const removeTaskUser = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId, userId } = req.params;

  await removeUserFromTask(companyId, Number(taskId), Number(userId));

  return res.status(204).send();
};

// Listar tarefas do usuário
export const listUserTasks = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { userId } = req.params;
  const { status, pageNumber } = req.query as any;

  const result = await ListUserTasksService({
    companyId,
    userId: Number(userId),
    status,
    pageNumber: pageNumber ? Number(pageNumber) : 1
  });

  return res.json(result);
};
