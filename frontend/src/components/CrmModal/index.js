import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    borderRadius: "16px",
    maxWidth: "600px",
    width: "90vw",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: theme.spacing(2.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    color: "white",
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
    },
  },
  cancelButton: {
    color: "#666",
    marginRight: theme.spacing(1),
  },
}));

const CrmModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    segmento: "",
    mensagem: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar email via API do backend
      await api.post("/send-crm-email", {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        empresa: formData.empresa,
        segmento: formData.segmento,
        mensagem: formData.mensagem,
      });

      toast.success("Solicitação enviada por email com sucesso! Entraremos em contato em breve.");
      onClose();
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        segmento: "",
        mensagem: "",
      });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar solicitação por email. Tente novamente ou entre em contato conosco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      maxWidth="md"
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          Sistema CRM Personalizado
        </Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body1" style={{ marginBottom: "24px", color: "#666" }}>
            Solicite um orçamento para seu sistema CRM personalizado. Atendemos clínicas, academias, imobiliárias, advogacias e muito mais.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nome"
                label="Nome Completo"
                value={formData.nome}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefone"
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="empresa"
                label="Nome da Empresa"
                value={formData.empresa}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth className={classes.formControl}>
                <InputLabel>Segmento</InputLabel>
                <Select
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleChange}
                  label="Segmento"
                  required
                >
                  <MenuItem value="clinica">Clínica Médica</MenuItem>
                  <MenuItem value="academia">Academia</MenuItem>
                  <MenuItem value="imobiliaria">Imobiliária</MenuItem>
                  <MenuItem value="advocacia">Advocacia</MenuItem>
                  <MenuItem value="consultoria">Consultoria</MenuItem>
                  <MenuItem value="comercio">Comércio</MenuItem>
                  <MenuItem value="servicos">Serviços</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="mensagem"
                label="Descreva suas necessidades"
                value={formData.mensagem}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                className={classes.formControl}
                placeholder="Conte-nos sobre sua empresa e quais funcionalidades você precisa no CRM..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions style={{ padding: "16px 24px" }}>
          <Button onClick={onClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Solicitar Orçamento"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CrmModal;
