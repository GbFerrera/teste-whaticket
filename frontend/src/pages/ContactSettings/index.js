import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  Settings as SettingsIcon,
  PhoneAndroid as PhoneIcon,
  TrendingUp as TrendingIcon,
  Assessment as AnalyticsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  getContactSettings,
  updateContactSettings,
  getContactStats,
  testContactConfiguration,
  resetContactSettings,
} from "../../services/contactSettingsService";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    width: "100%",
    margin: 0,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  card: {
    padding: theme.spacing(3),
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  sliderContainer: {
    margin: theme.spacing(2, 0),
  },
  sliderLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  statsCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    padding: theme.spacing(2),
    borderRadius: "8px",
    textAlign: "center",
  },
  statsNumber: {
    fontSize: "32px",
    fontWeight: "bold",
  },
  statsLabel: {
    fontSize: "14px",
    opacity: 0.9,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
  },
}));

const ContactSettings = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { showConfirm } = useSystemAlert();
  const [settings, setSettings] = useState({
    autoSaveContacts: "enabled",
    autoSaveContactsScore: 7,
    autoSaveContactsReason: "high_potential",
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const companyId = user.companyId;
      const response = await getContactSettings(companyId);
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const companyId = user.companyId;
      const response = await getContactStats(companyId);
      setStats(response);
    } catch (err) {
      toastError(err);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const companyId = user.companyId;
      console.log("Enviando configurações:", settings);
      const response = await updateContactSettings(companyId, settings);
      console.log("Resposta do backend:", response);
      toast.success("Configurações salvas com sucesso!");
      
      // Atualizar o estado com os dados retornados do backend
      if (response.settings) {
        console.log("Atualizando estado com:", response.settings);
        setSettings(response.settings);
      }
      
      setHasChanges(false);
      loadStats();
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const companyId = user.companyId;
      const response = await testContactConfiguration(companyId, {
        testMessage: "Olá, gostaria de saber mais sobre seus produtos e serviços. Tenho interesse em fazer uma compra."
      });
      toast.success(response.message || "Teste realizado com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setTesting(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await showConfirm({
      type: "warning",
      title: "Resetar Configurações",
      message: "Tem certeza que deseja resetar as configurações para os valores padrão?",
      confirmText: "Sim, resetar",
      cancelText: "Cancelar",
    });
    if (confirmed) {
      setLoading(true);
      try {
        const companyId = user.companyId;
        await resetContactSettings(companyId);
        toast.success("Configurações resetadas com sucesso!");
        loadSettings();
        loadStats();
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !settings) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.pageHeader}>
        <div>
          <Typography className={classes.pageTitle}>
            <SettingsIcon /> Configurações de Contatos
          </Typography>
          <Typography className={classes.pageSubtitle}>
            Gerencie deduplicação, scoring e salvamento automático de contatos
          </Typography>
        </div>
        {hasChanges && (
          <Chip
            label="Alterações não salvas"
            color="warning"
            size="small"
            className={classes.statusChip}
          />
        )}
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <Grid container spacing={3} className={classes.section}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <Typography className={classes.statsNumber}>
                {stats.totalContacts || 0}
              </Typography>
              <Typography className={classes.statsLabel}>
                Total de Contatos
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <Typography className={classes.statsNumber}>
                {stats.potentialContacts || 0}
              </Typography>
              <Typography className={classes.statsLabel}>
                Potenciais Clientes
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <Typography className={classes.statsNumber}>
                {stats.savedToPhone || 0}
              </Typography>
              <Typography className={classes.statsLabel}>
                Salvos no Celular
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <Typography className={classes.statsNumber}>
                {stats.averageScore ? stats.averageScore.toFixed(1) : "0.0"}
              </Typography>
              <Typography className={classes.statsLabel}>
                Score Médio
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Configurações Principais */}
      <Paper className={classes.card}>
        <Typography className={classes.sectionTitle}>
          <PhoneIcon /> Salvamento Automático no Celular
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSaveContacts !== "disabled"}
                  onChange={(e) => 
                    handleChange("autoSaveContacts", e.target.checked ? "enabled" : "disabled")
                  }
                  color="primary"
                />
              }
              label="Ativar salvamento automático"
            />
            <Typography variant="body2" color="textSecondary">
              Salve automaticamente contatos importantes no celular
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel>Critério de Salvamento</InputLabel>
              <Select
                value={settings.autoSaveContactsReason}
                onChange={(e) => handleChange("autoSaveContactsReason", e.target.value)}
                disabled={settings.autoSaveContacts === "disabled"}
              >
                <MenuItem value="high_potential">Apenas Alta Potencial</MenuItem>
                <MenuItem value="message_analysis">Análise de Mensagem</MenuItem>
                <MenuItem value="business_hours">Horário Comercial</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderLabel}>
                <Typography>Score Mínimo para Salvamento</Typography>
                <Typography color="primary">
                  {settings.autoSaveContactsScore}
                </Typography>
              </div>
              <Slider
                value={settings.autoSaveContactsScore}
                onChange={(e, value) => handleChange("autoSaveContactsScore", value)}
                min={0}
                max={10}
                step={1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 7, label: "7" },
                  { value: 10, label: "10" },
                ]}
                disabled={settings.autoSaveContacts === "disabled"}
              />
              <Typography variant="caption" color="textSecondary">
                Contatos com score igual ou superior a este valor serão salvos automaticamente
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* Informações Adicionais */}
      <Paper className={classes.card}>
        <Typography className={classes.sectionTitle}>
          <InfoIcon /> Informações do Sistema
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Status do Sistema:</strong>{" "}
              <Chip
                label={settings.autoSaveContacts === "disabled" ? "Desativado" : "Ativado"}
                color={settings.autoSaveContacts === "disabled" ? "default" : "primary"}
                size="small"
              />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Critério Atual:</strong> {settings.autoSaveContactsReason}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Score Mínimo:</strong> {settings.autoSaveContactsScore}/10
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Última Atualização:</strong> {new Date().toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Botões de Ação */}
      <div className={classes.actionButtons}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RefreshIcon />}
          onClick={handleTest}
          disabled={testing || settings.autoSaveContacts === "disabled"}
        >
          {testing ? "Testando..." : "Testar Configuração"}
        </Button>

        <Button
          variant="outlined"
          color="default"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={loading}
        >
          Resetar para Padrão
        </Button>
      </div>
    </div>
  );
};

export default ContactSettings;
