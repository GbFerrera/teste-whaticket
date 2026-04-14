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
  CircularProgress
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";

import {
  deleteCompanyPaymentSetting,
  listCompanyPaymentSettings,
  upsertCompanyPaymentSetting
} from "../../services/companyPaymentSettings";
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
  formPaper: {
    padding: theme.spacing(3),
    borderRadius: 16
  },
  listPaper: {
    padding: theme.spacing(3),
    borderRadius: 16
  },
  providerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    textTransform: "capitalize"
  },
  tokenBox: {
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontFamily: "monospace",
    wordBreak: "break-all",
    fontSize: "0.9rem"
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#94a3b8"
  }
}));

const PROVIDER_OPTIONS = [
  { value: "asaas", label: "Asaas" },
  { value: "mercadopago", label: "Mercado Pago" }
];

const DEFAULT_FORM = {
  id: null,
  provider: "asaas",
  token: "",
  additionalData: "",
  active: true
};

const PaymentSettings = () => {
  const classes = useStyles();
  const { showConfirm } = useSystemAlert();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const editing = Boolean(form.id);

  const formattedRecords = useMemo(
    () =>
      records.sort((a, b) => a.provider.localeCompare(b.provider)),
    [records]
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await listCompanyPaymentSettings();
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

  const handleEdit = item => {
    setForm({
      id: item.id,
      provider: item.provider,
      token: item.token || "",
      additionalData: item.additionalData
        ? JSON.stringify(item.additionalData, null, 2)
        : "",
      active: item.active
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = async () => {
    if (!form.provider) {
      toast.error("Selecione o gateway.");
      return;
    }

    if (!form.token) {
      toast.error("Informe o token do gateway.");
      return;
    }

    let parsedAdditionalData;
    if (form.additionalData) {
      try {
        parsedAdditionalData = JSON.parse(form.additionalData);
      } catch (err) {
        toast.error("JSON de dados adicionais inválido.");
        return;
      }
    }

    try {
      setSaving(true);
      await upsertCompanyPaymentSetting({
        id: form.id,
        provider: form.provider,
        token: form.token,
        additionalData: parsedAdditionalData,
        active: form.active
      });
      toast.success(
        editing
          ? "Configuração atualizada com sucesso."
          : "Configuração criada com sucesso."
      );
      handleResetForm();
      fetchRecords();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async item => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Remover Configuração",
      message: "Remover esta configuração?",
      confirmText: "Sim, remover",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;
    try {
      await deleteCompanyPaymentSetting(item.id);
      toast.success("Configuração removida.");
      if (form.id === item.id) {
        handleResetForm();
      }
      fetchRecords();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Gateways de pagamento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure os tokens de integração do Asaas e Mercado Pago para gerar links nas faturas.
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
        </Box>
      </Box>

      <Paper className={classes.formPaper} elevation={0}>
        <Typography variant="h6" gutterBottom>
          {editing ? "Editar configuração" : "Nova configuração"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Gateway"
              value={form.provider}
              onChange={handleChange("provider")}
              variant="outlined"
            >
              {PROVIDER_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={handleChange("active")}
                  color="primary"
                />
              }
              label="Ativo"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Token do gateway"
              variant="outlined"
              fullWidth
              value={form.token}
              onChange={handleChange("token")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dados adicionais (JSON)"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={form.additionalData}
              onChange={handleChange("additionalData")}
              placeholder='{"clientId":"..."}'
            />
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={16}>
          {editing && (
            <Button onClick={handleResetForm} disabled={saving}>
              Cancelar edição
            </Button>
          )}
          <Button
            color="primary"
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar configuração"}
          </Button>
        </Box>
      </Paper>

      <Paper className={classes.listPaper} elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Configurações salvas</Typography>
          {loading && <CircularProgress size={20} />}
        </Box>
        <Divider style={{ margin: "16px 0" }} />
        {formattedRecords.length === 0 ? (
          <Box className={classes.emptyState}>
            {loading
              ? "Carregando configurações..."
              : "Nenhuma configuração cadastrada ainda."}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {formattedRecords.map(item => (
              <Grid item xs={12} md={6} key={item.id}>
                <Paper variant="outlined" style={{ padding: 16, borderRadius: 12 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span className={classes.providerBadge}>{item.provider}</span>
                    <Box display="flex" gap={8}>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(item)}
                      >
                        Editar
                      </Button>
                      <Tooltip title="Remover configuração">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box mt={2} className={classes.tokenBox}>
                    {item.token}
                  </Box>
                  <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}
                    </Typography>
                    <Typography
                      variant="caption"
                      style={{
                        color: item.active ? "#10b981" : "#ef4444",
                        fontWeight: 600
                      }}
                    >
                      {item.active ? "Ativo" : "Inativo"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentSettings;
