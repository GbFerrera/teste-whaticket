import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@material-ui/icons";

import ConfirmationModal from "../../components/ConfirmationModal";
import ScheduledDispatcherModal from "../../components/AutomationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import {
  deleteScheduledDispatcher,
  eventTypeOptions,
  listScheduledDispatchers,
  toggleScheduledDispatcher
} from "../../services/scheduledDispatcherService";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
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
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  filterSelect: {
    minWidth: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": { borderRadius: 8 },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  content: {
    padding: "0 24px 16px",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tableHead: {
    backgroundColor: "var(--sidebar-color, #1e293b)",
    "& th": {
      color: "#cbd5e1",
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "none",
      padding: "14px 16px",
    },
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  actionBtn: {
    minWidth: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
  },
}));

const Automations = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [dispatchers, setDispatchers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("all");
  const [searchParam, setSearchParam] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDispatcher, setEditingDispatcher] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [dispatcherPendingDeletion, setDispatcherPendingDeletion] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  const loadDispatchers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listScheduledDispatchers();
      setDispatchers(data);
    } catch (error) {
      toast.error("Não foi possível carregar os disparos agendados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDispatchers();
  }, [loadDispatchers]);

  useEffect(() => {
    const nextList = dispatchers.filter(dispatcher => {
      const matchesEvent =
        eventFilter === "all" || dispatcher.eventType === eventFilter;
      const matchesSearch =
        !searchParam || dispatcher.title?.toLowerCase().includes(searchParam.toLowerCase());
      return matchesEvent && matchesSearch;
    });
    setFiltered(nextList);
    setTablePage(0);
  }, [dispatchers, eventFilter, searchParam]);

  const stats = useMemo(() => {
    return { total: dispatchers.length };
  }, [dispatchers]);

  const handleToggleDispatcher = async dispatcher => {
    try {
      await toggleScheduledDispatcher(dispatcher.id, !dispatcher.active);
      toast.success(
        dispatcher.active ? "Dispatcher desativado" : "Dispatcher ativado"
      );
      loadDispatchers();
    } catch (error) {
      toast.error("Não foi possível atualizar o status");
    }
  };

  const handleDeleteDispatcher = async () => {
    if (!dispatcherPendingDeletion) return;
    try {
      await deleteScheduledDispatcher(dispatcherPendingDeletion.id);
      toast.success("Dispatcher removido");
      setConfirmModalOpen(false);
      setDispatcherPendingDeletion(null);
      loadDispatchers();
    } catch (error) {
      toast.error("Erro ao remover dispatcher");
    }
  };

  const handleOpenModal = dispatcher => {
    setEditingDispatcher(dispatcher || null);
    setModalOpen(true);
  };

  const handleCloseModal = shouldReload => {
    setModalOpen(false);
    setEditingDispatcher(null);
    if (shouldReload) {
      loadDispatchers();
    }
  };

  const getEventLabel = (eventType) => {
    const found = eventTypeOptions.find(o => o.value === eventType);
    return found?.label || eventType || "—";
  };

  const paginatedItems = filtered.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <ConfirmationModal
        title="Remover disparo agendado"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteDispatcher}
      >
        Tem certeza que deseja excluir "{dispatcherPendingDeletion?.title}"?
      </ConfirmationModal>

      <ScheduledDispatcherModal
        open={modalOpen}
        onClose={handleCloseModal}
        dispatcher={editingDispatcher}
      />

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>
              Disparos Automáticos
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {stats.total}{" "}
              {stats.total === 1 ? "regra configurada" : "regras configuradas"}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar disparo..."
            variant="outlined"
            size="small"
            className={classes.searchField}
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl
            variant="outlined"
            size="small"
            className={classes.filterSelect}
          >
            <Select
              value={eventFilter}
              onChange={event => setEventFilter(event.target.value)}
            >
              <MenuItem value="all">Todos os eventos</MenuItem>
              {eventTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            className={classes.addButton}
          >
            Novo Disparo
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell align="center">Evento</TableCell>
                <TableCell align="center">Início</TableCell>
                <TableCell align="center">Intervalo</TableCell>
                <TableCell align="center">Conexão</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={8} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum disparo encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map(dispatcher => (
                  <TableRow
                    key={dispatcher.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenModal(dispatcher)}
                  >
                    <TableCell>{dispatcher.id}</TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {dispatcher.title || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{getEventLabel(dispatcher.eventType)}</TableCell>
                    <TableCell align="center">{dispatcher.startTime || "—"}</TableCell>
                    <TableCell align="center">{dispatcher.sendIntervalSeconds || 0}s</TableCell>
                    <TableCell align="center">{dispatcher.whatsapp?.name || "—"}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" style={{ gap: 8 }}>
                        <Chip
                          size="small"
                          label={dispatcher.active ? "Ativo" : "Inativo"}
                          className={classes.statusChip}
                          style={{
                            backgroundColor: dispatcher.active ? "#dcfce7" : "#fee2e2",
                            color: dispatcher.active ? "#166534" : "#991b1b",
                          }}
                        />
                        <Tooltip title={dispatcher.active ? "Desativar" : "Ativar"}>
                          <Switch
                            checked={dispatcher.active}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleDispatcher(dispatcher);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            color="primary"
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(dispatcher);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDispatcherPendingDeletion(dispatcher);
                              setConfirmModalOpen(true);
                            }}
                            style={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filtered.length)} de{" "}
                {filtered.length} resultado(s)
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <Button
                  size="small"
                  disabled={tablePage === 0}
                  onClick={() => setTablePage(tablePage - 1)}
                  className={classes.actionBtn}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant={i === tablePage ? "contained" : "text"}
                    color={i === tablePage ? "primary" : "default"}
                    onClick={() => setTablePage(i)}
                    style={{
                      minWidth: 32,
                      borderRadius: 6,
                      fontWeight: i === tablePage ? 700 : 400,
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="small"
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage(tablePage + 1)}
                  className={classes.actionBtn}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Automations;