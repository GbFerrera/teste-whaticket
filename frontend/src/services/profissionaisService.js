import api from "./api";

export const listProfissionais = () => api.get("/profissionais");

export const createProfissional = (payload) => api.post("/profissionais", payload);

export const updateProfissional = (id, payload) => api.put(`/profissionais/${id}`, payload);

export const deleteProfissional = (id) => api.delete(`/profissionais/${id}`);

export default {
  listProfissionais,
  createProfissional,
  updateProfissional,
  deleteProfissional
};
