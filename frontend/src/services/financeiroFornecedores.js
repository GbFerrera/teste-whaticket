import api from "./api";

export const listFinanceiroFornecedores = async (params) => {
  const { data } = await api.get("/financeiro/fornecedores", {
    params
  });
  return data;
};

export const createFinanceiroFornecedor = async (data) => {
  const response = await api.post("/financeiro/fornecedores", data);
  return response.data;
};

export const updateFinanceiroFornecedor = async (id, data) => {
  const response = await api.put(`/financeiro/fornecedores/${id}`, data);
  return response.data;
};

export const deleteFinanceiroFornecedor = async (id) => {
  await api.delete(`/financeiro/fornecedores/${id}`);
};

export const getFinanceiroFornecedor = async (id) => {
  const { data } = await api.get(`/financeiro/fornecedores/${id}`);
  return data;
};
