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

const useStyles = makeStyles(theme => ({
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
  rejected: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  amountCell: {
    fontWeight: 600,
    color: theme.palette.primary.main,
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

const AdminSaques = () => {
  const classes = useStyles();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [formData, setFormData] = useState({
    status: "approved",
    notes: ""
  });

  useEffect(() => {
    loadWithdrawals();
    loadStats();
  }, [page, rowsPerPage, statusFilter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(statusFilter && { status: statusFilter })
      });
      
      const response = await api.get(`/affiliate/withdrawals/admin?${params}`);
      setWithdrawals(response.data.withdrawals);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      toast.error("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/affiliate/withdrawals/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleProcessWithdrawal = async () => {
    try {
      await api.put(`/affiliate/withdrawals/${selectedWithdrawal.id}`, {
        status: formData.status,
        notes: formData.notes
      });
      
      toast.success(`Saque ${formData.status === "approved" ? "aprovado" : formData.status === "rejected" ? "rejeitado" : "processado"} com sucesso!`);
      setShowProcessDialog(false);
      setSelectedWithdrawal(null);
      setFormData({ status: "approved", notes: "" });
      loadWithdrawals();
      loadStats();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Erro ao processar saque");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return classes.pending;
      case "approved":
        return classes.approved;
      case "rejected":
        return classes.rejected;
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
      case "rejected":
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
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
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

  const openProcessDialog = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
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
            Gerenciar Saques
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
                <MenuItem value="approved">Aprovados</MenuItem>
                <MenuItem value="rejected">Rejeitados</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadWithdrawals}
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
              <div className={classes.statLabel}>Aprovados</div>
            </CardContent>
          </Card>
          <Card className={classes.statCard}>
            <CardContent>
              <div className={classes.statValue}>{stats.rejected}</div>
              <div className={classes.statLabel}>Rejeitados</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Saques */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Afiliado</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                  <TableCell>{withdrawal.affiliate?.company?.name || "N/A"}</TableCell>
                  <TableCell className={classes.amountCell}>
                    R$ {parseFloat(withdrawal.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{withdrawal.paymentMethod?.toUpperCase() || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(withdrawal.status)}
                      className={`${classes.statusChip} ${getStatusColor(withdrawal.status)}`}
                      icon={getStatusIcon(withdrawal.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === "pending" && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => openProcessDialog(withdrawal)}
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

        {withdrawals.length === 0 && (
          <Card className={classes.emptyState}>
            <CardContent>
              <Typography variant="body1" color="textSecondary">
                Nenhum saque encontrado.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                {statusFilter ? "Tente remover o filtro de status." : "Nenhum saque solicitado ainda."}
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
          labelRowsPerPage="Saques por página:"
        />

        {/* Dialog para Processar Saque */}
        <Dialog
          open={showProcessDialog}
          onClose={() => setShowProcessDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Processar Saque</DialogTitle>
          <DialogContent>
            {selectedWithdrawal && (
              <div>
                <Typography variant="body2" gutterBottom>
                  <strong>Valor:</strong> R$ {parseFloat(selectedWithdrawal.amount || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Afiliado:</strong> {selectedWithdrawal.affiliate?.company?.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Método:</strong> {selectedWithdrawal.paymentMethod?.toUpperCase()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Data:</strong> {formatDate(selectedWithdrawal.createdAt)}
                </Typography>
                {selectedWithdrawal.paymentDetails && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Dados:</strong> {JSON.stringify(selectedWithdrawal.paymentDetails)}
                  </Typography>
                )}
                
                <FormControl fullWidth className={classes.formField}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="approved">Aprovar</MenuItem>
                    <MenuItem value="rejected">Rejeitar</MenuItem>
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
                  helperText={formData.status === "rejected" ? "Informe o motivo da rejeição" : "Observações sobre o processamento"}
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
              onClick={handleProcessWithdrawal}
            >
              Processar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
};

export default AdminSaques;
