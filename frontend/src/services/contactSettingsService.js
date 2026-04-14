import api from "./api";

export const getContactSettings = async (companyId) => {
  try {
    const { data } = await api.get(`/contact-settings`, {
      params: { companyId }
    });
    return data;
  } catch (err) {
    console.error("Error getting contact settings:", err);
    throw err;
  }
};

export const updateContactSettings = async (companyId, settings) => {
  try {
    const { data } = await api.put(`/contact-settings`, {
      companyId,
      ...settings
    });
    return data;
  } catch (err) {
    console.error("Error updating contact settings:", err);
    throw err;
  }
};

export const getContactStats = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contact-settings/stats`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error getting contact stats:", err);
    throw err;
  }
};

export const batchSaveToPhone = async (companyId, options = {}) => {
  try {
    const { data } = await api.post(`/contact-settings/batch-save`, {
      companyId,
      ...options
    });
    return data;
  } catch (err) {
    console.error("Error batch saving contacts:", err);
    throw err;
  }
};

export const testContactConfiguration = async (companyId) => {
  try {
    const { data } = await api.post(`/contact-settings/test`, {
      companyId
    });
    return data;
  } catch (err) {
    console.error("Error testing contact configuration:", err);
    throw err;
  }
};

export const resetContactSettings = async (companyId) => {
  try {
    const { data } = await api.post(`/contact-settings/reset`, {
      companyId
    });
    return data;
  } catch (err) {
    console.error("Error resetting contact settings:", err);
    throw err;
  }
};
