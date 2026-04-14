import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Chip,
  Tabs,
  Tab
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import CodeIcon from "@material-ui/icons/Code";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";

import {
  deleteCompanyIntegration,
  listCompanyIntegrations,
  upsertCompanyIntegration,
  upsertIntegrationFieldMaps
} from "../../services/companyIntegrationSettings";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3)
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  card: {
    padding: theme.spacing(3),
    borderRadius: 16
  },
  integrationList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5)
  },
  integrationItem: {
    padding: theme.spacing(2),
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      boxShadow: "0 10px 30px rgba(15,23,42,0.08)"
    },
    "&.active": {
      borderColor: theme.palette.primary.main,
      boxShadow: "0 10px 30px rgba(15,23,42,0.12)"
    }
  },
  fieldMapsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  fieldMapRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 80px",
    gap: theme.spacing(1),
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
      "& > div:last-child": {
        display: "flex",
        justifyContent: "flex-end"
      }
    }
  },
  tokenBox: {
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontFamily: "monospace",
    wordBreak: "break-all",
    fontSize: "0.85rem"
  },
  testOutput: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "monospace",
    minHeight: 160,
    overflow: "auto"
  },
  tabs: {
    marginTop: theme.spacing(2)
  }
}));

const PROVIDER_OPTIONS = [
  { value: "custom", label: "Custom API" },
  { value: "wordpress", label: "WordPress / Woo" },
  { value: "shopify", label: "Shopify" },
  { value: "n8n", label: "n8n Webhook" }
];

const CRM_FIELD_OPTIONS = [
  "name",
  "email",
  "phone",
  "document",
  "address",
  "city",
  "state",
  "zipCode",
  "notes"
];

const DEFAULT_FORM = {
  id: null,
  name: "",
  provider: "custom",
  baseUrl: "",
  apiKey: "",
  apiSecret: "",
  webhookSecret: "",
  metadata: "",
  active: true
};

const DEFAULT_TEST_PAYLOAD = `{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "telefone": "+55 11 99999-1111",
  "cpf": "123.456.789-00",
  "endereco": "Rua Flores, 123"
}`;

const IntegrationSettings = () => {
  const classes = useStyles();
  const { showConfirm } = useSystemAlert();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [fieldMaps, setFieldMaps] = useState([]);
  const [testPayload, setTestPayload] = useState(DEFAULT_TEST_PAYLOAD);
  const [testResult, setTestResult] = useState("");
  const [tab, setTab] = useState(0);

  const editing = Boolean(form.id);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => a.name.localeCompare(b.name)),
    [records]
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await listCompanyIntegrations();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = field => event => {
    let value;
    if (field === "active") {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setFieldMaps([]);
    setTestResult("");
    setTab(0);
  };

  const handleEdit = integration => {
    setForm({
      id: integration.id,
      name: integration.name,
      provider: integration.provider || "custom",
      baseUrl: integration.baseUrl || "",
      apiKey: integration.apiKey || "",
      apiSecret: integration.apiSecret || "",
      webhookSecret: integration.webhookSecret || "",
      metadata: integration.metadata
        ? JSON.stringify(integration.metadata, null, 2)
        : "",
      active: integration.active
    });
    setFieldMaps(
      (integration.fieldMaps || []).map(map => ({
        id: map.id,
        externalField: map.externalField,
        crmField: map.crmField || "",
        transformExpression: map.transformExpression || "",
        options: map.options || {}
      }))
    );
    setTestResult("");
    setTab(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Informe o nome da integração.");
      return;
    }

    let parsedMetadata;
    if (form.metadata) {
      try {
        parsedMetadata = JSON.parse(form.metadata);
      } catch (err) {
        toast.error("JSON de metadados inválido.");
        return;
      }
    }

    try {
      setSaving(true);
      const payload = await upsertCompanyIntegration({
        id: form.id,
        name: form.name,
        provider: form.provider,
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
        apiSecret: form.apiSecret,
        webhookSecret: form.webhookSecret,
        metadata: parsedMetadata,
        active: form.active
      });

      toast.success(editing ? "Integração atualizada." : "Integração criada.");
      setForm(prev => ({ ...prev, id: payload.id }));
      if (!editing) {
        fetchRecords();
      } else {
        setRecords(prev =>
          prev.map(item => (item.id === payload.id ? payload : item))
        );
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async integration => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Remover Integração",
      message: "Deseja remover esta integração?",
      confirmText: "Sim, remover",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;
    try {
      await deleteCompanyIntegration(integration.id);
      toast.success("Integração removida.");
      if (form.id === integration.id) {
        resetForm();
      }
      fetchRecords();
    } catch (err) {
      toastError(err);
    }
  };

  const handleAddFieldMap = () => {
    setFieldMaps(prev => [
      ...prev,
      {
        tempId: Math.random().toString(36).substring(2, 9),
        externalField: "",
        crmField: "",
        transformExpression: ""
      }
    ]);
  };

  const handleChangeFieldMap = (index, field, value) => {
    setFieldMaps(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  };

  const handleRemoveFieldMap = index => {
    setFieldMaps(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveFieldMaps = async () => {
    if (!form.id) {
      toast.error("Salve a integração antes de mapear campos.");
      return;
    }

    try {
      const payload = fieldMaps.map(map => ({
        id: map.id,
        externalField: map.externalField,
        crmField: map.crmField || null,
        transformExpression: map.transformExpression || null
      }));

      const data = await upsertIntegrationFieldMaps(form.id, payload);
      setFieldMaps(
        data.map(map => ({
          id: map.id,
          externalField: map.externalField,
          crmField: map.crmField || "",
          transformExpression: map.transformExpression || ""
        }))
      );
      toast.success("Mapeamento salvo.");
      fetchRecords();
    } catch (err) {
      toastError(err);
    }
  };

  const applyMapping = () => {
    if (!fieldMaps.length) {
      toast.info("Adicione ao menos um mapeamento.");
      return;
    }
    try {
      const payload = JSON.parse(testPayload);
      const output = {};

      fieldMaps.forEach(map => {
        if (!map.crmField) return;
        const value = payload[map.externalField];
        if (typeof value !== "undefined") {
          output[map.crmField] = value;
        }
      });

      setTestResult(JSON.stringify(output, null, 2));
    } catch (err) {
      toast.error("JSON de teste inválido.");
    }
  };

  const handleTabChange = (_, value) => setTab(value);

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Conectores de clientes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure integrações externas, personalize o mapeamento dos campos e teste o fluxo
            antes de liberar para produção.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={8}>
          <Tooltip title="Atualizar lista">
            <span>
              <IconButton onClick={fetchRecords} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Nova integração">
            <span>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={resetForm}
              >
                Novo conector
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className={classes.card} elevation={0}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Integrações</Typography>
              {loading && <CircularProgress size={18} />}
            </Box>
            <Divider style={{ margin: "16px 0" }} />
            <Box className={classes.integrationList}>
              {sortedRecords.length === 0 && !loading && (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma integração cadastrada ainda.
                </Typography>
              )}
              {sortedRecords.map(integration => (
                <Box
                  key={integration.id}
                  className={`${classes.integrationItem} ${
                    form.id === integration.id ? "active" : ""
                  }`}
                  onClick={() => handleEdit(integration)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">{integration.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {integration.provider || "Custom"}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={integration.active ? "Ativa" : "Inativa"}
                      style={{
                        backgroundColor: integration.active ? "#ecfdf5" : "#fee2e2",
                        color: integration.active ? "#047857" : "#b91c1c",
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  {integration.baseUrl && (
                    <Box mt={1} className={classes.tokenBox}>
                      {integration.baseUrl}
                    </Box>
                  )}
                  <Box display="flex" justifyContent="flex-end" gap={8} mt={1}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(integration);
                      }}
                    >
                      Editar
                    </Button>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(integration);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper className={classes.card} elevation={0}>
            <Typography variant="h6" gutterBottom>
              {editing ? "Editar integração" : "Nova integração"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome"
                  fullWidth
                  variant="outlined"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Provider"
                  fullWidth
                  variant="outlined"
                  value={form.provider}
                  onChange={handleChange("provider")}
                >
                  {PROVIDER_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Base URL"
                  fullWidth
                  variant="outlined"
                  value={form.baseUrl}
                  onChange={handleChange("baseUrl")}
                  placeholder="https://api.exemplo.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="API Key"
                  fullWidth
                  variant="outlined"
                  value={form.apiKey}
                  onChange={handleChange("apiKey")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="API Secret"
                  fullWidth
                  variant="outlined"
                  value={form.apiSecret}
                  onChange={handleChange("apiSecret")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Webhook Secret"
                  fullWidth
                  variant="outlined"
                  value={form.webhookSecret}
                  onChange={handleChange("webhookSecret")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={handleChange("active")}
                      color="primary"
                    />
                  }
                  label="Integração ativa"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Metadata (JSON)"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={form.metadata}
                  onChange={handleChange("metadata")}
                  placeholder='{"region":"br","customField":"valor"}'
                />
              </Grid>
            </Grid>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={16}>
              {editing && (
                <Button onClick={resetForm} disabled={saving}>
                  Cancelar
                </Button>
              )}
              <Button
                color="primary"
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar integração"}
              </Button>
            </Box>
          </Paper>

          <Paper className={classes.card} elevation={0} style={{ marginTop: 24 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Mapeamento de campos</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                color="primary"
                onClick={handleAddFieldMap}
                disabled={!editing}
              >
                Adicionar campo
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" paragraph>
              Defina como cada campo enviado pela API externa será gravado no CRM. Você pode
              reutilizar campos existentes ou escolher salvar determinadas informações no campo de
              observações.
            </Typography>

            <Box className={classes.fieldMapsContainer}>
              {fieldMaps.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  Nenhum mapeamento configurado.
                </Typography>
              )}

              {fieldMaps.map((map, index) => (
                <Box key={map.id || map.tempId || index} className={classes.fieldMapRow}>
                  <TextField
                    label="Campo externo"
                    variant="outlined"
                    value={map.externalField}
                    onChange={event =>
                      handleChangeFieldMap(index, "externalField", event.target.value)
                    }
                  />
                  <TextField
                    select
                    label="Campo no CRM"
                    variant="outlined"
                    value={map.crmField}
                    onChange={event =>
                      handleChangeFieldMap(index, "crmField", event.target.value)
                    }
                  >
                    <MenuItem value="">— Ignorar —</MenuItem>
                    {CRM_FIELD_OPTIONS.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                    <MenuItem value="notes">observações</MenuItem>
                  </TextField>
                  <Box display="flex" justifyContent="center">
                    <Tooltip title="Remover linha">
                      <IconButton onClick={() => handleRemoveFieldMap(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveFieldMaps}
                disabled={!editing || fieldMaps.length === 0}
                startIcon={<SaveIcon />}
              >
                Salvar mapeamento
              </Button>
            </Box>
          </Paper>

          <Paper className={classes.card} elevation={0} style={{ marginTop: 24 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Laboratório / Teste</Typography>
              <Chip icon={<CodeIcon />} label="sandbox" size="small" color="primary" />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Cole o payload recebido do seu site, aplique o mapeamento e valide se os dados chegam
              corretamente antes de liberar a integração para os clientes.
            </Typography>

            <Tabs
              value={tab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabs}
            >
              <Tab label="Entrada externa" />
              <Tab label="Resultado (preview)" />
            </Tabs>

            {tab === 0 && (
              <TextField
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={testPayload}
                onChange={event => setTestPayload(event.target.value)}
                style={{ marginTop: 16 }}
              />
            )}

            {tab === 1 && (
              <Box className={classes.testOutput}>
                {testResult || "Execute um teste para visualizar a saída."}
              </Box>
            )}

            <Box mt={2} display="flex" gap={16} justifyContent="flex-end">
              <Button onClick={() => setTestPayload(DEFAULT_TEST_PAYLOAD)}>Resetar exemplo</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={applyMapping}
                disabled={!fieldMaps.length}
              >
                Rodar teste
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IntegrationSettings;
