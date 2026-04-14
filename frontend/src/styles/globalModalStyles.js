// Estilos globais para TODOS os modais da aplicação
import { Z_INDEX } from './zIndex';

// Estilo global que deve ser aplicado a TODOS os modais
export const globalModalStyles = {
  // Para Dialog components
  dialogPaper: {
    zIndex: Z_INDEX.MODAL_MEDIUM, // 1400 - Acima de header (1200) e sidebar (1000)
    borderRadius: '8px',
    boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  
  // Para Drawer components
  drawerPaper: {
    zIndex: Z_INDEX.MODAL_MEDIUM, // 1400
    boxShadow: '-4px 0px 20px rgba(0, 0, 0, 0.15)',
  },
  
  // Para Modal components
  modal: {
    zIndex: Z_INDEX.MODAL_MEDIUM, // 1400
  },
  
  // Para Backdrop
  backdrop: {
    zIndex: Z_INDEX.BACKDROP, // 1600
  },
};

// Função para aplicar estilos globais via CSS-in-JS
export const applyGlobalModalStyles = (theme) => ({
  // Aplica a TODOS os Dialogs
  '& .MuiDialog-root .MuiDialog-paper': {
    zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
  },
  
  // Aplica a TODOS os Drawers
  '& .MuiDrawer-root .MuiDrawer-paper': {
    zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
  },
  
  // Aplica a TODOS os Modals
  '& .MuiModal-root': {
    zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
  },
  
  // Aplica a TODOS os Backdrops
  '& .MuiBackdrop-root': {
    zIndex: `${Z_INDEX.BACKDROP} !important`,
  },
});

// CSS global para ser injetado na aplicação
export const globalModalCSS = `
  /* FORÇA TODOS OS MODAIS FICAREM ACIMA DO LAYOUT */
  
  /* Dialogs */
  .MuiDialog-root .MuiDialog-paper {
    z-index: 1400 !important;
  }
  
  /* Drawers */
  .MuiDrawer-root .MuiDrawer-paper {
    z-index: 1400 !important;
  }
  
  /* Modals */
  .MuiModal-root {
    z-index: 1400 !important;
  }
  
  /* Backdrops */
  .MuiBackdrop-root {
    z-index: 1600 !important;
  }
  
  /* Portals (para garantir que modais em portals também funcionem) */
  .MuiPortal-root {
    z-index: 1400 !important;
  }
  
  /* Específico para modais que usam position fixed */
  [role="dialog"] {
    z-index: 1400 !important;
  }
  
  /* Garante que modais fiquem acima de tudo */
  .MuiDialog-container,
  .MuiDrawer-container {
    z-index: 1400 !important;
  }
`;
