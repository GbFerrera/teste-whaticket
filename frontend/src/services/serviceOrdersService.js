import api from "./api";

export const listServiceOrders = async (params = {}) => {
  const { data } = await api.get("/service-orders", { params });
  return data;
};

export const createServiceOrder = async payload => {
  const { data } = await api.post("/service-orders", payload);
  return data;
};

export const showServiceOrder = async serviceOrderId => {
  const { data } = await api.get(`/service-orders/${serviceOrderId}`);
  return data;
};

export const updateServiceOrder = async (serviceOrderId, payload) => {
  const { data } = await api.put(`/service-orders/${serviceOrderId}`, payload);
  return data;
};

export const deleteServiceOrder = async serviceOrderId => {
  await api.delete(`/service-orders/${serviceOrderId}`);
};

export default {
  listServiceOrders,
  createServiceOrder,
  showServiceOrder,
  updateServiceOrder,
  deleteServiceOrder
};
