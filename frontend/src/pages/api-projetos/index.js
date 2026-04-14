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
    maxWidth: 600
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

const ApiProjetosPage = () => {
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

  const getProjectsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/projects`;

  const postmanRequests = [
    {
      name: "Listar projetos",
      method: "GET",
      url: getProjectsEndpoint(),
      description: "Retorna os projetos cadastrados na empresa."
    },
    {
      name: "Buscar projeto por ID",
      method: "GET",
      url: `${getProjectsEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um projeto específico."
    },
    {
      name: "Criar projeto",
      method: "POST",
      url: getProjectsEndpoint(),
      description: "Cria um novo projeto.",
      body: {
        name: "Projeto Website",
        description: "Desenvolvimento de website institucional",
        clientId: 1,
        status: "active",
        startDate: "2026-01-01",
        endDate: "2026-03-01",
        userIds: [1, 2]
      }
    },
    {
      name: "Atualizar projeto",
      method: "PUT",
      url: `${getProjectsEndpoint()}/1`,
      description: "Altere o ID para atualizar o projeto desejado.",
      body: {
        name: "Projeto Website (editado)",
        status: "completed"
      }
    },
    {
      name: "Remover projeto",
      method: "DELETE",
      url: `${getProjectsEndpoint()}/1`,
      description: "Remove definitivamente o projeto e suas tarefas."
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

  const handleListProjects = async (token, status) => {
    try {
      const params = status ? `?status=${status}` : "";
      const { data } = await axios.get(`${getProjectsEndpoint()}${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de projetos", data);
      toast.success("Projetos carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowProject = async (token, projectId) => {
    try {
      const { data } = await axios.get(`${getProjectsEndpoint()}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Projeto ${projectId}`, data);
      toast.success("Projeto carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildProjectPayload = (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      clientId: values.clientId ? Number(values.clientId) : null,
      status: values.status || "draft",
      startDate: values.startDate || null,
      endDate: values.endDate || null,
      deliveryTime: values.deliveryTime || null,
      warranty: values.warranty || null,
      terms: values.terms || null
    };

    if (values.userIds) {
      try {
        payload.userIds = JSON.parse(values.userIds);
      } catch (error) {
        throw new Error("JSON inválido em userIds.");
      }
    }

    return payload;
  };

  const handleCreateProject = async (values) => {
    try {
      const payload = buildProjectPayload(values);
      const { data } = await axios.post(getProjectsEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Projeto criado", data);
      toast.success("Projeto criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateProject = async (values) => {
    try {
      const payload = buildProjectPayload(values);
      const { data } = await axios.put(`${getProjectsEndpoint()}/${values.projectId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Projeto atualizado", data);
      toast.success("Projeto atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteProject = async (values) => {
    try {
      await axios.delete(`${getProjectsEndpoint()}/${values.projectId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Projeto removido", { id: values.projectId, deleted: true });
      toast.success("Projeto removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", projectId: "", status: "" }}
      onSubmit={(values) => handleListProjects(values.token, values.status)}
    >
      {({ values, isSubmitting }) => (
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
                label="Project ID (opcional)"
                name="projectId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Status (filtro)"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Field>
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
                  if (!values.projectId) {
                    toast.error("Informe o Project ID para buscar.");
                    return;
                  }
                  handleShowProject(values.token, values.projectId);
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
        clientId: "",
        status: "draft",
        startDate: "",
        endDate: "",
        userIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateProject(values);
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
                label="Nome do Projeto"
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
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Client ID"
                name="clientId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
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
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label='Usuários (JSON array)'
                name="userIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2]'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Data Início"
                name="startDate"
                type="date"
                variant="outlined"
                margin="dense"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Data Fim"
                name="endDate"
                type="date"
                variant="outlined"
                margin="dense"
                fullWidth
                InputLabelProps={{ shrink: true }}
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar projeto"}
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
        projectId: "",
        name: "",
        description: "",
        clientId: "",
        status: "",
        startDate: "",
        endDate: "",
        userIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateProject(values);
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
                label="Project ID"
                name="projectId"
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
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Client ID"
                name="clientId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label='Usuários (JSON array)'
                name="userIds"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar projeto"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", projectId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteProject(values);
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
                label="Project ID"
                name="projectId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir projeto"}
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
          <Typography variant="h5">API de Projetos</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie projetos via API externa.
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
            <li><b>Listar projetos:</b> GET {getProjectsEndpoint()}</li>
            <li><b>Buscar projeto:</b> GET {getProjectsEndpoint()}/:id</li>
            <li><b>Criar projeto:</b> POST {getProjectsEndpoint()}</li>
            <li><b>Atualizar projeto:</b> PUT {getProjectsEndpoint()}/:id</li>
            <li><b>Excluir projeto:</b> DELETE {getProjectsEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code>.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Projetos"
        requests={postmanRequests}
        filename="whaticket-api-projetos.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar projetos</Typography>
        <Typography color="textSecondary">
          Informe o token para listar todos ou adicione um Project ID para buscar específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar projeto</Typography>
        <Typography color="textSecondary">
          Campo obrigatório: <b>name</b>. Os demais campos são opcionais.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar projeto</Typography>
        <Typography color="textSecondary">
          Informe o <b>Project ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir projeto</Typography>
        <Typography color="textSecondary">
          Remove o projeto e todas as tarefas associadas.
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

export default ApiProjetosPage;
