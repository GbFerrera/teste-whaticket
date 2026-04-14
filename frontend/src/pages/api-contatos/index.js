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

const ApiContatosPage = () => {
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

  const getContactsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/contacts`;

  const postmanRequests = [
    {
      name: "Listar contatos",
      method: "GET",
      url: getContactsEndpoint(),
      description: "Retorna contatos paginados da empresa autenticada."
    },
    {
      name: "Buscar contato por ID",
      method: "GET",
      url: `${getContactsEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um contato específico."
    },
    {
      name: "Criar contato",
      method: "POST",
      url: getContactsEndpoint(),
      description: "Cria um contato com tags opcionais e campos extras.",
      body: {
        name: "Maria Cliente",
        number: "559999999999",
        email: "cliente@example.com",
        tags: ["VIP", "Lead quente"],
        extraInfo: [
          { name: "cpf", value: "000.000.000-00" }
        ]
      }
    },
    {
      name: "Atualizar contato",
      method: "PUT",
      url: `${getContactsEndpoint()}/1`,
      description: "Altere o ID ao final da URL para atualizar um contato existente.",
      body: {
        name: "Maria Cliente (atualizada)",
        email: "novo-email@example.com",
        tags: ["Lead quente"]
      }
    },
    {
      name: "Remover contato",
      method: "DELETE",
      url: `${getContactsEndpoint()}/1`,
      description: "Remove definitivamente o contato informado no path."
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

  const cleanContact = (contact) => ({
    id: contact.id,
    name: contact.name,
    number: contact.number,
    email: contact.email,
    tags: contact.tags?.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color
    })),
    extraInfo: contact.extraInfo,
    channel: contact.channel
  });

  const saveFormattedResult = (title, payload) => {
    saveResult(title, {
      ...payload,
      contacts: payload.contacts?.map(cleanContact),
      contact: payload.contact ? cleanContact(payload.contact) : undefined
    });
  };

  const handleListContacts = async (token) => {
    try {
      const { data } = await axios.get(getContactsEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveFormattedResult("Lista de contatos", {
        ...data,
        contacts: data.contacts
      });
      toast.success("Contatos carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowContact = async (token, contactId) => {
    try {
      const { data } = await axios.get(`${getContactsEndpoint()}/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveFormattedResult(`Contato ${contactId}`, { contact: data });
      toast.success("Contato carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildContactPayload = (values) => {
    const payload = {
      name: values.name,
      number: values.number,
      email: values.email || null,
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined
    };

    if (values.extraInfo) {
      try {
        payload.extraInfo = JSON.parse(values.extraInfo);
      } catch (error) {
        throw new Error("JSON inválido em campos customizados.");
      }
    }

    return payload;
  };

  const handleCreateContact = async (values) => {
    try {
      const payload = buildContactPayload(values);
      const { data } = await axios.post(getContactsEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveFormattedResult("Contato criado", { contact: data });
      toast.success("Contato criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateContact = async (values) => {
    try {
      const payload = buildContactPayload(values);
      const { data } = await axios.put(`${getContactsEndpoint()}/${values.contactId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveFormattedResult("Contato atualizado", { contact: data });
      toast.success("Contato atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteContact = async (values) => {
    try {
      await axios.delete(`${getContactsEndpoint()}/${values.contactId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Contato removido", { id: values.contactId, deleted: true });
      toast.success("Contato removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", contactId: "" }}
      onSubmit={(values) => handleListContacts(values.token)}
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
                label="Contact ID (opcional para buscar um)"
                name="contactId"
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
                  if (!values.contactId) {
                    toast.error("Informe o Contact ID para buscar um registro.");
                    return;
                  }
                  handleShowContact(values.token, values.contactId);
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
        number: "",
        email: "",
        tags: "",
        extraInfo: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateContact(values);
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
                label="Número (com DDI)"
                name="number"
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
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Tags (separadas por vírgula)"
                name="tags"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="VIP, Lead quente"
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Campos customizados (JSON)'
                name="extraInfo"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='[{"name":"cpf","value":"123"}]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar contato"}
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
        contactId: "",
        name: "",
        number: "",
        email: "",
        tags: "",
        extraInfo: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateContact(values);
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
                label="Contact ID"
                name="contactId"
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
                label="Número"
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
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
                label="Tags"
                name="tags"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Campos customizados (JSON)'
                name="extraInfo"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='[{"name":"cpf","value":"123"}]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar contato"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{
        token: "",
        contactId: ""
      }}
      onSubmit={async (values, actions) => {
        await handleDeleteContact(values);
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
                label="Contact ID"
                name="contactId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
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
                {isSubmitting ? <CircularProgress size={20} /> : "Remover contato"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <Paper className={classes.mainPaper}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <div>
          <Typography variant="h5" gutterBottom>
            API de Contatos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Liste, crie, atualize e remova contatos usando os tokens externos da empresa.
          </Typography>
        </div>
        <Button
          startIcon={<ReplyIcon />}
          variant="outlined"
          onClick={() => history.push("/messages-api")}
        >
          Voltar para documentação
        </Button>
      </Box>
      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Contatos"
        requests={postmanRequests}
        filename="whaticket-api-contatos.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />
      <Box mb={4} className={classes.elementMargin}>
        <Typography variant="h6">Visão geral</Typography>
        <Typography color="textSecondary">
          Gerencie contatos externos com nome, número, tags e campos extras utilizando os tokens desta conta.
        </Typography>
        <Box mt={2} component="div" color="textSecondary">
          <ul>
            <li><b>Listar contatos:</b> GET {getContactsEndpoint()}</li>
            <li><b>Buscar contato:</b> GET {getContactsEndpoint()}/:id</li>
            <li><b>Criar contato:</b> POST {getContactsEndpoint()}</li>
            <li><b>Atualizar contato:</b> PUT {getContactsEndpoint()}/:id</li>
            <li><b>Excluir contato:</b> DELETE {getContactsEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Box>
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Listar Contatos
        </Typography>
        {renderListAndShowForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Criar Contato
        </Typography>
        {renderCreateForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Atualizar Contato
        </Typography>
        {renderUpdateForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Remover Contato
        </Typography>
        {renderDeleteForm()}
      </Box>
      {testResult && (
        <Box className={classes.elementMargin}>
          <Typography variant="h6" gutterBottom>
            Resultado
          </Typography>
          <Paper className={classes.resultBox}>
            <Typography variant="body1" gutterBottom>
              {testResult.title}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {testResult.payload}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {testResult.timestamp}
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default ApiContatosPage;