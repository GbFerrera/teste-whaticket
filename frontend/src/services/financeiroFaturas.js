import api from "./api";

export const listFinanceiroFaturas = async params => {
  const { data } = await api.get("/financeiro/faturas", { params });
  return data;
};

export const showFinanceiroFatura = async id => {
  const { data } = await api.get(`/financeiro/faturas/${id}`);
  return data;
};

export const createFinanceiroFatura = async payload => {
  const { data } = await api.post("/financeiro/faturas", payload);
  return data;
};

export const updateFinanceiroFatura = async (id, payload) => {
  const { data } = await api.put(`/financeiro/faturas/${id}`, payload);
  return data;
};

export const deleteFinanceiroFatura = id =>
  api.delete(`/financeiro/faturas/${id}`);
