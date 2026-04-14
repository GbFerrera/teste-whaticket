import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@material-ui/core";
import { FileCopy, OpenInNew, Facebook, Instagram } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: "#1877f2",
    color: "white",
    padding: theme.spacing(2),
  },
  dialogContent: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(3),
  },
  dialogActions: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
  instructionBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: "1px solid #e0e0e0",
  },
  instructionTitle: {
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  instructionText: {
    color: "#666",
    fontSize: 13,
    marginBottom: theme.spacing(1),
  },
  copyField: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: "8px 12px",
    marginTop: theme.spacing(1),
    border: "1px solid #e0e0e0",
  },
  copyText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
    wordBreak: "break-all",
  },
  linkButton: {
    marginTop: theme.spacing(2),
    backgroundColor: "#1877f2",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#166fe5",
    },
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#1877f2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
  },
  tabsContainer: {
    borderBottom: "1px solid #e0e0e0",
    marginBottom: theme.spacing(2),
  },
  tab: {
    textTransform: "none",
    fontWeight: 500,
  },
  facebookTab: {
    color: "#3b5998",
  },
  instagramTab: {
    color: "#e1306c",
  },
}));

const FacebookInstagramModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = Facebook, 1 = Instagram

  // Informações do webhook - usando a URL do backend
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://api.faedeveloper.com.br";
  const webhookUrl = `${backendUrl}/webhook`;
  const verifyToken = "whaticket";

  // Função para login direto no Instagram Business
  const handleInstagramLogin = () => {
    const instagramOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(backendUrl + '/instagram-callback')}&scope=instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management&response_type=token&state=${localStorage.getItem('companyId')}`;
    window.open(instagramOAuthUrl, '_blank', 'width=600,height=600');
  };

  // Função para login direto no Facebook
  const handleFacebookLogin = () => {
    const facebookOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(backendUrl + '/facebook-callback')}&scope=public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management&response_type=token&state=${localStorage.getItem('companyId')}`;
    window.open(facebookOAuthUrl, '_blank', 'width=600,height=600');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!whatsAppId || !open) return;

      setLoading(true);
      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}?session=0`);
        setName(data.name || "");
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [whatsAppId, open]);

  const handleClose = () => {
    onClose();
    setName("");
  };

  const handleSave = async () => {
    try {
      await api.put(`/whatsapp/${whatsAppId}`, {
        name,
      });

      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const openFacebookDeveloper = () => {
    window.open("https://developers.facebook.com/apps/", "_blank");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        Conexão Facebook / Instagram
      </DialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        className={classes.tabsContainer}
        centered
      >
        <Tab 
          label="Facebook" 
          icon={<Facebook style={{ marginRight: 8 }} />}
          className={`${classes.tab} ${classes.facebookTab}`}
        />
        <Tab 
          label="Instagram" 
          icon={<Instagram style={{ marginRight: 8 }} />}
          className={`${classes.tab} ${classes.instagramTab}`}
        />
      </Tabs>

      <DialogContent className={classes.dialogContent}>
        {activeTab === 0 && (
          // Conteúdo do Facebook
          <>
            <TextField
              label="Nome da Conexão Facebook"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classes.textField}
              disabled={loading}
              placeholder="Ex: Minha Página do Facebook"
            />

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>1</span>
                Conectar ao Facebook
              </Typography>
              <Typography className={classes.instructionText}>
                Clique no botão abaixo para fazer login no Facebook e autorizar o acesso às suas páginas.
              </Typography>
              <Button
                variant="contained"
                className={classes.linkButton}
                startIcon={<Facebook />}
                onClick={handleFacebookLogin}
                fullWidth
                style={{ backgroundColor: "#3b5998" }}
              >
                Conectar Facebook
              </Button>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>2</span>
                Configurar Webhook (Opcional)
              </Typography>
              <Typography className={classes.instructionText}>
                Se precisar configurar manualmente, use as informações abaixo:
              </Typography>
              
              <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                URL de Callback:
              </Typography>
              <Box className={classes.copyField}>
                <Typography className={classes.copyText}>
                  {webhookUrl}
                </Typography>
                <Tooltip title="Copiar URL">
                  <IconButton size="small" onClick={() => copyToClipboard(webhookUrl)}>
                    <FileCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box mt={2}>
                <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                  Token de Verificação:
                </Typography>
                <Box className={classes.copyField}>
                  <Typography className={classes.copyText}>
                    {verifyToken}
                  </Typography>
                  <Tooltip title="Copiar Token">
                    <IconButton size="small" onClick={() => copyToClipboard(verifyToken)}>
                      <FileCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          // Conteúdo do Instagram
          <>
            <TextField
              label="Nome da Conexão Instagram"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classes.textField}
              disabled={loading}
              placeholder="Ex: Meu Instagram Business"
            />

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>1</span>
                Conectar ao Instagram
              </Typography>
              <Typography className={classes.instructionText}>
                Clique no botão abaixo para fazer login no Instagram e autorizar o acesso à sua conta Business.
              </Typography>
              <Button
                variant="contained"
                className={classes.linkButton}
                startIcon={<Instagram />}
                onClick={handleInstagramLogin}
                fullWidth
                style={{ backgroundColor: "#e1306c" }}
              >
                Conectar Instagram
              </Button>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>2</span>
                Requisitos
              </Typography>
              <Typography className={classes.instructionText}>
                Para conectar o Instagram, você precisa:
              </Typography>
              <Typography className={classes.instructionText} style={{ fontFamily: "monospace", backgroundColor: "#f0f0f0", padding: 8, borderRadius: 4 }}>
                • Conta Instagram Business<br />
                • Conta Facebook vinculada<br />
                • Permissões de mensagens
              </Typography>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>3</span>
                Configurar Webhook (Opcional)
              </Typography>
              <Typography className={classes.instructionText}>
                Se precisar configurar manualmente, use as informações abaixo:
              </Typography>
              
              <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                URL de Callback:
              </Typography>
              <Box className={classes.copyField}>
                <Typography className={classes.copyText}>
                  {webhookUrl}
                </Typography>
                <Tooltip title="Copiar URL">
                  <IconButton size="small" onClick={() => copyToClipboard(webhookUrl)}>
                    <FileCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} color="default" variant="outlined">
          {i18n.t("whatsappModal.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacebookInstagramModal;
