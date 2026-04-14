import React from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { Z_INDEX } from './zIndex';

// Estilo CSS global para injetar
const globalModalCSS = `
  /* FORÇA TODOS OS MODAIS FICAREM ACIMA DO LAYOUT */
  
  /* Dialogs */
  .MuiDialog-root .MuiDialog-paper {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Drawers */
  .MuiDrawer-root .MuiDrawer-paper {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Modals */
  .MuiModal-root {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Backdrops */
  .MuiBackdrop-root {
    z-index: ${Z_INDEX.BACKDROP} !important;
  }
  
  /* Portals */
  .MuiPortal-root {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Específico para modais com role="dialog" */
  [role="dialog"] {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Containers */
  .MuiDialog-container,
  .MuiDrawer-container {
    z-index: ${Z_INDEX.MODAL_MEDIUM} !important;
  }
  
  /* Garante que modais fiquem acima de tooltips e popovers */
  .MuiTooltip-popper,
  .MuiPopover-root {
    z-index: ${Z_INDEX.TOOLTIP} !important;
  }
`;

// Função para injetar CSS global
const injectGlobalModalCSS = () => {
  // Verifica se já foi injetado
  if (document.getElementById('global-modal-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'global-modal-styles';
  style.textContent = globalModalCSS;
  document.head.appendChild(style);
};

// Componente Provider que injeta os estilos globais
export const ModalThemeProvider = ({ children }) => {
  React.useEffect(() => {
    injectGlobalModalCSS();
  }, []);

  return children;
};

// Theme customizado com z-index para modais
export const createModalTheme = (baseTheme) => {
  return createTheme({
    ...baseTheme,
    overrides: {
      MuiDialog: {
        paper: {
          zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
        },
        container: {
          zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
        },
      },
      MuiDrawer: {
        paper: {
          zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
        },
      },
      MuiModal: {
        root: {
          zIndex: `${Z_INDEX.MODAL_MEDIUM} !important`,
        },
      },
      MuiBackdrop: {
        root: {
          zIndex: `${Z_INDEX.BACKDROP} !important`,
        },
      },
    },
    props: {
      MuiDialog: {
        // Garante que todos os Dialogs usem o z-index correto
        PaperProps: {
          style: {
            zIndex: Z_INDEX.MODAL_MEDIUM,
          },
        },
      },
      MuiDrawer: {
        // Garante que todos os Drawers usem o z-index correto
        PaperProps: {
          style: {
            zIndex: Z_INDEX.MODAL_MEDIUM,
          },
        },
      },
    },
  });
};

export default ModalThemeProvider;
