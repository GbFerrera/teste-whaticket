import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import {
  createSliderBanner,
  updateSliderBanner
} from "../../services/sliderHomeService";

const useStyles = makeStyles((theme) => ({
  previewWrapper: {
    marginTop: theme.spacing(2),
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: `1px dashed ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    borderRadius: 8,
    maxHeight: 240,
    objectFit: "cover",
  },
  uploadInput: {
    marginTop: theme.spacing(2),
  }
}));

const SliderBannerModal = ({ open, onClose, banner, onSuccess }) => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(banner?.name || "");
    setPreviewUrl(banner?.image || "");
    setImageFile(null);
  }, [banner]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, "");
    return baseUrl ? `${baseUrl}/${path}` : path;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome do banner");
      return;
    }
    if (!banner && !imageFile) {
      toast.error("Selecione uma imagem PNG para o banner");
      return;
    }

    setSaving(true);
    try {
      if (banner) {
        await updateSliderBanner(banner.id, { name, image: imageFile || undefined });
        toast.success("Banner atualizado com sucesso!");
      } else {
        await createSliderBanner({ name, image: imageFile });
        toast.success("Banner criado com sucesso!");
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      toast.error("Não foi possível salvar o banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{banner ? "Editar Banner" : "Novo Banner"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do Banner"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Box className={classes.uploadInput}>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <Typography variant="caption" color="textSecondary">
            Recomendado: imagens horizontais em PNG ou JPG.
          </Typography>
        </Box>

        {previewUrl && (
          <Box className={classes.previewWrapper}>
            <img
              src={imageFile ? previewUrl : getImageUrl(previewUrl)}
              alt="Pré-visualização"
              className={classes.previewImage}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving}>
          {banner ? "Salvar" : "Cadastrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SliderBannerModal;
