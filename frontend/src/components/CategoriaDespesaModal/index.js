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
  Box,
  Typography,
  Grid,
  CircularProgress,
  Chip
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const CORES_PREDEFINIDAS = [
  "#FF6B6B", // Vermelho
  "#4ECDC4", // Verde água
  "#45B7D1", // Azul
  "#96CEB4", // Verde claro
  "#FFEAA7", // Amarelo claro
  "#DDA0DD", // Roxo
  "#F4A460", // Marrom claro
  "#87CEEB", // Azul céu
  "#98D8C8", // Menta
  "#FFD93D"  // Amarelo ouro
];

const useStyles = makeStyles((theme) => ({
  colorPicker: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 4,
    cursor: "pointer",
    border: "2px solid transparent",
    "&:hover": {
      transform: "scale(1.1)",
    },
    "&.selected": {
      borderColor: theme.palette.primary.main,
    },
  },
  customColorPicker: {
    width: 40,
    height: 40,
    padding: 0,
  },
  previewContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const CategoriaDespesaModal = ({ open, onClose, categoriaEdit, onSuccess }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#6B7280",
    descricao: ""
  });

  useEffect(() => {
    if (open) {
      fetchCategorias();
      
      if (categoriaEdit) {
        setFormData({
          nome: categoriaEdit.nome || "",
          cor: categoriaEdit.cor || "#6B7280",
          descricao: categoriaEdit.descricao || ""
        });
      } else {
        // Reset form
        setFormData({
          nome: "",
          cor: "#6B7280",
          descricao: ""
        });
      }
    }
  }, [open, categoriaEdit]);

  const fetchCategorias = async () => {
    try {
      const { data } = await api.get("/despesas/categorias");
      setCategorias(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar categorias");
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleColorSelect = (cor) => {
    setFormData(prev => ({ ...prev, cor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    // Verificar se já existe categoria com mesmo nome (exceto se editando)
    const categoriaExistente = categorias.find(
      cat => cat.nome.toLowerCase() === formData.nome.toLowerCase() && 
              cat.id !== categoriaEdit?.id
    );

    if (categoriaExistente) {
      toast.error("Já existe uma categoria com este nome");
      return;
    }

    setLoading(true);

    try {
      if (categoriaEdit) {
        await api.put(`/despesas/categorias/${categoriaEdit.id}`, formData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await api.post("/despesas/categorias", formData);
        toast.success("Categoria criada com sucesso!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {categoriaEdit ? i18n.translate("categoria.modal.editTitle") : i18n.translate("categoria.modal.createTitle")}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Nome */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.translate("categoria.form.name")}
                value={formData.nome}
                onChange={handleChange("nome")}
                variant="outlined"
                required
                placeholder={i18n.translate("categoria.form.namePlaceholder")}
              />
            </Grid>

            {/* Cor */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.translate("categoria.form.color")}
              </Typography>
              <div className={classes.colorPicker}>
                {CORES_PREDEFINIDAS.map((cor) => (
                  <Box
                    key={cor}
                    className={`${classes.colorOption} ${formData.cor === cor ? "selected" : ""}`}
                    onClick={() => handleColorSelect(cor)}
                    sx={{
                      backgroundColor: cor,
                    }}
                  />
                ))}
                
                {/* Cor personalizada */}
                <TextField
                  type="color"
                  value={formData.cor}
                  onChange={handleChange("cor")}
                  variant="outlined"
                  size="small"
                  className={classes.customColorPicker}
                />
              </div>
              
              {/* Preview da cor */}
              <div className={classes.previewContainer}>
                <Typography variant="body2">
                  {i18n.translate("categoria.form.preview")}:
                </Typography>
                <Chip
                  label={formData.nome || i18n.translate("categoria.form.previewName")}
                  style={{
                    backgroundColor: formData.cor + "20",
                    color: formData.cor,
                    fontWeight: 500
                  }}
                />
              </div>
            </Grid>

            {/* Descrição */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.translate("categoria.form.description")}
                value={formData.descricao}
                onChange={handleChange("descricao")}
                variant="outlined"
                multiline
                rows={2}
                placeholder={i18n.translate("categoria.form.descriptionPlaceholder")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {i18n.translate("categoria.form.cancel")}
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
              categoriaEdit ? i18n.translate("categoria.form.update") : i18n.translate("categoria.form.create")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoriaDespesaModal;
