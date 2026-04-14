import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Visibility,
  MonetizationOn,
  TrendingUp,
  People
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import MainContainer from "../../components/MainContainer";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  tableContainer: {
    marginBottom: theme.spacing(3),
  },
  statusChip: {
    fontSize: "0.75rem",
  },
  active: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  inactive: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  suspended: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  amountCell: {
    fontWeight: 600,
    color: theme.palette.success.main,
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  statsContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(2),
    textAlign: "center",
    minWidth: 150,
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
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: theme.spacing(2),
  },
}));

const AdminAffiliates = () => {
  const classes = useStyles();
  const history = useHistory();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    companyId: "",
    commissionRate: "10.00",
    minWithdrawAmount: "50.00",
    status: "active"
  });

  useEffect(() => {
    loadAffiliates();
    loadStats();
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data } = await api.get("/companiesPlan/", {
        params: { searchParam: "", pageNumber: 1 },
      });
      setCompanies(data.companies || []);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const loadAffiliates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/affiliate");
      setAffiliates(response.data);
    } catch (error) {
      console.error("Error loading affiliates:", error);
      toast.error("Erro ao carregar afiliados");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/affiliate/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleCreateAffiliate = async () => {
    try {
      await api.post("/affiliate", formData);
      toast.success("Afiliado criado com sucesso!");
      setShowCreateDialog(false);
      setFormData({
        companyId: "",
        commissionRate: "10.00",
        minWithdrawAmount: "50.00",
        status: "active"
      });
      loadAffiliates();
      loadStats();
    } catch (error) {
      console.error("Error creating affiliate:", error);
      toast.error(error.response?.data?.error || "Erro ao criar afiliado");
    }
  };

  const handleUpdateAffiliate = async () => {
    try {
      await api.put(`/affiliate/${selectedAffiliate.id}`, formData);
      toast.success("Afiliado atualizado com sucesso!");
      setShowEditDialog(false);
      setSelectedAffiliate(null);
      loadAffiliates();
      loadStats();
    } catch (error) {
      console.error("Error updating affiliate:", error);
      toast.error("Erro ao atualizar afiliado");
    }
  };

  const handleDeleteAffiliate = async () => {
    try {
      await api.delete(`/affiliate/${selectedAffiliate.id}`);
      toast.success("Afiliado excluído com sucesso!");
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
      loadAffiliates();
      loadStats();
    } catch (error) {
      console.error("Error deleting affiliate:", error);
      toast.error("Erro ao excluir afiliado");
    }
  };

  const handleViewDetails = (affiliate) => {
    history.push(`/admin/afiliados/${affiliate.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return classes.active;
      case "inactive":
        return classes.inactive;
      case "suspended":
        return classes.suspended;
      default:
        return "";
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

  const openEditDialog = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setFormData({
      companyId: affiliate.companyId.toString(),
      commissionRate: affiliate.commissionRate.toString(),
      minWithdrawAmount: affiliate.minWithdrawAmount.toString(),
      status: affiliate.status
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <MainContainer>
        <Container className={classes.container}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Container className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Gerenciar Afiliados
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            Novo Afiliado
          </Button>
        </div>

        {/* Estatísticas */}
        <div className={classes.statsContainer}>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.total}</div>
              <div className={classes.statLabel}>Total</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.active}</div>
              <div className={classes.statLabel}>Ativos</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.inactive}</div>
              <div className={classes.statLabel}>Inativos</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.suspended}</div>
              <div className={classes.statLabel}>Suspensos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Afiliados */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Taxa de Comissão</TableCell>
                <TableCell>Valor Mínimo Saque</TableCell>
                <TableCell>Total Ganho</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>{affiliate.company?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                      {affiliate.affiliateCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{affiliate.commissionRate}%</TableCell>
                  <TableCell>R$ {parseFloat(affiliate.minWithdrawAmount || 0).toFixed(2)}</TableCell>
                  <TableCell className={classes.amountCell}>
                    R$ {parseFloat(affiliate.totalEarned || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(affiliate.status)}
                      className={`${classes.statusChip} ${getStatusColor(affiliate.status)}`}
                    />
                  </TableCell>
                  <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                  <TableCell>
                    <div className={classes.actions}>
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(affiliate)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(affiliate)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(affiliate)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {affiliates.length === 0 && (
          <Card className={classes.emptyState}>
            <CardContent>
              <Typography variant="body1" color="textSecondary">
                Nenhum afiliado encontrado.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                Clique em "Novo Afiliado" para criar o primeiro afiliado.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Dialog para Criar Afiliado */}
        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Novo Afiliado</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Empresa</InputLabel>
                  <Select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    label="Empresa"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name} (ID: {company.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Taxa de Comissão (%)"
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Valor Mínimo Saque (R$)"
                  type="number"
                  value={formData.minWithdrawAmount}
                  onChange={(e) => setFormData({ ...formData, minWithdrawAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="suspended">Suspenso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAffiliate}
            >
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Editar Afiliado */}
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Afiliado</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Taxa de Comissão (%)"
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valor Mínimo Saque (R$)"
                  type="number"
                  value={formData.minWithdrawAmount}
                  onChange={(e) => setFormData({ ...formData, minWithdrawAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="suspended">Suspenso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateAffiliate}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Excluir Afiliado */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o afiliado "{selectedAffiliate?.company?.name}"?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAffiliate}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
};

export default AdminAffiliates;
