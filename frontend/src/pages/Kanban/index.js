import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Box, FormControl, InputLabel, Select, MenuItem, IconButton } from "@material-ui/core";
import { isSameDay, parseISO, format } from "date-fns";
import { Can } from "../../components/Can";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import EventIcon from "@material-ui/icons/Event";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import ContactModal from "../../components/ContactModal";
import ScheduleModal from "../../components/ScheduleModal";
import ChatModal from "../../components/ChatModal";
import TicketTagsKanbanModal from "../../components/TicketTagsKanbanModal";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#1976d2",
    },
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  filterSelect: {
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  kanbanContainer: {
    flex: 1,
    width: "100%",
    overflow: "auto",
    padding: theme.spacing(1),
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    borderRadius: 3,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto"
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [negocios, setNegocios] = useState([]);
  const [selectedNegocioId, setSelectedNegocioId] = useState("");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleContactId, setScheduleContactId] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatContact, setChatContact] = useState(null);
  const [chatTicketUuid, setChatTicketUuid] = useState(null);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [selectedTicketForTags, setSelectedTicketForTags] = useState(null);

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  const getDisplayName = (contact) => {
    if (!contact || !contact.name) return "Contato sem nome";
    const onlyDigits = /^\+?\d+$/.test(contact.name.replace(/\s+/g, ""));
    return onlyDigits ? "Contato sem nome" : contact.name;
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "R$ 0,00";
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "R$ 0,00";
    }
    return numeric.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  useEffect(() => {
    fetchNegocios();
  }, [user]);

  useEffect(() => {
    if (!selectedNegocioId) {
      setTags([]);
      setFile({ lanes: [] });
      return;
    }
    fetchTags();
  }, [selectedNegocioId]);

  const fetchNegocios = async () => {
    try {
      const { data } = await api.get("/negocios");
      const lista = data || [];
      setNegocios(lista);
      if (!selectedNegocioId && lista.length > 0) {
        setSelectedNegocioId(String(lista[0].id));
      }
    } catch (error) {
      console.log(error);
      setNegocios([]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/", {
        params: {
          negocioId: selectedNegocioId || undefined,
        },
      });
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  // **DEBOUNCE para evitar múltiplas requisições simultâneas**
  const fetchTimeoutRef = useRef(null);
  
  const fetchTickets = async () => {
    // **CANCELAR requisição anterior se existir**
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // **AGUARDAR 300ms antes de fazer nova requisição**
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔄 KANBAN: Buscando tickets...");
        const { data } = await api.get("/ticket/kanban", {
          params: {
            queueIds: JSON.stringify(jsonString),
          }
        });
        console.log("📊 KANBAN DEBUG: Total de tickets retornados:", data.tickets.length);
        console.log("📊 KANBAN DEBUG: Tickets por status:", {
          open: data.tickets.filter(t => t.status === "open").length,
          pending: data.tickets.filter(t => t.status === "pending").length,
          closed: data.tickets.filter(t => t.status === "closed").length
        });
        console.log("📊 KANBAN DEBUG: Tickets closed:", data.tickets.filter(t => t.status === "closed").map(t => ({
          id: t.id,
          tags: t.tags?.map(tag => tag.name)
        })));
        setTickets(data.tickets);
      } catch (err) {
        console.error("❌ KANBAN: Erro ao buscar tickets:", err);
        setTickets([]);
      }
    }, 300);
  };

  useEffect(() => {
    const companyId = user.companyId;
    
    // **LIMITADOR DE FREQUÊNCIA: Máximo 1 atualização por segundo**
    let lastUpdateTime = 0;
    const MIN_UPDATE_INTERVAL = 1000; // 1 segundo
    
    const onAppMessage = (data) => {
      const now = Date.now();
      
      // **VERIFICAR SE PASSOU TEMPO MÍNIMO DESDE ÚLTIMA ATUALIZAÇÃO**
      if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
        console.log("⏱️ KANBAN: Ignorando evento - muito recente");
        return;
      }
      
      lastUpdateTime = now;
      
      // KANBAN FIX: Ignorar evento delete para tickets - apenas processar create e update
      // Tickets só devem sair do Kanban quando forem excluídos manualmente
      if (data.action === "create" || data.action === "update") {
        console.log("🔵 KANBAN: Recebido evento", data.action, "- atualizando tickets");
        fetchTickets();
      } else if (data.action === "delete") {
        console.log("🔴 KANBAN: Evento delete IGNORADO - tickets permanecem no Kanban");
        // Não faz nada - ticket permanece visível
      }
    };
    
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket]);
  
  // **LIMPEZA: Cancelar timeout ao desmontar**
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, []);

  const handleNegocioChange = (event) => {
    setSelectedNegocioId(String(event.target.value));
  };

  const handleOpenContactModal = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedContactId(null);
  };

  const handleOpenScheduleModal = (contactId) => {
    setScheduleContactId(contactId);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleContactId(null);
  };

  const handleOpenWhatsModal = (ticket) => {
    setChatContact({
      name: getDisplayName(ticket.contact),
      avatar: ticket.contact?.urlPicture,
      meAvatar: user?.profilePicUrl,
      statusText: "Ativo agora",
    });
    setChatTicketUuid(ticket.uuid);
    setChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setChatModalOpen(false);
    setChatTicketUuid(null);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const selectedNegocio = useMemo(
    () => negocios.find(n => String(n.id) === String(selectedNegocioId)),
    [negocios, selectedNegocioId]
  );

  const orderedTags = useMemo(() => {
    if (!selectedNegocio || !Array.isArray(selectedNegocio.kanbanBoards)) {
      return tags;
    }
    const order = selectedNegocio.kanbanBoards.map(String);
    const map = new Map(tags.map(tag => [String(tag.id), tag]));
    const ordered = order.map(id => map.get(id)).filter(Boolean);
    const remaining = tags.filter(tag => !order.includes(String(tag.id)));
    return [...ordered, ...remaining];
  }, [tags, selectedNegocio]);

  const popularCards = (currentTags, currentTickets) => {
    const lanes = currentTags.map(tag => {
      const filteredTickets = currentTickets.filter(ticket => {
        const tagIds = (ticket.tags || []).map(tagItem => tagItem.id);
        return tagIds.includes(tag.id);
      });
      const totalValue = filteredTickets.reduce((sum, ticket) => {
        const numericValue = Number(ticket.leadValue) || 0;
        return sum + numericValue;
      }, 0);

      return {
        id: tag.id.toString(),
        title: tag.name,
        label: `${filteredTickets.length} • ${formatCurrency(totalValue)}`,
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <p>
                {ticket.contact.number}
                <br />
                {truncateText(ticket.lastMessage || " ", 20)}
              </p>
              <Typography
                component="div"
                style={{ fontWeight: 600, color: "#111b21", marginBottom: 4 }}
              >
                Valor: {formatCurrency(ticket.leadValue)}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenContactModal(ticket.contact.id)}
                  aria-label="ver perfil do contato"
                  style={{ backgroundColor: '#e0e0e0', marginRight: 4 }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenTagsModal(ticket)}
                  aria-label="editar ações do ticket"
                  style={{ backgroundColor: '#e0e0e0', marginRight: 4 }}
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenWhatsModal(ticket)}
                  aria-label="visualizar conversa"
                  style={{ backgroundColor: '#e0e0e0', marginRight: 4 }}
                >
                  <WhatsApp style={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenScheduleModal(ticket.contact.id)}
                  aria-label="agendar mensagem"
                  style={{ backgroundColor: '#e0e0e0', marginRight: 4 }}
                >
                  <EventIcon fontSize="small" />
                </IconButton>
                <span style={{ flex: 1 }} />
                {ticket?.user && (
                  <Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>
                    {ticket.user?.name.toUpperCase()}
                  </Badge>
                )}
              </div>

            </div>
          ),
          title: <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> {getDisplayName(ticket.contact)}
          </>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: { backgroundColor: tag.color, color: "white" }
      };
    });

    setFile({ lanes });
  };

  const handleOpenTagsModal = (ticket) => {
    setSelectedTicketForTags(ticket);
    setTagsModalOpen(true);
  };

  const handleCloseTagsModal = () => {
    setTagsModalOpen(false);
    setSelectedTicketForTags(null);
  };

  useEffect(() => {
    if (!selectedNegocioId) {
      setFile({ lanes: [] });
      return;
    }
    popularCards(orderedTags, tickets);
  }, [orderedTags, tickets, selectedNegocioId]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <ViewColumnIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>Kanban</Typography>
            <Typography className={classes.headerSubtitle}>
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} • {tags.length} {tags.length === 1 ? "quadro" : "quadros"}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel id="negocio-select-label">Negócio</InputLabel>
            <Select
              labelId="negocio-select-label"
              value={selectedNegocioId}
              onChange={handleNegocioChange}
              label="Negócio"
            >
              {negocios.length === 0 && (
                <MenuItem value="" disabled>
                  Nenhum negócio cadastrado
                </MenuItem>
              )}
              {negocios.map(n => (
                <MenuItem key={n.id} value={n.id}>
                  {n.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Kanban Board */}
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
      <ChatModal
        open={chatModalOpen}
        onClose={handleCloseChatModal}
        contact={chatContact}
        ticketUuid={chatTicketUuid}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        contactId={selectedContactId}
      />
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        contactId={scheduleContactId}
      />
      <TicketTagsKanbanModal
        open={tagsModalOpen}
        onClose={handleCloseTagsModal}
        contact={selectedTicketForTags?.contact}
        ticket={selectedTicketForTags}
        onUpdate={fetchTickets}
      />
    </div>
  );
};

export default Kanban;