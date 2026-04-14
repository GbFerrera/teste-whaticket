import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { Edit as EditIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      maxWidth: "500px",
      width: "100%",
    },
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#00a884",
  },
  content: {
    padding: "20px 24px",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#e9edef",
      },
      "&:hover fieldset": {
        borderColor: "#00a884",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00a884",
      },
    },
  },
  actions: {
    padding: "16px 24px",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelButton: {
    color: "#667781",
  },
  saveButton: {
    backgroundColor: "#00a884",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#008f6f",
    },
  },
}));

const EditMessageModal = ({ open, onClose, onSave, initialMessage }) => {
  const classes = useStyles();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSave = () => {
    if (message.trim()) {
      onSave(message);
      setMessage("");
    }
  };

  const handleClose = () => {
    setMessage(initialMessage || "");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className={classes.dialog}>
      <DialogTitle className={classes.title}>
        <EditIcon />
        Editar mensagem
      </DialogTitle>
      <DialogContent className={classes.content}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite a mensagem..."
          className={classes.textField}
          autoFocus
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={handleClose} className={classes.cancelButton}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className={classes.saveButton}
          disabled={!message.trim()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMessageModal;
