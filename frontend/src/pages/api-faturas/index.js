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
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { listCompanyPaymentSettings } from "../../services/companyPaymentSettings";
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
    maxWidth: 700
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

const ApiFaturasPage = () => {
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

  const getFaturasEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/faturas`;

  const postmanRequests = [
    {
      name: "Listar faturas",
      method: "GET",
      url: getFaturasEndpoint(),
      description: "Retorna todas as faturas da empresa."
    },
    {
      name: "Buscar fatura por ID",
      method: "GET",
      url: `${getFaturasEndpoint()}/1`,
      description: "Retorna detalhes de uma fatura específica."
    },
    {
      name: "Faturas por projeto",
      method: "GET",
      url: `${getFaturasEndpoint()}/project/1`,
      description: "Retorna faturas de um projeto específico."
    },
    {
      name: "Faturas por cliente",
      method: "GET",
      url: `${getFaturasEndpoint()}/client/1`,
      description: "Retorna faturas de um cliente específico."
    },
    {
      name: "Criar fatura",
      method: "POST",
      url: getFaturasEndpoint(),
      description: "Cria uma nova fatura.",
      body: {
        clientId: 1,
        projectId: null,
        descricao: "Serviço de consultoria",
        valor: 1500.00,
        dataVencimento: "2025-02-15",
        tipoRecorrencia: "unica",
        observacoes: "Pagamento à vista"
      }
    },
    {
      name: "Atualizar fatura",
      method: "PUT",
      url: `${getFaturasEndpoint()}/1`,
      description: "Atualiza uma fatura existente.",
      body: {
        descricao: "Serviço atualizado",
        valor: 2000.00,
        status: "aberta"
      }
    },
    {
      name: "Marcar como paga",
      method: "POST",
      url: `${getFaturasEndpoint()}/1/pay`,
      description: "Marca a fatura como paga.",
      body: {
        dataPagamento: "2025-01-15",
        valorPago: 1500.00
      }
    },
    {
      name: "Cancelar fatura",
      method: "POST",
      url: `${getFaturasEndpoint()}/1/cancel`,
      description: "Cancela a fatura."
    },
    {
      name: "Excluir fatura",
      method: "DELETE",
      url: `${getFaturasEndpoint()}/1`,
      description: "Remove uma fatura."
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

  const handleListFaturas = async (values) => {
    try {
      let url = getFaturasEndpoint();
      const params = new URLSearchParams();
      if (values.status) params.append("status", values.status);
      if (values.tipoRecorrencia) params.append("tipoRecorrencia", values.tipoRecorrencia);
      if (values.clientId) params.append("clientId", values.clientId);
      if (values.projectId) params.append("projectId", values.projectId);
      if (params.toString()) url += `?${params.toString()}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Lista de faturas", data);
      toast.success("Faturas carregadas!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowFatura = async (token, faturaId) => {
    try {
      const { data } = await axios.get(`${getFaturasEndpoint()}/${faturaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Fatura ${faturaId}`, data);
      toast.success("Fatura carregada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateFatura = async (values) => {
    try {
      const payload = {
        clientId: Number(values.clientId),
        descricao: values.descricao,
        valor: Number(values.valor),
        dataVencimento: values.dataVencimento
      };
      if (values.projectId) payload.projectId = Number(values.projectId);
      if (values.tipoRecorrencia) payload.tipoRecorrencia = values.tipoRecorrencia;
      if (values.observacoes) payload.observacoes = values.observacoes;

      const { data } = await axios.post(getFaturasEndpoint(), payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Fatura criada", data);
      toast.success("Fatura criada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateFatura = async (values) => {
    try {
      const payload = {};
      if (values.descricao) payload.descricao = values.descricao;
      if (values.valor) payload.valor = Number(values.valor);
      if (values.status) payload.status = values.status;
      if (values.dataVencimento) payload.dataVencimento = values.dataVencimento;
      if (values.projectId) payload.projectId = Number(values.projectId);
      if (values.observacoes) payload.observacoes = values.observacoes;

      const { data } = await axios.put(`${getFaturasEndpoint()}/${values.faturaId}`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Fatura atualizada", data);
      toast.success("Fatura atualizada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleMarkAsPaid = async (values) => {
    try {
      const payload = {};
      if (values.dataPagamento) payload.dataPagamento = values.dataPagamento;
      if (values.valorPago) payload.valorPago = Number(values.valorPago);

      const { data } = await axios.post(`${getFaturasEndpoint()}/${values.faturaId}/pay`, payload, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Fatura marcada como paga", data);
      toast.success("Fatura marcada como paga!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleCancelFatura = async (values) => {
    try {
      const { data } = await axios.post(`${getFaturasEndpoint()}/${values.faturaId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Fatura cancelada", data);
      toast.success("Fatura cancelada!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteFatura = async (values) => {
    try {
      const { data } = await axios.delete(`${getFaturasEndpoint()}/${values.faturaId}`, {
        headers: { Authorization: `Bearer ${values.token}` }
      });
      saveResult("Fatura removida", data);
      toast.success("Fatura removida!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListForm = () => (
    <Formik
      initialValues={{ token: "", faturaId: "", status: "", tipoRecorrencia: "", clientId: "", projectId: "" }}
      onSubmit={(values) => handleListFaturas(values)}
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
                label="Fatura ID (opcional)"
                name="faturaId"
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
                SelectProps={{ native: true }}
              >
                <option value="">Todos</option>
                <option value="aberta">Aberta</option>
                <option value="paga">Paga</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Recorrência"
                name="tipoRecorrencia"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Todas</option>
                <option value="unica">Única</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Cliente ID"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Projeto ID"
                name="projectId"
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
                  if (!values.faturaId) {
                    toast.error("Informe o Fatura ID.");
                    return;
                  }
                  handleShowFatura(values.token, values.faturaId);
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
        clientId: "",
        projectId: "",
        descricao: "",
        valor: "",
        dataVencimento: "",
        tipoRecorrencia: "unica",
        observacoes: ""
      }}
      onSubmit={async (values, actions) => {
        if (!values.clientId || !values.valor || !values.dataVencimento) {
          toast.error("Cliente, valor e data de vencimento são obrigatórios.");
          actions.setSubmitting(false);
          return;
        }
        await handleCreateFatura(values);
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
                label="Cliente ID"
                name="clientId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Projeto ID (opcional)"
                name="projectId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Descrição"
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Valor"
                name="valor"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Vencimento"
                name="dataVencimento"
                type="date"
                variant="outlined"
                margin="dense"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                select
                label="Recorrência"
                name="tipoRecorrencia"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="unica">Única</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={8}>
              <Field
                as={TextField}
                label="Observações"
                name="observacoes"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Criar fatura"}
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
        faturaId: "",
        descricao: "",
        valor: "",
        status: "",
        dataVencimento: "",
        projectId: "",
        observacoes: ""
      }}
      onSubmit={async (values, actions) => {
        if (!values.faturaId) {
          toast.error("Fatura ID é obrigatório.");
          actions.setSubmitting(false);
          return;
        }
        await handleUpdateFatura(values);
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
                label="Fatura ID"
                name="faturaId"
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
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Não alterar</option>
                <option value="aberta">Aberta</option>
                <option value="paga">Paga</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </Field>
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Descrição"
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Valor"
                name="valor"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Vencimento"
                name="dataVencimento"
                type="date"
                variant="outlined"
                margin="dense"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Projeto ID"
                name="projectId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Field
                as={TextField}
                label="Observações"
                name="observacoes"
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
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar fatura"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderActionsForm = () => (
    <Formik
      initialValues={{ token: "", faturaId: "", dataPagamento: "", valorPago: "" }}
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
                label="Fatura ID"
                name="faturaId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Data pagamento"
                name="dataPagamento"
                type="date"
                variant="outlined"
                margin="dense"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Valor pago"
                name="valorPago"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!values.faturaId) {
                    toast.error("Informe o Fatura ID.");
                    return;
                  }
                  handleMarkAsPaid(values);
                }}
                style={{ marginRight: 8 }}
              >
                Marcar como paga
              </Button>
              <Button
                variant="contained"
                style={{ marginRight: 8, backgroundColor: "#ff9800", color: "#fff" }}
                onClick={() => {
                  if (!values.faturaId) {
                    toast.error("Informe o Fatura ID.");
                    return;
                  }
                  handleCancelFatura(values);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  if (!values.faturaId) {
                    toast.error("Informe o Fatura ID.");
                    return;
                  }
                  const confirmed = await showConfirm({
                    type: "error",
                    title: "Excluir Fatura",
                    message: "Tem certeza que deseja excluir esta fatura?",
                    confirmText: "Sim, excluir",
                    cancelText: "Cancelar",
                  });
                  if (confirmed) {
                    handleDeleteFatura(values);
                  }
                }}
              >
                Excluir
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
          <Typography variant="h5">API de Faturas</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gerencie faturas via API externa. Suporta faturas normais e vinculadas a projetos.
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
            <li><b>Listar faturas:</b> GET {getFaturasEndpoint()}</li>
            <li><b>Buscar fatura:</b> GET {getFaturasEndpoint()}/:id</li>
            <li><b>Faturas por projeto:</b> GET {getFaturasEndpoint()}/project/:projectId</li>
            <li><b>Faturas por cliente:</b> GET {getFaturasEndpoint()}/client/:clientId</li>
            <li><b>Criar:</b> POST {getFaturasEndpoint()}</li>
            <li><b>Atualizar:</b> PUT {getFaturasEndpoint()}/:id</li>
            <li><b>Marcar como paga:</b> POST {getFaturasEndpoint()}/:id/pay</li>
            <li><b>Cancelar:</b> POST {getFaturasEndpoint()}/:id/cancel</li>
            <li><b>Excluir:</b> DELETE {getFaturasEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code>.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Faturas"
        requests={postmanRequests}
        filename="whaticket-api-faturas.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar faturas</Typography>
        <Typography color="textSecondary">
          Liste todas as faturas ou busque uma específica. Filtre por status, recorrência, cliente ou projeto.
        </Typography>
        {renderListForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar fatura</Typography>
        <Typography color="textSecondary">
          Crie uma nova fatura. Vincule a um projeto para faturas de projeto.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar fatura</Typography>
        <Typography color="textSecondary">
          Altere descrição, valor, status e outras informações da fatura.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Ações</Typography>
        <Typography color="textSecondary">
          Marcar como paga, cancelar ou excluir fatura.
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

export default ApiFaturasPage;
