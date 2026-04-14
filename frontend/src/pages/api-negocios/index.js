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

const ApiNegociosPage = () => {
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

  const getNegociosEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/negocios`;

  const postmanRequests = [
    {
      name: "Listar negócios",
      method: "GET",
      url: getNegociosEndpoint(),
      description: "Retorna os negócios cadastrados na empresa."
    },
    {
      name: "Buscar negócio por ID",
      method: "GET",
      url: `${getNegociosEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um negócio específico."
    },
    {
      name: "Criar negócio",
      method: "POST",
      url: getNegociosEndpoint(),
      description: "Cria um novo negócio.",
      body: {
        name: "Vendas Online",
        description: "Funil de vendas para e-commerce",
        kanbanBoards: [1, 2, 3],
        users: [1, 2]
      }
    },
    {
      name: "Atualizar negócio",
      method: "PUT",
      url: `${getNegociosEndpoint()}/1`,
      description: "Altere o ID para atualizar o negócio desejado.",
      body: {
        name: "Vendas Online (editado)",
        description: "Nova descrição"
      }
    },
    {
      name: "Remover negócio",
      method: "DELETE",
      url: `${getNegociosEndpoint()}/1`,
      description: "Remove definitivamente o negócio informado no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanNegocio = (negocio) => ({
    id: negocio.id,
    name: negocio.name,
    description: negocio.description,
    kanbanBoards: negocio.kanbanBoards,
    users: negocio.users
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListNegocios = async (token) => {
    try {
      const { data } = await axios.get(getNegociosEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de negócios", {
        ...data,
        negocios: data.negocios?.map(cleanNegocio)
      });
      toast.success("Negócios carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowNegocio = async (token, negocioId) => {
    try {
      const { data } = await axios.get(`${getNegociosEndpoint()}/${negocioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Negócio ${negocioId}`, cleanNegocio(data));
      toast.success("Negócio carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildNegocioPayload = (values) => {
    const payload = {
      name: values.name,
      description: values.description || null
    };

    if (values.kanbanBoards) {
      try {
        payload.kanbanBoards = JSON.parse(values.kanbanBoards);
      } catch (error) {
        throw new Error("JSON inválido em kanbanBoards.");
      }
    }

    if (values.users) {
      try {
        payload.users = JSON.parse(values.users);
      } catch (error) {
        throw new Error("JSON inválido em users.");
      }
    }

    return payload;
  };

  const handleCreateNegocio = async (values) => {
    try {
      const payload = buildNegocioPayload(values);
      const { data } = await axios.post(getNegociosEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Negócio criado", cleanNegocio(data));
      toast.success("Negócio criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateNegocio = async (values) => {
    try {
      const payload = buildNegocioPayload(values);
      const { data } = await axios.put(`${getNegociosEndpoint()}/${values.negocioId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Negócio atualizado", cleanNegocio(data));
      toast.success("Negócio atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteNegocio = async (values) => {
    try {
      await axios.delete(`${getNegociosEndpoint()}/${values.negocioId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Negócio removido", { id: values.negocioId, deleted: true });
      toast.success("Negócio removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", negocioId: "" }}
      onSubmit={(values) => handleListNegocios(values.token)}
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
                label="Negócio ID (opcional para buscar um)"
                name="negocioId"
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
                  if (!values.negocioId) {
                    toast.error("Informe o Negócio ID para buscar um registro.");
                    return;
                  }
                  handleShowNegocio(values.token, values.negocioId);
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
        description: "",
        kanbanBoards: "",
        users: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateNegocio(values);
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
                label="Nome do Negócio"
                name="name"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="description"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label='Tags Kanban (JSON array de IDs)'
                name="kanbanBoards"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2, 3]'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label='Usuários (JSON array de IDs)'
                name="users"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar negócio"}
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
        negocioId: "",
        name: "",
        description: "",
        kanbanBoards: "",
        users: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateNegocio(values);
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
                label="Negócio ID"
                name="negocioId"
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
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="description"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label='Tags Kanban (JSON array de IDs)'
                name="kanbanBoards"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2, 3]'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label='Usuários (JSON array de IDs)'
                name="users"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar negócio"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", negocioId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteNegocio(values);
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
                label="Negócio ID"
                name="negocioId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir negócio"}
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
          <Typography variant="h5">API de Negócios</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie negócios (funis) via API externa.
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
            <li><b>Listar negócios:</b> GET {getNegociosEndpoint()}</li>
            <li><b>Buscar negócio:</b> GET {getNegociosEndpoint()}/:id</li>
            <li><b>Criar negócio:</b> POST {getNegociosEndpoint()}</li>
            <li><b>Atualizar negócio:</b> PUT {getNegociosEndpoint()}/:id</li>
            <li><b>Excluir negócio:</b> DELETE {getNegociosEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Negócios"
        requests={postmanRequests}
        filename="whaticket-api-negocios.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar negócios</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todos ou adicione um Negócio ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar negócio</Typography>
        <Typography color="textSecondary">
          Campo obrigatório: <b>name</b>. Descrição, kanbanBoards e users são opcionais.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar negócio</Typography>
        <Typography color="textSecondary">
          Informe o <b>Negócio ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir negócio</Typography>
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

export default ApiNegociosPage;
