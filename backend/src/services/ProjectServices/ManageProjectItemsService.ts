import AppError from "../../errors/AppError";
import Project from "../../models/Project";
import ProjectService from "../../models/ProjectService";
import ProjectProduct from "../../models/ProjectProduct";
import ProjectUser from "../../models/ProjectUser";
import ProjectTaskUser from "../../models/ProjectTaskUser";

interface AddServiceRequest {
  companyId: number;
  projectId: number;
  serviceId: number;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

interface AddProductRequest {
  companyId: number;
  projectId: number;
  productId: number;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

interface AddUserRequest {
  companyId: number;
  projectId: number;
  userId: number;
  role?: string;
  effortAllocation?: number;
}

interface AddTaskUserRequest {
  companyId: number;
  taskId: number;
  userId: number;
  responsibility?: string;
}

const verifyProject = async (projectId: number, companyId: number) => {
  const project = await Project.findOne({
    where: { id: projectId, companyId }
  });
  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }
  return project;
};

export const addServiceToProject = async (data: AddServiceRequest): Promise<ProjectService> => {
  await verifyProject(data.projectId, data.companyId);

  const [projectService, created] = await ProjectService.findOrCreate({
    where: {
      projectId: data.projectId,
      serviceId: data.serviceId
    },
    defaults: {
      companyId: data.companyId,
      projectId: data.projectId,
      serviceId: data.serviceId,
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice,
      notes: data.notes
    }
  });

  if (!created) {
    await projectService.update({
      quantity: data.quantity || projectService.quantity,
      unitPrice: data.unitPrice ?? projectService.unitPrice,
      notes: data.notes ?? projectService.notes
    });
  }

  return projectService;
};

export const removeServiceFromProject = async (
  companyId: number,
  projectId: number,
  serviceId: number
): Promise<void> => {
  await verifyProject(projectId, companyId);

  const deleted = await ProjectService.destroy({
    where: { projectId, serviceId }
  });

  if (!deleted) {
    throw new AppError("ERR_SERVICE_NOT_IN_PROJECT", 404);
  }
};

export const addProductToProject = async (data: AddProductRequest): Promise<ProjectProduct> => {
  await verifyProject(data.projectId, data.companyId);

  const [projectProduct, created] = await ProjectProduct.findOrCreate({
    where: {
      projectId: data.projectId,
      productId: data.productId
    },
    defaults: {
      companyId: data.companyId,
      projectId: data.projectId,
      productId: data.productId,
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice,
      notes: data.notes
    }
  });

  if (!created) {
    await projectProduct.update({
      quantity: data.quantity || projectProduct.quantity,
      unitPrice: data.unitPrice ?? projectProduct.unitPrice,
      notes: data.notes ?? projectProduct.notes
    });
  }

  return projectProduct;
};

export const removeProductFromProject = async (
  companyId: number,
  projectId: number,
  productId: number
): Promise<void> => {
  await verifyProject(projectId, companyId);

  const deleted = await ProjectProduct.destroy({
    where: { projectId, productId }
  });

  if (!deleted) {
    throw new AppError("ERR_PRODUCT_NOT_IN_PROJECT", 404);
  }
};

export const addUserToProject = async (data: AddUserRequest): Promise<ProjectUser> => {
  await verifyProject(data.projectId, data.companyId);

  const [projectUser, created] = await ProjectUser.findOrCreate({
    where: {
      projectId: data.projectId,
      userId: data.userId
    },
    defaults: {
      companyId: data.companyId,
      projectId: data.projectId,
      userId: data.userId,
      role: data.role || "participant",
      effortAllocation: data.effortAllocation
    }
  });

  if (!created) {
    await projectUser.update({
      role: data.role || projectUser.role,
      effortAllocation: data.effortAllocation ?? projectUser.effortAllocation
    });
  }

  return projectUser;
};

export const removeUserFromProject = async (
  companyId: number,
  projectId: number,
  userId: number
): Promise<void> => {
  await verifyProject(projectId, companyId);

  const deleted = await ProjectUser.destroy({
    where: { projectId, userId }
  });

  if (!deleted) {
    throw new AppError("ERR_USER_NOT_IN_PROJECT", 404);
  }
};

export const addUserToTask = async (data: AddTaskUserRequest): Promise<ProjectTaskUser> => {
  const [taskUser, created] = await ProjectTaskUser.findOrCreate({
    where: {
      taskId: data.taskId,
      userId: data.userId
    },
    defaults: {
      companyId: data.companyId,
      taskId: data.taskId,
      userId: data.userId,
      responsibility: data.responsibility
    }
  });

  if (!created && data.responsibility) {
    await taskUser.update({ responsibility: data.responsibility });
  }

  return taskUser;
};

export const removeUserFromTask = async (
  companyId: number,
  taskId: number,
  userId: number
): Promise<void> => {
  const deleted = await ProjectTaskUser.destroy({
    where: { taskId, userId, companyId }
  });

  if (!deleted) {
    throw new AppError("ERR_USER_NOT_IN_TASK", 404);
  }
};
