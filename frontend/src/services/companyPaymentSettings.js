import api from "./api";

export const listCompanyPaymentSettings = async () => {
  const { data } = await api.get("/payment-settings");
  return data;
};

export const upsertCompanyPaymentSetting = async payload => {
  const { id, ...body } = payload || {};

  if (id) {
    const { data } = await api.put(`/payment-settings/${id}`, body);
    return data;
  }

  const { data } = await api.post("/payment-settings", body);
  return data;
};

export const deleteCompanyPaymentSetting = async id =>
  api.delete(`/payment-settings/${id}`);
