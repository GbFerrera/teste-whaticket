import api from "./api";

export const createFinanceiroReceita = async (data) => {
  const response = await api.post("/financeiro/receitas", data);
  return response.data;
};

export default createFinanceiroReceita;
