import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: "#444394",
    color: "white",
    padding: theme.spacing(2),
  },
  dialogContent: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(3),
  },
  dialogActions: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
  },
}));

const GoogleCalendarIntegrationModal = ({ open, onClose }) => {
  const classes = useStyles();

  const handleConnect = async () => {
    try {
      const { data } = await api.get("/google-calendar/auth-url");
      if (data && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        Google Calendar
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body1" gutterBottom>
          {i18n.t("queueIntegration.googleCalendar.description", {
            defaultValue:
              "Conecte a agenda do Google da sua empresa para sincronizar seus compromissos com o sistema. Ao continuar, você será redirecionado para a página de autorização do Google."
          })}
        </Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} color="secondary" variant="contained">
          {i18n.t("queueIntegration.googleCalendar.cancel", { defaultValue: "Cancelar" })}
        </Button>
        <Button onClick={handleConnect} color="primary" variant="contained">
          {i18n.t("queueIntegration.googleCalendar.connect", { defaultValue: "Conectar Google Agenda" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoogleCalendarIntegrationModal;
