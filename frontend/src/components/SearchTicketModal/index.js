import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Box,
  Divider,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";
import ChatIcon from "@material-ui/icons/Chat";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      maxWidth: 500,
      width: "100%",
      maxHeight: "80vh",
    },
  },
  dialogTitle: {
    padding: theme.spacing(2, 3),
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  closeButton: {
    padding: 8,
  },
  dialogContent: {
    padding: 0,
  },
  searchContainer: {
    padding: theme.spacing(2, 3),
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#f5f7fa",
      "&:hover": {
        backgroundColor: "#eef1f5",
      },
      "&.Mui-focused": {
        backgroundColor: "#fff",
      },
    },
  },
  resultsList: {
    padding: 0,
    maxHeight: "calc(80vh - 180px)",
    overflowY: "auto",
  },
  listItem: {
    padding: theme.spacing(1.5, 3),
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f5f7fa",
    },
  },
  avatar: {
    width: 48,
    height: 48,
    marginRight: theme.spacing(2),
  },
  contactName: {
    fontWeight: 600,
    fontSize: 15,
    color: "#1a1a2e",
  },
  lastMessage: {
    fontSize: 13,
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 280,
  },
  ticketInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    height: 20,
    fontSize: 10,
    fontWeight: 600,
  },
  channelIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  whatsappIcon: {
    color: "#25d366",
  },
  instagramIcon: {
    color: "#e1306c",
  },
  facebookIcon: {
    color: "#1877f2",
  },
  noResults: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: "#9ca3af",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  queueChip: {
    height: 20,
    fontSize: 10,
    fontWeight: 500,
    marginLeft: 4,
  },
  searchHint: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: "#9ca3af",
  },
  searchHintIcon: {
    fontSize: 48,
    color: "#e0e0e0",
    marginBottom: theme.spacing(2),
  },
}));

const SearchTicketModal = ({ open, onClose }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  
  const [searchParam, setSearchParam] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchParam("");
      setTickets([]);
    }
  }, [open]);

  useEffect(() => {
    if (searchParam.length < 2) {
      setTickets([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchTickets(searchParam);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const fetchTickets = async (term) => {
    if (!term || term.length < 2) return;
    try {
      setLoading(true);
      const { data } = await api.get("/tickets", {
        params: {
          searchParam: term,
          pageNumber: 1,
          showAll: "true",
          searchOnMessages: "true",
        },
      });
      
      const ticketsList = data.tickets || [];
      const search = term.toLowerCase();
      
      // Filtrar e ordenar: tickets com match na mensagem primeiro
      const sortedTickets = ticketsList
        .map(ticket => {
          const lastMessage = (ticket.lastMessage || "").toLowerCase();
          const contactName = (ticket.contact?.name || "").toLowerCase();
          const contactNumber = (ticket.contact?.number || "").toLowerCase();
          
          // Calcular score de relevância
          let score = 0;
          if (lastMessage.includes(search)) score += 10; // Match na mensagem = maior prioridade
          if (contactName.includes(search)) score += 5;  // Match no nome
          if (contactNumber.includes(search)) score += 3; // Match no número
          
          return { ...ticket, _score: score };
        })
        .filter(ticket => ticket._score > 0) // Remover tickets sem match
        .sort((a, b) => b._score - a._score); // Ordenar por score (maior primeiro)
      
      setTickets(sortedTickets);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (ticket) => {
    onClose();
    history.push(`/atendimentos/${ticket.id}`);
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "whatsapp":
        return <WhatsAppIcon className={`${classes.channelIcon} ${classes.whatsappIcon}`} />;
      case "instagram":
        return <InstagramIcon className={`${classes.channelIcon} ${classes.instagramIcon}`} />;
      case "facebook":
        return <FacebookIcon className={`${classes.channelIcon} ${classes.facebookIcon}`} />;
      default:
        return <ChatIcon className={classes.channelIcon} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      case "pending":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "closed":
        return { backgroundColor: "#f3f4f6", color: "#6b7280" };
      default:
        return { backgroundColor: "#e0e7ff", color: "#3730a3" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "pending":
        return "Pendente";
      case "closed":
        return "Resolvido";
      default:
        return status;
    }
  };

  const formatLastMessage = (ticket) => {
    if (ticket.lastMessage) {
      return ticket.lastMessage.length > 60 
        ? ticket.lastMessage.substring(0, 60) + "..." 
        : ticket.lastMessage;
    }
    return "Sem mensagens";
  };

  // Função para destacar o texto buscado na mensagem
  const highlightSearchTerm = (text, search) => {
    if (!text || !search || search.length < 2) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: "#fef08a", fontWeight: 600 }}>
          {part}
        </span>
      ) : part
    );
  };

  // Função para encontrar e mostrar o trecho da mensagem que contém o termo buscado
  const getMatchingMessagePreview = (ticket) => {
    const message = ticket.lastMessage || "";
    const search = searchParam.toLowerCase();
    
    if (!message || search.length < 2) {
      return formatLastMessage(ticket);
    }
    
    const lowerMessage = message.toLowerCase();
    const index = lowerMessage.indexOf(search);
    
    if (index === -1) {
      return formatLastMessage(ticket);
    }
    
    // Mostrar contexto ao redor do termo encontrado
    const start = Math.max(0, index - 20);
    const end = Math.min(message.length, index + search.length + 40);
    
    let preview = message.substring(start, end);
    if (start > 0) preview = "..." + preview;
    if (end < message.length) preview = preview + "...";
    
    return highlightSearchTerm(preview, searchParam);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      fullWidth
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography className={classes.titleText}>
          Buscar Conversas
        </Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <div className={classes.searchContainer}>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            placeholder="Digite o nome, número ou mensagem..."
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={32} />
          </div>
        ) : searchParam.length < 2 ? (
          <div className={classes.searchHint}>
            <SearchIcon className={classes.searchHintIcon} />
            <Typography>
              Digite pelo menos 2 caracteres para buscar
            </Typography>
          </div>
        ) : tickets.length === 0 ? (
          <div className={classes.noResults}>
            <Typography>
              Nenhuma conversa encontrada
            </Typography>
          </div>
        ) : (
          <List className={classes.resultsList}>
            {tickets.map((ticket, index) => (
              <React.Fragment key={ticket.id}>
                <ListItem
                  className={classes.listItem}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <ListItemAvatar>
                    <Avatar
                      className={classes.avatar}
                      src={ticket.contact?.profilePicUrl}
                    >
                      {ticket.contact?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography className={classes.contactName}>
                        {ticket.contact?.name || "Sem nome"}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography className={classes.lastMessage} component="div">
                          {getMatchingMessagePreview(ticket)}
                        </Typography>
                        <div className={classes.ticketInfo}>
                          {getChannelIcon(ticket.channel)}
                          <Chip
                            label={getStatusLabel(ticket.status)}
                            size="small"
                            className={classes.statusChip}
                            style={getStatusColor(ticket.status)}
                          />
                          {ticket.queue && (
                            <Chip
                              label={ticket.queue.name}
                              size="small"
                              className={classes.queueChip}
                              style={{ 
                                backgroundColor: ticket.queue.color + "20",
                                color: ticket.queue.color 
                              }}
                            />
                          )}
                          <Typography variant="caption" style={{ color: "#9ca3af", marginLeft: "auto" }}>
                            #{ticket.id}
                          </Typography>
                        </div>
                      </Box>
                    }
                  />
                </ListItem>
                {index < tickets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchTicketModal;
