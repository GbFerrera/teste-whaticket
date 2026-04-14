import React, { useState, useEffect, useReducer, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import PersonIcon from "@material-ui/icons/Person";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import BlockIcon from "@material-ui/icons/Block";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FileUploadIcon from "@material-ui/icons/CloudUpload";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ContactPhoneIcon from "@material-ui/icons/ContactPhone";
import BackupIcon from "@material-ui/icons/Backup";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import { v4 as uuidv4 } from "uuid";
import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
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
  importButton: {
    borderRadius: 8,
    padding: "6px 16px",
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#4caf50",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#388e3c",
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
    cursor: "pointer",
    border: "2px solid #1976d2",
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
  bulkActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 24px",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    margin: "0 24px",
  },
}));

const ExpandableAvatar = ({ contact, classes }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Avatar
        src={contact?.urlPicture}
        className={classes.itemAvatar}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        {!contact?.urlPicture && <PersonIcon />}
      </Avatar>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <img
          src={contact?.urlPicture}
          alt="Contact"
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        />
      </Dialog>
    </>
  );
};

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const { user, socket } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [importContactModalOpen, setImportContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [blockingContact, setBlockingContact] = useState(null);
  const [unBlockingContact, setUnBlockingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const fileUploadRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [importWhatsappId, setImportWhatsappId] = useState();
  const [ImportContacts, setImportContacts] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  const { getAll: getAllSettings } = useCompanySettings();
  const [hideNum, setHideNum] = useState(false);

  // Menu de importação
  const [anchorEl, setAnchorEl] = useState(null);

  // Função para baixar modelo de planilha
  const downloadContactTemplate = () => {
    // Criar cabeçalho com todos os campos disponíveis
    const headers = [
      'Nome *', // obrigatório
      'Número *', // obrigatório
      'E-mail',
      'Tags',
      'URL Foto Perfil',
      'É Grupo',
      'Desabilitar Bot',
      'Aceitar Áudio',
      'Ativo',
      'Canal',
      'CPF/CNPJ',
      'Endereço',
      'Informações Adicionais',
      'Data de Nascimento',
      'Data de Aniversário',
      'Score Potencial',
      'É Potencial',
      'Salvo no Telefone',
      'Remote JID',
      'LID',
      'É LID'
    ];

    // Criar linha de exemplo
    const exampleRow = [
      'João Silva',
      '5511999998888',
      'joao@email.com',
      'cliente,vip',
      'https://exemplo.com/foto.jpg',
      'false',
      'false',
      'true',
      'true',
      'whatsapp',
      '123.456.789-00',
      'Rua das Flores, 123 - São Paulo/SP',
      'Cliente VIP, prefere atendimento via WhatsApp',
      '15/03/1990',
      '20/04/2025',
      '85',
      'true',
      'false',
      '5511999998888@s.whatsapp.net',
      '123456789',
      'false'
    ];

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_contatos.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Modelo de planilha baixado com sucesso!');
  };

  const getDisplayName = (c) => {
    if (!c || !c.name) return "Contato sem nome";
    const onlyDigits = /^\+?\d+$/.test(c.name.replace(/\s+/g, ""));
    return onlyDigits ? "Contato sem nome" : c.name;
  };

  useEffect(() => {
    async function fetchData() {
      const settingList = await getAllSettings(user.companyId);
      for (const [key, value] of Object.entries(settingList)) {
        if (key === "lgpdHideNumber") setHideNum(value === "enabled");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, selectedTags]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber, contactTag: JSON.stringify(selectedTags) },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, selectedTags]);

  useEffect(() => {
    const companyId = user.companyId;

    const onContactEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    };
    socket.on(`company-${companyId}-contact`, onContactEvent);

    return () => {
      socket.off(`company-${companyId}-contact`, onContactEvent);
    };
  }, [socket, user.companyId]);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.id !== undefined) {
      handleSelectTicket(ticket);
      history.push(`/atendimentos/${ticket.id}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleToggleSelectContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  const handleDeleteSelectedContacts = async () => {
    try {
      for (const id of selectedContacts) {
        await api.delete(`/contacts/${id}`);
      }
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setConfirmBulkDeleteOpen(false);
    setSelectedContacts([]);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: false });
      toast.success("Contato bloqueado");
    } catch (err) {
      toastError(err);
    }
    setBlockingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleUnBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: true });
      toast.success("Contato desbloqueado");
    } catch (err) {
      toastError(err);
    }
    setUnBlockingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const onSave = (whatsappId) => {
    setImportWhatsappId(whatsappId);
  };

  const handleImportContact = async () => {
    setConfirmOpen(false);
    setImportContacts(null);
    
    try {
      toast.info('Importando contatos do aparelho... Aguarde.');
      
      await api.post("/contacts/import", { whatsappId: importWhatsappId });
      
      toast.success('Contatos importados com sucesso!');
      
      // Recarregar lista de contatos sem recarregar a página
      setPageNumber(1);
      setSearchParam('');
      setSelectedTags([]);
      
    } catch (err) {
      toastError(err);
    }
  };

  const handleImportExcel = async () => {
    setConfirmOpen(false);
    
    try {
      toast.info('Importando contatos do Excel... Aguarde.');
      
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `/contacts/upload`,
        method: "POST",
        data: formData,
      });
      
      toast.success('Contatos importados com sucesso!');
      
      // Recarregar lista de contatos sem recarregar a página
      setPageNumber(1);
      setSearchParam('');
      setSelectedTags([]);
      
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const paginatedItems = contacts.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(contacts.length / rowsPerPage);

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      {/* Modais */}
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => handleCloseOrOpenTicket(ticket)}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${getDisplayName(deletingContact)}?`
            : blockingContact
            ? `Bloquear Contato ${getDisplayName(blockingContact)}?`
            : unBlockingContact
            ? `Desbloquear Contato ${getDisplayName(unBlockingContact)}?`
            : ImportContacts
            ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
            : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        onSave={onSave}
        isCellPhone={ImportContacts}
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : blockingContact
            ? handleBlockContact(blockingContact.id)
            : unBlockingContact
            ? handleUnBlockContact(unBlockingContact.id)
            : ImportContacts
            ? handleImportContact()
            : handleImportExcel()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : blockingContact
          ? `${i18n.t("contacts.confirmationModal.blockContact")}`
          : unBlockingContact
          ? `${i18n.t("contacts.confirmationModal.unblockContact")}`
          : ImportContacts
          ? `Escolha de qual conexão deseja importar`
          : `${i18n.t("contactListItems.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title="Excluir contatos selecionados"
        open={confirmBulkDeleteOpen}
        onClose={setConfirmBulkDeleteOpen}
        onConfirm={handleDeleteSelectedContacts}
      >
        {`Você tem ${selectedContacts.length} contato(s) selecionado(s). Deseja realmente excluir todos?`}
      </ConfirmationModal>

      {importContactModalOpen && (
        <ContactImportWpModal
          isOpen={importContactModalOpen}
          handleClose={() => setImportContactModalOpen(false)}
          selectedTags={selectedTags}
          hideNum={hideNum}
          userProfile={user.profile}
        />
      )}

      {/* Input oculto para upload */}
      <input
        style={{ display: "none" }}
        id="upload"
        name="file"
        type="file"
        accept=".xls,.xlsx"
        onChange={() => setConfirmOpen(true)}
        ref={fileUploadRef}
      />

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>
              {i18n.t("contacts.title")}
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {contacts.length} contato(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <TagsFilter onFiltered={handleSelectedTags} />
          <TextField
            size="small"
            variant="outlined"
            placeholder={i18n.t("contacts.searchPlaceholder")}
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            className={classes.importButton}
            startIcon={<FileUploadIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Importar
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setConfirmOpen(true);
                setImportContacts(true);
                setAnchorEl(null);
              }}
            >
              <ContactPhoneIcon fontSize="small" style={{ marginRight: 10 }} />
              {i18n.t("contacts.menu.importYourPhone")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setImportContactModalOpen(true);
                setAnchorEl(null);
              }}
            >
              <BackupIcon fontSize="small" style={{ marginRight: 10 }} />
              {i18n.t("contacts.menu.importToExcel")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                downloadContactTemplate();
                setAnchorEl(null);
              }}
            >
              <FileUploadIcon fontSize="small" style={{ marginRight: 10 }} />
              Baixar Modelo Planilha
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenContactModal}
            className={classes.addButton}
          >
            Novo Contato
          </Button>
        </Box>
      </Box>

      {/* Ações em massa */}
      {selectedContacts.length > 0 && (
        <Box className={classes.bulkActions}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            {selectedContacts.length} selecionado(s)
          </Typography>
          <Button
            size="small"
            color="secondary"
            variant="contained"
            onClick={() => setConfirmBulkDeleteOpen(true)}
            style={{ borderRadius: 6, textTransform: "none" }}
          >
            Excluir selecionados
          </Button>
          <Button
            size="small"
            onClick={handleClearSelection}
            style={{ borderRadius: 6, textTransform: "none" }}
          >
            Limpar seleção
          </Button>
        </Box>
      )}

      {/* Content - Tabela */}
      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell padding="checkbox" style={{ width: 40 }}>
                  <Checkbox
                    style={{ color: "#cbd5e1" }}
                    indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
                    checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(contacts.map((c) => c.id));
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell style={{ width: 50 }}></TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Número</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading && contacts.length === 0 ? (
                <TableRowSkeleton columns={6} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum contato encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((contact) => (
                  <TableRow
                    key={contact.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditContact(contact.id)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        color="primary"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleToggleSelectContact(contact.id)}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ExpandableAvatar contact={contact} classes={classes} />
                    </TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {getDisplayName(contact)}
                      </Typography>
                      <Typography variant="caption" style={{ color: "#999" }}>
                        ID: {contact.id}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{contact.number}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={contact.active ? "Ativo" : "Bloqueado"}
                        className={classes.statusChip}
                        style={{
                          backgroundColor: contact.active ? "#dcfce7" : "#fee2e2",
                          color: contact.active ? "#166534" : "#991b1b",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <Tooltip title="WhatsApp">
                          <IconButton
                            size="small"
                            disabled={!contact.active}
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactTicket(contact);
                              setNewTicketModalOpen(true);
                            }}
                            style={{ color: "#25D366" }}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditContact(contact.id);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={contact.active ? "Bloquear" : "Desbloquear"}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmOpen(true);
                              if (contact.active) {
                                setBlockingContact(contact);
                              } else {
                                setUnBlockingContact(contact);
                              }
                            }}
                            style={{ color: contact.active ? "#ff9800" : "#4caf50" }}
                          >
                            {contact.active ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmOpen(true);
                                  setDeletingContact(contact);
                                }}
                                style={{ color: "#ef4444" }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {contacts.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, contacts.length)} de{" "}
                {contacts.length} resultado(s)
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

export default Contacts;