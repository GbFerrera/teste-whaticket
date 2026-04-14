import { Z_INDEX } from './zIndex';

// Estilos padrão para todos os modais da aplicação
export const getModalStyles = (theme) => ({
  // Estilo base para todos os Dialog/Modal
  dialogPaper: {
    borderRadius: '8px',
    boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    zIndex: Z_INDEX.MODAL_MEDIUM, // 1400
  },
  
  // Estilo para modais pequenos (confirmação, alerta)
  dialogPaperSmall: {
    borderRadius: '8px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: Z_INDEX.MODAL_LOW, // 1350
  },
  
  // Estilo para modais grandes (UserModal, TicketModal)
  dialogPaperLarge: {
    borderRadius: '8px',
    boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    zIndex: Z_INDEX.MODAL_MEDIUM, // 1400
    width: '90vw',
    maxWidth: '1000px',
    height: '90vh',
    maxHeight: '800px',
  },
  
  // Estilo para modais críticos (importante, não pode ser fechado)
  dialogPaperCritical: {
    borderRadius: '8px',
    boxShadow: '0px 12px 60px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    zIndex: Z_INDEX.MODAL_CRITICAL, // 1500
  },
  
  // Estilo para Backdrop/Overlay
  backdrop: {
    zIndex: Z_INDEX.BACKDROP, // 1600
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Títulos de modal
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(1.5, 3),
    borderBottom: `1px solid ${theme.palette.primary.light}`,
  },
  
  // Conteúdo de modal
  dialogContent: {
    padding: theme.spacing(3),
    backgroundColor: '#f9f9ff',
    overflowY: 'auto',
    height: 'calc(100% - 120px)',
  },
  
  // Ações de modal
  dialogActions: {
    backgroundColor: '#ffffff',
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
});

// Função para aplicar estilos de modal baseado no tipo
export const getModalClassNames = (type = 'medium') => {
  switch (type) {
    case 'small':
      return {
        paper: 'dialogPaperSmall'
      };
    case 'large':
      return {
        paper: 'dialogPaperLarge'
      };
    case 'critical':
      return {
        paper: 'dialogPaperCritical'
      };
    default:
      return {
        paper: 'dialogPaper'
      };
  }
};
