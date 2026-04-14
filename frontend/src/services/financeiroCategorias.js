import api from "./api";

export const listFinanceiroCategorias = async (params) => {
  const { data } = await api.get("/financeiro/categorias", {
    params
  });
  return data;
};

export const createFinanceiroCategoria = async (data) => {
  const response = await api.post("/financeiro/categorias", data);
  return response.data;
};

export const updateFinanceiroCategoria = async (id, data) => {
  const response = await api.put(`/financeiro/categorias/${id}`, data);
  return response.data;
};

export const deleteFinanceiroCategoria = async (id) => {
  await api.delete(`/financeiro/categorias/${id}`);
};

export const getFinanceiroCategoria = async (id) => {
  const { data } = await api.get(`/financeiro/categorias/${id}`);
  return data;
};
