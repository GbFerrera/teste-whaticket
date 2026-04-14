import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { toast } from "react-toastify";
import api from "../../services/api";

const ParcelamentoModal = ({ open, onClose, fatura, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [valorEntrada, setValorEntrada] = useState("");
  const [parcelas, setParcelas] = useState([
    { valor: "", dataVencimento: "", descricao: "" }
  ]);

  useEffect(() => {
    if (open && fatura) {
      setValorEntrada("");
      setParcelas([{ valor: "", dataVencimento: "", descricao: "" }]);
    }
  }, [open, fatura]);

  const handleAddParcela = () => {
    setParcelas([...parcelas, { valor: "", dataVencimento: "", descricao: "" }]);
  };

  const handleRemoveParcela = (index) => {
    setParcelas(parcelas.filter((_, i) => i !== index));
  };

  const handleParcelaChange = (index, field, value) => {
    const newParcelas = [...parcelas];
    newParcelas[index][field] = value;
    setParcelas(newParcelas);
  };

  const calcularTotalParcelas = () => {
    return parcelas.reduce((sum, parcela) => sum + (Number(parcela.valor) || 0), 0);
  };

  const calcularTotalGeral = () => {
    return Number(valorEntrada || 0) + calcularTotalParcelas();
  };

  const handleSubmit = async () => {
    if (!fatura) return;

    // Validações
    if (!valorEntrada || Number(valorEntrada) <= 0) {
      toast.error("Informe o valor da entrada");
      return;
    }

    if (parcelas.some(p => !p.valor || Number(p.valor) <= 0)) {
      toast.error("Todas as parcelas devem ter um valor positivo");
      return;
    }

    if (parcelas.some(p => !p.dataVencimento)) {
      toast.error("Todas as parcelas devem ter uma data de vencimento");
      return;
    }

    const totalGeral = calcularTotalGeral();
    const valorFatura = Number(fatura.valor);

    if (Math.abs(totalGeral - valorFatura) > 0.01) {
      toast.error(`A soma dos valores (${totalGeral.toFixed(2)}) não corresponde ao valor da fatura (${valorFatura.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        faturaId: fatura.id,
        valorEntrada: Number(valorEntrada),
        parcelas: parcelas.map(p => ({
          valor: Number(p.valor),
          dataVencimento: p.dataVencimento,
          descricao: p.descricao || `Parcela`
        }))
      };

      await api.post("/parcelamento", payload);
      toast.success("Parcelamento criado com sucesso!");
      
      if (onSaved) {
        onSaved();
      }
      
      handleClose();
    } catch (error) {
      console.error("Erro ao criar parcelamento:", error);
      toast.error(error.response?.data?.error || "Erro ao criar parcelamento");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="parcelamento-dialog-title"
    >
      <DialogTitle id="parcelamento-dialog-title">
        Parcelar Fatura #{fatura?.id}
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Valor da Fatura: {fatura ? `R$ ${Number(fatura.valor).toFixed(2)}` : ""}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor de Entrada"
              type="number"
              fullWidth
              value={valorEntrada}
              onChange={(e) => setValorEntrada(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Saldo a Parcelar"
              type="number"
              fullWidth
              value={Number(fatura?.valor || 0) - Number(valorEntrada || 0)}
              disabled
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Parcelas
          </Typography>

          {parcelas.map((parcela, index) => (
            <Box key={index} mb={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    label={`Parcela ${index + 1}`}
                    type="number"
                    fullWidth
                    value={parcela.valor}
                    onChange={(e) => handleParcelaChange(index, "valor", e.target.value)}
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Vencimento"
                    type="date"
                    fullWidth
                    value={parcela.dataVencimento}
                    onChange={(e) => handleParcelaChange(index, "dataVencimento", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Descrição"
                    fullWidth
                    value={parcela.descricao}
                    onChange={(e) => handleParcelaChange(index, "descricao", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  {parcelas.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveParcela(index)}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}

          <Box mt={2}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddParcela}
              variant="outlined"
              color="primary"
            >
              Adicionar Parcela
            </Button>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="textSecondary">
            Total das Parcelas: R$ {calcularTotalParcelas().toFixed(2)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Entrada: R$ {Number(valorEntrada || 0).toFixed(2)}
          </Typography>
          <Typography variant="h6" color="primary">
            Total Geral: R$ {calcularTotalGeral().toFixed(2)}
          </Typography>
          {Math.abs(calcularTotalGeral() - Number(fatura?.valor || 0)) > 0.01 && (
            <Typography variant="body2" color="error">
              ⚠️ A soma dos valores não corresponde ao valor da fatura
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || Math.abs(calcularTotalGeral() - Number(fatura?.valor || 0)) > 0.01}
        >
          {loading ? "Processando..." : "Parcelar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParcelamentoModal;
