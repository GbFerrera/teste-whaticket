import api from "./api";

export const listCompanyApiKeys = async () => {
  const { data } = await api.get("/company-api-keys");
  return data;
};

export const createCompanyApiKey = async payload => {
  const { data } = await api.post("/company-api-keys", payload);
  return data;
};

export const updateCompanyApiKey = async (id, payload) => {
  const { data } = await api.put(`/company-api-keys/${id}`, payload);
  return data;
};

export const deleteCompanyApiKey = async id => {
  await api.delete(`/company-api-keys/${id}`);
};
