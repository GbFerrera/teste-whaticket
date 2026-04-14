import api from "./api";

export const listFinanceiroDespesas = async (params) => {
  const { data } = await api.get("/financeiro/despesas", {
    params
  });
  return data;
};

export const createFinanceiroDespesa = async (data) => {
  const response = await api.post("/financeiro/despesas", data);
  return response.data;
};

export const updateFinanceiroDespesa = async (id, data) => {
  const response = await api.put(`/financeiro/despesas/${id}`, data);
  return response.data;
};

export const deleteFinanceiroDespesa = async (id) => {
  await api.delete(`/financeiro/despesas/${id}`);
};

export const getFinanceiroDespesa = async (id) => {
  const { data } = await api.get(`/financeiro/despesas/${id}`);
  return data;
};

export const pagarFinanceiroDespesa = async (id, data) => {
  const response = await api.post(`/financeiro/despesas/${id}/pagar`, data);
  return response.data;
};
