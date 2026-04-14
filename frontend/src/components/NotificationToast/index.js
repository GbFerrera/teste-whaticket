import React, { useState, useEffect, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, IconButton, Typography, Slide } from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 360,
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    backgroundColor: theme.palette.type === "dark" ? "#2d2d2d" : "#ffffff",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    cursor: "pointer",
    pointerEvents: "auto",
    transition: "all 0.3s ease",
    border: `1px solid ${theme.palette.type === "dark" ? "#404040" : "#e0e0e0"}`,
    "&:hover": {
      transform: "translateX(-4px)",
      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
    },
  },
  toastTransfer: {
    borderLeft: "4px solid #4caf50",
  },
  toastMessage: {
    borderLeft: "4px solid #2196f3",
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: theme.palette.primary.main,
    fontSize: 16,
    fontWeight: 600,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.type === "dark" ? "#fff" : "#1a1a1a",
    marginBottom: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    fontSize: 12,
    color: theme.palette.type === "dark" ? "#b0b0b0" : "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
    color: theme.palette.type === "dark" ? "#888" : "#999",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#404040" : "#f5f5f5",
    },
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 10,
    marginBottom: 4,
    display: "inline-block",
  },
  badgeTransfer: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  badgeMessage: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
}));

const NotificationToast = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => {
      // Limita a 3 notificações visíveis
      const newNotifications = [...prev, { ...notification, id }];
      if (newNotifications.length > 3) {
        return newNotifications.slice(-3);
      }
      return newNotifications;
    });

    // Auto-remove após 6 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  }, [removeNotification]);

  const handleNotificationClick = useCallback((notification) => {
    // Apenas fecha a notificação ao clicar
    removeNotification(notification.id);
  }, [removeNotification]);

  useEffect(() => {
    // Verifica se o socket está disponível e tem o método 'on'
    if (!user?.companyId || !socket || typeof socket.on !== 'function') {
      console.log("[NotificationToast] Sem companyId ou socket inválido, aguardando...");
      return;
    }

    const companyId = user.companyId;
    console.log("[NotificationToast] Registrando listeners para company:", companyId);

    // Listener para novos tickets (transferências)
    const handleTicket = (data) => {
      console.log("[NotificationToast] Evento ticket recebido:", data.action, data.ticket?.id);
      
      if (data.action === "update" || data.action === "create") {
        const ticket = data.ticket;
        
        // Ignora grupos
        if (ticket?.isGroup) {
          console.log("[NotificationToast] Ignorando grupo");
          return;
        }

        // Verifica se o ticket pertence às filas do usuário
        const userQueueIds = user?.queues?.map((q) => q.id) || [];
        const belongsToUserQueue = !ticket?.queueId || userQueueIds.includes(ticket.queueId);

        // Verifica se é uma transferência para o usuário
        const isTransferToMe = ticket?.userId === user?.id && data.action === "update";
        
        // Verifica se é um ticket pendente nas filas do usuário
        const isPendingInMyQueue = ticket?.status === "pending" && belongsToUserQueue && !ticket?.userId;

        console.log("[NotificationToast] Ticket check:", {
          belongsToUserQueue,
          isTransferToMe,
          isPendingInMyQueue,
          ticketUserId: ticket?.userId,
          myUserId: user?.id,
          ticketStatus: ticket?.status
        });

        if (isTransferToMe || isPendingInMyQueue) {
          console.log("[NotificationToast] Adicionando notificação de transferência");
          addNotification({
            type: "transfer",
            title: ticket?.contact?.name || "Novo Ticket",
            subtitle: isTransferToMe ? "Você recebeu uma transferência" : "Novo ticket aguardando",
            avatar: ticket?.contact?.urlPicture,
            ticketId: ticket?.id,
            ticketUuid: ticket?.uuid,
          });
        }
      }
    };

    // **DESLIGADO: NotificationToast causando loop infinito**
    // const handleMessage = (data) => {
    //   console.log("[NotificationToast] Evento mensagem recebido:", data.action, data.message?.id);
      
    //   if (data.action === "create" && !data.message?.fromMe) {
    //     const ticket = data.ticket;
    //     const message = data.message;

    //     // Ignora grupos
    //     if (ticket?.isGroup) {
    //       console.log("[NotificationToast] Ignorando grupo");
    //       return;
    //     }

    //     // Verifica se o ticket pertence às filas do usuário
    //     const userQueueIds = user?.queues?.map((q) => q.id) || [];
    //     const belongsToUserQueue = !ticket?.queueId || userQueueIds.includes(ticket.queueId);

    //     // Verifica se o usuário pode ver o ticket
    //     const canSeeTicket = user?.profile === "admin" ||
    //       ticket?.userId === user?.id ||
    //       !ticket?.userId ||
    //       ticket?.status === "pending";

    //     console.log("[NotificationToast] Message check:", {
    //       belongsToUserQueue,
    //       canSeeTicket,
    //       ticketUserId: ticket?.userId,
    //       myUserId: user?.id,
    //       ticketQueueId: ticket?.queueId,
    //       userQueueIds
    //     });

    //     if (belongsToUserQueue && canSeeTicket) {
    //       console.log("[NotificationToast] Adicionando notificação de mensagem");
    //       // Trunca a mensagem se for muito longa
    //       let messageBody = message?.body || "Nova mensagem";
    //       if (messageBody.length > 50) {
    //         messageBody = messageBody.substring(0, 50) + "...";
    //       }

    //       addNotification({
    //         type: "message",
    //         title: ticket?.contact?.name || "Nova Mensagem",
    //         subtitle: messageBody,
    //         avatar: ticket?.contact?.urlPicture,
    //         ticketId: ticket?.id,
    //         ticketUuid: ticket?.uuid,
    //       });
    //     }
    //   }
    // };

    socket.on(`company-${companyId}-ticket`, handleTicket);
    // **DESLIGADO: handleMessage desativado para parar loop**
    // socket.on(`company-${companyId}-appMessage`, handleMessage);

    console.log("[NotificationToast] Listeners registrados para:", `company-${companyId}-ticket`, `company-${companyId}-appMessage`);

    return () => {
      socket.off(`company-${companyId}-ticket`, handleTicket);
      // **DESLIGADO: handleMessage desativado**
      // socket.off(`company-${companyId}-appMessage`, handleMessage);
    };
  }, [user, socket, addNotification]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={classes.container}>
      {notifications.map((notification) => (
        <Slide
          key={notification.id}
          direction="left"
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <div
            className={`${classes.toast} ${
              notification.type === "transfer"
                ? classes.toastTransfer
                : classes.toastMessage
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <Avatar
              src={notification.avatar}
              className={classes.avatar}
            >
              {getInitials(notification.title)}
            </Avatar>
            <div className={classes.content}>
              <span
                className={`${classes.badge} ${
                  notification.type === "transfer"
                    ? classes.badgeTransfer
                    : classes.badgeMessage
                }`}
              >
                {notification.type === "transfer" ? "Transferência" : "Mensagem"}
              </span>
              <Typography className={classes.title}>
                {notification.title}
              </Typography>
              <Typography className={classes.subtitle}>
                {notification.subtitle}
              </Typography>
            </div>
            <IconButton
              className={classes.closeButton}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </Slide>
      ))}
    </div>
  );
};

export default NotificationToast;
