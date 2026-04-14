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
  Typography
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
  elementMargin: {
    padding: theme.spacing(2)
  },
  formContainer: {
    maxWidth: 520
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

const ApiClientesPage = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClientsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/clients`;

  const postmanRequests = [
    {
      name: "Listar clientes",
      method: "GET",
      url: getClientsEndpoint(),
      description: "Retorna os clientes externos cadastrados."
    },
    {
      name: "Buscar cliente por ID",
      method: "GET",
      url: `${getClientsEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um cliente específico."
    },
    {
      name: "Criar cliente",
      method: "POST",
      url: getClientsEndpoint(),
      description: "Cria um novo cliente externo.",
      body: {
        name: "Maria Cliente",
        email: "cliente@example.com",
        document: "123.456.789-00",
        phoneNumber: "5524999999999"
      }
    },
    {
      name: "Atualizar cliente",
      method: "PUT",
      url: `${getClientsEndpoint()}/1`,
      description: "Altere o ID para atualizar o cliente desejado.",
      body: {
        name: "Maria Cliente (editada)",
        email: "novo-email@example.com"
      }
    },
    {
      name: "Remover cliente",
      method: "DELETE",
      url: `${getClientsEndpoint()}/1`,
      description: "Remove definitivamente o cliente informado no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanClient = (client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    document: client.document,
    phoneNumber: client.phoneNumber,
    status: client.status,
    ownerUserId: client.ownerUserId
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListClients = async (token) => {
    try {
      const { data } = await axios.get(getClientsEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de clientes", {
        ...data,
        clients: data.clients?.map(cleanClient)
      });
      toast.success("Clientes carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowClient = async (token, clientId) => {
    try {
      const { data } = await axios.get(`${getClientsEndpoint()}/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Cliente ${clientId}`, cleanClient(data));
      toast.success("Cliente carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildClientPayload = (values) => {
    const payload = {
      name: values.name,
      email: values.email || null,
      document: values.document || null,
      phoneNumber: values.phoneNumber || null
    };

    if (values.customFields) {
      try {
        payload.customFields = JSON.parse(values.customFields);
      } catch (error) {
        throw new Error("JSON inválido em campos customizados.");
      }
    }

    return payload;
  };

  const handleCreateClient = async (values) => {
    try {
      const payload = buildClientPayload(values);
      const { data } = await axios.post(getClientsEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Cliente criado", cleanClient(data));
      toast.success("Cliente criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateClient = async (values) => {
    try {
      const payload = buildClientPayload(values);
      const { data } = await axios.put(`${getClientsEndpoint()}/${values.clientId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Cliente atualizado", cleanClient(data));
      toast.success("Cliente atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteClient = async (values) => {
    try {
      await axios.delete(`${getClientsEndpoint()}/${values.clientId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Cliente removido", { id: values.clientId, deleted: true });
      toast.success("Cliente removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", clientId: "" }}
      onSubmit={(values) => handleListClients(values.token)}
    >
      {({ values, isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Client ID (opcional para buscar um)"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={isSubmitting}
                style={{ marginRight: 8 }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Listar todos"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.clientId) {
                    toast.error("Informe o Client ID para buscar um registro.");
                    return;
                  }
                  handleShowClient(values.token, values.clientId);
                }}
              >
                Buscar por ID
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderCreateForm = () => (
    <Formik
      initialValues={{
        token: "",
        name: "",
        email: "",
        document: "",
        phoneNumber: "",
        customFields: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateClient(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Nome"
                name="name"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="E-mail"
                name="email"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Documento"
                name="document"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Telefone"
                name="phoneNumber"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Campos customizados (JSON)'
                name="customFields"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='{"campo": "valor"}'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar cliente"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderUpdateForm = () => (
    <Formik
      initialValues={{
        token: "",
        clientId: "",
        name: "",
        email: "",
        document: "",
        phoneNumber: "",
        customFields: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateClient(values);
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
                label="Client ID"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Nome"
                name="name"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="E-mail"
                name="email"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Documento"
                name="document"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Telefone"
                name="phoneNumber"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Campos customizados (JSON)'
                name="customFields"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='{"campo": "valor"}'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar cliente"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", clientId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteClient(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Client ID"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir cliente"}
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
          <Typography variant="h5">API de Clientes</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gere, consulte e sincronize clientes externos utilizando os tokens desta conta.
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
            <li><b>Listar clientes:</b> GET {getClientsEndpoint()}</li>
            <li><b>Buscar cliente:</b> GET {getClientsEndpoint()}/:id</li>
            <li><b>Criar cliente:</b> POST {getClientsEndpoint()}</li>
            <li><b>Atualizar cliente:</b> PUT {getClientsEndpoint()}/:id</li>
            <li><b>Excluir cliente:</b> DELETE {getClientsEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Clientes"
        requests={postmanRequests}
        filename="whaticket-api-clientes.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar clientes</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todos ou adicione um Client ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar cliente</Typography>
        <Typography color="textSecondary">
          Campos mínimos: <b>name</b>. E-mail, documento e telefone são opcionais.
          Você pode enviar campos customizados no formato JSON.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar cliente</Typography>
        <Typography color="textSecondary">
          Informe o <b>Client ID</b> retornado pela criação/listagem e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir cliente</Typography>
        <Typography color="textSecondary">
          Esta operação remove o registro definitivamente. Utilize com cuidado.
        </Typography>
        {renderDeleteForm()}
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

export default ApiClientesPage;