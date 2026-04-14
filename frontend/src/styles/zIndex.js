// Padrão de z-index para a aplicação
export const Z_INDEX = {
  // Layout base
  SIDEBAR: 1000,
  HEADER: 1200,
  HEADER_MOBILE: 1202,
  
  // Modais (SEMPRE ACIMA do layout)
  MODAL_BASE: 1900,
  MODAL_LOW: 1950,
  MODAL_MEDIUM: 2000,
  MODAL_HIGH: 2050,
  MODAL_CRITICAL: 2100,
  
  // Overlays e loading (ACIMA dos modais)
  BACKDROP: 1999,
  LOADING: 2200,
  
  // Notificações e toasts (ACIMA de tudo)
  NOTIFICATION: 2300,
  TOAST: 2350,
  
  // Tooltips e popovers (ACIMA dos modais)
  TOOLTIP: 2400,
  POPOVER: 2450,
  DROPDOWN: 2500,
  
  // Debug e desenvolvimento
  DEBUG: 9999
};

// Função para obter z-index de modal baseado na prioridade
export const getModalZIndex = (priority = 'medium') => {
  switch (priority) {
    case 'low':
      return Z_INDEX.MODAL_LOW;
    case 'medium':
      return Z_INDEX.MODAL_MEDIUM;
    case 'high':
      return Z_INDEX.MODAL_HIGH;
    case 'critical':
      return Z_INDEX.MODAL_CRITICAL;
    default:
      return Z_INDEX.MODAL_MEDIUM;
  }
};

// Estilo padrão para modais
export const getModalStyles = (priority = 'medium') => ({
  zIndex: getModalZIndex(priority),
  position: 'relative'
});
