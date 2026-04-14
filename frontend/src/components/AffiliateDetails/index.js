import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import {
  Person,
  MonetizationOn,
  TrendingUp,
  People,
  Link,
  Refresh,
  Edit,
  Delete,
  FileCopy,
  Add,
  CheckCircle,
  Schedule
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../../services/api";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    marginBottom: theme.spacing(4),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  infoCard: {
    marginBottom: theme.spacing(2),
  },
  infoCardContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    padding: theme.spacing(1),
  },
  infoLabel: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  infoValue: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  statsGrid: {
    marginBottom: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  statLabel: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  progressCard: {
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
  },
  progressText: {
    marginTop: theme.spacing(1),
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  linksList: {
    maxHeight: 300,
    overflow: "auto",
  },
  linkItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  linkUrl: {
    fontFamily: "monospace",
    fontSize: "0.875rem",
    wordBreak: "break-all",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
  commissionItem: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
  },
  commissionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commissionAmount: {
    fontWeight: 600,
    color: theme.palette.success.main,
  },
  commissionDetails: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  modalContent: {
    padding: theme.spacing(3),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
}));

const AffiliateDetails = () => {
  const classes = useStyles();
  const { id } = useParams();
  const [affiliateInfo, setAffiliateInfo] = useState(null);
  const [links, setLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [formData, setFormData] = useState({
    notes: "",
    status: "approved"
  });

  useEffect(() => {
    if (id) {
      loadAffiliateInfo();
      loadLinks();
      loadCommissions();
      loadWithdrawals();
    }
  }, [id]);

  const loadAffiliateInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/affiliate/my-info`);
      setAffiliateInfo(response.data);
    } catch (error) {
      console.error("Error loading affiliate info:", error);
      toast.error("Erro ao carregar informações do afiliado");
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async () => {
    try {
      const response = await api.get("/affiliate/my-links");
      setLinks(response.data);
    } catch (error) {
      console.error("Error loading links:", error);
      toast.error("Erro ao carregar links");
    }
  };

  const loadCommissions = async () => {
    try {
      const response = await api.get("/affiliate/commissions");
      setCommissions(response.data.commissions);
    } catch (error) {
      console.error("Error loading commissions:", error);
      toast.error("Erro ao carregar comissões");
    }
  };

  const loadWithdrawals = async () => {
    try {
      const response = await api.get("/affiliate/withdrawals");
      setWithdrawals(response.data);
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      toast.error("Erro ao carregar saques");
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado com sucesso!");
  };

  const handleGenerateLink = async () => {
    try {
      const response = await api.post("/affiliate/generate-link");
      setLinks(prev => [response.data, ...prev]);
      toast.success("Link gerado com sucesso!");
      loadLinks();
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error("Erro ao gerar link");
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await api.delete(`/affiliate/links/${linkId}`);
      setLinks(prev => prev.filter(link => link.id !== linkId));
      toast.success("Link excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Erro ao excluir link");
    }
  };

  const handleProcessCommission = async () => {
    try {
      await api.put(`/affiliate/commissions/${selectedCommission.id}`, {
        status: formData.status,
        notes: formData.notes
      });
      
      toast.success(`Comissão ${formData.status === "approved" ? "aprovada" : "rejeitada"} com sucesso!`);
      setShowCommissionModal(false);
      setSelectedCommission(null);
      setFormData({ notes: "", status: "approved" });
      loadCommissions();
    } catch (error) {
      console.error("Error processing commission:", error);
      toast.error("Erro ao processar comissão");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
        return "error";
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "paid":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "suspended":
        return "Suspenso";
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovada";
      case "paid":
        return "Paga";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const calculateProgress = () => {
    if (!affiliateInfo) return 0;
    const earned = affiliateInfo.totalEarned || 0;
    const withdrawn = affiliateInfo.totalWithdrawn || 0;
    const available = earned - withdrawn;
    const percentage = earned > 0 ? (available / earned) * 100 : 0;
    return Math.min(percentage, 100);
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!affiliateInfo) {
    return (
      <Container className={classes.container}>
        <Typography variant="h6" color="error">
          Afiliado não encontrado.
        </Typography>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      {/* Header */}
      <div className={classes.header}>
        <Typography variant="h4">Detalhes do Afiliado</Typography>
        <Box>
          <Chip
            label={getStatusText(affiliateInfo.status)}
            color={getStatusColor(affiliateInfo.status)}
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              loadAffiliateInfo();
              loadLinks();
              loadCommissions();
              loadWithdrawals();
            }}
          >
            Atualizar
          </Button>
        </Box>
      </div>

      {/* Informações Principais */}
      <Card className={classes.infoCard}>
        <CardContent className={classes.infoCardContent}>
          <Avatar className={classes.avatar}>
            {affiliateInfo.company?.name?.charAt(0) || "A"}
          </Avatar>
          <Box ml={2}>
            <Typography variant="h5">{affiliateInfo.company?.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {affiliateInfo.company?.email}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {affiliateInfo.company?.phone}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Grid container spacing={3} className={classes.statsGrid}>
        <Grid item xs={12} sm={6}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography variant="h6">Informações da Conta</Typography>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Taxa de Comissão:</span>
                <span className={classes.infoValue}>{affiliateInfo.commissionRate}%</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Valor Mínimo Saque:</span>
                <span className={classes.infoValue}>R$ {parseFloat(affiliateInfo.minWithdrawAmount || 0).toFixed(2)}</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Status:</span>
                <Chip
                  label={getStatusText(affiliateInfo.status)}
                  color={getStatusColor(affiliateInfo.status)}
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography variant="h6">Resumo Financeiro</Typography>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Total Ganho:</span>
                <span className={classes.infoValue}>R$ {parseFloat(affiliateInfo.totalEarned || 0).toFixed(2)}</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Total Sacado:</span>
                <span className={classes.infoValue}>R$ {parseFloat(affiliateInfo.totalWithdrawn || 0).toFixed(2)}</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.infoLabel}>Saldo Disponível:</span>
                <span className={classes.infoValue}>
                  R$ {(parseFloat(affiliateInfo.totalEarned || 0) - parseFloat(affiliateInfo.totalWithdrawn || 0)).toFixed(2)}
                </span>
              </div>
              <div className={classes.progressCard}>
                <Typography variant="body2" className={classes.progressText}>
                  Progresso para próximo saque: {parseFloat(calculateProgress() || 0).toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  className={classes.progressBar}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Links de Indicação */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Links de Indicação ({links.length})
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleGenerateLink}
              style={{ float: "right" }}
            >
              Gerar Novo Link
            </Button>
          </Typography>
          <div className={classes.linksList}>
            {links.map((link) => (
              <div key={link.id} className={classes.linkItem}>
                <div>
                  <Typography variant="body2">
                    <strong>{link.code}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Criado em {formatDate(link.createdAt)} | Cliques: {link.clicks} | Cadastros: {link.signups}
                  </Typography>
                </div>
                <div className={classes.actions}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileCopy />}
                    onClick={() => handleCopyLink(link.url)}
                  >
                    Copiar
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Delete />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comissões */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Comissões ({commissions.length})
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadCommissions}
              style={{ float: "right" }}
            >
              Atualizar
            </Button>
          </Typography>
          {commissions.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography variant="body1" color="textSecondary">
                Nenhuma comissão encontrada.
              </Typography>
            </div>
          ) : (
            <div>
              {commissions.map((commission) => (
                <div key={commission.id} className={classes.commissionItem}>
                  <div className={classes.commissionHeader}>
                    <div>
                      <Typography variant="body1" className={classes.commissionAmount}>
                        R$ {parseFloat(commission.commissionAmount || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        {commission.referredCompany?.name || "Empresa não identificada"}
                      </Typography>
                      <Typography variant="body2" className={classes.commissionDetails}>
                        {formatDate(commission.createdAt)} | Taxa: {commission.commissionRate}%
                      </Typography>
                    </div>
                    <div>
                      <Chip
                        size="small"
                        label={getStatusText(commission.status)}
                        color={getStatusColor(commission.status)}
                      />
                      {commission.status === "pending" && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedCommission(commission);
                            setShowCommissionModal(true);
                          }}
                          style={{ marginLeft: 8 }}
                        >
                          Processar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Saques */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico de Saques ({withdrawals.length})
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadWithdrawals}
              style={{ float: "right" }}
            >
              Atualizar
            </Button>
          </Typography>
          {withdrawals.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography variant="body1" color="textSecondary">
                Nenhum saque solicitado.
              </Typography>
            </div>
          ) : (
            <div>
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className={classes.commissionItem}>
                  <div className={classes.commissionHeader}>
                    <div>
                      <Typography variant="body1" className={classes.commissionAmount}>
                        R$ {parseFloat(withdrawal.amount || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        {withdrawal.paymentMethod.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" className={classes.commissionDetails}>
                        {formatDate(withdrawal.createdAt)}
                      </Typography>
                    </div>
                    <Chip
                      size="small"
                      label={getStatusText(withdrawal.status)}
                      color={getStatusColor(withdrawal.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Processar Comissão */}
      <Dialog
        open={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Processar Comissão</DialogTitle>
        <DialogContent>
          {selectedCommission && (
            <div className={classes.modalContent}>
              <Typography variant="body2" gutterBottom>
                <strong>Comissão:</strong> R$ {parseFloat(selectedCommission.commissionAmount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Empresa:</strong> {selectedCommission.referredCompany?.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Data:</strong> {formatDate(selectedCommission.createdAt)}
              </Typography>
              
              <FormControl fullWidth className={classes.formField}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="approved">Aprovar</MenuItem>
                  <MenuItem value="cancelled">Cancelar</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={classes.formField}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommissionModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcessCommission}
          >
            Processar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AffiliateDetails;
