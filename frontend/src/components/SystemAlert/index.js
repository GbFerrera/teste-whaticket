import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  makeStyles,
  Slide,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import WarningIcon from "@material-ui/icons/Warning";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import InfoIcon from "@material-ui/icons/Info";
import ErrorIcon from "@material-ui/icons/Error";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      overflow: "hidden",
      minWidth: 380,
      maxWidth: 480,
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 12px",
    position: "relative",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    fontSize: "1.15rem",
    color: "#1a1a2e",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    color: "#9ca3af",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
  },
  content: {
    padding: "8px 24px 20px",
  },
  message: {
    fontSize: "0.95rem",
    color: "#4b5563",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
  actions: {
    padding: "12px 24px 20px",
    justifyContent: "flex-end",
    gap: 8,
  },
  confirmButton: {
    borderRadius: 10,
    padding: "8px 28px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.9rem",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  cancelButton: {
    borderRadius: 10,
    padding: "8px 28px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.9rem",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  },
}));

const alertConfig = {
  warning: {
    icon: <WarningIcon style={{ fontSize: 28, color: "#fff" }} />,
    iconBg: "#f59e0b",
    buttonColor: "#f59e0b",
    defaultTitle: "Atenção",
  },
  success: {
    icon: <CheckCircleIcon style={{ fontSize: 28, color: "#fff" }} />,
    iconBg: "#10b981",
    buttonColor: "#10b981",
    defaultTitle: "Sucesso",
  },
  info: {
    icon: <InfoIcon style={{ fontSize: 28, color: "#fff" }} />,
    iconBg: "#3b82f6",
    buttonColor: "#3b82f6",
    defaultTitle: "Informação",
  },
  error: {
    icon: <ErrorIcon style={{ fontSize: 28, color: "#fff" }} />,
    iconBg: "#ef4444",
    buttonColor: "#ef4444",
    defaultTitle: "Erro",
  },
};

const SystemAlertContext = createContext();

export const useSystemAlert = () => {
  const context = useContext(SystemAlertContext);
  if (!context) {
    throw new Error("useSystemAlert must be used within SystemAlertProvider");
  }
  return context;
};

export const SystemAlertProvider = ({ children }) => {
  const classes = useStyles();
  const resolveRef = useRef(null);
  const [alertState, setAlertState] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback(({
    type = "warning",
    title,
    message,
    confirmText = "OK",
    cancelText = "",
    onConfirm,
    onCancel,
  }) => {
    setAlertState({
      open: true,
      type,
      title: title || alertConfig[type]?.defaultTitle || "Aviso",
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  }, []);

  const showConfirm = useCallback(({
    type = "warning",
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
  }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setAlertState({
        open: true,
        type,
        title: title || alertConfig[type]?.defaultTitle || "Confirmação",
        message,
        confirmText,
        cancelText,
        onConfirm: null,
        onCancel: null,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    if (alertState.onCancel) alertState.onCancel();
    setAlertState((prev) => ({ ...prev, open: false }));
  }, [alertState]);

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    if (alertState.onConfirm) alertState.onConfirm();
    setAlertState((prev) => ({ ...prev, open: false }));
  }, [alertState]);

  const config = alertConfig[alertState.type] || alertConfig.warning;

  return (
    <SystemAlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog
        open={alertState.open}
        onClose={handleClose}
        TransitionComponent={Transition}
        className={classes.dialog}
        maxWidth="sm"
      >
        <div className={classes.header}>
          <div className={classes.headerContent}>
            <div
              className={classes.iconWrapper}
              style={{ backgroundColor: config.iconBg }}
            >
              {config.icon}
            </div>
            <Typography className={classes.title}>{alertState.title}</Typography>
          </div>
          <IconButton className={classes.closeButton} onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <DialogContent className={classes.content}>
          <Typography className={classes.message}>{alertState.message}</Typography>
        </DialogContent>

        <DialogActions className={classes.actions}>
          {alertState.cancelText && (
            <Button
              onClick={handleClose}
              className={classes.cancelButton}
              variant="outlined"
            >
              {alertState.cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={classes.confirmButton}
            variant="contained"
            style={{ backgroundColor: config.buttonColor, color: "#fff" }}
          >
            {alertState.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </SystemAlertContext.Provider>
  );
};

export default SystemAlertProvider;
