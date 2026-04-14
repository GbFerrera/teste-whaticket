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

const ApiFilasPage = () => {
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

  const getQueuesEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/queues`;

  const postmanRequests = [
    {
      name: "Listar filas",
      method: "GET",
      url: getQueuesEndpoint(),
      description: "Retorna as filas cadastradas na empresa."
    },
    {
      name: "Buscar fila por ID",
      method: "GET",
      url: `${getQueuesEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar uma fila específica."
    },
    {
      name: "Criar fila",
      method: "POST",
      url: getQueuesEndpoint(),
      description: "Cria uma nova fila.",
      body: {
        name: "Suporte Técnico",
        color: "#5C59C2",
        greetingMessage: "Olá! Você está na fila de Suporte Técnico.",
        outOfHoursMessage: "Estamos fora do horário de atendimento."
      }
    },
    {
      name: "Atualizar fila",
      method: "PUT",
      url: `${getQueuesEndpoint()}/1`,
      description: "Altere o ID para atualizar a fila desejada.",
      body: {
        name: "Suporte Técnico (editado)",
        greetingMessage: "Nova mensagem de saudação"
      }
    },
    {
      name: "Remover fila",
      method: "DELETE",
      url: `${getQueuesEndpoint()}/1`,
      description: "Remove definitivamente a fila informada no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanQueue = (queue) => ({
    id: queue.id,
    name: queue.name,
    color: queue.color,
    greetingMessage: queue.greetingMessage,
    outOfHoursMessage: queue.outOfHoursMessage,
    orderQueue: queue.orderQueue
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListQueues = async (token) => {
    try {
      const { data } = await axios.get(getQueuesEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de filas", {
        ...data,
        queues: data.queues?.map(cleanQueue)
      });
      toast.success("Filas carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowQueue = async (token, queueId) => {
    try {
      const { data } = await axios.get(`${getQueuesEndpoint()}/${queueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Fila ${queueId}`, cleanQueue(data));
      toast.success("Fila carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildQueuePayload = (values) => {
    const payload = {
      name: values.name,
      color: values.color,
      greetingMessage: values.greetingMessage || null,
      outOfHoursMessage: values.outOfHoursMessage || null,
      orderQueue: values.orderQueue ? Number(values.orderQueue) : 0
    };

    if (values.schedules) {
      try {
        payload.schedules = JSON.parse(values.schedules);
      } catch (error) {
        throw new Error("JSON inválido em horários.");
      }
    }

    return payload;
  };

  const handleCreateQueue = async (values) => {
    try {
      const payload = buildQueuePayload(values);
      const { data } = await axios.post(getQueuesEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Fila criada", cleanQueue(data));
      toast.success("Fila criada com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateQueue = async (values) => {
    try {
      const payload = buildQueuePayload(values);
      const { data } = await axios.put(`${getQueuesEndpoint()}/${values.queueId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Fila atualizada", cleanQueue(data));
      toast.success("Fila atualizada com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteQueue = async (values) => {
    try {
      await axios.delete(`${getQueuesEndpoint()}/${values.queueId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Fila removida", { id: values.queueId, deleted: true });
      toast.success("Fila removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", queueId: "" }}
      onSubmit={(values) => handleListQueues(values.token)}
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
                label="Queue ID (opcional para buscar uma)"
                name="queueId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Listar todas"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.queueId) {
                    toast.error("Informe o Queue ID para buscar um registro.");
                    return;
                  }
                  handleShowQueue(values.token, values.queueId);
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
        color: "#5C59C2",
        greetingMessage: "",
        outOfHoursMessage: "",
        orderQueue: "",
        schedules: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateQueue(values);
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
                label="Nome da Fila"
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
                label="Cor (hex)"
                name="color"
                variant="outlined"
                margin="dense"
                fullWidth
                required
                placeholder="#5C59C2"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Ordem"
                name="orderQueue"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de Saudação"
                name="greetingMessage"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem Fora do Horário"
                name="outOfHoursMessage"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Horários (JSON)'
                name="schedules"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='[{"weekday": "Segunda", "startTime": "08:00", "endTime": "18:00"}]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar fila"}
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
        queueId: "",
        name: "",
        color: "",
        greetingMessage: "",
        outOfHoursMessage: "",
        orderQueue: "",
        schedules: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateQueue(values);
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
                label="Queue ID"
                name="queueId"
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
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Cor (hex)"
                name="color"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="#5C59C2"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Ordem"
                name="orderQueue"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de Saudação"
                name="greetingMessage"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem Fora do Horário"
                name="outOfHoursMessage"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Horários (JSON)'
                name="schedules"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='[{"weekday": "Segunda", "startTime": "08:00", "endTime": "18:00"}]'
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar fila"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", queueId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteQueue(values);
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
                label="Queue ID"
                name="queueId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir fila"}
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
          <Typography variant="h5">API de Filas</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie filas de atendimento via API externa.
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
            <li><b>Listar filas:</b> GET {getQueuesEndpoint()}</li>
            <li><b>Buscar fila:</b> GET {getQueuesEndpoint()}/:id</li>
            <li><b>Criar fila:</b> POST {getQueuesEndpoint()}</li>
            <li><b>Atualizar fila:</b> PUT {getQueuesEndpoint()}/:id</li>
            <li><b>Excluir fila:</b> DELETE {getQueuesEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Filas"
        requests={postmanRequests}
        filename="whaticket-api-filas.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar filas</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todas ou adicione um Queue ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar fila</Typography>
        <Typography color="textSecondary">
          Campos obrigatórios: <b>name</b> e <b>color</b>. Mensagens e horários são opcionais.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar fila</Typography>
        <Typography color="textSecondary">
          Informe o <b>Queue ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir fila</Typography>
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

export default ApiFilasPage;
