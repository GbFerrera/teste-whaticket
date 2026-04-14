import React, { useReducer, useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ReceiptIcon from "@material-ui/icons/Receipt";
import LaunchIcon from "@material-ui/icons/Launch";
import ChatIcon from "@material-ui/icons/Chat";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import api from "../../services/api";
import ClientModal from "../../components/ClientModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import FaturaModal from "../../components/FaturaModal";
import NewTicketModal from "../../components/NewTicketModal";
import ImportPreviewModal from "../../components/ImportPreviewModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const STATUS_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Ativo", value: "active" },
  { label: "Inativo", value: "inactive" },
  { label: "Bloqueado", value: "blocked" }
];

const STATUS_LABEL = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado"
};

const STATUS_COLORS = {
  active: "#059669",
  inactive: "#6b7280",
  blocked: "#dc2626"
};

const STATUS_BG = {
  active: "#dcfce7",
  inactive: "#f3f4f6",
  blocked: "#fee2e2"
};

const TYPE_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Pessoa Física", value: "pf" },
  { label: "Pessoa Jurídica", value: "pj" }
];

const TYPE_LABEL = {
  pf: "Pessoa Física",
  pj: "Pessoa Jurídica"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return [];
    case "LOAD_CLIENTS": {
      const incoming = action.payload || [];
      const clone = [...state];
      incoming.forEach((client) => {
        const index = clone.findIndex((item) => item.id === client.id);
        if (index > -1) {
          clone[index] = client;
        } else {
          clone.push(client);
        }
      });
      return clone;
    }
    case "DELETE_CLIENT":
      return state.filter((client) => client.id !== action.payload);
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles,
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
    flex: 1,
  },
  filtersGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    flex: 1,
    minWidth: 320,
  },
  actionsGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
    marginLeft: "auto",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 180,
    maxWidth: 280,
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  selectField: {
    minWidth: 120,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  primaryButton: {
    padding: "10px 24px",
    fontWeight: 700,
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
  nameCell: {
    paddingLeft: 8,
  },
  nameWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  itemAvatar: {
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 600,
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

const Clients = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);
  const theme = useTheme();
  const history = useHistory();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [clients, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [faturaClient, setFaturaClient] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedClientForTicket, setSelectedClientForTicket] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;
  const [importPreviewModalOpen, setImportPreviewModalOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParam, statusFilter, typeFilter]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const controller = new AbortController();

    const fetchClients = async () => {
      try {
        const { data } = await api.get("/crm/clients", {
          params: {
            searchParam,
            status: statusFilter,
            type: typeFilter,
            pageNumber
          },
          signal: controller.signal
        });

        if (isMounted) {
          dispatch({ type: "LOAD_CLIENTS", payload: data.clients });
          setHasMore(data.hasMore);
        }
      } catch (err) {
        if (isMounted && err.name !== "CanceledError") {
          toastError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchParam, statusFilter, typeFilter, pageNumber, refreshToken]);

  const handleScroll = (event) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleOpenModal = (clientId = null) => {
    setSelectedClientId(clientId);
    setClientModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedClientId(null);
    setClientModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  };

  const handleOpenFaturaModal = (client) => {
    setFaturaClient(client);
    setFaturaModalOpen(true);
  };

  const handleCloseFaturaModal = () => {
    setFaturaClient(null);
    setFaturaModalOpen(false);
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseOrOpenTicket = async (ticket) => {
    setTicketModalOpen(false);
    if (ticket !== undefined && ticket.id !== undefined) {
      const code = uuidv4();
      const { id, uuid } = ticket;
      setCurrentTicket({ id, uuid, code });
      history.push(`/atendimentos/${ticket.id}`);
    }
  };

  const handleOpenTicketFromClient = async (client) => {
    try {
      // Buscar contato pelo número de telefone do cliente
      const { data: contactsData } = await api.get("contacts", {
        params: { searchParam: client.phone || client.name }
      });
      
      let contact = null;
      if (contactsData?.contacts?.length > 0) {
        // Procurar contato com mesmo número de telefone
        contact = contactsData.contacts.find(c => c.number === client.phone);
      }
      
      // Se não encontrou contato, criar um novo
      if (!contact && client.phone) {
        const { data: newContact } = await api.post("contacts", {
          name: client.name,
          number: client.phone,
          email: client.email || ""
        });
        contact = newContact;
      }
      
      if (!contact) {
        toast.error("Não foi possível encontrar ou criar um contato para este cliente");
        return;
      }
      
      setSelectedClientForTicket({
        id: contact.id,
        name: contact.name,
        phone: contact.number,
        email: contact.email
      });
      setTicketModalOpen(true);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      await api.delete(`/crm/clients/${deletingClient.id}`);
      dispatch({ type: "DELETE_CLIENT", payload: deletingClient.id });
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingClient(null);
      setConfirmModalOpen(false);
    }
  };

  // **FUNÇÕES DE IMPORTAR E EXPORTAR**
  const handleExportClients = async () => {
    try {
      if (selectedClients.length === 0) {
        toast.error("Selecione pelo menos um cliente para exportar");
        return;
      }

      console.log("Iniciando exportação de clientes selecionados...");
      console.log("Clientes selecionados:", selectedClients);
      
      const response = await api.post("/crm/clients/export", {
        clientIds: selectedClients
      }, {
        responseType: 'blob'
      });

      console.log("Resposta recebida:", response);

      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${selectedClients.length} cliente(s) exportado(s) com sucesso!`);
      setSelectedClients([]); // Limpar seleção após exportar
    } catch (err) {
      console.error("Erro na exportação:", err);
      toastError(err);
    }
  };

  const handleImportClients = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setImportFile(file);
    
    // Primeira chamada: preview para validação
    api.post("/crm/clients/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        previewOnly: true
      }
    })
    .then(response => {
      if (response.data.preview) {
        setImportData(response.data.data);
        setImportPreviewModalOpen(true);
      } else {
        // Importação direta (fallback)
        toast.success("Importação concluída com sucesso!");
        setRefreshToken((prev) => prev + 1);
      }
    })
    .catch(err => {
      toastError(err);
    })
    .finally(() => {
      setLoading(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = '';
    });
  };

  const handleConfirmImport = (selectedItems) => {
    if (!importFile) return;

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('selectedItems', JSON.stringify(selectedItems.map(item => item.index)));

    setLoading(true);
    api.post("/crm/clients/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      toast.success(`Importação concluída! ${response.data.imported} clientes importados com sucesso.`);
      setRefreshToken((prev) => prev + 1);
      setImportPreviewModalOpen(false);
      setImportData(null);
      setImportFile(null);
    })
    .catch(err => {
      toastError(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleCloseImportModal = () => {
    setImportPreviewModalOpen(false);
    setImportData(null);
    setImportFile(null);
  };

  const getInitials = (name = "") => {
    if (!name.trim()) return "C";
    const pieces = name.trim().split(" ");
    return pieces
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const formatStatus = (status) => STATUS_LABEL[status] || "Ativo";

  const statusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.active;

  const statusBg = (status) => STATUS_BG[status] || STATUS_BG.active;

  const formatType = (type) => TYPE_LABEL[type] || "Pessoa Física";

  const paginatedItems = clients.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(clients.length / rowsPerPage);

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      <FaturaModal
        open={faturaModalOpen}
        onClose={handleCloseFaturaModal}
        fatura={
          faturaClient
            ? {
                clientId: faturaClient.id,
                client: faturaClient,
                descricao: "",
                valor: ""
              }
            : null
        }
        onSaved={() => {
          handleCloseFaturaModal();
        }}
      />

      <ImportPreviewModal
        open={importPreviewModalOpen}
        onClose={handleCloseImportModal}
        data={importData}
        onConfirm={handleConfirmImport}
        type="clients"
      />
      <ClientModal
        open={clientModalOpen}
        onClose={handleCloseModal}
        clientId={selectedClientId}
        onSuccess={handleModalSuccess}
      />

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Excluir cliente"
        onConfirm={handleDeleteClient}
      >
        Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Clientes</Typography>
            <Typography className={classes.headerSubtitle}>
              {clients.length} cliente(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <Box className={classes.filtersGroup}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Pesquisar por nome, documento ou telefone"
              value={searchParam}
              onChange={(event) => setSearchParam(event.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "#999" }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              size="small"
              label="Tipo"
              variant="outlined"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className={classes.selectField}
            >
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              variant="outlined"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={classes.selectField}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box className={classes.actionsGroup}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              className={classes.addButton}
              component="label"
            >
              Importar
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportClients}
                style={{ display: 'none' }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudDownloadIcon />}
              className={classes.addButton}
              onClick={handleExportClients}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={`${classes.addButton} ${classes.primaryButton}`}
              onClick={() => handleOpenModal()}
            >
              Novo Cliente
            </Button>
          </Box>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <TableContainer component={Paper}>
            <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell style={{ width: 50 }}>
                  <Checkbox
                    size="small"
                    style={{ color: "#fff" }}
                    checked={selectedClients.length === clients.length && clients.length > 0}
                    indeterminate={selectedClients.length > 0 && selectedClients.length < clients.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClients(clients.map(client => client.id));
                      } else {
                        setSelectedClients([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">E-mail</TableCell>
                <TableCell align="center">Telefone</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading && clients.length === 0 ? (
                <TableRowSkeleton columns={7} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum cliente encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((client) => (
                  <TableRow
                    key={client.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => history.push(`/clientes/${client.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={selectedClients.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients([...selectedClients, client.id]);
                          } else {
                            setSelectedClients(selectedClients.filter(id => id !== client.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className={classes.nameCell}>
                      <Box className={classes.nameWrapper}>
                        <Avatar
                          className={classes.itemAvatar}
                          style={{ backgroundColor: statusColor(client.status), color: "#fff" }}
                        >
                          {getInitials(client.name)}
                        </Avatar>
                        <Box>
                          <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                            {client.name || "Cliente sem nome"}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#999" }}>
                            ID: {client.id} {client.document ? `• ${client.document}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{client.email || "—"}</TableCell>
                    <TableCell align="center">{client.phone || "—"}</TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">{formatType(client.type)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={formatStatus(client.status)}
                        className={classes.statusChip}
                        style={{
                          backgroundColor: statusBg(client.status),
                          color: statusColor(client.status),
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(client.id);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nova fatura">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFaturaModal(client);
                            }}
                            style={{ color: "#f59e0b" }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Abrir ticket">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTicketFromClient(client);
                            }}
                            style={{ color: "#10b981" }}
                          >
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              history.push(`/clientes/${client.id}`);
                            }}
                            style={{ color: "#6366f1" }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingClient(client);
                              setConfirmModalOpen(true);
                            }}
                            style={{ color: "#ef4444" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </TableContainer>

          {clients.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, clients.length)} de{" "}
                {clients.length} resultado(s)
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageIdx = i;
                  if (totalPages > 5) {
                    const start = Math.max(0, Math.min(tablePage - 2, totalPages - 5));
                    pageIdx = start + i;
                  }
                  return (
                    <Button
                      key={pageIdx}
                      size="small"
                      variant={pageIdx === tablePage ? "contained" : "text"}
                      color={pageIdx === tablePage ? "primary" : "default"}
                      onClick={() => setTablePage(pageIdx)}
                      style={{
                        minWidth: 32,
                        borderRadius: 6,
                        fontWeight: pageIdx === tablePage ? 700 : 400,
                      }}
                    >
                      {pageIdx + 1}
                    </Button>
                  );
                })}
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

      <NewTicketModal
        modalOpen={ticketModalOpen}
        initialContact={selectedClientForTicket ? {
          id: selectedClientForTicket.id,
          name: selectedClientForTicket.name,
          number: selectedClientForTicket.phone || "",
          email: selectedClientForTicket.email || ""
        } : null}
        onClose={(ticket) => handleCloseOrOpenTicket(ticket)}
      />
    </Box>
  );
};

export default Clients;
