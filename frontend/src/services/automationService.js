import api from "./api";

export const getAutomations = async (params = {}) => {
  const { data } = await api.get("/automations", { params });
  return data;
};

export const getAutomation = async (id) => {
  const { data } = await api.get(`/automations/${id}`);
  return data;
};

export const createAutomation = async (automationData) => {
  const { data } = await api.post("/automations", automationData);
  return data;
};

export const updateAutomation = async (id, automationData) => {
  const { data } = await api.put(`/automations/${id}`, automationData);
  return data;
};

export const deleteAutomation = async (id) => {
  const { data } = await api.delete(`/automations/${id}`);
  return data;
};

export const toggleAutomation = async (id, isActive) => {
  const { data } = await api.patch(`/automations/${id}/toggle`, { isActive });
  return data;
};

// Tipos de gatilhos disponíveis
export const triggerTypes = [
  { value: "birthday", label: "Aniversário do Contato", icon: "🎂" },
  { value: "anniversary", label: "Data Comemorativa", icon: "🎉" },
  { value: "kanban_stage", label: "Entrada em Fase do Kanban", icon: "📋" },
  { value: "kanban_time", label: "Tempo em Fase do Kanban", icon: "⏱️" },
  { value: "tag_added", label: "Tag Adicionada", icon: "🏷️" },
  { value: "tag_removed", label: "Tag Removida", icon: "🏷️" },
  { value: "ticket_created", label: "Novo Ticket Criado", icon: "🎫" },
  { value: "ticket_closed", label: "Ticket Fechado", icon: "✅" },
  { value: "no_response", label: "Sem Resposta", icon: "⏰" },
  { value: "scheduled", label: "Agendamento Recorrente", icon: "📅" }
];

// Tipos de ações disponíveis
export const actionTypes = [
  { value: "send_message", label: "Enviar Mensagem", icon: "💬" },
  { value: "send_media", label: "Enviar Mídia", icon: "📎" },
  { value: "add_tag", label: "Adicionar Tag", icon: "🏷️" },
  { value: "remove_tag", label: "Remover Tag", icon: "🗑️" },
  { value: "move_kanban", label: "Mover no Kanban", icon: "📋" },
  { value: "transfer_queue", label: "Transferir para Fila", icon: "📁" },
  { value: "transfer_user", label: "Transferir para Atendente", icon: "👤" },
  { value: "close_ticket", label: "Fechar Ticket", icon: "✅" },
  { value: "create_ticket", label: "Criar Ticket", icon: "🎫" },
  { value: "webhook", label: "Chamar Webhook", icon: "🔗" },
  { value: "wait", label: "Aguardar", icon: "⏳" }
];

export default {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  triggerTypes,
  actionTypes
};
