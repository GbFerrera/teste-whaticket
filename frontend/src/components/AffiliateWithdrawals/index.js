import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Refresh, Add } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  withdrawalItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  withdrawalAmount: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  withdrawalDetails: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
}));

const AffiliateWithdrawals = ({ withdrawals, onRefresh }) => {
  const classes = useStyles();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "pix",
    paymentDetails: {
      pixKey: "",
    },
  });

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "primary";
      case "rejected":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRequestWithdrawal = async () => {
    try {
      await api.post("/affiliate/withdraw", {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails,
      });
      toast.success("Saque solicitado com sucesso!");
      setShowRequestDialog(false);
      setFormData({
        amount: "",
        paymentMethod: "pix",
        paymentDetails: { pixKey: "" },
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      toast.error(error.response?.data?.error || "Erro ao solicitar saque");
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Saques ({withdrawals?.length || 0})
            </Typography>
            <Box display="flex" style={{ gap: 8 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRefresh}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setShowRequestDialog(true)}
              >
                Solicitar Saque
              </Button>
            </Box>
          </Box>

          {(!withdrawals || withdrawals.length === 0) ? (
            <div className={classes.emptyState}>
              <Typography variant="body1" color="textSecondary">
                Nenhum saque solicitado.
              </Typography>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className={classes.withdrawalItem}>
                <div>
                  <Typography variant="body1" className={classes.withdrawalAmount}>
                    R$ {withdrawal.amount?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    {withdrawal.paymentMethod?.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" className={classes.withdrawalDetails}>
                    {formatDate(withdrawal.createdAt)}
                  </Typography>
                </div>
                <Chip
                  size="small"
                  label={getStatusText(withdrawal.status)}
                  color={getStatusColor(withdrawal.status)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Solicitar Saque</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Valor (R$)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className={classes.formField}
          />
          <FormControl fullWidth className={classes.formField}>
            <InputLabel>Método de Pagamento</InputLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              label="Método de Pagamento"
            >
              <MenuItem value="pix">PIX</MenuItem>
              <MenuItem value="bank_transfer">Transferência Bancária</MenuItem>
            </Select>
          </FormControl>
          {formData.paymentMethod === "pix" && (
            <TextField
              fullWidth
              label="Chave PIX"
              value={formData.paymentDetails.pixKey || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentDetails: { ...formData.paymentDetails, pixKey: e.target.value },
                })
              }
              className={classes.formField}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestWithdrawal}
          >
            Solicitar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AffiliateWithdrawals;
