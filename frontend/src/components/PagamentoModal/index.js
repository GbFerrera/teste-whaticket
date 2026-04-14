import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(() => ({
  paymentList: {
    maxHeight: 260,
    overflowY: "auto",
    marginBottom: 16
  },
  paymentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    marginBottom: 8
  },
  paymentInfo: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.85rem"
  },
  paymentActions: {
    display: "flex",
    alignItems: "center",
    gap: 4
  }
}));

const PagamentoModal = ({ open, onClose, fatura }) => {
  const classes = useStyles();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    metodoPagamento: "pix",
    valor: "",
    dataPagamento: "",
    observacoes: ""
  });

  useEffect(() => {
    if (open && fatura?.id) {
      fetchPayments();
    }
  }, [open, fatura]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/financeiro/pagamentos", {
        params: {
          faturaId: fatura.id
        }
      });
      setPayments(data.pagamentos || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = field => event => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCreatePayment = async () => {
    if (!form.valor) {
      toast.error("Informe o valor do pagamento.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/financeiro/pagamentos", {
        faturaId: fatura.id,
        metodoPagamento: form.metodoPagamento,
        valor: Number(String(form.valor).replace(",", ".")),
        dataPagamento: form.dataPagamento || undefined,
        observacoes: form.observacoes || undefined
      });
      toast.success("Pagamento registrado com sucesso.");
      await fetchPayments();
      setForm({
        metodoPagamento: "pix",
        valor: "",
        dataPagamento: "",
        observacoes: ""
      });
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async pagamento => {
    try {
      await api.delete(`/financeiro/pagamentos/${pagamento.id}`);
      toast.success("Pagamento removido.");
      fetchPayments();
    } catch (err) {
      toastError(err);
    }
  };

  const formatCurrency = value =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const formatDate = value => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString("pt-BR");
    } catch {
      return value;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="pagamento-modal-title"
    >
      <DialogTitle id="pagamento-modal-title">
        Pagamentos da fatura #{fatura?.id}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Histórico de pagamentos
        </Typography>
        <Box className={classes.paymentList}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : payments.length === 0 ? (
            <Typography color="textSecondary">
              Nenhum pagamento registrado.
            </Typography>
          ) : (
            payments.map(payment => (
              <Box key={payment.id} className={classes.paymentItem}>
                <Box className={classes.paymentInfo}>
                  <strong>{formatCurrency(payment.valor)}</strong>
                  <span>Método: {payment.metodoPagamento}</span>
                  <span>Data: {formatDate(payment.dataPagamento)}</span>
                  {payment.observacoes && (
                    <span>Obs.: {payment.observacoes}</span>
                  )}
                </Box>
                <Box className={classes.paymentActions}>
                  <Tooltip title="Excluir pagamento">
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePayment(payment)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Registrar novo pagamento
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Método"
              fullWidth
              value={form.metodoPagamento}
              onChange={handleChange("metodoPagamento")}
            >
              <MenuItem value="pix">Pix</MenuItem>
              <MenuItem value="cartao">Cartão</MenuItem>
              <MenuItem value="boleto">Boleto</MenuItem>
              <MenuItem value="transferencia">Transferência</MenuItem>
              <MenuItem value="dinheiro">Dinheiro</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Valor (R$)"
              type="number"
              fullWidth
              value={form.valor}
              onChange={handleChange("valor")}
              inputProps={{ min: "0", step: "0.01" }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Data de pagamento"
              type="date"
              fullWidth
              value={form.dataPagamento}
              InputLabelProps={{ shrink: true }}
              onChange={handleChange("dataPagamento")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Observações"
              fullWidth
              multiline
              rows={2}
              value={form.observacoes}
              onChange={handleChange("observacoes")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          color="primary"
          onClick={handleCreatePayment}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Registrar pagamento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PagamentoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fatura: PropTypes.shape({
    id: PropTypes.number
  })
};

PagamentoModal.defaultProps = {
  fatura: null
};

export default PagamentoModal;
