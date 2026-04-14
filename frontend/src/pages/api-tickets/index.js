import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import axios from "axios";
import { toast } from "react-toastify";

import toastError from "../../errors/toastError";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";

import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import ApiPostmanDownload from "../../components/ApiPostmanDownload";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100
  },
  formContainer: {
    maxWidth: 700
  },
  textRight: {
    textAlign: "right"
  },
  resultBox: {
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 13,
    padding: theme.spacing(2),
    borderRadius: 8,
    overflowX: "auto"
  }
}));

const ApiTicketsPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    async function checkPermission() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página!");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    checkPermission();
  }, []);

  const getTicketsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/tickets`;

  const postmanRequests = [
    {
      name: "Listar tickets",
      method: "GET",
      url: getTicketsEndpoint(),
      description: "Retorna os tickets da empresa. Use filtros como ?status=open&queueId=1"
    },
    {
      name: "Buscar ticket por ID",
      method: "GET",
      url: `${getTicketsEndpoint()}/1`,
      description: "Retorna detalhes de um ticket específico."
    },
    {
      name: "Listar mensagens do ticket",
      method: "GET",
      url: `${getTicketsEndpoint()}/1/messages`,
      description: "Retorna as mensagens de um ticket."
    },
    {
      name: "Atualizar ticket",
      method: "PUT",
      url: `${getTicketsEndpoint()}/1`,
      description: "Atualiza status, usuário, fila ou tags do ticket.",
      body: {
        status: "open",
        userId: 1,
        queueId: 1,
        tagIds: [1, 2]
      }
    },
    {
      name: "Fechar ticket",
      method: "POST",
      url: `${getTicketsEndpoint()}/1/close`,
      description: "Fecha o ticket informado."
    },
    {
      name: "Reabrir ticket",
      method: "POST",
      url: `${getTicketsEndpoint()}/1/reopen`,
      description: "Reabre um ticket fechado."
    },
    {
      name: "Transferir ticket",
      method: "POST",
      url: `${getTicketsEndpoint()}/1/transfer`,
      description: "Transfere o ticket para outro usuário ou fila.",
      body: {
        userId: 2,
        queueId: 1
      }
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListTickets = async (values) => {
    try {
      const params = new URLSearchParams();
      if (values.status) params.append("status", values.status);
      if (values.queueId) params.append("queueId", values.queueId);
      if (values.userId) params.append("userId", values.userId);
      if (values.searchParam) params.append("searchParam", values.searchParam);
      const queryString = params.toString() ? `?${params.toString()}` : "";

      const { data } = await axios.get(`${getTicketsEndpoint()}${queryString}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Lista de tickets", data);
      toast.success("Tickets carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowTicket = async (token, ticketId) => {
    try {
      const { data } = await axios.get(`${getTicketsEndpoint()}/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Ticket ${ticketId}`, data);
      toast.success("Ticket carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleGetMessages = async (token, ticketId) => {
    try {
      const { data } = await axios.get(`${getTicketsEndpoint()}/${ticketId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Mensagens do Ticket ${ticketId}`, data);
      toast.success("Mensagens carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateTicket = async (values) => {
    try {
      const payload = {};
      if (values.status) payload.status = values.status;
      if (values.userId) payload.userId = Number(values.userId);
      if (values.queueId) payload.queueId = Number(values.queueId);
      if (values.tagIds) {
        try {
          payload.tagIds = JSON.parse(values.tagIds);
        } catch (e) {
          toast.error("JSON inválido em tagIds");
          return;
        }
      }

      const { data } = await axios.put(`${getTicketsEndpoint()}/${values.ticketId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Ticket atualizado", data);
      toast.success("Ticket atualizado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseTicket = async (values) => {
    try {
      const { data } = await axios.post(`${getTicketsEndpoint()}/${values.ticketId}/close`, {}, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Ticket fechado", data);
      toast.success("Ticket fechado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleReopenTicket = async (values) => {
    try {
      const { data } = await axios.post(`${getTicketsEndpoint()}/${values.ticketId}/reopen`, {}, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Ticket reaberto", data);
      toast.success("Ticket reaberto!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleTransferTicket = async (values) => {
    try {
      const payload = {};
      if (values.userId) payload.userId = Number(values.userId);
      if (values.queueId) payload.queueId = Number(values.queueId);

      const { data } = await axios.post(`${getTicketsEndpoint()}/${values.ticketId}/transfer`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Ticket transferido", data);
      toast.success("Ticket transferido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListForm = () => (
    <Formik
      initialValues={{ token: "", ticketId: "", status: "", queueId: "", userId: "", searchParam: "" }}
      onSubmit={(values) => handleListTickets(values)}
    >
      {({ values, isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Ticket ID (opcional)"
                name="ticketId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                select
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="open">Aberto</MenuItem>
                <MenuItem value="pending">Aguardando</MenuItem>
                <MenuItem value="closed">Fechado</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Buscar contato"
                name="searchParam"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="Nome ou número"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Queue ID"
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="User ID"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6} className={classes.textRight}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={isSubmitting}
                style={{ marginRight: 8 }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Listar"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.ticketId) {
                    toast.error("Informe o Ticket ID.");
                    return;
                  }
                  handleShowTicket(values.token, values.ticketId);
                }}
                style={{ marginRight: 8 }}
              >
                Buscar por ID
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.ticketId) {
                    toast.error("Informe o Ticket ID.");
                    return;
                  }
                  handleGetMessages(values.token, values.ticketId);
                }}
              >
                Ver Mensagens
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderUpdateForm = () => (
    <Formik
      initialValues={{ token: "", ticketId: "", status: "", userId: "", queueId: "", tagIds: "" }}
      onSubmit={async (values, actions) => {
        await handleUpdateTicket(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Ticket ID"
                name="ticketId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="">Não alterar</MenuItem>
                <MenuItem value="open">Aberto</MenuItem>
                <MenuItem value="pending">Aguardando</MenuItem>
                <MenuItem value="closed">Fechado</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="User ID"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Queue ID"
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label='Tags (JSON array)'
                name="tagIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2]'
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar ticket"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderActionsForm = () => (
    <Formik
      initialValues={{ token: "", ticketId: "", userId: "", queueId: "" }}
      onSubmit={() => {}}
    >
      {({ values }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Ticket ID"
                name="ticketId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="User ID (transferir)"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Queue ID (transferir)"
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (!values.ticketId) {
                    toast.error("Informe o Ticket ID.");
                    return;
                  }
                  handleCloseTicket(values);
                }}
                style={{ marginRight: 8 }}
              >
                Fechar
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (!values.ticketId) {
                    toast.error("Informe o Ticket ID.");
                    return;
                  }
                  handleReopenTicket(values);
                }}
                style={{ marginRight: 8 }}
              >
                Reabrir
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.ticketId) {
                    toast.error("Informe o Ticket ID.");
                    return;
                  }
                  if (!values.userId && !values.queueId) {
                    toast.error("Informe User ID ou Queue ID para transferir.");
                    return;
                  }
                  handleTransferTicket(values);
                }}
              >
                Transferir
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h5">API de Tickets</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie tickets de atendimento via API externa.
          </Typography>
        </div>
        <Button startIcon={<ReplyIcon />} variant="outlined" onClick={() => history.push("/messages-api")}>
          Voltar para tokens
        </Button>
      </Box>

      <Box mb={4}>
        <Typography variant="h6">Visão geral</Typography>
        <Typography component="div" color="textSecondary">
          <ul>
            <li><b>Listar tickets:</b> GET {getTicketsEndpoint()}</li>
            <li><b>Buscar ticket:</b> GET {getTicketsEndpoint()}/:id</li>
            <li><b>Mensagens:</b> GET {getTicketsEndpoint()}/:id/messages</li>
            <li><b>Atualizar:</b> PUT {getTicketsEndpoint()}/:id</li>
            <li><b>Fechar:</b> POST {getTicketsEndpoint()}/:id/close</li>
            <li><b>Reabrir:</b> POST {getTicketsEndpoint()}/:id/reopen</li>
            <li><b>Transferir:</b> POST {getTicketsEndpoint()}/:id/transfer</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code>.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Tickets"
        requests={postmanRequests}
        filename="whaticket-api-tickets.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar tickets</Typography>
        <Typography color="textSecondary">
          Liste tickets com filtros ou busque um específico por ID. Também pode ver mensagens.
        </Typography>
        {renderListForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Atualizar ticket</Typography>
        <Typography color="textSecondary">
          Altere status, atribua usuário, fila ou tags.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Ações rápidas</Typography>
        <Typography color="textSecondary">
          Fechar, reabrir ou transferir tickets.
        </Typography>
        {renderActionsForm()}
      </Box>

      {testResult && (
        <Box mt={4}>
          <Typography variant="h6">Resultado do último teste</Typography>
          <Typography variant="body2" color="textSecondary">
            {testResult.title} — {testResult.timestamp}
          </Typography>
          <Box component="pre" mt={2} className={classes.resultBox}>
            {testResult.payload}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ApiTicketsPage;
