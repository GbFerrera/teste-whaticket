import api from "./api";

export const listIaWorkflows = async () => {
  const { data } = await api.get("/ia-workflows");
  return data || [];
};

export const showIaWorkflow = async workflowId => {
  if (!workflowId) return null;
  const { data } = await api.get(`/ia-workflows/${workflowId}`);
  return data || null;
};

export const saveIaWorkflow = async (payload, workflowId) => {
  if (workflowId) {
    const { data } = await api.put(`/ia-workflows/${workflowId}`, payload);
    return data?.workflow || null;
  }

  const { data } = await api.post("/ia-workflows", payload);
  return data?.workflow || null;
};

export const deleteIaWorkflow = async workflowId => {
  await api.delete(`/ia-workflows/${workflowId}`);
};
