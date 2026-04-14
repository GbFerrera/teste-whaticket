import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  makeStyles
} from "@material-ui/core";
import { toast } from "react-toastify";

import {
  createMediaFolder,
  updateMediaFolder
} from "../../services/mediaLibraryService";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    fontWeight: 600
  },
  dialogContent: {
    paddingTop: theme.spacing(3)
  },
  formField: {
    marginBottom: theme.spacing(2)
  },
  dialogActions: {
    padding: theme.spacing(2, 3)
  }
}));

const MediaFolderModal = ({ open, onClose, folder, onSuccess }) => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(folder?.name || "");
    setDescription(folder?.description || "");
  }, [folder, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("O nome da pasta é obrigatório.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined
      };

      if (folder?.id) {
        await updateMediaFolder(folder.id, payload);
        toast.success("Pasta atualizada com sucesso!");
      } else {
        await createMediaFolder(payload);
        toast.success("Pasta criada com sucesso!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className={classes.dialogTitle}>
        {folder ? "Editar pasta" : "Nova pasta"}
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form id="media-folder-form" onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={classes.formField}
            required
          />
          <TextField
            label="Descrição"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={classes.formField}
            multiline
            rows={3}
          />
        </form>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          form="media-folder-form"
          disabled={submitting}
        >
          {folder ? "Salvar alterações" : "Criar pasta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaFolderModal;
