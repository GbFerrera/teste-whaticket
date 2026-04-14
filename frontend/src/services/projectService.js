import api from "./api";

export const listProjects = async (params = {}) => {
  const { data } = await api.get("/projects", { params });
  return data;
};

export const getProject = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

export const createProject = async (projectData) => {
  const { data } = await api.post("/projects", projectData);
  return data;
};

export const updateProject = async (projectId, projectData) => {
  const { data } = await api.put(`/projects/${projectId}`, projectData);
  return data;
};

export const deleteProject = async (projectId) => {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
};

// Tasks
export const createTask = async (projectId, taskData) => {
  const { data } = await api.post(`/projects/${projectId}/tasks`, taskData);
  return data;
};

export const updateTask = async (taskId, taskData) => {
  const { data } = await api.put(`/projects/tasks/${taskId}`, taskData);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await api.delete(`/projects/tasks/${taskId}`);
  return data;
};

// Services
export const addServiceToProject = async (projectId, serviceData) => {
  const { data } = await api.post(`/projects/${projectId}/services`, serviceData);
  return data;
};

export const removeServiceFromProject = async (projectId, serviceId) => {
  const { data } = await api.delete(`/projects/${projectId}/services/${serviceId}`);
  return data;
};

// Products
export const addProductToProject = async (projectId, productData) => {
  const { data } = await api.post(`/projects/${projectId}/products`, productData);
  return data;
};

export const removeProductFromProject = async (projectId, productId) => {
  const { data } = await api.delete(`/projects/${projectId}/products/${productId}`);
  return data;
};

// Users
export const addUserToProject = async (projectId, userData) => {
  const { data } = await api.post(`/projects/${projectId}/users`, userData);
  return data;
};

export const removeUserFromProject = async (projectId, userId) => {
  const { data } = await api.delete(`/projects/${projectId}/users/${userId}`);
  return data;
};

// Task Users
export const addUserToTask = async (taskId, userData) => {
  const { data } = await api.post(`/projects/tasks/${taskId}/users`, userData);
  return data;
};

export const removeUserFromTask = async (taskId, userId) => {
  const { data } = await api.delete(`/projects/tasks/${taskId}/users/${userId}`);
  return data;
};
