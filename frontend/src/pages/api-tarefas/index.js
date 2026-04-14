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

const ApiTarefasPage = () => {
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

  const getTasksEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/project-tasks`;

  const postmanRequests = [
    {
      name: "Listar tarefas",
      method: "GET",
      url: getTasksEndpoint(),
      description: "Retorna as tarefas cadastradas. Use ?projectId=X para filtrar por projeto."
    },
    {
      name: "Buscar tarefa por ID",
      method: "GET",
      url: `${getTasksEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar uma tarefa específica."
    },
    {
      name: "Criar tarefa",
      method: "POST",
      url: getTasksEndpoint(),
      description: "Cria uma nova tarefa em um projeto.",
      body: {
        projectId: 1,
        title: "Desenvolver homepage",
        description: "Criar layout responsivo da homepage",
        status: "pending",
        dueDate: "2026-02-15",
        assignedUserIds: [1, 2]
      }
    },
    {
      name: "Atualizar tarefa",
      method: "PUT",
      url: `${getTasksEndpoint()}/1`,
      description: "Altere o ID para atualizar a tarefa desejada.",
      body: {
        title: "Desenvolver homepage (editado)",
        status: "completed"
      }
    },
    {
      name: "Remover tarefa",
      method: "DELETE",
      url: `${getTasksEndpoint()}/1`,
      description: "Remove definitivamente a tarefa informada."
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

  const handleListTasks = async (token, projectId, status) => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append("projectId", projectId);
      if (status) params.append("status", status);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      
      const { data } = await axios.get(`${getTasksEndpoint()}${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de tarefas", data);
      toast.success("Tarefas carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowTask = async (token, taskId) => {
    try {
      const { data } = await axios.get(`${getTasksEndpoint()}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Tarefa ${taskId}`, data);
      toast.success("Tarefa carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildTaskPayload = (values) => {
    const payload = {
      projectId: values.projectId ? Number(values.projectId) : undefined,
      title: values.title,
      description: values.description || null,
      status: values.status || "pending",
      order: values.order ? Number(values.order) : 0,
      startDate: values.startDate || null,
      dueDate: values.dueDate || null
    };

    if (values.assignedUserIds) {
      try {
        payload.assignedUserIds = JSON.parse(values.assignedUserIds);
      } catch (error) {
        throw new Error("JSON inválido em assignedUserIds.");
      }
    }

    return payload;
  };

  const handleCreateTask = async (values) => {
    try {
      const payload = buildTaskPayload(values);
      const { data } = await axios.post(getTasksEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Tarefa criada", data);
      toast.success("Tarefa criada com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateTask = async (values) => {
    try {
      const payload = buildTaskPayload(values);
      delete payload.projectId; // Não permite mudar o projeto
      const { data } = await axios.put(`${getTasksEndpoint()}/${values.taskId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Tarefa atualizada", data);
      toast.success("Tarefa atualizada com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteTask = async (values) => {
    try {
      await axios.delete(`${getTasksEndpoint()}/${values.taskId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Tarefa removida", { id: values.taskId, deleted: true });
      toast.success("Tarefa removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", taskId: "", projectId: "", status: "" }}
      onSubmit={(values) => handleListTasks(values.token, values.projectId, values.status)}
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
                label="Task ID (opcional)"
                name="taskId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Project ID (filtro)"
                name="projectId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
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
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="in_progress">Em Progresso</MenuItem>
                <MenuItem value="review">Em Revisão</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
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
                {isSubmitting ? <CircularProgress size={20} /> : "Listar todas"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.taskId) {
                    toast.error("Informe o Task ID para buscar.");
                    return;
                  }
                  handleShowTask(values.token, values.taskId);
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
        projectId: "",
        title: "",
        description: "",
        status: "pending",
        order: "",
        startDate: "",
        dueDate: "",
        assignedUserIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateTask(values);
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
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Título da Tarefa"
                name="title"
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
                select
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="in_progress">Em Progresso</MenuItem>
                <MenuItem value="review">Em Revisão</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Ordem"
                name="order"
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
                name="assignedUserIds"
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
                label="Data Limite"
                name="dueDate"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar tarefa"}
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
        taskId: "",
        title: "",
        description: "",
        status: "",
        order: "",
        startDate: "",
        dueDate: "",
        assignedUserIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateTask(values);
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
                label="Task ID"
                name="taskId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Título"
                name="title"
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
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="in_progress">Em Progresso</MenuItem>
                <MenuItem value="review">Em Revisão</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Ordem"
                name="order"
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
                name="assignedUserIds"
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
                label="Data Limite"
                name="dueDate"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar tarefa"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", taskId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteTask(values);
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
                label="Task ID"
                name="taskId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir tarefa"}
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
          <Typography variant="h5">API de Tarefas de Projeto</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie tarefas de projetos via API externa.
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
            <li><b>Listar tarefas:</b> GET {getTasksEndpoint()}</li>
            <li><b>Buscar tarefa:</b> GET {getTasksEndpoint()}/:id</li>
            <li><b>Criar tarefa:</b> POST {getTasksEndpoint()}</li>
            <li><b>Atualizar tarefa:</b> PUT {getTasksEndpoint()}/:id</li>
            <li><b>Excluir tarefa:</b> DELETE {getTasksEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code>.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Tarefas"
        requests={postmanRequests}
        filename="whaticket-api-tarefas.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar tarefas</Typography>
        <Typography color="textSecondary">
          Informe o token para listar. Use Project ID e Status para filtrar.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar tarefa</Typography>
        <Typography color="textSecondary">
          Campos obrigatórios: <b>projectId</b> e <b>title</b>.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar tarefa</Typography>
        <Typography color="textSecondary">
          Informe o <b>Task ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir tarefa</Typography>
        <Typography color="textSecondary">
          Remove a tarefa definitivamente.
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

export default ApiTarefasPage;
