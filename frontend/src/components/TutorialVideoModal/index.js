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
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import { createTutorialVideo, updateTutorialVideo, getVideoThumbnailFallback } from "../../services/tutorialVideoService";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: 600,
    maxWidth: 800,
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  characterCount: {
    textAlign: "right",
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
}));

const TutorialVideoModal = ({
  open,
  onClose,
  tutorialVideo = null,
  onSuccess,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: ""
  });

  const isEditing = !!tutorialVideo;

  useEffect(() => {
    if (tutorialVideo) {
      setFormData({
        title: tutorialVideo.title || "",
        description: tutorialVideo.description || "",
        videoUrl: tutorialVideo.videoUrl || "",
        thumbnailUrl: tutorialVideo.thumbnailUrl || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: ""
      });
    }
  }, [tutorialVideo, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!formData.videoUrl.trim()) {
      toast.error("URL do vídeo é obrigatória");
      return;
    }

    if (formData.description && formData.description.length > 300) {
      toast.error("Descrição deve ter no máximo 300 caracteres");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl?.trim() || getVideoThumbnailFallback(formData.videoUrl.trim()) || undefined
      };

      let response;
      if (isEditing) {
        response = await updateTutorialVideo(tutorialVideo.id, payload);
        toast.success("Vídeo atualizado com sucesso!");
      } else {
        response = await createTutorialVideo(payload);
        toast.success("Vídeo criado com sucesso!");
      }

      onSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar vídeo:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar vídeo");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: "", description: "", videoUrl: "", thumbnailUrl: "" });
      onClose();
    }
  };

  const getCharacterCount = (text) => {
    return text ? text.length : 0;
  };

  const isDescriptionValid = () => {
    return getCharacterCount(formData.description) <= 300;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6">
          {isEditing ? "Editar Vídeo Tutorial" : "Novo Vídeo Tutorial"}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
            <Typography variant="body1" style={{ marginLeft: 16 }}>
              {isEditing ? "Atualizando..." : "Criando..."} vídeo tutorial...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Título */}
            <TextField
              label="Título *"
              variant="outlined"
              fullWidth
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={classes.formField}
              disabled={loading}
            />

            {/* Descrição */}
            <TextField
              label="Descrição"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={classes.formField}
              disabled={loading}
              error={!isDescriptionValid()}
              helperText={
                !isDescriptionValid() 
                  ? "Descrição deve ter no máximo 300 caracteres"
                  : ""
              }
            />
            <Typography 
              className={classes.characterCount}
              color={isDescriptionValid() ? "textSecondary" : "error"}
            >
              {getCharacterCount(formData.description)}/300 caracteres
            </Typography>

            {/* URL do Vídeo */}
            <TextField
              label="URL do Vídeo (YouTube) *"
              variant="outlined"
              fullWidth
              value={formData.videoUrl}
              onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              className={classes.formField}
              disabled={loading}
              placeholder="https://www.youtube.com/watch?v=..."
            />

            {/* Thumbnail Opcional */}
            <TextField
              label="URL da Thumbnail (opcional)"
              variant="outlined"
              fullWidth
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
              className={classes.formField}
              disabled={loading}
              helperText="Se vazio, tentaremos usar automaticamente a thumbnail do YouTube"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions style={{ padding: 16, borderTop: "1px solid #e0e0e0" }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            !formData.title.trim() ||
            !formData.videoUrl.trim() ||
            !isDescriptionValid()
          }
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TutorialVideoModal;
