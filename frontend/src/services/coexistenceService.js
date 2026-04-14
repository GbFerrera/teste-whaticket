import api from "./api";

export const enableCoexistence = (whatsappId, payload) =>
  api.post(`/whatsapp/${whatsappId}/coexistence/enable`, payload);

export const fetchCoexistenceStatus = whatsappId =>
  api.get(`/whatsapp/${whatsappId}/coexistence/status`);

export const syncCoexistence = (whatsappId, payload = {}) =>
  api.post(`/whatsapp/${whatsappId}/coexistence/sync`, payload);

export const fetchRoutingConfig = whatsappId =>
  api.get(`/whatsapp/${whatsappId}/coexistence/routing`);

export const updateRoutingConfig = (whatsappId, payload) =>
  api.post(`/whatsapp/${whatsappId}/coexistence/routing`, payload);

export const simulateRouting = (whatsappId, payload) =>
  api.post(`/whatsapp/${whatsappId}/coexistence/simulate`, payload);

export default {
  enableCoexistence,
  fetchCoexistenceStatus,
  syncCoexistence,
  fetchRoutingConfig,
  updateRoutingConfig,
  simulateRouting
};
