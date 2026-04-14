import React, { useState, useEffect, useReducer, useContext } from "react";
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
import ChatIcon from "@material-ui/icons/Chat";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import api from "../../services/api";
import LeadModal from "../../components/LeadModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import NewTicketModal from "../../components/NewTicketModal";
import ImportPreviewModal from "../../components/ImportPreviewModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const STATUS_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Novo", value: "new" },
  { label: "Contactado", value: "contacted" },
  { label: "Qualificado", value: "qualified" },
  { label: "Não qualificado", value: "unqualified" },
  { label: "Convertido", value: "converted" },
  { label: "Perdido", value: "lost" }
];

const STATUS_LABEL = {
  new: "Novo",
  contacted: "Contactado",
  qualified: "Qualificado",
  unqualified: "Não qualificado",
  converted: "Convertido",
  lost: "Perdido"
};

const STATUS_COLORS = {
  new: "#3b82f6",
  contacted: "#6366f1",
  qualified: "#059669",
  unqualified: "#f97316",
  converted: "#0f766e",
  lost: "#dc2626"
};

const STATUS_BG = {
  new: "#dbeafe",
  contacted: "#e0e7ff",
  qualified: "#dcfce7",
  unqualified: "#fff7ed",
  converted: "#ccfbf1",
  lost: "#fee2e2"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return [];
    case "LOAD_LEADS": {
      const incoming = action.payload;
      const clone = [...state];
      incoming.forEach((lead) => {
        const index = clone.findIndex((item) => item.id === lead.id);
        if (index > -1) {
          clone[index] = lead;
        } else {
          clone.push(lead);
        }
      });
      return clone;
    }
    case "DELETE_LEAD":
      return state.filter((lead) => lead.id !== action.payload);
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
  selectField: {
    minWidth: 160,
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

const Leads = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [leads, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingLead, setDeletingLead] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedLeadForTicket, setSelectedLeadForTicket] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;
  const [importPreviewModalOpen, setImportPreviewModalOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParam, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const controller = new AbortController();

    const fetchLeads = async () => {
      try {
        const { data } = await api.get("/crm/leads", {
          params: {
            searchParam,
            status: statusFilter,
            pageNumber
          },
          signal: controller.signal
        });

        if (isMounted) {
          dispatch({ type: "LOAD_LEADS", payload: data.leads });
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

    fetchLeads();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchParam, statusFilter, pageNumber, refreshToken]);

  const handleScroll = (event) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleOpenModal = (leadId = null) => {
    setSelectedLeadId(leadId);
    setLeadModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLeadId(null);
    setLeadModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  };

  const handleDeleteLead = async () => {
    if (!deletingLead) return;

    try {
      await api.delete(`/crm/leads/${deletingLead.id}`);
      dispatch({ type: "DELETE_LEAD", payload: deletingLead.id });
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingLead(null);
      setConfirmModalOpen(false);
    }
  };

  // **FUNÇÕES DE IMPORTAR E EXPORTAR**
  const handleExportLeads = async () => {
    try {
      if (selectedLeads.length === 0) {
        toast.error("Selecione pelo menos um lead para exportar");
        return;
      }

      console.log("Iniciando exportação de leads selecionados...");
      console.log("Leads selecionados:", selectedLeads);
      
      const response = await api.post("/crm/leads/export", {
        leadIds: selectedLeads
      }, {
        responseType: 'blob'
      });

      console.log("Resposta recebida:", response);

      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${selectedLeads.length} lead(s) exportado(s) com sucesso!`);
      setSelectedLeads([]); // Limpar seleção após exportar
    } catch (err) {
      console.error("Erro na exportação:", err);
      toastError(err);
    }
  };

  const handleImportLeads = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setImportFile(file);
    
    // Primeira chamada: preview para validação
    api.post("/crm/leads/import", formData, {
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
    api.post("/crm/leads/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      toast.success(`Importação concluída! ${response.data.imported} leads importados com sucesso.`);
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
    if (!name.trim()) return "L";
    const pieces = name.trim().split(" ");
    return pieces.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  };

  const formatStatus = (status) => STATUS_LABEL[status] || "Novo";

  const statusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.new;

  const statusBg = (status) => STATUS_BG[status] || STATUS_BG.new;

  const paginatedItems = leads.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(leads.length / rowsPerPage);

  const handleCloseOrOpenTicket = async (ticket) => {
    setTicketModalOpen(false);
    if (ticket !== undefined && ticket.id !== undefined) {
      const code = uuidv4();
      const { id, uuid } = ticket;
      setCurrentTicket({ id, uuid, code });
      history.push(`/atendimentos/${ticket.id}`);
    }
  };

  const handleOpenTicketFromLead = async (lead) => {
    try {
      // Buscar contato pelo número de telefone do lead
      const { data: contactsData } = await api.get("contacts", {
        params: { searchParam: lead.phone || lead.name }
      });
      
      let contact = null;
      if (contactsData?.contacts?.length > 0) {
        // Procurar contato com mesmo número de telefone
        contact = contactsData.contacts.find(c => c.number === lead.phone);
      }
      
      // Se não encontrou contato, criar um novo
      if (!contact && lead.phone) {
        const { data: newContact } = await api.post("contacts", {
          name: lead.name,
          number: lead.phone,
          email: lead.email || ""
        });
        contact = newContact;
      }
      
      if (!contact) {
        toast.error("Não foi possível encontrar ou criar um contato para este lead");
        return;
      }
      
      setSelectedLeadForTicket({
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

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      <LeadModal
        open={leadModalOpen}
        onClose={handleCloseModal}
        leadId={selectedLeadId}
        onSuccess={handleModalSuccess}
      />

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Excluir lead"
        onConfirm={handleDeleteLead}
      >
        Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <NewTicketModal
        modalOpen={ticketModalOpen}
        initialContact={selectedLeadForTicket ? {
          id: selectedLeadForTicket.id,
          name: selectedLeadForTicket.name,
          number: selectedLeadForTicket.phone || "",
          email: selectedLeadForTicket.email || ""
        } : null}
        onClose={(ticket) => handleCloseOrOpenTicket(ticket)}
      />

      <ImportPreviewModal
        open={importPreviewModalOpen}
        onClose={handleCloseImportModal}
        data={importData}
        onConfirm={handleConfirmImport}
        type="leads"
      />

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Leads</Typography>
            <Typography className={classes.headerSubtitle}>
              {leads.length} lead(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Pesquisar por nome, e-mail ou telefone"
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
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            className={classes.addButton}
            component="label"
            style={{ marginRight: 8 }}
          >
            Importar
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportLeads}
              style={{ display: 'none' }}
            />
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            className={classes.addButton}
            onClick={handleExportLeads}
            style={{ marginRight: 8 }}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => handleOpenModal()}
          >
            Novo Lead
          </Button>
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
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      indeterminate={selectedLeads.length > 0 && selectedLeads.length < leads.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(leads.map((lead) => lead.id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">E-mail</TableCell>
                  <TableCell align="center">Telefone</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {loading && leads.length === 0 ? (
                  <TableRowSkeleton columns={7} />
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box className={classes.emptyState}>
                        <Typography>Nenhum lead encontrado</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((lead) => (
                    <TableRow
                      key={lead.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenModal(lead.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads([...selectedLeads, lead.id]);
                            } else {
                              setSelectedLeads(selectedLeads.filter((id) => id !== lead.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
                          <Avatar
                            className={classes.itemAvatar}
                            style={{ backgroundColor: statusColor(lead.status), color: "#fff" }}
                          >
                            {getInitials(lead.name)}
                          </Avatar>
                          <Box>
                            <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                              {lead.name || "Lead sem nome"}
                            </Typography>
                            <Typography variant="caption" style={{ color: "#999" }}>
                              ID: {lead.id} {lead.companyName ? `• ${lead.companyName}` : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{lead.email || "—"}</TableCell>
                      <TableCell align="center">{lead.phone || "—"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={formatStatus(lead.status)}
                          className={classes.statusChip}
                          style={{
                            backgroundColor: statusBg(lead.status),
                            color: statusColor(lead.status),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{lead.score ?? 0}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(lead.id);
                              }}
                              style={{ color: "#1976d2" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Abrir ticket">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadForTicket(lead);
                                setTicketModalOpen(true);
                              }}
                              style={{ color: "#10b981" }}
                            >
                              <ChatIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingLead(lead);
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

          {leads.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, leads.length)} de{" "}
                {leads.length} resultado(s)
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
    </Box>
  );
};

export default Leads;