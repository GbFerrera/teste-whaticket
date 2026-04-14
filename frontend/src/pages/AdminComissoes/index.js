import React, { useState, useEffect } from "react";
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
  Tooltip,
  TablePagination
} from "@material-ui/core";
import {
  Refresh,
  MonetizationOn,
  CheckCircle,
  Schedule,
  Cancel
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
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
  pending: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  approved: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
  paid: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  cancelled: {
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
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
}));

const AdminCommissions = () => {
  const classes = useStyles();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    cancelled: 0
  });
  const [formData, setFormData] = useState({
    status: "approved",
    notes: ""
  });

  useEffect(() => {
    loadCommissions();
    loadStats();
  }, [page, rowsPerPage, statusFilter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(statusFilter && { status: statusFilter })
      });
      
      const response = await api.get(`/affiliate/commissions/admin?${params}`);
      setCommissions(response.data.commissions);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error("Error loading commissions:", error);
      toast.error("Erro ao carregar comissões");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/affiliate/commissions/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleProcessCommission = async () => {
    try {
      await api.put(`/affiliate/commissions/${selectedCommission.id}`, {
        status: formData.status,
        notes: formData.notes
      });
      
      toast.success(`Comissão ${formData.status === "approved" ? "aprovada" : formData.status === "cancelled" ? "cancelada" : "paga"} com sucesso!`);
      setShowProcessDialog(false);
      setSelectedCommission(null);
      setFormData({ status: "approved", notes: "" });
      loadCommissions();
      loadStats();
    } catch (error) {
      console.error("Error processing commission:", error);
      toast.error("Erro ao processar comissão");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return classes.pending;
      case "approved":
        return classes.approved;
      case "paid":
        return classes.paid;
      case "cancelled":
        return classes.cancelled;
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Schedule />;
      case "approved":
        return <CheckCircle />;
      case "paid":
        return <MonetizationOn />;
      case "cancelled":
        return <Cancel />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const openProcessDialog = (commission) => {
    setSelectedCommission(commission);
    setFormData({ status: "approved", notes: "" });
    setShowProcessDialog(true);
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
            Gerenciar Comissões
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" style={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendentes</MenuItem>
                <MenuItem value="approved">Aprovadas</MenuItem>
                <MenuItem value="paid">Pagas</MenuItem>
                <MenuItem value="cancelled">Canceladas</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadCommissions}
            >
              Atualizar
            </Button>
          </Box>
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
              <div className={classes.statValue}>{stats.pending}</div>
              <div className={classes.statLabel}>Pendentes</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.approved}</div>
              <div className={classes.statLabel}>Aprovadas</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.paid}</div>
              <div className={classes.statLabel}>Pagas</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Comissões */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Afiliado</TableCell>
                <TableCell>Empresa Indicada</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Taxa</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{formatDate(commission.createdAt)}</TableCell>
                  <TableCell>{commission.affiliate?.company?.name || "N/A"}</TableCell>
                  <TableCell>{commission.referredCompany?.name || "N/A"}</TableCell>
                  <TableCell className={classes.amountCell}>
                    R$ {parseFloat(commission.commissionAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{commission.commissionRate}%</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(commission.status)}
                      className={`${classes.statusChip} ${getStatusColor(commission.status)}`}
                      icon={getStatusIcon(commission.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {commission.status === "pending" && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => openProcessDialog(commission)}
                      >
                        Processar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {commissions.length === 0 && (
          <Card className={classes.emptyState}>
            <CardContent>
              <Typography variant="body1" color="textSecondary">
                Nenhuma comissão encontrada.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                {statusFilter ? "Tente remover o filtro de status." : "Nenhuma comissão registrada ainda."}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Paginação */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
          labelRowsPerPage="Comissões por página:"
        />

        {/* Dialog para Processar Comissão */}
        <Dialog
          open={showProcessDialog}
          onClose={() => setShowProcessDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Processar Comissão</DialogTitle>
          <DialogContent>
            {selectedCommission && (
              <div>
                <Typography variant="body2" gutterBottom>
                  <strong>Comissão:</strong> R$ {parseFloat(selectedCommission.commissionAmount || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Afiliado:</strong> {selectedCommission.affiliate?.company?.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Empresa Indicada:</strong> {selectedCommission.referredCompany?.name}
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
                    <MenuItem value="paid">Marcar como Paga</MenuItem>
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
            <Button onClick={() => setShowProcessDialog(false)}>
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
    </MainContainer>
  );
};

export default AdminCommissions;
