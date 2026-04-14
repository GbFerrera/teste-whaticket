import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Warning as WarningIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      maxWidth: "400px",
    },
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#d32f2f",
  },
  content: {
    padding: "20px 24px",
  },
  actions: {
    padding: "16px 24px",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelButton: {
    color: "#667781",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#b71c1c",
    },
  },
}));

const DeleteConfirmModal = ({ open, onClose, onConfirm, messageText }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog}>
      <DialogTitle className={classes.title}>
        <WarningIcon />
        Excluir mensagem
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2" color="textSecondary">
          Tem certeza que deseja excluir esta mensagem?
        </Typography>
        {messageText && (
          <Typography
            variant="body2"
            style={{
              marginTop: "12px",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontStyle: "italic",
            }}
          >
            "{messageText.substring(0, 100)}
            {messageText.length > 100 ? "..." : ""}"
          </Typography>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose} className={classes.cancelButton}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className={classes.deleteButton}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;
