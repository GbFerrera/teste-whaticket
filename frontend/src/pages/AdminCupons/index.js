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
  Switch,
  FormControlLabel
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  Refresh,
  MonetizationOn,
  LocalOffer
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
  active: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  inactive: {
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
}));

const AdminCupons = () => {
  const classes = useStyles();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPlanAmount: "0",
    maxUses: "",
    validUntil: "",
    isActive: true,
    description: ""
  });

  useEffect(() => {
    loadCoupons();
    loadStats();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get("/coupon");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/coupon/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      await api.post("/coupon", formData);
      toast.success("Cupom criado com sucesso!");
      setShowCreateDialog(false);
      setFormData({
        name: "",
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPlanAmount: "0",
        maxUses: "",
        validUntil: "",
        isActive: true,
        description: ""
      });
      loadCoupons();
      loadStats();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error.response?.data?.error || "Erro ao criar cupom");
    }
  };

  const handleUpdateCoupon = async () => {
    try {
      await api.put(`/coupon/${selectedCoupon.id}`, formData);
      toast.success("Cupom atualizado com sucesso!");
      setShowEditDialog(false);
      setSelectedCoupon(null);
      loadCoupons();
      loadStats();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Erro ao atualizar cupom");
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      await api.delete(`/coupon/${selectedCoupon.id}`);
      toast.success("Cupom excluído com sucesso!");
      setShowDeleteDialog(false);
      setSelectedCoupon(null);
      loadCoupons();
      loadStats();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Erro ao excluir cupom");
    }
  };

  const getStatusColor = (isActive, validUntil) => {
    if (!isActive) return classes.inactive;
    if (new Date(validUntil) < new Date()) return classes.inactive;
    return classes.active;
  };

  const getStatusText = (isActive, validUntil) => {
    if (!isActive) return "Inativo";
    if (new Date(validUntil) < new Date()) return "Expirado";
    return "Ativo";
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

  const openEditDialog = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPlanAmount: coupon.minPlanAmount.toString(),
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      isActive: coupon.isActive,
      description: coupon.description || ""
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (coupon) => {
    setSelectedCoupon(coupon);
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
            Gerenciar Cupons
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            Novo Cupom
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
              <div className={classes.statValue}>{stats.expired}</div>
              <div className={classes.statLabel}>Expirados</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Cupons */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Tipo de Desconto</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Usos</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                      {coupon.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage" ? "Percentual" : "Fixo"}
                  </TableCell>
                  <TableCell className={classes.amountCell}>
                    {coupon.discountType === "percentage" 
                      ? `${coupon.discountValue}%` 
                      : `R$ ${coupon.discountValue.toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.usedCount} / {coupon.maxUses || "∞"}
                  </TableCell>
                  <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(coupon.isActive, coupon.validUntil)}
                      className={`${classes.statusChip} ${getStatusColor(coupon.isActive, coupon.validUntil)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={classes.actions}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(coupon)}
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

        {coupons.length === 0 && (
          <Card className={classes.emptyState}>
            <CardContent>
              <Typography variant="body1" color="textSecondary">
                Nenhum cupom encontrado.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                Clique em "Novo Cupom" para criar o primeiro cupom.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Dialog para Criar Cupom */}
        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Novo Cupom</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Cupom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Código"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  helperText="Código em maiúsculas"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Desconto</InputLabel>
                  <Select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    label="Tipo de Desconto"
                  >
                    <MenuItem value="percentage">Percentual (%)</MenuItem>
                    <MenuItem value="fixed">Fixo (R$)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={formData.discountType === "percentage" ? "Percentual (%)" : "Valor (R$)"}
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Valor Mínimo do Plano (R$)"
                  type="number"
                  value={formData.minPlanAmount}
                  onChange={(e) => setFormData({ ...formData, minPlanAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Máximo de Usos"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  helperText="Deixe em branco para ilimitado"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Data de Validade"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Cupom Ativo"
                />
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
              onClick={handleCreateCoupon}
            >
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Editar Cupom */}
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Editar Cupom</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Cupom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Código"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Desconto</InputLabel>
                  <Select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    label="Tipo de Desconto"
                  >
                    <MenuItem value="percentage">Percentual (%)</MenuItem>
                    <MenuItem value="fixed">Fixo (R$)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={formData.discountType === "percentage" ? "Percentual (%)" : "Valor (R$)"}
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Valor Mínimo do Plano (R$)"
                  type="number"
                  value={formData.minPlanAmount}
                  onChange={(e) => setFormData({ ...formData, minPlanAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Máximo de Usos"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Data de Validade"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Cupom Ativo"
                />
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
              onClick={handleUpdateCoupon}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Excluir Cupom */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o cupom "{selectedCoupon?.name}"?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteCoupon}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
};

export default AdminCupons;
