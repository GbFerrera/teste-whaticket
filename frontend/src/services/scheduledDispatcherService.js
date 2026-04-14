import api from "./api";

export const eventTypeOptions = [
  {
    value: "birthday",
    label: "Aniversário do Cliente",
    description: "Envia uma mensagem automática no dia do aniversário do cliente."
  },
  {
    value: "invoice_reminder",
    label: "Lembrete de Fatura",
    description: "Dispara lembretes antes do vencimento da fatura."
  },
  {
    value: "invoice_overdue",
    label: "Cobrança de Fatura em Atraso",
    description: "Aciona mensagens após o atraso da fatura."
  }
];

export const listScheduledDispatchers = async params => {
  const { data } = await api.get("/scheduled-dispatchers", { params });
  return data;
};

export const getScheduledDispatcher = async id => {
  const { data } = await api.get(`/scheduled-dispatchers/${id}`);
  return data;
};

export const createScheduledDispatcher = async payload => {
  const { data } = await api.post("/scheduled-dispatchers", payload);
  return data;
};

export const updateScheduledDispatcher = async (id, payload) => {
  const { data } = await api.put(`/scheduled-dispatchers/${id}`, payload);
  return data;
};

export const deleteScheduledDispatcher = async id => {
  const { data } = await api.delete(`/scheduled-dispatchers/${id}`);
  return data;
};

export const toggleScheduledDispatcher = async (id, active) => {
  const { data } = await api.patch(`/scheduled-dispatchers/${id}/toggle`, {
    active
  });
  return data;
};

export default {
  listScheduledDispatchers,
  getScheduledDispatcher,
  createScheduledDispatcher,
  updateScheduledDispatcher,
  deleteScheduledDispatcher,
  toggleScheduledDispatcher,
  eventTypeOptions
};
