export const STATUS_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "aberta", label: "Aberta" },
  { value: "em_execucao", label: "Em execução" },
  { value: "concluida", label: "Concluída" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" }
];

export const statusColors = {
  aberta: { bg: "#eff6ff", color: "#1d4ed8" },
  em_execucao: { bg: "#ecfdf5", color: "#047857" },
  concluida: { bg: "#fef3c7", color: "#92400e" },
  entregue: { bg: "#e0f2fe", color: "#0369a1" },
  cancelada: { bg: "#fee2e2", color: "#b91c1c" }
};

export const PAYMENT_OPTIONS = [
  { value: "", label: "Definir depois" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "boleto", label: "Boleto" }
];
