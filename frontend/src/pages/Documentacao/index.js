import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";
import { Box, Button, CircularProgress, Grid, IconButton, Paper, TextField, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import axios from "axios";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  listCompanyApiKeys,
  createCompanyApiKey,
  deleteCompanyApiKey
} from "../../services/companyApiKeys";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100
  },
  mainHeader: {
    marginTop: theme.spacing(1),
  },
  elementMargin: {
    padding: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right"
  },
  navCardsWrapper: {
    marginTop: theme.spacing(3)
  },
  navCard: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e3e7f0",
    height: "100%",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)"
    }
  },
  navCardTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5)
  },
  navCardDescription: {
    color: theme.palette.text.secondary
  }
}));

const DocumentacaoPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { showConfirm } = useSystemAlert();

  const [formMessageTextData,] = useState({ token: '', number: '', body: '', userId: '', queueId: '' })
  const [formMessageMediaData,] = useState({ token: '', number: '', medias: '', body:'', userId: '', queueId: '' })
  const [file, setFile] = useState({})
  const { user, socket } = useContext(AuthContext);
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creatingToken, setCreatingToken] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState({});

  const apiCards = [
    {
      title: "API de mensagens",
      description: "Envie textos e mídias autenticadas pelos tokens da empresa.",
      route: "/api-mensagens"
    },
    {
      title: "API de clientes",
      description: "Crie, atualize e sincronize clientes externos com webhooks.",
      route: "/messages-api/documentacao"
    },
    {
      title: "API de contatos",
      description: "Gerencie contatos externos e sincronize dados do CRM.",
      route: "/api-contatos"
    },
    {
      title: "API de tags",
      description: "Crie e organize etiquetas externas para segmentação e kanban.",
      route: "/api-tags"
    },
    {
      title: "API de produtos",
      description: "Gerencie o catálogo externo de produtos com indicadores e webhooks.",
      route: "/api-produtos"
    },
    {
      title: "API de serviços",
      description: "Sincronize serviços ofertados e mantenha o CRM atualizado.",
      route: "/api-servicos"
    },
    {
      title: "API de usuários",
      description: "Gerencie usuários da empresa via API externa.",
      route: "/api-usuarios"
    },
    {
      title: "API de filas",
      description: "Gerencie filas de atendimento via API externa.",
      route: "/api-filas"
    },
    {
      title: "API de negócios",
      description: "Gerencie negócios (funis) via API externa.",
      route: "/api-negocios"
    },
    {
      title: "API de tags kanban",
      description: "Gerencie tags kanban (lanes do funil) via API externa.",
      route: "/api-tags-kanban"
    },
    {
      title: "API de projetos",
      description: "Gerencie projetos via API externa.",
      route: "/api-projetos"
    },
    {
      title: "API de tarefas",
      description: "Gerencie tarefas de projetos via API externa.",
      route: "/api-tarefas"
    },
    {
      title: "API de tickets",
      description: "Gerencie tickets de atendimento via API externa.",
      route: "/api-tickets"
    },
    {
      title: "API de conexões WhatsApp",
      description: "Gerencie conexões WhatsApp via API externa.",
      route: "/api-conexoes"
    },
    {
      title: "API de faturas",
      description: "Gerencie faturas via API externa. Suporta faturas normais e de projetos.",
      route: "/api-faturas"
    }
  ];

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
        return;
      }
      await loadApiKeys();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoadingKeys(true);
      const data = await listCompanyApiKeys();
      setApiKeys(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleCreateToken = async () => {
    const label = window.prompt("Informe um nome para identificar este token", "Integração");
    if (!label) {
      return;
    }

    const webhookUrl = window.prompt("Webhook URL (opcional)", "");
    const webhookSecret = window.prompt("Webhook secret (opcional)", "");

    try {
      setCreatingToken(true);
      await createCompanyApiKey({
        label,
        webhookUrl: webhookUrl || null,
        webhookSecret: webhookSecret || null
      });
      toast.success("Token gerado com sucesso!");
      await loadApiKeys();
    } catch (err) {
      toastError(err);
    } finally {
      setCreatingToken(false);
    }
  };

  const handleCopyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copiado para a área de transferência!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteToken = async (id) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir Token",
      message: "Tem certeza que deseja excluir este token?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      await deleteCompanyApiKey(id);
      toast.success("Token removido com sucesso!");
      await loadApiKeys();
    } catch (err) {
      toastError(err);
    }
  };

  const toggleTokenVisibility = (id) => {
    setVisibleTokens((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send'
  }

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    const data = { number, body, userId, queueId, noRegister: true };
    try {
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${values.token}` 
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', values.body ? values.body: firstFile.name);
      data.append('userId', values.userId);
      data.append('queueId', values.queueId);
      data.append('noRegister', 'true');
      data.append('medias', firstFile);
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'multipart/form-data',
          'Authorization': `Bearer ${values.token}`
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  startIcon={<SendIcon />}
                  style={{
                  color: "white",
                  backgroundColor: "#FFA500",
                  boxShadow: "none",
                  borderRadius: "5px",
                  }}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
            document.getElementById('medias').files = null
            document.getElementById('medias').value = null
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <input type="file" name="medias" id="medias" required onChange={(e) => setFile(e.target.files)} />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  startIcon={<SendIcon />}
                  style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px",
                  }}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  return (
    <Paper
      className={classes.mainPaper}
      style={{marginLeft: "5px"}}
      // className={classes.elementMargin}
      variant="outlined"
    >
      <Box display="flex" flexDirection="column" gap={16}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <Typography variant="h5">{i18n.t("messagesAPI.API.title")}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Gere tokens, configure webhooks e teste as chamadas da API externa.
            </Typography>
          </div>
          <Button
            color="primary"
            variant="contained"
            onClick={handleCreateToken}
            disabled={creatingToken}
          >
            {creatingToken ? "Gerando..." : "Gerar novo token"}
          </Button>
        </Box>

        <Box className={classes.navCardsWrapper}>
          <Typography variant="subtitle1" gutterBottom>
            APIs disponíveis
          </Typography>
          <Grid container spacing={2}>
            {apiCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.title}>
                <Paper
                  elevation={0}
                  className={classes.navCard}
                  onClick={() => history.push(card.route)}
                >
                  <Typography className={classes.navCardTitle}>{card.title}</Typography>
                  <Typography variant="body2" className={classes.navCardDescription}>
                    {card.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Paper elevation={0} style={{ padding: 16, marginBottom: 24 }}>
          <Typography variant="h6" gutterBottom>
            Tokens ativos
          </Typography>
          {loadingKeys ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : apiKeys.length === 0 ? (
            <Typography color="textSecondary">
              Nenhum token gerado ainda. Clique em "Gerar novo token" para começar.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {apiKeys.map((key) => (
                <Grid item xs={12} md={6} key={key.id}>
                  <Paper variant="outlined" style={{ padding: 16 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {key.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Último uso: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "nunca"}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={1}
                      mb={1}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        background: "#f4f6fb"
                      }}
                    >
                      <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                        {visibleTokens[key.id] ? key.token : "••••••••••••••••••••••"}
                      </Typography>
                      <Box>
                        <IconButton onClick={() => toggleTokenVisibility(key.id)}>
                          {visibleTokens[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <IconButton onClick={() => handleCopyToken(key.token)}>
                          <ContentCopyIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteToken(key.id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    {key.webhookUrl && (
                      <Typography variant="body2">
                        Webhook: <b>{key.webhookUrl}</b>
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Paper>
  );
};

export default DocumentacaoPage;