import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@material-ui/core";
import {
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  PhoneAndroid as PhoneIcon,
  People as PeopleIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  getContactAnalytics,
  getDeduplicationReport,
  getSavingReport,
  getTopContacts,
  exportContactData,
} from "../../services/contactAnalyticsService";

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
  statsCard: {
    padding: theme.spacing(2),
    borderRadius: "8px",
    textAlign: "center",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  statsNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: theme.spacing(0.5),
  },
  statsLabel: {
    fontSize: "14px",
    opacity: 0.9,
  },
  primaryCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
  },
  successCard: {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "#ffffff",
  },
  warningCard: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#ffffff",
  },
  infoCard: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#ffffff",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
  },
  chartContainer: {
    height: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px dashed #d1d5db",
  },
  progressContainer: {
    marginTop: theme.spacing(2),
  },
}));

const ContactAnalytics = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [analytics, setAnalytics] = useState(null);
  const [deduplicationReport, setDeduplicationReport] = useState(null);
  const [savingReport, setSavingReport] = useState(null);
  const [topContacts, setTopContacts] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [period]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const companyId = user.companyId;
      
      // Carregar dados em paralelo
      const [analyticsRes, deduplicationRes, savingRes, topContactsRes] = await Promise.all([
        getContactAnalytics(companyId, { period }),
        getDeduplicationReport(companyId),
        getSavingReport(companyId, { period }),
        getTopContacts(companyId, { limit: 10 }),
      ]);

      setAnalytics(analyticsRes);
      setDeduplicationReport(deduplicationRes);
      setSavingReport(savingRes);
      setTopContacts(topContactsRes);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = "json") => {
    setExporting(true);
    try {
      const companyId = user.companyId;
      const response = await exportContactData(companyId, { format, period });
      
      // Criar download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-analytics-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("pt-BR").format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  if (loading && !analytics) {
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
            <AnalyticsIcon /> Analytics de Contatos
          </Typography>
          <Typography className={classes.pageSubtitle}>
            Visualize estatísticas detalhadas sobre contatos, deduplicação e salvamento
          </Typography>
        </div>
        <div className={classes.actionButtons}>
          <FormControl className={classes.formControl}>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="7d">Últimos 7 dias</MenuItem>
              <MenuItem value="30d">Últimos 30 dias</MenuItem>
              <MenuItem value="90d">Últimos 90 dias</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAllData}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("json")}
            disabled={exporting}
          >
            {exporting ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {analytics && (
        <Grid container spacing={3} className={classes.section}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={`${classes.statsCard} ${classes.primaryCard}`}>
              <Typography className={classes.statsNumber}>
                {formatNumber(analytics.summary?.totalContacts)}
              </Typography>
              <Typography className={classes.statsLabel}>
                <PeopleIcon /> Total de Contatos
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={`${classes.statsCard} ${classes.successCard}`}>
              <Typography className={classes.statsNumber}>
                {formatNumber(analytics.summary?.potentialContacts)}
              </Typography>
              <Typography className={classes.statsLabel}>
                <TrendingIcon /> Potenciais Clientes
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={`${classes.statsCard} ${classes.warningCard}`}>
              <Typography className={classes.statsNumber}>
                {formatNumber(analytics.summary?.savedToPhone)}
              </Typography>
              <Typography className={classes.statsLabel}>
                <PhoneIcon /> Salvos no Celular
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={`${classes.statsCard} ${classes.infoCard}`}>
              <Typography className={classes.statsNumber}>
                {analytics.summary?.averageScore?.toFixed(1) || "0.0"}
              </Typography>
              <Typography className={classes.statsLabel}>
                <TrendingIcon /> Score Médio
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Relatório de Deduplicação */}
      {deduplicationReport && (
        <Paper className={classes.card}>
          <Typography className={classes.sectionTitle}>
            <AnalyticsIcon /> Relatório de Deduplicação
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estatísticas de Duplicação
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Números: {formatNumber(deduplicationReport.summary?.totalNumbers)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Números Duplicados: {formatNumber(deduplicationReport.summary?.duplicatedNumbers)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Taxa de Duplicação: {formatPercentage(deduplicationReport.summary?.duplicateRate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Duplicados: {formatNumber(deduplicationReport.summary?.totalDuplicates)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Grupos Duplicados ({deduplicationReport.duplicateGroups?.length || 0})
              </Typography>
              <TableContainer className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Contatos</TableCell>
                      <TableCell>Score Médio</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deduplicationReport.duplicateGroups?.slice(0, 5).map((group, index) => (
                      <TableRow key={index}>
                        <TableCell>{group.number}</TableCell>
                        <TableCell>{group.count}</TableCell>
                        <TableCell>
                          {group.contacts?.length > 0 
                            ? (group.contacts.reduce((sum, c) => sum + (c.potentialScore || 0), 0) / group.contacts.length).toFixed(1)
                            : "0.0"
                          }
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Duplicado" 
                            color="warning" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Relatório de Salvamento */}
      {savingReport && (
        <Paper className={classes.card}>
          <Typography className={classes.sectionTitle}>
            <PhoneIcon /> Relatório de Salvamento no Celular
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estatísticas do Período
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Período: {savingReport.period?.type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Potenciais: {formatNumber(savingReport.summary?.totalPotential)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Salvos: {formatNumber(savingReport.summary?.totalSaved)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Taxa de Conversão: {formatPercentage(savingReport.summary?.conversionRate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Média por Dia: {formatNumber(savingReport.summary?.averagePerDay)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Salvamentos Recentes
              </Typography>
              <TableContainer className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Número</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savingReport.recentSaves?.slice(0, 5).map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.number}</TableCell>
                        <TableCell>
                          <Chip 
                            label={contact.potentialScore} 
                            color={contact.potentialScore >= 7 ? "primary" : "default"} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{contact.savedToPhoneReason}</TableCell>
                        <TableCell>
                          {new Date(contact.savedToPhoneAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Top Contatos */}
      {topContacts && (
        <Paper className={classes.card}>
          <Typography className={classes.sectionTitle}>
            <TrendingIcon /> Top Contatos
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Potenciais Clientes
              </Typography>
              {topContacts.highPotential?.slice(0, 5).map((contact, index) => (
                <Card key={index} variant="outlined" style={{ marginBottom: 8 }}>
                  <CardContent style={{ padding: 12 }}>
                    <Typography variant="body2" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Score: {contact.potentialScore}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Salvos no Celular
              </Typography>
              {topContacts.savedToPhone?.slice(0, 5).map((contact, index) => (
                <Card key={index} variant="outlined" style={{ marginBottom: 8 }}>
                  <CardContent style={{ padding: 12 }}>
                    <Typography variant="body2" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {contact.savedToPhoneReason}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Recentes
              </Typography>
              {topContacts.recent?.slice(0, 5).map((contact, index) => (
                <Card key={index} variant="outlined" style={{ marginBottom: 8 }}>
                  <CardContent style={{ padding: 12 }}>
                    <Typography variant="body2" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </Paper>
      )}
    </div>
  );
};

export default ContactAnalytics;
