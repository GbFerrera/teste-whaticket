import api from "./api";

export const listServicos = () => api.get("/servicos");

export const createServico = (payload) => api.post("/servicos", payload);

export const updateServico = (id, payload) => api.put(`/servicos/${id}`, payload);

export const deleteServico = (id) => api.delete(`/servicos/${id}`);

export default {
  listServicos,
  createServico,
  updateServico,
  deleteServico
};
