import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import MessageVariablesPicker from "../MessageVariablesPicker";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#111827",
    marginBottom: theme.spacing(1.5),
  },
  helperText: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
}));

const FlowBuilderCloseTicketModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const [activeModal, setActiveModal] = useState(false);
  const [labels, setLabels] = useState({ title: "", btn: "" });
  const [message, setMessage] = useState("");

  const initialMessage = useMemo(() => data?.data?.message || "", [data]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar encerramento", btn: "Salvar" });
      setMessage(initialMessage);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Encerrar ticket", btn: "Adicionar" });
      setMessage("");
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, initialMessage]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSave = () => {
    const payload = { message };
    if (open === "edit") {
      onUpdate({
        ...data,
        data: {
          ...data.data,
          ...payload,
        },
      });
    } else if (open === "create") {
      onSave(payload);
    }
    handleClose();
  };

  const handleInsertVariable = (variable) => {
    setMessage((old) => `${old || ""}${variable}`);
  };

  return (
    <Dialog open={activeModal} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{labels.title}</DialogTitle>
      <DialogContent dividers>
        <Paper className={classes.section} elevation={0}>
          <Typography className={classes.sectionTitle}>
            Mensagem de encerramento
          </Typography>
          <TextField
            label="Mensagem (opcional)"
            placeholder="Ex: Encerramos seu atendimento, obrigado!"
            multiline
            rows={5}
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Typography className={classes.helperText}>
            Suporta variáveis e formatação do WhatsApp (negrito, itálico, etc.).
          </Typography>
        </Paper>
        <MessageVariablesPicker onClick={handleInsertVariable} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<CancelIcon />}>
          Cancelar
        </Button>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          {labels.btn}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderCloseTicketModal;
