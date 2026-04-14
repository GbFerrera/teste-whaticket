import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  Box,
  CircularProgress
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[2],
  },
}));

const DespesaModal = ({ open, onClose, despesaEdit, onSuccess }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [contatos, setContatos] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    titulo: "",
    valor: "",
    dataVencimento: moment().format("YYYY-MM-DD"),
    categoriaId: "",
    contatoId: "",
    recorrente: false,
    tipoRecorrencia: "mensal",
    observacoes: ""
  });

  useEffect(() => {
    if (open) {
      fetchCategorias();
      fetchContatos();
      
      if (despesaEdit) {
        setFormData({
          titulo: despesaEdit.titulo || "",
          valor: despesaEdit.valor || "",
          dataVencimento: moment(despesaEdit.dataVencimento).format("YYYY-MM-DD"),
          categoriaId: despesaEdit.categoriaId || "",
          contatoId: despesaEdit.contatoId || "",
          recorrente: despesaEdit.recorrente || false,
          tipoRecorrencia: despesaEdit.tipoRecorrencia || "mensal",
          observacoes: despesaEdit.observacoes || ""
        });
      } else {
        // Reset form
        setFormData({
          titulo: "",
          valor: "",
          dataVencimento: moment().format("YYYY-MM-DD"),
          categoriaId: "",
          contatoId: "",
          recorrente: false,
          tipoRecorrencia: "mensal",
          observacoes: ""
        });
      }
    }
  }, [open, despesaEdit]);

  const fetchCategorias = async () => {
    try {
      const { data } = await api.get("/despesas/categorias");
      setCategorias(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar categorias");
    }
  };

  const fetchContatos = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: { pageNumber: 1, limit: 100 }
      });
      setContatos(data.contacts || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar contatos");
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === "recorrente" ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }
    
    if (!formData.dataVencimento) {
      toast.error("Data de vencimento é obrigatória");
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        valor: parseFloat(formData.valor)
      };

      if (despesaEdit) {
        await api.put(/despesas/, dataToSend);
        toast.success("Despesa atualizada com sucesso!");
      } else {
        await api.post("/despesas", dataToSend);
        toast.success("Despesa criada com sucesso!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar despesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {despesaEdit ? i18n.translate("despesa.modal.editTitle") : i18n.translate("despesa.modal.createTitle")}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.translate("despesa.form.title")}
                value={formData.titulo}
                onChange={handleChange("titulo")}
                variant="outlined"
                required
                placeholder={i18n.translate("despesa.form.titlePlaceholder")}
              />
            </Grid>

            {/* Valor e Data */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={i18n.translate("despesa.form.value")}
                value={formData.valor}
                onChange={handleChange("valor")}
                variant="outlined"
                required
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="0,00"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={i18n.translate("despesa.form.dueDate")}
                type="date"
                value={formData.dataVencimento}
                onChange={handleChange("dataVencimento")}
                variant="outlined"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Categoria e Contato */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{i18n.translate("despesa.form.category")}</InputLabel>
                <Select
                  value={formData.categoriaId}
                  onChange={handleChange("categoriaId")}
                  label={i18n.translate("despesa.form.category")}
                >
                  <MenuItem value="">{i18n.translate("despesa.form.noCategory")}</MenuItem>
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          width={12}
                          height={12}
                          borderRadius="50%"
                          bgcolor={categoria.cor}
                        />
                        {categoria.nome}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{i18n.translate("despesa.form.contact")}</InputLabel>
                <Select
                  value={formData.contatoId}
                  onChange={handleChange("contatoId")}
                  label={i18n.translate("despesa.form.contact")}
                >
                  <MenuItem value="">{i18n.translate("despesa.form.noContact")}</MenuItem>
                  {contatos.map((contato) => (
                    <MenuItem key={contato.id} value={contato.id}>
                      {contato.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Recorrência */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.recorrente}
                    onChange={handleChange("recorrente")}
                    color="primary"
                  />
                }
                label={i18n.translate("despesa.form.recurring")}
              />
            </Grid>

            {formData.recorrente && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>{i18n.translate("despesa.form.recurringType")}</InputLabel>
                  <Select
                    value={formData.tipoRecorrencia}
                    onChange={handleChange("tipoRecorrencia")}
                    label={i18n.translate("despesa.form.recurringType")}
                  >
                    <MenuItem value="diario">{i18n.translate("despesa.form.daily")}</MenuItem>
                    <MenuItem value="semanal">{i18n.translate("despesa.form.weekly")}</MenuItem>
                    <MenuItem value="mensal">{i18n.translate("despesa.form.monthly")}</MenuItem>
                    <MenuItem value="anual">{i18n.translate("despesa.form.yearly")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.translate("despesa.form.notes")}
                value={formData.observacoes}
                onChange={handleChange("observacoes")}
                variant="outlined"
                multiline
                rows={3}
                placeholder={i18n.translate("despesa.form.notesPlaceholder")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {i18n.translate("despesa.form.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              despesaEdit ? i18n.translate("despesa.form.update") : i18n.translate("despesa.form.create")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DespesaModal;
