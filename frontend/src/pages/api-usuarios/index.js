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

const ApiUsuariosPage = () => {
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

  const getUsersEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/users`;

  const postmanRequests = [
    {
      name: "Listar usuários",
      method: "GET",
      url: getUsersEndpoint(),
      description: "Retorna os usuários cadastrados na empresa."
    },
    {
      name: "Buscar usuário por ID",
      method: "GET",
      url: `${getUsersEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um usuário específico."
    },
    {
      name: "Criar usuário",
      method: "POST",
      url: getUsersEndpoint(),
      description: "Cria um novo usuário.",
      body: {
        name: "João Silva",
        email: "joao@empresa.com",
        password: "senha123",
        profile: "user",
        userType: "professional",
        startWork: "08:00",
        endWork: "18:00",
        workDays: "1,2,3,4,5",
        lunchStart: "12:00",
        lunchEnd: "13:00",
        queueIds: [1, 2]
      }
    },
    {
      name: "Atualizar usuário",
      method: "PUT",
      url: `${getUsersEndpoint()}/1`,
      description: "Altere o ID para atualizar o usuário desejado.",
      body: {
        name: "João Silva (editado)",
        profile: "admin",
        workDays: "1,2,3,4,5,6"
      }
    },
    {
      name: "Remover usuário",
      method: "DELETE",
      url: `${getUsersEndpoint()}/1`,
      description: "Remove definitivamente o usuário informado."
    },
    {
      name: "Listar serviços do usuário",
      method: "GET",
      url: `${getUsersEndpoint()}/1/services`,
      description: "Retorna os serviços vinculados ao usuário."
    },
    {
      name: "Vincular serviços ao usuário",
      method: "POST",
      url: `${getUsersEndpoint()}/1/services`,
      description: "Adiciona serviços ao usuário.",
      body: { serviceIds: [1, 2, 3] }
    },
    {
      name: "Definir serviços do usuário",
      method: "PUT",
      url: `${getUsersEndpoint()}/1/services`,
      description: "Substitui todos os serviços do usuário.",
      body: { serviceIds: [1, 2] }
    },
    {
      name: "Remover serviços do usuário",
      method: "DELETE",
      url: `${getUsersEndpoint()}/1/services`,
      description: "Remove serviços específicos do usuário.",
      body: { serviceIds: [3] }
    },
    {
      name: "Obter agenda do usuário",
      method: "GET",
      url: `${getUsersEndpoint()}/1/schedule`,
      description: "Retorna a agenda do usuário."
    },
    {
      name: "Criar agenda do usuário",
      method: "POST",
      url: `${getUsersEndpoint()}/1/schedule`,
      description: "Cria uma agenda para o usuário.",
      body: { name: "Agenda Principal", description: "Agenda de atendimentos", active: true }
    },
    {
      name: "Listar compromissos",
      method: "GET",
      url: `${getUsersEndpoint()}/1/appointments`,
      description: "Retorna os compromissos do usuário."
    },
    {
      name: "Criar compromisso",
      method: "POST",
      url: `${getUsersEndpoint()}/1/appointments`,
      description: "Cria um novo compromisso.",
      body: {
        title: "Consulta",
        startDatetime: "2025-01-15T10:00:00",
        durationMinutes: 60,
        serviceId: 1,
        clientId: 1
      }
    },
    {
      name: "Atualizar status do compromisso",
      method: "PATCH",
      url: `${getUsersEndpoint()}/1/appointments/1/status`,
      description: "Atualiza o status do compromisso.",
      body: { status: "confirmed" }
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

  const handleListUsers = async (token, profile) => {
    try {
      const params = profile ? `?profile=${profile}` : "";
      const { data } = await axios.get(`${getUsersEndpoint()}${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de usuários", data);
      toast.success("Usuários carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowUser = async (token, userId) => {
    try {
      const { data } = await axios.get(`${getUsersEndpoint()}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Usuário ${userId}`, data);
      toast.success("Usuário carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildUserPayload = (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password || undefined,
      profile: values.profile || "user",
      startWork: values.startWork || "00:00",
      endWork: values.endWork || "23:59",
      userType: values.userType || "attendant",
      workDays: values.workDays || "1,2,3,4,5",
      color: values.color || "",
      allTicket: values.allTicket || "disable",
      allowGroup: values.allowGroup === "true" || values.allowGroup === true,
      farewellMessage: values.farewellMessage || ""
    };

    if (values.queueIds) {
      try {
        payload.queueIds = JSON.parse(values.queueIds);
      } catch (error) {
        throw new Error("JSON inválido em queueIds.");
      }
    }

    return payload;
  };

  const handleCreateUser = async (values) => {
    try {
      const payload = buildUserPayload(values);
      const { data } = await axios.post(getUsersEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Usuário criado", data);
      toast.success("Usuário criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      const payload = buildUserPayload(values);
      if (!payload.password) delete payload.password;
      const { data } = await axios.put(`${getUsersEndpoint()}/${values.userId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Usuário atualizado", data);
      toast.success("Usuário atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteUser = async (values) => {
    try {
      await axios.delete(`${getUsersEndpoint()}/${values.userId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Usuário removido", { id: values.userId, deleted: true });
      toast.success("Usuário removido!");
    } catch (err) {
      toastError(err);
    }
  };

  // ==================== SERVIÇOS ====================

  const handleListServices = async (token, userId) => {
    try {
      const { data } = await axios.get(`${getUsersEndpoint()}/${userId}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Serviços do usuário ${userId}`, data);
      toast.success("Serviços carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSetServices = async (values) => {
    try {
      let serviceIds;
      try {
        serviceIds = JSON.parse(values.serviceIds);
      } catch (e) {
        toast.error("JSON inválido em serviceIds");
        return;
      }

      const { data } = await axios.put(`${getUsersEndpoint()}/${values.userId}/services`, { serviceIds }, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Serviços atualizados", data);
      toast.success("Serviços atualizados!");
    } catch (err) {
      toastError(err);
    }
  };

  // ==================== AGENDA ====================

  const handleGetSchedule = async (token, userId) => {
    try {
      const { data } = await axios.get(`${getUsersEndpoint()}/${userId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Agenda do usuário ${userId}`, data);
      toast.success("Agenda carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateSchedule = async (values) => {
    try {
      const payload = {
        name: values.scheduleName || `Agenda do usuário ${values.userId}`,
        description: values.scheduleDescription || "",
        active: true
      };

      const { data } = await axios.post(`${getUsersEndpoint()}/${values.userId}/schedule`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Agenda criada", data);
      toast.success("Agenda criada!");
    } catch (err) {
      toastError(err);
    }
  };

  // ==================== COMPROMISSOS ====================

  const handleListAppointments = async (token, userId) => {
    try {
      const { data } = await axios.get(`${getUsersEndpoint()}/${userId}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Compromissos do usuário ${userId}`, data);
      toast.success("Compromissos carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateAppointment = async (values) => {
    try {
      const payload = {
        title: values.appointmentTitle || "Compromisso",
        startDatetime: values.startDatetime,
        durationMinutes: Number(values.durationMinutes) || 60
      };
      if (values.serviceId) payload.serviceId = Number(values.serviceId);
      if (values.clientId) payload.clientId = Number(values.clientId);
      if (values.appointmentDescription) payload.description = values.appointmentDescription;

      const { data } = await axios.post(`${getUsersEndpoint()}/${values.userId}/appointments`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Compromisso criado", data);
      toast.success("Compromisso criado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateAppointmentStatus = async (values) => {
    try {
      const { data } = await axios.patch(
        `${getUsersEndpoint()}/${values.userId}/appointments/${values.appointmentId}/status`,
        { status: values.status },
        { headers: { Authorization: `Bearer ${values.token}` } }
      );
      saveResult("Status atualizado", data);
      toast.success("Status atualizado!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", userId: "", profile: "" }}
      onSubmit={(values) => handleListUsers(values.token, values.profile)}
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
                label="User ID (opcional)"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Perfil (filtro)"
                name="profile"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="super">Super</MenuItem>
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
                  if (!values.userId) {
                    toast.error("Informe o User ID para buscar.");
                    return;
                  }
                  handleShowUser(values.token, values.userId);
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
        password: "",
        profile: "user",
        startWork: "08:00",
        endWork: "18:00",
        queueIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateUser(values);
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
                type="email"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Senha"
                name="password"
                type="password"
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
                label="Perfil"
                name="profile"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Início Expediente"
                name="startWork"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="08:00"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Fim Expediente"
                name="endWork"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="18:00"
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Filas (JSON array de IDs)'
                name="queueIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2, 3]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar usuário"}
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
        userId: "",
        name: "",
        email: "",
        password: "",
        profile: "",
        startWork: "",
        endWork: "",
        queueIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateUser(values);
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
                label="User ID"
                name="userId"
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
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="E-mail"
                name="email"
                type="email"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Nova Senha (opcional)"
                name="password"
                type="password"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Perfil"
                name="profile"
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <MenuItem value="">Não alterar</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Início Expediente"
                name="startWork"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="08:00"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Fim Expediente"
                name="endWork"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="18:00"
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Filas (JSON array de IDs)'
                name="queueIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2, 3]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar usuário"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", userId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteUser(values);
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
                label="User ID"
                name="userId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir usuário"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderServicesForm = () => (
    <Formik
      initialValues={{ token: "", userId: "", serviceIds: "" }}
      onSubmit={() => {}}
    >
      {({ values }) => (
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
                label="User ID"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label='IDs dos serviços (JSON)'
                name="serviceIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2, 3]'
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.userId) {
                    toast.error("Informe o User ID.");
                    return;
                  }
                  handleListServices(values.token, values.userId);
                }}
                style={{ marginRight: 8 }}
              >
                Listar serviços
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.userId || !values.serviceIds) {
                    toast.error("Informe User ID e serviceIds.");
                    return;
                  }
                  handleSetServices(values);
                }}
              >
                Definir serviços
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderScheduleForm = () => (
    <Formik
      initialValues={{ token: "", userId: "", scheduleName: "", scheduleDescription: "" }}
      onSubmit={() => {}}
    >
      {({ values }) => (
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
                label="User ID"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Nome da agenda"
                name="scheduleName"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="scheduleDescription"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.userId) {
                    toast.error("Informe o User ID.");
                    return;
                  }
                  handleGetSchedule(values.token, values.userId);
                }}
                style={{ marginRight: 8 }}
              >
                Ver agenda
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.userId) {
                    toast.error("Informe o User ID.");
                    return;
                  }
                  handleCreateSchedule(values);
                }}
              >
                Criar agenda
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderAppointmentsForm = () => (
    <Formik
      initialValues={{
        token: "",
        userId: "",
        appointmentId: "",
        appointmentTitle: "",
        startDatetime: "",
        durationMinutes: "60",
        serviceId: "",
        clientId: "",
        status: ""
      }}
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
                label="User ID"
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Título"
                name="appointmentTitle"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Data/Hora"
                name="startDatetime"
                type="datetime-local"
                variant="outlined"
                margin="dense"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Duração (min)"
                name="durationMinutes"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Serviço ID"
                name="serviceId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Cliente ID"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Compromisso ID"
                name="appointmentId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Status (para atualizar)"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Selecione</option>
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
                <option value="no_show">Não compareceu</option>
              </Field>
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.userId) {
                    toast.error("Informe o User ID.");
                    return;
                  }
                  handleListAppointments(values.token, values.userId);
                }}
                style={{ marginRight: 8 }}
              >
                Listar compromissos
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.userId || !values.startDatetime) {
                    toast.error("Informe User ID e Data/Hora.");
                    return;
                  }
                  handleCreateAppointment(values);
                }}
                style={{ marginRight: 8 }}
              >
                Criar compromisso
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#ff9800", color: "#fff" }}
                onClick={() => {
                  if (!values.userId || !values.appointmentId || !values.status) {
                    toast.error("Informe User ID, Compromisso ID e Status.");
                    return;
                  }
                  handleUpdateAppointmentStatus(values);
                }}
              >
                Atualizar status
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
          <Typography variant="h5">API de Usuários</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie usuários da empresa via API externa.
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
            <li><b>Listar usuários:</b> GET {getUsersEndpoint()}</li>
            <li><b>Buscar usuário:</b> GET {getUsersEndpoint()}/:id</li>
            <li><b>Criar usuário:</b> POST {getUsersEndpoint()}</li>
            <li><b>Atualizar usuário:</b> PUT {getUsersEndpoint()}/:id</li>
            <li><b>Excluir usuário:</b> DELETE {getUsersEndpoint()}/:id</li>
          </ul>
          <b>Serviços do usuário:</b>
          <ul>
            <li>GET {getUsersEndpoint()}/:id/services - Listar serviços</li>
            <li>POST {getUsersEndpoint()}/:id/services - Adicionar serviços</li>
            <li>PUT {getUsersEndpoint()}/:id/services - Definir serviços</li>
            <li>DELETE {getUsersEndpoint()}/:id/services - Remover serviços</li>
          </ul>
          <b>Agenda e compromissos:</b>
          <ul>
            <li>GET {getUsersEndpoint()}/:id/schedule - Obter agenda</li>
            <li>POST {getUsersEndpoint()}/:id/schedule - Criar agenda</li>
            <li>GET {getUsersEndpoint()}/:id/appointments - Listar compromissos</li>
            <li>POST {getUsersEndpoint()}/:id/appointments - Criar compromisso</li>
            <li>PATCH {getUsersEndpoint()}/:id/appointments/:appointmentId/status - Atualizar status</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"token"}</code> com um token ativo.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Usuários"
        requests={postmanRequests}
        filename="whaticket-api-usuarios.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar usuários</Typography>
        <Typography color="textSecondary">
          Informe o token para listar todos ou adicione um User ID para buscar específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar usuário</Typography>
        <Typography color="textSecondary">
          Campos obrigatórios: <b>name</b>, <b>email</b> e <b>password</b>.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar usuário</Typography>
        <Typography color="textSecondary">
          Informe o <b>User ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir usuário</Typography>
        <Typography color="textSecondary">
          Remove o usuário definitivamente.
        </Typography>
        {renderDeleteForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">5. Serviços do usuário</Typography>
        <Typography color="textSecondary">
          Vincule serviços ao usuário (para profissionais que prestam serviços).
        </Typography>
        {renderServicesForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">6. Agenda do usuário</Typography>
        <Typography color="textSecondary">
          Gerencie a agenda e compromissos do usuário.
        </Typography>
        {renderScheduleForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">7. Compromissos</Typography>
        <Typography color="textSecondary">
          Crie e gerencie compromissos na agenda do usuário.
        </Typography>
        {renderAppointmentsForm()}
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

export default ApiUsuariosPage;
