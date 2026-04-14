import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Receipt } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      minWidth: 450,
    },
  },
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #10b981, #059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
  },
  titleText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  dialogContent: {
    padding: "24px",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
    display: "block",
  },
  helpText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
  },
  dialogActions: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    gap: 12,
  },
  cancelButton: {
    textTransform: "none",
    fontWeight: 600,
    color: "#6b7280",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  saveButton: {
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#10b981",
    color: "#ffffff",
    borderRadius: 8,
    padding: "8px 20px",
    "&:hover": {
      backgroundColor: "#059669",
    },
  },
  infoBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 16,
    border: "1px solid #bbf7d0",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#166534",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#15803d",
    lineHeight: 1.5,
  },
}));

const FlowBuilderAsaasModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const [message, setMessage] = useState("Por favor, informe seu CPF para buscarmos seu boleto:");
  const [errorMessage, setErrorMessage] = useState("Desculpe, não encontramos nenhum boleto pendente para este CPF.");
  const [successMessage, setSuccessMessage] = useState("Encontramos seu boleto! Enviando os dados...");

  useEffect(() => {
    if (open === "edit" && data?.data) {
      setMessage(data.data.message || "Por favor, informe seu CPF para buscarmos seu boleto:");
      setErrorMessage(data.data.errorMessage || "Desculpe, não encontramos nenhum boleto pendente para este CPF.");
      setSuccessMessage(data.data.successMessage || "Encontramos seu boleto! Enviando os dados...");
    } else if (open === "create") {
      setMessage("Por favor, informe seu CPF para buscarmos seu boleto:");
      setErrorMessage("Desculpe, não encontramos nenhum boleto pendente para este CPF.");
      setSuccessMessage("Encontramos seu boleto! Enviando os dados...");
    }
  }, [open, data]);

  const handleSave = () => {
    const nodeData = {
      message,
      errorMessage,
      successMessage,
    };

    if (open === "edit") {
      onUpdate({
        ...data,
        data: nodeData,
      });
    } else {
      onSave(nodeData);
    }
    handleClose();
  };

  const handleClose = () => {
    setMessage("Por favor, informe seu CPF para buscarmos seu boleto:");
    setErrorMessage("Desculpe, não encontramos nenhum boleto pendente para este CPF.");
    setSuccessMessage("Encontramos seu boleto! Enviando os dados...");
    close();
  };

  return (
    <Dialog
      open={open === "create" || open === "edit"}
      onClose={handleClose}
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
    >
      <div className={classes.dialogTitle}>
        <div className={classes.iconWrapper}>
          <Receipt sx={{ color: "#ffffff", fontSize: 22 }} />
        </div>
        <div>
          <Typography className={classes.titleText}>
            2ª Via de Boleto - Asaas
          </Typography>
          <Typography className={classes.subtitle}>
            Recuperação automática de boleto por CPF
          </Typography>
        </div>
      </div>

      <DialogContent className={classes.dialogContent}>
        <Box className={classes.infoBox}>
          <Typography className={classes.infoTitle}>
            Como funciona?
          </Typography>
          <Typography className={classes.infoText}>
            Este nó solicita o CPF do cliente e busca automaticamente no Asaas 
            o boleto pendente mais recente. Se encontrado, envia o PDF do boleto 
            e o QR Code PIX para pagamento.
          </Typography>
        </Box>

        <div className={classes.field}>
          <label className={classes.label}>Mensagem de solicitação do CPF</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite a mensagem para solicitar o CPF..."
          />
          <Typography className={classes.helpText}>
            Esta mensagem será enviada para solicitar o CPF do cliente
          </Typography>
        </div>

        <div className={classes.field}>
          <label className={classes.label}>Mensagem de sucesso</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            placeholder="Mensagem quando o boleto for encontrado..."
          />
          <Typography className={classes.helpText}>
            Enviada antes de enviar o boleto e QR Code PIX
          </Typography>
        </div>

        <div className={classes.field}>
          <label className={classes.label}>Mensagem de erro</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="Mensagem quando não encontrar boleto..."
          />
          <Typography className={classes.helpText}>
            Enviada quando não houver boleto pendente ou CPF inválido
          </Typography>
        </div>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} className={classes.cancelButton}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className={classes.saveButton}
          variant="contained"
        >
          {open === "edit" ? "Atualizar" : "Adicionar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAsaasModal;
