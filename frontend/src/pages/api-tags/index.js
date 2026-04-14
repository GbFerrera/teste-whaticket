import React, { useState, useEffect, useContext, useMemo } from "react";
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

const ApiTagsPage = () => {
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

  const getTagsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/tags`;

  const postmanRequests = useMemo(
    () => [
      {
        name: "Listar tags",
        method: "GET",
        url: getTagsEndpoint(),
        description: "Retorna a lista de tags cadastradas, com suporte a paginação e filtros."
      },
      {
        name: "Buscar tag por ID",
        method: "GET",
        url: `${getTagsEndpoint()}/1`,
        description: "Substitua o ID ao final da URL para consultar uma tag específica."
      },
      {
        name: "Criar tag",
        method: "POST",
        url: getTagsEndpoint(),
        description: "Cria uma nova tag (kanban, cores e lanes opcionais).",
        body: {
          name: "Novos Leads",
          color: "#5F72BE",
          kanban: 0
        }
      },
      {
        name: "Atualizar tag",
        method: "PUT",
        url: `${getTagsEndpoint()}/1`,
        description: "Atualiza os atributos de uma tag existente.",
        body: {
          name: "Novos Leads (qualificados)",
          color: "#6B8DD6",
          kanban: 0
        }
      },
      {
        name: "Remover tag",
        method: "DELETE",
        url: `${getTagsEndpoint()}/1`,
        description: "Remove definitivamente a tag informada no path."
      }
    ],
    []
  );

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanContact = (contact = {}) => ({
    id: contact.id,
    name: contact.name,
    number: contact.number,
    email: contact.email,
    profilePicUrl: contact.profilePicUrl,
    channel: contact.channel
  });

  const cleanTag = (tag = {}) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    kanban: tag.kanban,
    timeLane: tag.timeLane,
    nextLaneId: tag.nextLaneId,
    rollbackLaneId: tag.rollbackLaneId,
    greetingMessageLane: tag.greetingMessageLane,
    contactCount: tag.contacts ? tag.contacts.length : undefined,
    contacts: tag.contacts ? tag.contacts.map(cleanContact) : undefined
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const buildTagPayload = (values) => {
    const payload = {
      name: values.name,
      color: values.color || "#A4CCCC",
      kanban: values.kanban ? Number(values.kanban) : 0,
      greetingMessageLane: values.greetingMessageLane || ""
    };

    const numericFields = ["timeLane", "nextLaneId", "rollbackLaneId"];
    numericFields.forEach((field) => {
      if (values[field] !== "" && values[field] !== null && values[field] !== undefined) {
        payload[field] = Number(values[field]);
      }
    });

    return payload;
  };

  const handleListTags = async (values) => {
    try {
      const params = {};

      if (values.searchParam) params.searchParam = values.searchParam;
      if (values.pageNumber) params.pageNumber = values.pageNumber;
      if (values.limit) params.limit = values.limit;
      if (values.kanban) params.kanban = values.kanban;

      const { data } = await axios.get(getTagsEndpoint(), {
        headers: { Authorization: `Bearer ${values.token}` },
        params
      });
      const cleanPayload = {
        count: data.count,
        hasMore: data.hasMore,
        tags: (data.tags || []).map(cleanTag)
      };
      saveResult("Lista de tags", cleanPayload);
      toast.success("Tags carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowTag = async (token, tagId) => {
    try {
      const { data } = await axios.get(`${getTagsEndpoint()}/${tagId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Tag ${tagId}`, cleanTag(data));
      toast.success("Tag carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateTag = async (values) => {
    try {
      const payload = buildTagPayload(values);
      const { data } = await axios.post(getTagsEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag criada", cleanTag(data));
      toast.success("Tag criada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateTag = async (values) => {
    try {
      const payload = buildTagPayload(values);
      const { data } = await axios.put(`${getTagsEndpoint()}/${values.tagId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag atualizada", cleanTag(data));
      toast.success("Tag atualizada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteTag = async (values) => {
    try {
      await axios.delete(`${getTagsEndpoint()}/${values.tagId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Tag removida", { id: values.tagId, deleted: true });
      toast.success("Tag removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{
        token: "",
        tagId: "",
        searchParam: "",
        pageNumber: "",
        limit: "",
        kanban: ""
      }}
      onSubmit={async (values, actions) => {
        await handleListTags(values);
        actions.setSubmitting(false);
      }}
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
                label="Tag ID (opcional)"
                name="tagId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Busca"
                name="searchParam"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="Nome ou cor"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Página"
                name="pageNumber"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Limite"
                name="limit"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Kanban (0 ou 1)"
                name="kanban"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Listar tags"}
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
        color: "",
        kanban: "",
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
                label="Cor (hex)"
                name="color"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="#A4CCCC"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Kanban (0 ou 1)"
                name="kanban"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Time lane (minutos)"
                name="timeLane"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Próxima lane ID"
                name="nextLaneId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Rollback lane ID"
                name="rollbackLaneId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de saudação"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar tag"}
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
        kanban: "",
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
                label="Cor"
                name="color"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Kanban"
                name="kanban"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Time lane"
                name="timeLane"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Próxima lane ID"
                name="nextLaneId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Rollback lane ID"
                name="rollbackLaneId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Mensagem de saudação"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar tag"}
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
        tagId: ""
      }}
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
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Remover tag"}
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
            API de Tags
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cadastre e organize etiquetas externas para segmentar contatos e fluxos kanban.
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
        collectionName="Whaticket - API de Tags"
        requests={postmanRequests}
        filename="whaticket-api-tags.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Visão geral
        </Typography>
        <Typography color="textSecondary">
          Crie etiquetas para organizar contatos e pipelines kanban utilizando os tokens desta conta.
        </Typography>
        <Box mt={2} component="div" color="textSecondary">
          <ul>
            <li><b>Listar tags:</b> GET {getTagsEndpoint()}</li>
            <li><b>Buscar tag:</b> GET {getTagsEndpoint()}/:id</li>
            <li><b>Criar tag:</b> POST {getTagsEndpoint()}</li>
            <li><b>Atualizar tag:</b> PUT {getTagsEndpoint()}/:id</li>
            <li><b>Excluir tag:</b> DELETE {getTagsEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Box>
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Listar Tags
        </Typography>
        {renderListAndShowForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Criar Tag
        </Typography>
        {renderCreateForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Atualizar Tag
        </Typography>
        {renderUpdateForm()}
      </Box>
      <Box className={classes.elementMargin}>
        <Typography variant="h6" gutterBottom>
          Remover Tag
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

export default ApiTagsPage;
