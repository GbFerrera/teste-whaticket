import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import { toast } from "react-toastify";
import api from "../../services/api";
import moment from "moment";

const DespesaForm = ({ open, onClose, despesaEdit, onSuccess }) => {
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
        await api.put(`/despesas/${despesaEdit.id}`, dataToSend);
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
        {despesaEdit ? "Editar Despesa" : "Nova Despesa"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título da Despesa"
                value={formData.titulo}
                onChange={handleChange("titulo")}
                variant="outlined"
                required
                placeholder="Ex: Conta de luz - Março"
              />
            </Grid>

            {/* Valor e Data */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor (R$)"
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
                label="Data de Vencimento"
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
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoriaId}
                  onChange={handleChange("categoriaId")}
                  label="Categoria"
                >
                  <MenuItem value="">Sem categoria</MenuItem>
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
                <InputLabel>Vincular a Cliente (Opcional)</InputLabel>
                <Select
                  value={formData.contatoId}
                  onChange={handleChange("contatoId")}
                  label="Vincular a Cliente (Opcional)"
                >
                  <MenuItem value="">Nenhum</MenuItem>
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
                label="Despesa Recorrente"
              />
            </Grid>

            {formData.recorrente && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Recorrência</InputLabel>
                  <Select
                    value={formData.tipoRecorrencia}
                    onChange={handleChange("tipoRecorrencia")}
                    label="Tipo de Recorrência"
                  >
                    <MenuItem value="diario">Diário</MenuItem>
                    <MenuItem value="semanal">Semanal</MenuItem>
                    <MenuItem value="mensal">Mensal</MenuItem>
                    <MenuItem value="anual">Anual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações (Opcional)"
                value={formData.observacoes}
                onChange={handleChange("observacoes")}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Adicione informações adicionais sobre esta despesa..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
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
              despesaEdit ? "Atualizar" : "Criar"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DespesaForm;
