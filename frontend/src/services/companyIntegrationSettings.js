import api from "./api";

export const listCompanyIntegrations = async () => {
  const { data } = await api.get("/integration-settings");
  return data;
};

export const showCompanyIntegration = async id => {
  const { data } = await api.get(`/integration-settings/${id}`);
  return data;
};

export const upsertCompanyIntegration = async payload => {
  const { id, ...body } = payload || {};

  if (id) {
    const { data } = await api.put(`/integration-settings/${id}`, body);
    return data;
  }

  const { data } = await api.post("/integration-settings", body);
  return data;
};

export const deleteCompanyIntegration = async id =>
  api.delete(`/integration-settings/${id}`);

export const upsertIntegrationFieldMaps = async (id, fieldMaps) => {
  const { data } = await api.put(`/integration-settings/${id}/field-maps`, {
    fieldMaps
  });
  return data;
};
