import api from "./api";

export const listFinanceiroPagamentosDespesas = async (params) => {
  const { data } = await api.get("/financeiro/pagamentos-despesas", {
    params
  });
  return data;
};

export const createFinanceiroPagamentoDespesa = async (data) => {
  const response = await api.post("/financeiro/pagamentos-despesas", data);
  return response.data;
};

export const updateFinanceiroPagamentoDespesa = async (id, data) => {
  const response = await api.put(`/financeiro/pagamentos-despesas/${id}`, data);
  return response.data;
};

export const deleteFinanceiroPagamentoDespesa = async (id) => {
  await api.delete(`/financeiro/pagamentos-despesas/${id}`);
};

export const getFinanceiroPagamentoDespesa = async (id) => {
  const { data } = await api.get(`/financeiro/pagamentos-despesas/${id}`);
  return data;
};
