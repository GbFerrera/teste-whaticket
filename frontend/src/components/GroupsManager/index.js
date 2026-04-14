import React, { useState, useEffect, useReducer, useContext } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import GroupIcon from "@material-ui/icons/Group";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useHistory, useParams } from "react-router-dom";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";
import { toast } from "react-toastify";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_GROUPS":
      return action.payload;
    case "UPDATE_GROUP":
      const groupIndex = state.findIndex((g) => g.id === action.payload.id);
      if (groupIndex !== -1) {
        state[groupIndex] = action.payload;
        return [...state];
      }
      return [action.payload, ...state];
    case "DELETE_GROUP":
      return state.filter((g) => g.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  header: {
    padding: "16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  headerTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: 8,
  },
  searchField: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  listContainer: {
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  groupItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  groupItemSelected: {
    backgroundColor: theme.palette.action.selected,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },
  groupAvatar: {
    width: 48,
    height: 48,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  groupName: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  groupInfo: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statusChip: {
    height: 20,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: theme.palette.text.secondary,
  },
  emptyIcon: {
    fontSize: 64,
    color: theme.palette.text.disabled,
    marginBottom: 16,
  },
}));

const GroupsManager = () => {
  const classes = useStyles();
  const history = useHistory();
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);

  const [groups, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const socket = socketConnection({ companyId: user.companyId });

    socket.on(`company-${user.companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        if (data.contact.isGroup) {
          dispatch({ type: "UPDATE_GROUP", payload: data.contact });
        }
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_GROUP", payload: data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user.companyId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/groups");
      dispatch({ type: "LOAD_GROUPS", payload: data.groups || [] });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadGroups();
  };

  const handleSelectGroup = async (group) => {
    // Criar ticket automaticamente ao clicar no grupo
    setCreatingTicket(true);
    try {
      // Verificar se já existe ticket aberto para este grupo
      const { data: existingTickets } = await api.get("/tickets", {
        params: {
          contactId: group.id,
          status: "open",
        },
      });

      if (existingTickets && existingTickets.tickets && existingTickets.tickets.length > 0) {
        // Já existe ticket, navegar para ele usando UUID
        const existingTicket = existingTickets.tickets[0];
        history.push(`/grupos/${existingTicket.uuid}`);
        toast.info("Ticket existente aberto");
      } else {
        // Criar novo ticket
        const { data: ticket } = await api.post("/tickets", {
          contactId: group.id,
          queueId: user.queues[0]?.id || null,
          whatsappId: group.whatsappId,
          userId: user.id,
          status: "open",
          isGroup: true,
        });

        // Usar UUID para navegação
        history.push(`/grupos/${ticket.uuid}`);
        toast.success("Ticket criado com sucesso!");
      }
    } catch (err) {
      toastError(err);
    } finally {
      setCreatingTicket(false);
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (!searchParam) return true;
    return group.name?.toLowerCase().includes(searchParam.toLowerCase());
  });

  const getInitials = (name = "") => {
    if (!name.trim()) return "G";
    const pieces = name.trim().split(" ");
    return pieces.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography className={classes.headerTitle}>
            Grupos ({filteredGroups.length})
          </Typography>
          <IconButton size="small" onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Buscar grupos..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          className={classes.searchField}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "#999" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box className={classes.listContainer}>
        {loading ? (
          <Box className={classes.emptyState}>
            <Typography>Carregando grupos...</Typography>
          </Box>
        ) : filteredGroups.length === 0 ? (
          <Box className={classes.emptyState}>
            <GroupIcon className={classes.emptyIcon} />
            <Typography>Nenhum grupo encontrado</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredGroups.map((group) => (
              <ListItem
                key={group.id}
                button
                className={`${classes.groupItem} ${
                  ticketId === String(group.id) ? classes.groupItemSelected : ""
                }`}
                onClick={() => handleSelectGroup(group)}
                disabled={creatingTicket}
              >
                <ListItemAvatar>
                  <Avatar
                    src={group.profilePicUrl}
                    className={classes.groupAvatar}
                  >
                    {getInitials(group.name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography className={classes.groupName}>
                      {group.name || "Grupo sem nome"}
                    </Typography>
                  }
                  secondary={
                    <Box className={classes.groupInfo}>
                      <span>{group.whatsappName || "Sem conexão"}</span>
                      {group.isActive && (
                        <Chip
                          label="Ativo"
                          size="small"
                          className={classes.statusChip}
                          style={{
                            backgroundColor: "#dcfce7",
                            color: "#059669",
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default GroupsManager;
