import api from "./api";

export const getContactAnalytics = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contacts/analytics/stats`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error getting contact analytics:", err);
    throw err;
  }
};

export const getDeduplicationReport = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contacts/analytics/deduplication`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error getting deduplication report:", err);
    throw err;
  }
};

export const getSavingReport = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contacts/analytics/saving`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error getting saving report:", err);
    throw err;
  }
};

export const getTopContacts = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contacts/analytics/top`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error getting top contacts:", err);
    throw err;
  }
};

export const exportContactData = async (companyId, params = {}) => {
  try {
    const { data } = await api.get(`/contacts/analytics/export`, {
      params: { companyId, ...params }
    });
    return data;
  } catch (err) {
    console.error("Error exporting contact data:", err);
    throw err;
  }
};
