import React, { useContext, useState, useEffect, useRef, useCallback } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import {
  Badge,
  ListItemAvatar,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import GroupIcon from "@material-ui/icons/Group";
import ContactTag from "../ContactTag";
import ConnectionIcon from "../ConnectionIcon";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ShowTicketOpen from "../ShowTicketOpenModal";
import { isNil } from "lodash";
import { toast } from "react-toastify";
import { useSystemAlert } from "../SystemAlert";
import { Done, HighlightOff, Replay, SwapHoriz, LocalOffer, DeleteOutline, Label } from "@material-ui/icons";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import TicketTagsKanbanModal from "../TicketTagsKanbanModal";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    margin: theme.spacing(0.25, 0.5),
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 4px rgba(15,23,42,0.06)"
        : "0 1px 4px rgba(15,23,42,0.35)",
    overflow: "hidden",
    paddingTop: 4,
    paddingBottom: 4,
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  tagDotRow: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.15)",
  },

  pendingTicket: {
    cursor: "unset",
  },
  ticketUnread: {
    // degrade leve só na borda esquerda quando tem não lidos
    boxShadow: "inset 4px 0 0 #9054BC",
  },

  queueTag: {
    background: "#FCFCFC",
    color: "#000",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    borderRadius: 3,
    fontSize: "0.5em",
    whiteSpace: "nowrap",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    color: "green",
    fontWeight: "bold",
    marginRight: "10px",
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    background: "transparent !important",
    color: "#25D366",
    marginRight: 3,
    padding: 0,
    fontWeight: 600,
    borderRadius: 0,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  queueTagText: {
    background: "transparent !important",
    marginRight: 3,
    padding: 0,
    fontWeight: 600,
    borderRadius: 0,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  userTagText: {
    background: "transparent !important",
    color: "#64748b",
    marginRight: 3,
    padding: 0,
    fontWeight: 600,
    borderRadius: 0,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "4px",
    color: theme.mode === "light" ? "black" : "white",
  },
  contactNameText: {
    fontWeight: 600,
    fontSize: 12,
  },

  // Avatar base + anel verde quando há notificação
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    transition: "border-color .2s ease",
    border: "2px solid transparent",
    boxSizing: "border-box",
  },
  avatarRing: {
    borderColor: "#9054bc", // CORES ROXO anel circular verde
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    marginRight: 0,
    color: theme.mode === "light" ? "#94a3b8" : grey[500],
    fontSize: 8,
  },

  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    color: "#9054bc",
    fontWeight: 600,
    marginRight: 0,
    fontSize: 8,
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
  paddingRight: "0%",
  marginLeft: "4px",
  color: theme.mode === "light" ? grey[500] : grey[400],
  fontWeight: 400,
  fontSize: 11,
},

contactLastMessageUnread: {
  paddingRight: 16,
  color: theme.mode === "light" ? "#9054BC" : grey[200],
  width: "50%",
  fontWeight: 400,
  fontSize: 11,
},


  badgeStyle: {
  color: "#fff",
  backgroundColor: "#9054bc", // CORES roxo
},

  acceptButton: {
    position: "absolute",
    right: "1px",
  },

  ticketQueueColor: {
    flex: "none",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -4,
  },
  secondaryContentSecond: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
    gap: 2,
    marginTop: 2,
    "& > span:not(:last-child)::after": {
      content: "'•'",
      marginLeft: 3,
      color: "#cbd5e1",
    },
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0,
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3,
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
  connectionIcon: {
    marginRight: theme.spacing(1),
  },

  /*** reserva espaço pro bloco de ações à direita ***/
  listItemText: {
    paddingRight: 80,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /*** META (bolinha + horário) embaixo dos botões ***/
  metaTopRight: {
    position: "absolute",
    bottom: 4,
    right: 8,
    display: "flex",
    alignItems: "center",
    gap: 4,
    zIndex: 3,
    pointerEvents: "none",
  },

  /*** Barra de ações à direita ***/
  actionBar: {
    right: 6,
    display: "flex",
    gap: 2,
    alignItems: "center",
    top: 6,
    transform: "none",
  },
  actionBtn: {
    padding: 2,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    color: "#fff",
    boxShadow: "none",
    "& svg": {
      fontSize: 12,
    },
  },
  btnBlue: { backgroundColor: "#40BFFF" },
  btnRed: { backgroundColor: "#FF6B6B" },
  btnGreen: { backgroundColor: "#2ECC71" },
}));

const TicketListItemCustom = ({ setTabOpen, ticket }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] =
    useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");
  const [openTagsKanbanModal, setOpenTagsKanbanModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { showConfirm } = useSystemAlert();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { get: getSetting } = useCompanySettings();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOpenAcceptTicketWithouSelectQueue = useCallback(() => {
    setAcceptTicketWithouSelectQueueOpen(true);
  }, []);

  const handleCloseTicket = async (id) => {
    const setting = await getSetting({ column: "requiredTag" });

    if (setting.requiredTag === "enabled") {
      try {
        const contactTags = await api.get(`/contactTags/${ticket.contact.id}`);
        if (!contactTags.data.tags) {
          toast.warning(i18n.t("messagesList.header.buttons.requiredTag"));
        } else {
          await api.put(`/tickets/${id}`, {
            status: "closed",
            userId: user?.id || null,
          });
          if (isMounted.current) setLoading(false);
          history.push(`/tickets/`);
        }
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    } else {
      setLoading(true);
      try {
        await api.put(`/tickets/${id}`, {
          status: "closed",
          userId: user?.id || null,
        });
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
      if (isMounted.current) setLoading(false);
      history.push(`/tickets/`);
    }
  };

	const getDisplayName = c => {
		if (!c || !c.name) return "Contato sem nome";
		const onlyDigits = /^\+?\d+$/.test(c.name.replace(/\s+/g, ""));
		return onlyDigits ? "Contato sem nome" : c.name;
	};

  const handleCloseIgnoreTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) setLoading(false);
    history.push(`/tickets/`);
  };

  const handleDeleteTicket = async (id) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir Ticket",
      message: "Tem certeza que deseja excluir este ticket? O histórico será apagado e não poderá ser recuperado.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await api.delete(`/tickets/${id}`);
    } catch (err) {
      setLoading(false);
      toastError(err);
      return;
    }

    if (isMounted.current) setLoading(false);
    history.push(`/tickets/`);
  };

  const truncate = (str, len) => {
    if (!isNil(str)) {
      if (str.length > len) return str.substring(0, len) + "...";
      return str;
    }
  };

  const handleCloseTransferTicketModal = useCallback(() => {
    if (isMounted.current) setTransferTicketModalOpen(false);
  }, []);

  const handleOpenTransferModal = () => {
    setLoading(true);
    setTransferTicketModalOpen(true);
    if (isMounted.current) setLoading(false);
    handleSelectTicket(ticket);
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      const otherTicket = await api.put(`/tickets/${id}`, {
        status:
          ticket.isGroup && ticket.channel === "whatsapp" ? "group" : "open",
        userId: user?.id,
      });

      if (otherTicket.data.id !== ticket.id) {
        if (otherTicket.data.userId !== user?.id) {
          setOpenAlert(true);
          setUserTicketOpen(otherTicket.data.user?.name || "Sem usuário");
          setQueueTicketOpen(otherTicket.data.queue?.name || "Sem fila");
        } else {
          setLoading(false);
          setTabOpen(ticket.isGroup ? "group" : "open");
          handleSelectTicket(otherTicket.data);
          history.push(`/tickets/${otherTicket.uuid}`);
        }
      } else {
        let setting;
        try {
          setting = await getSetting({ column: "sendGreetingAccepted" });
        } catch (err) {
          toastError(err);
        }

        if (
          setting.sendGreetingAccepted === "enabled" &&
          (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
        ) {
          handleSendMessage(ticket.id);
        }
        if (isMounted.current) setLoading(false);

        setTabOpen(ticket.isGroup ? "group" : "open");
        handleSelectTicket(ticket);
        history.push(`/tickets/${ticket.uuid}`);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSendMessage = async (id) => {
    let setting;
    try {
      setting = await getSetting({ column: "greetingAcceptedMessage" });
    } catch (err) {
      toastError(err);
    }

    const msg = `${setting.greetingAcceptedMessage}`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseAlert = useCallback(() => {
    setOpenAlert(false);
    setLoading(false);
  }, []);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
       const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const hasUnread = Number(ticket.unreadMessages) > 0;

  return (
    <React.Fragment key={ticket.id}>
      {openAlert && (
        <ShowTicketOpen
          isOpen={openAlert}
          handleClose={handleCloseAlert}
          user={userTicketOpen}
          queue={queueTicketOpen}
        />
      )}
      {acceptTicketWithouSelectQueueOpen && (
        <AcceptTicketWithouSelectQueue
          modalOpen={acceptTicketWithouSelectQueueOpen}
          onClose={() => setAcceptTicketWithouSelectQueueOpen(false)}
          ticketId={ticket.id}
          ticket={ticket}
        />
      )}
      {transferTicketModalOpen && (
        <TransferTicketModalCustom
          modalOpen={transferTicketModalOpen}
          onClose={handleCloseTransferTicketModal}
          ticketid={ticket.id}
          ticket={ticket}
        />
      )}

      <ListItem
  button
  dense
  onClick={(e) => {
    const tag = e.target.tagName.toLowerCase();
    const isIconClick =
      (tag === "input" && e.target.type === "checkbox") ||
      tag === "svg" ||
      tag === "path";
    if (isIconClick) return;

    handleSelectTicket(ticket);
    // opcional: se quiser já navegar ao clicar no item:
    // history.push(`/tickets/${ticket.uuid}`);
  }}
  selected={ticketId && ticketId === ticket.uuid}
  className={clsx(classes.ticket, {
    [classes.pendingTicket]: ticket.status === "pending",
    [classes.ticketUnread]: hasUnread,
  })}
>

        <ListItemAvatar style={{ marginLeft: "-15px" }}>
          <Avatar
            className={clsx(classes.avatar, { [classes.avatarRing]: hasUnread })}
            src={`${ticket?.contact?.urlPicture}`}
          />
        </ListItemAvatar>

        <ListItemText
          className={classes.listItemText}
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography noWrap component="span" variant="body2">
                {ticket.isGroup && ticket.channel === "whatsapp" && (
                  <GroupIcon
                    fontSize="small"
                    style={{
                      color: grey[700],
                      marginBottom: "-1px",
                      marginRight: "4px",
                    }}
                  />
                )}
                <span className={classes.contactNameText}>
                  {truncate(getDisplayName(ticket.contact), 60)}
                </span>
              </Typography>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={
                  Number(ticket.unreadMessages) > 0
                    ? classes.contactLastMessageUnread
                    : classes.contactLastMessage
                }
                noWrap
                component="span"
                variant="body2"
              >
                {ticket.lastMessage ? (
                  <>
                    {ticket.lastMessage.includes("fb.me") ? (
                      <MarkdownWrapper>Clique de Anúncio</MarkdownWrapper>
                    ) : ticket.lastMessage.includes("data:image/png;base64") ? (
                      <MarkdownWrapper>Localização</MarkdownWrapper>
                    ) : (
                      <>
                        {ticket.lastMessage.includes("BEGIN:VCARD") ? (
                          <MarkdownWrapper>Contato</MarkdownWrapper>
                        ) : (
                          <MarkdownWrapper>
                            {truncate(ticket.lastMessage, 40)}
                          </MarkdownWrapper>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <br />
                )}

                <span className={classes.secondaryContentSecond}>
                  {ticket?.whatsapp && (
                    <span
                      className={classes.connectionTag}
                      style={{
                        color:
                          ticket.channel === "facebook"
                            ? "#1877F2"
                            : ticket.channel === "instagram"
                            ? "#E4405F"
                            : "#25D366",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {ticket.channel && (
                        <ConnectionIcon
                          width="8"
                          height="8"
                          connectionType={ticket.channel}
                        />
                      )}
                      {ticket.whatsapp?.name}
                    </span>
                  )}
                  <span
                    className={classes.queueTagText}
                    style={{ color: ticket.queue?.color || "#7c7c7c" }}
                  >
                    {ticket.queueId
                      ? ticket.queue?.name
                      : ticket.status === "lgpd"
                      ? "LGPD"
                      : "Sem fila"}
                  </span>
                  {ticket?.user && (
                    <span className={classes.userTagText}>
                      {ticket.user?.name}
                    </span>
                  )}
                  {/* Tags do Ticket */}
                  {ticket?.tags && ticket.tags.length > 0 && ticket.tags.filter(t => t && t.name).slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className={classes.ticketTag}
                      style={{ backgroundColor: tag.color || "#999999" }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {ticket?.tags && ticket.tags.filter(t => t && t.name).length > 2 && (
                    <span className={classes.ticketTag} style={{ backgroundColor: "#666" }}>
                      +{ticket.tags.filter(t => t && t.name).length - 2}
                    </span>
                  )}
                </span>
              </Typography>
            </span>
          }
        />

        {/* META (bolinha + horário) no topo direito */}
        <div className={classes.metaTopRight}>
          <Badge
            className={classes.newMessagesCount}
            badgeContent={ticket.unreadMessages}
            classes={{ badge: classes.badgeStyle }}
          />
          {ticket.lastMessage && (
            <Typography
              className={
                Number(ticket.unreadMessages) > 0
                  ? classes.lastMessageTimeUnread
                  : classes.lastMessageTime
              }
              component="span"
              variant="body2"
              style={{ top: 0, marginRight: 0 }}
            >
              {isSameDay(parseISO(ticket.updatedAt), new Date())
                ? format(parseISO(ticket.updatedAt), "HH:mm")
                : format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
            </Typography>
          )}
        </div>

        {/* AÇÕES */}
        <ListItemSecondaryAction className={classes.actionBar}>
          {isMobile ? (
            <>
              <IconButton
                size="small"
                onClick={handleOpenMenu}
                style={{ padding: 4 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {(ticket.status === "pending" || ticket.status === "closed") && (
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      ticket.status === "closed"
                        ? handleAcepptTicket(ticket.id)
                        : ticket.queueId
                        ? handleAcepptTicket(ticket.id)
                        : handleOpenAcceptTicketWithouSelectQueue();
                    }}
                  >
                    {ticket.status === "closed" ? <Replay fontSize="small" style={{ marginRight: 8 }} /> : <Done fontSize="small" style={{ marginRight: 8 }} />}
                    {ticket.status === "closed" ? i18n.t("ticketsList.buttons.reopen") : i18n.t("ticketsList.buttons.accept")}
                  </MenuItem>
                )}
                {(ticket.status === "open" || ticket.status === "group" || ticket.status === "pending") && (
                  <MenuItem onClick={() => { handleCloseMenu(); handleOpenTransferModal(); }}>
                    <SwapHoriz fontSize="small" style={{ marginRight: 8 }} />
                    {i18n.t("ticketsList.buttons.transfer")}
                  </MenuItem>
                )}
                {(ticket.status === "open" || ticket.status === "group") && (
                  <MenuItem onClick={() => { handleCloseMenu(); setOpenTagsKanbanModal(true); }}>
                    <Label fontSize="small" style={{ marginRight: 8 }} />
                    Tags & Kanban
                  </MenuItem>
                )}
                {(ticket.status === "open" || ticket.status === "group") && (
                  <MenuItem onClick={() => { handleCloseMenu(); handleCloseTicket(ticket.id); }}>
                    <HighlightOff fontSize="small" style={{ marginRight: 8, color: "#E74C3C" }} />
                    {i18n.t("ticketsList.buttons.closed")}
                  </MenuItem>
                )}
                {(ticket.status === "pending" || ticket.status === "lgpd") &&
                  (user.userClosePendingTicket === "enabled" || user.profile === "admin") && (
                    <MenuItem onClick={() => { handleCloseMenu(); handleCloseIgnoreTicket(ticket.id); }}>
                      <HighlightOff fontSize="small" style={{ marginRight: 8, color: "#E74C3C" }} />
                      {i18n.t("ticketsList.buttons.ignore")}
                    </MenuItem>
                  )}
                <MenuItem onClick={() => { handleCloseMenu(); handleDeleteTicket(ticket.id); }}>
                  <DeleteOutline fontSize="small" style={{ marginRight: 8, color: "#E74C3C" }} />
                  Excluir ticket
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {(ticket.status === "pending" || ticket.status === "closed") && (
                <ButtonWithSpinner
                  size="small"
                  loading={loading}
                  className={`${classes.actionBtn} ${classes.btnGreen}`}
                  onClick={() =>
                    ticket.status === "closed"
                      ? handleAcepptTicket(ticket.id)
                      : ticket.queueId
                      ? handleAcepptTicket(ticket.id)
                      : handleOpenAcceptTicketWithouSelectQueue()
                  }
                  variant="contained"
                >
                  {ticket.status === "closed" ? (
                    <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
                      <Replay fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Tooltip title={i18n.t("ticketsList.buttons.accept")}>
                      <Done fontSize="small" />
                    </Tooltip>
                  )}
                </ButtonWithSpinner>
              )}

              {(ticket.status === "open" || ticket.status === "group" || ticket.status === "pending") && (
                <ButtonWithSpinner
                  size="small"
                  loading={loading}
                  className={`${classes.actionBtn} ${classes.btnBlue}`}
                  onClick={handleOpenTransferModal}
                  variant="contained"
                >
                  <Tooltip title={i18n.t("ticketsList.buttons.transfer")}>
                    <SwapHoriz fontSize="small" />
                  </Tooltip>
                </ButtonWithSpinner>
              )}

              {(ticket.status === "open" || ticket.status === "group") && (
                <ButtonWithSpinner
                  size="small"
                  loading={false}
                  className={`${classes.actionBtn} ${classes.btnBlue}`}
                  onClick={() => setOpenTagsKanbanModal(true)}
                  variant="contained"
                >
                  <Tooltip title="Tags & Kanban">
                    <Label fontSize="small" />
                  </Tooltip>
                </ButtonWithSpinner>
              )}

              {(ticket.status === "open" || ticket.status === "group") && (
                <ButtonWithSpinner
                  size="small"
                  loading={loading}
                  className={`${classes.actionBtn} ${classes.btnRed}`}
                  onClick={() => handleCloseTicket(ticket.id)}
                  variant="contained"
                >
                  <Tooltip title={i18n.t("ticketsList.buttons.closed")}>
                    <HighlightOff fontSize="small" />
                  </Tooltip>
                </ButtonWithSpinner>
              )}

              {(ticket.status === "pending" || ticket.status === "lgpd") &&
                (user.userClosePendingTicket === "enabled" ||
                  user.profile === "admin") && (
                  <ButtonWithSpinner
                    size="small"
                    loading={loading}
                    className={`${classes.actionBtn} ${classes.btnRed}`}
                    onClick={() => handleCloseIgnoreTicket(ticket.id)}
                    variant="contained"
                  >
                    <Tooltip title={i18n.t("ticketsList.buttons.ignore")}>
                      <HighlightOff />
                    </Tooltip>
                  </ButtonWithSpinner>
                )}

              <ButtonWithSpinner
                size="small"
                loading={loading}
                className={`${classes.actionBtn} ${classes.btnRed}`}
                onClick={() => handleDeleteTicket(ticket.id)}
                variant="contained"
              >
                <Tooltip title="Excluir ticket">
                  <DeleteOutline fontSize="small" />
                </Tooltip>
              </ButtonWithSpinner>
            </>
          )}
        </ListItemSecondaryAction>
      </ListItem>

      <TicketTagsKanbanModal
        open={openTagsKanbanModal}
        onClose={() => setOpenTagsKanbanModal(false)}
        contact={ticket.contact}
        ticket={ticket}
      />
    </React.Fragment>
  );
};

export default TicketListItemCustom;