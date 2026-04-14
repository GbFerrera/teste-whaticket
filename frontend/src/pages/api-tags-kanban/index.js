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

const ApiTagsKanbanPage = () => {
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

  const getTagsKanbanEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/tags-kanban`;

  const postmanRequests = [
    {
      name: "Listar tags kanban",
      method: "GET",
      url: getTagsKanbanEndpoint(),
      description: "Retorna as tags kanban cadastradas na empresa."
    },
    {
      name: "Buscar tag kanban por ID",
      method: "GET",
      url: `${getTagsKanbanEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar uma tag específica."
    },
    {
      name: "Criar tag kanban",
      method: "POST",
      url: getTagsKanbanEndpoint(),
      description: "Cria uma nova tag kanban.",
      body: {
        name: "Em Negociação",
        color: "#f59e0b",
        timeLane: 0,
        greetingMessageLane: "Olá! Você está na fase de negociação."
      }
    },
    {
      name: "Atualizar tag kanban",
      method: "PUT",
      url: `${getTagsKanbanEndpoint()}/1`,
      description: "Altere o ID para atualizar a tag desejada.",
      body: {
        name: "Em Negociação (editado)",
        color: "#eab308"
      }
    },
    {
      name: "Remover tag kanban",
      method: "DELETE",
      url: `${getTagsKanbanEndpoint()}/1`,
      description: "Remove definitivamente a tag informada no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanTag = (tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    kanban: tag.kanban,
    timeLane: tag.timeLane,
    nextLaneId: tag.nextLaneId,
    greetingMessageLane: tag.greetingMessageLane,
    rollbackLaneId: tag.rollbackLaneId
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListTags = async (token) => {
    try {
      const { data } = await axios.get(getTagsKanbanEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de tags kanban", {
        ...data,
        tags: data.tags?.map(cleanTag)
      });
      toast.success("Tags kanban carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowTag = async (token, tagId) => {
    try {
      const { data } = await axios.get(`${getTagsKanbanEndpoint()}/${tagId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Tag Kanban ${tagId}`, cleanTag(data));
      toast.success("Tag kanban carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildTagPayload = (values) => {
    return {
      name: values.name,
      color: values.color,
      timeLane: values.timeLane ? Number(values.timeLane) : 0,
      nextLaneId: values.nextLaneId ? Number(values.nextLaneId) : null,
      greetingMessageLane: values.greetingMessageLane || null,
      rollbackLaneId: values.rollbackLaneId ? Number(values.rollbackLaneId) : null
    };
  };

  const handleCreateTag = async (values) => {
    try {
      const payload = buildTagPayload(values);
      const { data } = await axios.post(getTagsKanbanEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag kanban criada", cleanTag(data));
      toast.success("Tag kanban criada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateTag = async (values) => {
    try {
      const payload = buildTagPayload(values);
      const { data } = await axios.put(`${getTagsKanbanEndpoint()}/${values.tagId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag kanban atualizada", cleanTag(data));
      toast.success("Tag kanban atualizada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteTag = async (values) => {
    try {
      await axios.delete(`${getTagsKanbanEndpoint()}/${values.tagId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag kanban removida", { id: values.tagId, deleted: true });
      toast.success("Tag kanban removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", tagId: "" }}
      onSubmit={(values) => handleListTags(values.token)}
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
                label="Tag ID (opcional para buscar uma)"
                name="tagId"
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
                  if (!values.tagId) {
                    toast.error("Informe o Tag ID para buscar um registro.");
                    return;
                  }
                  handleShowTag(values.token, values.tagId);
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
        timeLane: "",
        nextLaneId: "",
        greetingMessageLane: "",
        rollbackLaneId: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateTag(values);
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
                label="Nome da Tag"
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
                label="Tempo na Lane (min)"
                name="timeLane"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Próxima Lane ID"
                name="nextLaneId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Rollback Lane ID"
                name="rollbackLaneId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de Saudação da Lane"
                name="greetingMessageLane"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar tag kanban"}
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
        tagId: "",
        name: "",
        color: "",
        timeLane: "",
        nextLaneId: "",
        greetingMessageLane: "",
        rollbackLaneId: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateTag(values);
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
                label="Tag ID"
                name="tagId"
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
                label="Tempo na Lane (min)"
                name="timeLane"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Próxima Lane ID"
                name="nextLaneId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Rollback Lane ID"
                name="rollbackLaneId"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de Saudação da Lane"
                name="greetingMessageLane"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar tag kanban"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", tagId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteTag(values);
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
                label="Tag ID"
                name="tagId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir tag kanban"}
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
          <Typography variant="h5">API de Tags Kanban</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie tags kanban (lanes do funil) via API externa.
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
            <li><b>Listar tags kanban:</b> GET {getTagsKanbanEndpoint()}</li>
            <li><b>Buscar tag kanban:</b> GET {getTagsKanbanEndpoint()}/:id</li>
            <li><b>Criar tag kanban:</b> POST {getTagsKanbanEndpoint()}</li>
            <li><b>Atualizar tag kanban:</b> PUT {getTagsKanbanEndpoint()}/:id</li>
            <li><b>Excluir tag kanban:</b> DELETE {getTagsKanbanEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Tags Kanban"
        requests={postmanRequests}
        filename="whaticket-api-tags-kanban.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar tags kanban</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todas ou adicione um Tag ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar tag kanban</Typography>
        <Typography color="textSecondary">
          Campos obrigatórios: <b>name</b> e <b>color</b>. Os demais campos são opcionais.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar tag kanban</Typography>
        <Typography color="textSecondary">
          Informe o <b>Tag ID</b> e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir tag kanban</Typography>
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

export default ApiTagsKanbanPage;
