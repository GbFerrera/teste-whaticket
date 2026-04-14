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
import { useSystemAlert } from "../../components/SystemAlert";

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

const ApiConexoesPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { showConfirm } = useSystemAlert();
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

  const getWhatsappsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/whatsapps`;

  const postmanRequests = [
    {
      name: "Listar conexões",
      method: "GET",
      url: getWhatsappsEndpoint(),
      description: "Retorna todas as conexões WhatsApp da empresa."
    },
    {
      name: "Buscar conexão por ID",
      method: "GET",
      url: `${getWhatsappsEndpoint()}/1`,
      description: "Retorna detalhes de uma conexão específica."
    },
    {
      name: "Status da conexão",
      method: "GET",
      url: `${getWhatsappsEndpoint()}/1/status`,
      description: "Retorna o status atual da conexão."
    },
    {
      name: "Obter QR Code",
      method: "GET",
      url: `${getWhatsappsEndpoint()}/1/qrcode`,
      description: "Retorna o QR Code para escanear com o WhatsApp."
    },
    {
      name: "Criar conexão",
      method: "POST",
      url: getWhatsappsEndpoint(),
      description: "Cria uma nova conexão WhatsApp.",
      body: {
        name: "WhatsApp Novo",
        greetingMessage: "Olá! Seja bem-vindo.",
        farewellMessage: "Obrigado pelo contato!",
        isDefault: false,
        queueIds: [1, 2]
      }
    },
    {
      name: "Atualizar conexão",
      method: "PUT",
      url: `${getWhatsappsEndpoint()}/1`,
      description: "Atualiza configurações da conexão.",
      body: {
        name: "WhatsApp Principal",
        greetingMessage: "Olá! Seja bem-vindo.",
        farewellMessage: "Obrigado pelo contato!",
        isDefault: true,
        queueIds: [1, 2]
      }
    },
    {
      name: "Remover conexão",
      method: "DELETE",
      url: `${getWhatsappsEndpoint()}/1`,
      description: "Remove uma conexão WhatsApp."
    },
    {
      name: "Reiniciar conexão",
      method: "POST",
      url: `${getWhatsappsEndpoint()}/1/restart`,
      description: "Reinicia a conexão para gerar novo QR Code."
    },
    {
      name: "Desconectar",
      method: "POST",
      url: `${getWhatsappsEndpoint()}/1/disconnect`,
      description: "Desconecta a sessão do WhatsApp."
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

  const handleListWhatsapps = async (token) => {
    try {
      const { data } = await axios.get(getWhatsappsEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de conexões", data);
      toast.success("Conexões carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowWhatsapp = async (token, whatsappId) => {
    try {
      const { data } = await axios.get(`${getWhatsappsEndpoint()}/${whatsappId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Conexão ${whatsappId}`, data);
      toast.success("Conexão carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleGetStatus = async (token, whatsappId) => {
    try {
      const { data } = await axios.get(`${getWhatsappsEndpoint()}/${whatsappId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Status da conexão ${whatsappId}`, data);
      toast.success("Status carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateWhatsapp = async (values) => {
    try {
      const payload = {};
      if (values.name) payload.name = values.name;
      if (values.greetingMessage) payload.greetingMessage = values.greetingMessage;
      if (values.farewellMessage) payload.farewellMessage = values.farewellMessage;
      if (values.outOfHoursMessage) payload.outOfHoursMessage = values.outOfHoursMessage;
      if (values.isDefault !== "") payload.isDefault = values.isDefault === "true";
      if (values.allowGroup !== "") payload.allowGroup = values.allowGroup === "true";
      if (values.queueIds) {
        try {
          payload.queueIds = JSON.parse(values.queueIds);
        } catch (e) {
          toast.error("JSON inválido em queueIds");
          return;
        }
      }

      const { data } = await axios.put(`${getWhatsappsEndpoint()}/${values.whatsappId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Conexão atualizada", data);
      toast.success("Conexão atualizada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleRestartWhatsapp = async (values) => {
    try {
      const { data } = await axios.post(`${getWhatsappsEndpoint()}/${values.whatsappId}/restart`, {}, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Conexão reiniciando", data);
      toast.success("Conexão reiniciando!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDisconnectWhatsapp = async (values) => {
    try {
      const { data } = await axios.post(`${getWhatsappsEndpoint()}/${values.whatsappId}/disconnect`, {}, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Conexão desconectada", data);
      toast.success("Conexão desconectada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateWhatsapp = async (values) => {
    try {
      const payload = {
        name: values.name
      };
      if (values.greetingMessage) payload.greetingMessage = values.greetingMessage;
      if (values.farewellMessage) payload.farewellMessage = values.farewellMessage;
      if (values.outOfHoursMessage) payload.outOfHoursMessage = values.outOfHoursMessage;
      if (values.isDefault !== "") payload.isDefault = values.isDefault === "true";
      if (values.allowGroup !== "") payload.allowGroup = values.allowGroup === "true";
      if (values.queueIds) {
        try {
          payload.queueIds = JSON.parse(values.queueIds);
        } catch (e) {
          toast.error("JSON inválido em queueIds");
          return;
        }
      }

      const { data } = await axios.post(getWhatsappsEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Conexão criada", data);
      toast.success("Conexão criada! Aguarde o QR Code.");
    } catch (err) {
      toastError(err);
    }
  };

  const handleGetQrCode = async (token, whatsappId) => {
    try {
      const { data } = await axios.get(`${getWhatsappsEndpoint()}/${whatsappId}/qrcode`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`QR Code da conexão ${whatsappId}`, data);
      if (data.qrcode) {
        toast.success("QR Code disponível!");
      } else {
        toast.info(data.message || "QR Code ainda não disponível.");
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteWhatsapp = async (values) => {
    try {
      const { data } = await axios.delete(`${getWhatsappsEndpoint()}/${values.whatsappId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Conexão removida", data);
      toast.success("Conexão removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListForm = () => (
    <Formik
      initialValues={{ token: "", whatsappId: "" }}
      onSubmit={(values) => handleListWhatsapps(values.token)}
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
                label="Whatsapp ID (opcional)"
                name="whatsappId"
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
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  handleShowWhatsapp(values.token, values.whatsappId);
                }}
                style={{ marginRight: 8 }}
              >
                Buscar por ID
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  handleGetStatus(values.token, values.whatsappId);
                }}
                style={{ marginRight: 8 }}
              >
                Ver Status
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  handleGetQrCode(values.token, values.whatsappId);
                }}
              >
                Ver QR Code
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
        greetingMessage: "",
        farewellMessage: "",
        outOfHoursMessage: "",
        isDefault: "",
        allowGroup: "",
        queueIds: ""
      }}
      onSubmit={async (values, actions) => {
        if (!values.name) {
          toast.error("Nome é obrigatório.");
          actions.setSubmitting(false);
          return;
        }
        await handleCreateWhatsapp(values);
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
                label="Nome da conexão"
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
                label="Mensagem de saudação"
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
                label="Mensagem de despedida"
                name="farewellMessage"
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
                label='Filas (JSON array)'
                name="queueIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2]'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Conexão padrão"
                name="isDefault"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Não</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Permitir grupos"
                name="allowGroup"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Não</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Field>
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Criar conexão"}
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
        whatsappId: "",
        name: "",
        greetingMessage: "",
        farewellMessage: "",
        outOfHoursMessage: "",
        isDefault: "",
        allowGroup: "",
        queueIds: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateWhatsapp(values);
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
                label="Whatsapp ID"
                name="whatsappId"
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
                label="Mensagem de saudação"
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
                label="Mensagem de despedida"
                name="farewellMessage"
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
                label="Mensagem fora do horário"
                name="outOfHoursMessage"
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
                label='Filas (JSON array)'
                name="queueIds"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder='[1, 2]'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Conexão padrão"
                name="isDefault"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Não alterar</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Permitir grupos"
                name="allowGroup"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Não alterar</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Field>
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar conexão"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderActionsForm = () => (
    <Formik
      initialValues={{ token: "", whatsappId: "" }}
      onSubmit={() => {}}
    >
      {({ values }) => (
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
                label="Whatsapp ID"
                name="whatsappId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  handleRestartWhatsapp(values);
                }}
                style={{ marginRight: 8 }}
              >
                Reiniciar Conexão
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  handleDisconnectWhatsapp(values);
                }}
                style={{ marginRight: 8 }}
              >
                Desconectar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  if (!values.whatsappId) {
                    toast.error("Informe o Whatsapp ID.");
                    return;
                  }
                  const confirmed = await showConfirm({
                    type: "error",
                    title: "Remover Conexão",
                    message: "Tem certeza que deseja remover esta conexão?",
                    confirmText: "Sim, remover",
                    cancelText: "Cancelar",
                  });
                  if (confirmed) {
                    handleDeleteWhatsapp(values);
                  }
                }}
              >
                Remover
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
          <Typography variant="h5">API de Conexões WhatsApp</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie conexões WhatsApp via API externa.
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
            <li><b>Listar conexões:</b> GET {getWhatsappsEndpoint()}</li>
            <li><b>Buscar conexão:</b> GET {getWhatsappsEndpoint()}/:id</li>
            <li><b>Status:</b> GET {getWhatsappsEndpoint()}/:id/status</li>
            <li><b>QR Code:</b> GET {getWhatsappsEndpoint()}/:id/qrcode</li>
            <li><b>Criar:</b> POST {getWhatsappsEndpoint()}</li>
            <li><b>Atualizar:</b> PUT {getWhatsappsEndpoint()}/:id</li>
            <li><b>Remover:</b> DELETE {getWhatsappsEndpoint()}/:id</li>
            <li><b>Reiniciar:</b> POST {getWhatsappsEndpoint()}/:id/restart</li>
            <li><b>Desconectar:</b> POST {getWhatsappsEndpoint()}/:id/disconnect</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code>.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Conexões WhatsApp"
        requests={postmanRequests}
        filename="whaticket-api-conexoes.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar conexões</Typography>
        <Typography color="textSecondary">
          Liste todas as conexões ou busque uma específica por ID. Use "Ver QR Code" para obter o código de escaneamento.
        </Typography>
        {renderListForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar conexão</Typography>
        <Typography color="textSecondary">
          Crie uma nova conexão WhatsApp. Após criar, use "Ver QR Code" para escanear.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar conexão</Typography>
        <Typography color="textSecondary">
          Altere nome, mensagens e configurações da conexão.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Ações</Typography>
        <Typography color="textSecondary">
          Reiniciar, desconectar ou remover conexão WhatsApp.
        </Typography>
        {renderActionsForm()}
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

export default ApiConexoesPage;
