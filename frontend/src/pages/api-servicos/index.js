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

const ApiServicosPage = () => {
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

  const getServicesEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/services`;

  const postmanRequests = [
    {
      name: "Listar serviços",
      method: "GET",
      url: getServicesEndpoint(),
      description: "Retorna os serviços externos cadastrados."
    },
    {
      name: "Buscar serviço por ID",
      method: "GET",
      url: `${getServicesEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um serviço específico."
    },
    {
      name: "Criar serviço",
      method: "POST",
      url: getServicesEndpoint(),
      description: "Cria um novo serviço externo.",
      body: {
        nome: "Consultoria Premium",
        descricao: "Sessão de consultoria de 1h",
        valorOriginal: 250.0,
        possuiDesconto: true,
        valorComDesconto: 199.9
      }
    },
    {
      name: "Atualizar serviço",
      method: "PUT",
      url: `${getServicesEndpoint()}/1`,
      description: "Altere o ID para atualizar o serviço desejado.",
      body: {
        nome: "Consultoria Premium (atualizada)",
        possuiDesconto: false
      }
    },
    {
      name: "Remover serviço",
      method: "DELETE",
      url: `${getServicesEndpoint()}/1`,
      description: "Remove definitivamente o serviço informado no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanService = (service) => ({
    id: service.id,
    nome: service.nome,
    descricao: service.descricao,
    valorOriginal: Number(service.valorOriginal || 0),
    possuiDesconto: Boolean(service.possuiDesconto),
    valorComDesconto: service.valorComDesconto ? Number(service.valorComDesconto) : null,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListServices = async (token) => {
    try {
      const { data } = await axios.get(getServicesEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de serviços", {
        ...data,
        services: data.services?.map(cleanService)
      });
      toast.success("Serviços carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowService = async (token, serviceId) => {
    try {
      const { data } = await axios.get(`${getServicesEndpoint()}/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Serviço ${serviceId}`, cleanService(data));
      toast.success("Serviço carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildServicePayload = (values) => {
    const payload = {
      nome: values.nome,
      descricao: values.descricao || null,
      valorOriginal: values.valorOriginal ? Number(values.valorOriginal) : undefined,
      possuiDesconto: values.possuiDesconto === "true" || values.possuiDesconto === true,
      valorComDesconto: values.valorComDesconto ? Number(values.valorComDesconto) : null
    };

    if (!values.nome) {
      throw new Error("Nome é obrigatório.");
    }
    if (!values.valorOriginal) {
      throw new Error("Valor original é obrigatório.");
    }

    return payload;
  };

  const handleCreateService = async (values) => {
    try {
      const payload = buildServicePayload(values);
      const { data } = await axios.post(getServicesEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Serviço criado", cleanService(data));
      toast.success("Serviço criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("obrigatório")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateService = async (values) => {
    try {
      const payload = {
        ...buildServicePayload(values),
        possuiDesconto:
          values.possuiDesconto === "" ? undefined : values.possuiDesconto === "true" || values.possuiDesconto === true,
        valorComDesconto: values.valorComDesconto
          ? Number(values.valorComDesconto)
          : values.valorComDesconto === ""
            ? undefined
            : null
      };

      const { data } = await axios.put(`${getServicesEndpoint()}/${values.serviceId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Serviço atualizado", cleanService(data));
      toast.success("Serviço atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("obrigatório")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteService = async (values) => {
    try {
      await axios.delete(`${getServicesEndpoint()}/${values.serviceId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Serviço removido", { id: values.serviceId, deleted: true });
      toast.success("Serviço removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", serviceId: "" }}
      onSubmit={(values) => handleListServices(values.token)}
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
                label="Service ID (opcional para buscar um)"
                name="serviceId"
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
                  if (!values.serviceId) {
                    toast.error("Informe o Service ID para buscar um registro.");
                    return;
                  }
                  handleShowService(values.token, values.serviceId);
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
        nome: "",
        descricao: "",
        valorOriginal: "",
        possuiDesconto: "false",
        valorComDesconto: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateService(values);
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
                label="Nome"
                name="nome"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Valor original"
                name="valorOriginal"
                type="number"
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
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Possui desconto? (true/false)"
                name="possuiDesconto"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="false"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Valor com desconto"
                name="valorComDesconto"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar serviço"}
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
        serviceId: "",
        nome: "",
        descricao: "",
        valorOriginal: "",
        possuiDesconto: "",
        valorComDesconto: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateService(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
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
                label="Service ID"
                name="serviceId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Nome"
                name="nome"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Valor original"
                name="valorOriginal"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Possui desconto? (true/false)"
                name="possuiDesconto"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Valor com desconto"
                name="valorComDesconto"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar serviço"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", serviceId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteService(values);
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
                label="Service ID"
                name="serviceId"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir serviço"}
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
          <Typography variant="h5">API de Serviços</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gere, consulte e sincronize serviços externos utilizando os tokens desta conta.
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
            <li><b>Listar serviços:</b> GET {getServicesEndpoint()}</li>
            <li><b>Buscar serviço:</b> GET {getServicesEndpoint()}/:id</li>
            <li><b>Criar serviço:</b> POST {getServicesEndpoint()}</li>
            <li><b>Atualizar serviço:</b> PUT {getServicesEndpoint()}/:id</li>
            <li><b>Excluir serviço:</b> DELETE {getServicesEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Serviços"
        requests={postmanRequests}
        filename="whaticket-api-servicos.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar serviços</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todos ou adicione um Service ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar serviço</Typography>
        <Typography color="textSecondary">
          Campos mínimos: <b>nome</b>, <b>valorOriginal</b>. Utilize os campos de desconto quando necessário.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar serviço</Typography>
        <Typography color="textSecondary">
          Informe o <b>Service ID</b> retornado pela criação/listagem e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir serviço</Typography>
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

export default ApiServicosPage;
