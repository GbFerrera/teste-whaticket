import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
} from "@material-ui/core";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import NotificationsOffIcon from "@material-ui/icons/NotificationsOff";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 20,
      maxWidth: 340,
      width: "100%",
      margin: 16,
      overflow: "hidden",
    },
  },
  content: {
    padding: theme.spacing(4, 3),
    textAlign: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
  },
  icon: {
    fontSize: 40,
    color: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  allowButton: {
    padding: "14px 24px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    textTransform: "none",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
    },
  },
  denyButton: {
    padding: "14px 24px",
    borderRadius: 12,
    background: "transparent",
    color: "#6b7280",
    fontWeight: 500,
    fontSize: 14,
    textTransform: "none",
    "&:hover": {
      background: "#f3f4f6",
    },
  },
  featureList: {
    textAlign: "left",
    marginBottom: 24,
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    fontSize: 13,
    color: "#4b5563",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  featureIcon: {
    fontSize: 18,
    color: "#667eea",
  },
}));

const STORAGE_KEY = "whaticket_notification_permission";

const NotificationPermissionModal = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  // Detectar se está em um WebView
  const isWebView = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (
      /wv/.test(userAgent) ||
      /WebView/.test(userAgent) ||
      (window.Android !== undefined) ||
      (window.AndroidNotification !== undefined) ||
      (window.webkit?.messageHandlers?.iOSNotification !== undefined) ||
      (window.ReactNativeWebView !== undefined)
    );
  };

  useEffect(() => {
    // Verificar se já respondeu antes
    const permission = localStorage.getItem(STORAGE_KEY);
    
    // Se está em WebView e ainda não respondeu, mostrar modal
    if (isWebView() && !permission) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = () => {
    // Salvar permissão
    localStorage.setItem(STORAGE_KEY, "granted");
    
    // Notificar o app nativo que as notificações foram permitidas
    try {
      if (window.Android?.onNotificationPermission) {
        window.Android.onNotificationPermission(true);
      }
      if (window.AndroidNotification?.onNotificationPermission) {
        window.AndroidNotification.onNotificationPermission(true);
      }
      if (window.webkit?.messageHandlers?.notificationPermission) {
        window.webkit.messageHandlers.notificationPermission.postMessage({ granted: true });
      }
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "notification_permission",
          granted: true
        }));
      }
    } catch (error) {
      console.error("[NotificationPermission] Erro ao notificar app:", error);
    }

    // Também solicitar permissão do navegador (para notificações web)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setOpen(false);
  };

  const handleDeny = () => {
    // Salvar que negou
    localStorage.setItem(STORAGE_KEY, "denied");
    
    // Notificar o app nativo
    try {
      if (window.Android?.onNotificationPermission) {
        window.Android.onNotificationPermission(false);
      }
      if (window.AndroidNotification?.onNotificationPermission) {
        window.AndroidNotification.onNotificationPermission(false);
      }
      if (window.webkit?.messageHandlers?.notificationPermission) {
        window.webkit.messageHandlers.notificationPermission.postMessage({ granted: false });
      }
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "notification_permission",
          granted: false
        }));
      }
    } catch (error) {
      console.error("[NotificationPermission] Erro ao notificar app:", error);
    }

    setOpen(false);
  };

  // Expor função para resetar permissão (útil para testes)
  useEffect(() => {
    window.resetNotificationPermission = () => {
      localStorage.removeItem(STORAGE_KEY);
      setOpen(true);
    };
    
    return () => {
      delete window.resetNotificationPermission;
    };
  }, []);

  return (
    <Dialog
      open={open}
      className={classes.dialog}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogContent className={classes.content}>
        <Box className={classes.iconContainer}>
          <NotificationsActiveIcon className={classes.icon} />
        </Box>

        <Typography className={classes.title}>
          Ativar Notificações
        </Typography>

        <Typography className={classes.description}>
          Receba alertas instantâneos quando novas mensagens chegarem, 
          mesmo quando o app estiver em segundo plano.
        </Typography>

        <Box className={classes.featureList}>
          <div className={classes.featureItem}>
            <NotificationsActiveIcon className={classes.featureIcon} />
            <span>Alertas de novas mensagens</span>
          </div>
          <div className={classes.featureItem}>
            <NotificationsActiveIcon className={classes.featureIcon} />
            <span>Nome e foto do contato</span>
          </div>
          <div className={classes.featureItem}>
            <NotificationsActiveIcon className={classes.featureIcon} />
            <span>Acesso rápido à conversa</span>
          </div>
        </Box>

        <Box className={classes.buttonContainer}>
          <Button
            className={classes.allowButton}
            onClick={handleAllow}
            fullWidth
          >
            Permitir Notificações
          </Button>
          <Button
            className={classes.denyButton}
            onClick={handleDeny}
            fullWidth
          >
            Agora não
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionModal;
