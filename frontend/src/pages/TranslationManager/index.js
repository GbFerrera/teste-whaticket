import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  CircularProgress,
  Collapse,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import LanguageIcon from "@material-ui/icons/Language";
import TranslateIcon from "@material-ui/icons/Translate";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

// Curated translation keys grouped by section
const CURATED_KEYS = {
  "Login & Cadastro": [
    { key: "signup.title", ptDefault: "Crie sua conta" },
    { key: "signup.form.name", ptDefault: "Nome" },
    { key: "signup.form.email", ptDefault: "Email" },
    { key: "signup.form.password", ptDefault: "Senha" },
    { key: "signup.form.company", ptDefault: "Nome da Empresa" },
    { key: "signup.form.phone", ptDefault: "Whatsapp (DDD + NÚMERO)" },
    { key: "signup.buttons.submit", ptDefault: "Cadastrar" },
    { key: "signup.buttons.login", ptDefault: "Já tem uma conta? Entre!" },
    { key: "signup.toasts.success", ptDefault: "Usuário criado com sucesso! Faça seu login!!!." },
    { key: "signup.toasts.fail", ptDefault: "Erro ao criar usuário. Verifique os dados informados." },
    { key: "login.title", ptDefault: "Login" },
    { key: "login.form.email", ptDefault: "Email" },
    { key: "login.form.password", ptDefault: "Senha" },
    { key: "login.buttons.submit", ptDefault: "Entrar no Sistema" },
    { key: "login.buttons.register", ptDefault: "Cadastre-se agora!" },
    { key: "auth.toasts.success", ptDefault: "Login efetuado com sucesso!" },
    { key: "auth.dueDate.expiration", ptDefault: "Sua assinatura expira em" },
    { key: "auth.dueDate.days", ptDefault: "dias!" },
    { key: "auth.dueDate.expirationToday", ptDefault: "Sua assinatura expira hoje!" },
  ],
  "Menu / Sidebar": [
    { key: "mainDrawer.listItems.dashboard", ptDefault: "Dashboard" },
    { key: "mainDrawer.listItems.connections", ptDefault: "Conexões" },
    { key: "mainDrawer.listItems.tickets", ptDefault: "Atendimentos" },
    { key: "mainDrawer.listItems.contacts", ptDefault: "Contatos" },
    { key: "mainDrawer.listItems.queues", ptDefault: "Filas & Chatbot" },
    { key: "mainDrawer.listItems.administration", ptDefault: "Administração" },
    { key: "mainDrawer.listItems.users", ptDefault: "Usuários" },
    { key: "mainDrawer.listItems.settings", ptDefault: "Configurações" },
    { key: "mainDrawer.listItems.campaigns", ptDefault: "Campanhas" },
    { key: "mainDrawer.listItems.annoucements", ptDefault: "Informativos" },
    { key: "mainDrawer.listItems.chats", ptDefault: "Chat Interno" },
    { key: "mainDrawer.listItems.financeiro", ptDefault: "Financeiro" },
    { key: "mainDrawer.listItems.files", ptDefault: "Lista de arquivos" },
    { key: "mainDrawer.listItems.prompts", ptDefault: "Open.AI" },
    { key: "mainDrawer.listItems.helps", ptDefault: "Ajuda" },
    { key: "mainDrawer.appBar.user.profile", ptDefault: "Perfil" },
    { key: "mainDrawer.appBar.user.logout", ptDefault: "Sair" },
  ],
  "Dashboard": [
    { key: "dashboard.tabs.indicators", ptDefault: "Indicadores" },
    { key: "dashboard.tabs.assessments", ptDefault: "NPS" },
    { key: "dashboard.tabs.attendants", ptDefault: "Atendentes" },
    { key: "dashboard.charts.perDay.title", ptDefault: "Atendimentos hoje: " },
    { key: "dashboard.cards.inAttendance", ptDefault: "Em Atendimento" },
    { key: "dashboard.cards.waiting", ptDefault: "Aguardando" },
    { key: "dashboard.cards.activeAttendants", ptDefault: "Atendentes Ativos" },
    { key: "dashboard.cards.finalized", ptDefault: "Finalizados" },
    { key: "dashboard.cards.newContacts", ptDefault: "Novos Contatos" },
    { key: "dashboard.cards.totalReceivedMessages", ptDefault: "Mensagens Recebidas" },
    { key: "dashboard.cards.totalSentMessages", ptDefault: "Mensagens Enviadas" },
    { key: "dashboard.cards.averageServiceTime", ptDefault: "T.M. de Atendimento" },
    { key: "dashboard.cards.averageWaitingTime", ptDefault: "T.M. de Espera" },
    { key: "dashboard.date.initialDate", ptDefault: "Data Inicial" },
    { key: "dashboard.date.finalDate", ptDefault: "Data Final" },
  ],
  "Tickets / Atendimentos": [
    { key: "tickets.tabs.open.title", ptDefault: "Abertas" },
    { key: "tickets.tabs.closed.title", ptDefault: "Resolvidos" },
    { key: "tickets.tabs.search.title", ptDefault: "Busca" },
    { key: "tickets.search.placeholder", ptDefault: "Buscar tickets e mensagens" },
    { key: "tickets.buttons.showAll", ptDefault: "Todos" },
    { key: "tickets.notification.message", ptDefault: "Mensagem de" },
    { key: "ticketsList.pendingHeader", ptDefault: "Aguardando" },
    { key: "ticketsList.assignedHeader", ptDefault: "Atendendo" },
    { key: "ticketsList.noTicketsTitle", ptDefault: "Nada aqui!" },
    { key: "ticketsList.noTicketsMessage", ptDefault: "Nenhum ticket encontrado com esse status ou termo pesquisado" },
    { key: "ticketsList.buttons.accept", ptDefault: "Aceitar" },
    { key: "ticketsManager.buttons.newTicket", ptDefault: "Novo" },
    { key: "ticketsQueueSelect.placeholder", ptDefault: "Filas" },
    { key: "newTicketModal.title", ptDefault: "Criar Ticket" },
    { key: "newTicketModal.fieldLabel", ptDefault: "Digite para pesquisar o contato" },
    { key: "newTicketModal.buttons.ok", ptDefault: "Salvar" },
    { key: "newTicketModal.buttons.cancel", ptDefault: "Cancelar" },
    { key: "transferTicketModal.title", ptDefault: "Transferir Ticket" },
    { key: "transferTicketModal.fieldLabel", ptDefault: "Digite para buscar usuários" },
    { key: "transferTicketModal.buttons.ok", ptDefault: "Transferir" },
    { key: "transferTicketModal.buttons.cancel", ptDefault: "Cancelar" },
  ],
  "Contatos": [
    { key: "contacts.title", ptDefault: "Contatos" },
    { key: "contacts.searchPlaceholder", ptDefault: "Pesquisar..." },
    { key: "contacts.buttons.import", ptDefault: "Importar Contatos" },
    { key: "contacts.buttons.add", ptDefault: "Adicionar Contato" },
    { key: "contacts.table.name", ptDefault: "Nome" },
    { key: "contacts.table.whatsapp", ptDefault: "WhatsApp" },
    { key: "contacts.table.email", ptDefault: "Email" },
    { key: "contacts.table.actions", ptDefault: "Ações" },
    { key: "contactModal.title.add", ptDefault: "Adicionar contato" },
    { key: "contactModal.title.edit", ptDefault: "Editar contato" },
    { key: "contactModal.form.name", ptDefault: "Nome" },
    { key: "contactModal.form.number", ptDefault: "Número do Whatsapp" },
    { key: "contactModal.form.email", ptDefault: "Email" },
    { key: "contactModal.buttons.okAdd", ptDefault: "Adicionar" },
    { key: "contactModal.buttons.okEdit", ptDefault: "Salvar" },
    { key: "contactModal.buttons.cancel", ptDefault: "Cancelar" },
  ],
  "Conexões": [
    { key: "connections.title", ptDefault: "Conexões" },
    { key: "connections.buttons.add", ptDefault: "Adicionar Conexão" },
    { key: "connections.buttons.disconnect", ptDefault: "desconectar" },
    { key: "connections.buttons.tryAgain", ptDefault: "Tentar novamente" },
    { key: "connections.buttons.qrcode", ptDefault: "QR CODE" },
    { key: "connections.buttons.connecting", ptDefault: "Conectando" },
    { key: "connections.table.name", ptDefault: "Nome" },
    { key: "connections.table.status", ptDefault: "Status" },
    { key: "connections.table.lastUpdate", ptDefault: "Última atualização" },
    { key: "connections.table.actions", ptDefault: "Ações" },
    { key: "connections.toasts.deleted", ptDefault: "Conexão excluída com sucesso!" },
    { key: "connections.toasts.disconnected", ptDefault: "Conexão desconectada com sucesso!" },
  ],
  "Usuários": [
    { key: "users.title", ptDefault: "Usuários" },
    { key: "users.table.name", ptDefault: "Nome" },
    { key: "users.table.email", ptDefault: "Email" },
    { key: "users.table.profile", ptDefault: "Perfil" },
    { key: "users.table.actions", ptDefault: "Ações" },
    { key: "users.buttons.add", ptDefault: "Adicionar usuário" },
    { key: "users.toasts.deleted", ptDefault: "Usuário excluído com sucesso." },
    { key: "userModal.title.add", ptDefault: "Adicionar usuário" },
    { key: "userModal.title.edit", ptDefault: "Editar usuário" },
    { key: "userModal.form.name", ptDefault: "Nome" },
    { key: "userModal.form.email", ptDefault: "Email" },
    { key: "userModal.form.password", ptDefault: "Senha" },
    { key: "userModal.form.profile", ptDefault: "Perfil" },
    { key: "userModal.buttons.okAdd", ptDefault: "Adicionar" },
    { key: "userModal.buttons.okEdit", ptDefault: "Salvar" },
    { key: "userModal.buttons.cancel", ptDefault: "Cancelar" },
  ],
  "Filas": [
    { key: "queues.title", ptDefault: "Filas" },
    { key: "queues.table.name", ptDefault: "Nome" },
    { key: "queues.table.color", ptDefault: "Cor" },
    { key: "queues.table.greeting", ptDefault: "Mensagem de saudação" },
    { key: "queues.table.actions", ptDefault: "Ações" },
    { key: "queues.buttons.add", ptDefault: "Adicionar fila" },
    { key: "queueModal.title.add", ptDefault: "Adicionar fila" },
    { key: "queueModal.title.edit", ptDefault: "Editar fila" },
    { key: "queueModal.buttons.okAdd", ptDefault: "Adicionar" },
    { key: "queueModal.buttons.okEdit", ptDefault: "Salvar" },
    { key: "queueModal.buttons.cancel", ptDefault: "Cancelar" },
    { key: "queueSelect.inputLabel", ptDefault: "Filas" },
  ],
  "Chat & Mensagens": [
    { key: "chat.noTicketMessage", ptDefault: "Selecione um ticket para começar a conversar." },
    { key: "messagesInput.placeholderOpen", ptDefault: "Digite uma mensagem" },
    { key: "messagesInput.placeholderClosed", ptDefault: "Reabra ou aceite esse ticket para enviar uma mensagem." },
    { key: "messagesInput.signMessage", ptDefault: "Assinar" },
    { key: "messagesList.header.assignedTo", ptDefault: "Atribuído à:" },
    { key: "messagesList.header.buttons.return", ptDefault: "Retornar" },
    { key: "messagesList.header.buttons.resolve", ptDefault: "Resolver" },
    { key: "messagesList.header.buttons.reopen", ptDefault: "Reabrir" },
    { key: "messagesList.header.buttons.accept", ptDefault: "Aceitar" },
    { key: "contactDrawer.header", ptDefault: "Dados do contato" },
    { key: "contactDrawer.buttons.edit", ptDefault: "Editar contato" },
    { key: "contactDrawer.extraInfo", ptDefault: "Outras informações" },
  ],
  "Configurações": [
    { key: "settings.title", ptDefault: "Configurações" },
    { key: "settings.success", ptDefault: "Configurações salvas com sucesso." },
    { key: "settings.settings.userCreation.name", ptDefault: "Criação de usuário" },
    { key: "settings.settings.userCreation.options.enabled", ptDefault: "Ativado" },
    { key: "settings.settings.userCreation.options.disabled", ptDefault: "Desativado" },
  ],
  "Respostas Rápidas": [
    { key: "quickMessages.title", ptDefault: "Respostas Rápidas" },
    { key: "quickMessages.searchPlaceholder", ptDefault: "Pesquisar..." },
    { key: "quickMessages.buttons.add", ptDefault: "Adicionar" },
    { key: "quickMessages.buttons.attach", ptDefault: "Arquivo" },
    { key: "quickMessages.buttons.cancel", ptDefault: "Cancelar" },
    { key: "quickMessages.buttons.edit", ptDefault: "Editar" },
    { key: "quickMessages.toasts.success", ptDefault: "Atalho adicionado com sucesso!" },
    { key: "quickMessages.toasts.deleted", ptDefault: "Atalho removido com sucesso!" },
    { key: "quickMessages.dialog.title", ptDefault: "Mensagem Rápida" },
    { key: "quickMessages.dialog.shortcode", ptDefault: "Atalho" },
    { key: "quickMessages.dialog.message", ptDefault: "Resposta" },
    { key: "quickMessages.dialog.save", ptDefault: "Salvar" },
    { key: "quickMessages.dialog.cancel", ptDefault: "Cancelar" },
  ],
  "Notificações & Geral": [
    { key: "notifications.noTickets", ptDefault: "Nenhuma notificação." },
    { key: "confirmationModal.buttons.confirm", ptDefault: "Ok" },
    { key: "confirmationModal.buttons.cancel", ptDefault: "Cancelar" },
    { key: "ticketOptionsMenu.delete", ptDefault: "Deletar" },
    { key: "ticketOptionsMenu.transfer", ptDefault: "Transferir" },
    { key: "messageOptionsMenu.delete", ptDefault: "Deletar" },
    { key: "messageOptionsMenu.reply", ptDefault: "Responder" },
  ],
  "Erros do Sistema": [
    { key: "backendErrors.ERR_NO_OTHER_WHATSAPP", ptDefault: "Deve haver pelo menos um WhatsApp padrão." },
    { key: "backendErrors.ERR_NO_DEF_WAPP_FOUND", ptDefault: "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões." },
    { key: "backendErrors.ERR_WAPP_NOT_INITIALIZED", ptDefault: "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões." },
    { key: "backendErrors.ERR_INVALID_CREDENTIALS", ptDefault: "Erro de autenticação. Por favor, tente novamente." },
    { key: "backendErrors.ERR_SESSION_EXPIRED", ptDefault: "Sessão expirada. Por favor entre." },
    { key: "backendErrors.ERR_NO_PERMISSION", ptDefault: "Você não tem permissão para acessar este recurso." },
    { key: "backendErrors.ERR_DUPLICATED_CONTACT", ptDefault: "Já existe um contato com este número." },
    { key: "backendErrors.ERR_NO_TICKET_FOUND", ptDefault: "Nenhum tíquete encontrado com este ID." },
    { key: "backendErrors.ERR_NO_USER_FOUND", ptDefault: "Nenhum usuário encontrado com este ID." },
    { key: "backendErrors.ERR_OTHER_OPEN_TICKET", ptDefault: "Já existe um tíquete aberto para este contato." },
    { key: "backendErrors.ERR_USER_CREATION_DISABLED", ptDefault: "A criação do usuário foi desabilitada pelo administrador." },
  ],
};

const ALL_CURATED_KEYS = Object.values(CURATED_KEYS).flat();

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 24,
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  mainGrid: {
    display: "flex",
    gap: 24,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  leftPanel: {
    width: 320,
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  rightPanel: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1e293b",
  },
  cardBody: {
    padding: 0,
  },
  langItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
    transition: "background-color 0.15s",
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  langItemActive: {
    backgroundColor: "#eff6ff !important",
    borderLeft: "3px solid",
    borderLeftColor: theme.palette.primary.main,
  },
  langName: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e293b",
  },
  langCode: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 8,
  },
  langActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  searchField: {
    margin: "12px 20px",
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      backgroundColor: "#f8fafc",
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      backgroundColor: "#f1f5f9",
    },
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: 13,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  translationRow: {
    display: "flex",
    alignItems: "flex-start",
    padding: "10px 20px",
    borderBottom: "1px solid #f8fafc",
    gap: 12,
  },
  translationKey: {
    width: 200,
    flexShrink: 0,
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
    paddingTop: 10,
    wordBreak: "break-all",
  },
  translationPt: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    paddingTop: 10,
    minWidth: 0,
  },
  translationInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 6,
      fontSize: 13,
    },
    "& .MuiOutlinedInput-input": {
      padding: "8px 12px",
    },
  },
  untranslated: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fffbeb",
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
  },
  statsChip: {
    height: 24,
    fontSize: 11,
    fontWeight: 600,
  },
  emptyState: {
    padding: "48px 24px",
    textAlign: "center",
    color: "#94a3b8",
  },
  importInput: {
    display: "none",
  },
}));

const TranslationManager = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [translations, setTranslations] = useState({});
  const [editedTranslations, setEditedTranslations] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoTranslating, setAutoTranslating] = useState(false);

  // Language modal
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langModalMode, setLangModalMode] = useState("create"); // "create" or "edit"
  const [langModalData, setLangModalData] = useState({ code: "", name: "" });
  const [editingLangId, setEditingLangId] = useState(null);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLang, setDeletingLang] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLang) {
      fetchTranslations(selectedLang.code);
    }
  }, [selectedLang]);

  const fetchLanguages = async () => {
    try {
      const { data } = await api.get("/translations/languages");
      setLanguages(data);
    } catch (err) {
      toastError(err);
    }
  };

  const fetchTranslations = async (langCode) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/translations/${langCode}`);
      setTranslations(data);
      setEditedTranslations({ ...data });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslations = async () => {
    if (!selectedLang) return;
    try {
      setSaving(true);
      await api.put(`/translations/${selectedLang.code}`, {
        translations: editedTranslations,
      });
      setTranslations({ ...editedTranslations });
      toast.success("Traduções salvas com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLanguage = async () => {
    try {
      if (!langModalData.code || !langModalData.name) {
        toast.error("Preencha o código e nome do idioma");
        return;
      }
      await api.post("/translations/languages", langModalData);
      toast.success("Idioma criado com sucesso!");
      setLangModalOpen(false);
      setLangModalData({ code: "", name: "" });
      fetchLanguages();
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateLanguage = async () => {
    try {
      await api.put(`/translations/languages/${editingLangId}`, langModalData);
      toast.success("Idioma atualizado!");
      setLangModalOpen(false);
      setLangModalData({ code: "", name: "" });
      setEditingLangId(null);
      fetchLanguages();
    } catch (err) {
      toastError(err);
    }
  };

  const handleToggleActive = async (lang) => {
    try {
      await api.put(`/translations/languages/${lang.id}`, {
        active: !lang.active,
      });
      fetchLanguages();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteLanguage = async () => {
    if (!deletingLang) return;
    try {
      await api.delete(`/translations/languages/${deletingLang.id}`);
      toast.success("Idioma removido!");
      setDeleteModalOpen(false);
      setDeletingLang(null);
      if (selectedLang?.id === deletingLang.id) {
        setSelectedLang(null);
        setTranslations({});
        setEditedTranslations({});
      }
      fetchLanguages();
    } catch (err) {
      toastError(err);
    }
  };

  const handleExport = async () => {
    if (!selectedLang) return;
    try {
      const { data } = await api.get(
        `/translations/${selectedLang.code}/export`
      );
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedLang.code}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportação concluída!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleImport = async (event) => {
    if (!selectedLang) return;
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const importData = json.translations || json;

      await api.post(`/translations/${selectedLang.code}/import`, {
        translations: importData,
      });
      toast.success("Importação concluída!");
      fetchTranslations(selectedLang.code);
    } catch (err) {
      toastError(err);
    }
    event.target.value = "";
  };

  const handleAutoTranslate = async (overwrite = false) => {
    if (!selectedLang) return;
    if (selectedLang.code === "pt-BR") {
      toast.error("Não é possível traduzir automaticamente para o idioma de origem (Português).");
      return;
    }

    try {
      setAutoTranslating(true);
      const keysToTranslate = ALL_CURATED_KEYS.map((item) => ({
        key: item.key,
        sourceText: item.ptDefault,
      }));

      const { data } = await api.post(
        `/translations/${selectedLang.code}/auto-translate`,
        {
          keys: keysToTranslate,
          sourceLanguage: "pt-BR",
          overwrite,
        }
      );

      // Atualizar campos com os resultados
      setEditedTranslations((prev) => ({
        ...prev,
        ...data.results,
      }));

      toast.success(
        `Tradução automática concluída! ${data.translated} traduzidas, ${data.skipped} já existiam.`
      );
    } catch (err) {
      toastError(err);
    } finally {
      setAutoTranslating(false);
    }
  };

  const handleTranslationChange = (key, value) => {
    setEditedTranslations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getFilteredSections = () => {
    const filtered = {};
    const search = searchTerm.toLowerCase();

    Object.entries(CURATED_KEYS).forEach(([section, keys]) => {
      const matchingKeys = keys.filter(
        (k) =>
          k.key.toLowerCase().includes(search) ||
          k.ptDefault.toLowerCase().includes(search) ||
          (editedTranslations[k.key] || "").toLowerCase().includes(search)
      );
      if (matchingKeys.length > 0) {
        filtered[section] = matchingKeys;
      }
    });

    return filtered;
  };

  const getTranslationStats = () => {
    const total = ALL_CURATED_KEYS.length;
    const translated = ALL_CURATED_KEYS.filter(
      (k) => editedTranslations[k.key] && editedTranslations[k.key].trim() !== ""
    ).length;
    return { total, translated, missing: total - translated };
  };

  const hasChanges = () => {
    return JSON.stringify(translations) !== JSON.stringify(editedTranslations);
  };

  const filteredSections = selectedLang ? getFilteredSections() : {};
  const stats = selectedLang ? getTranslationStats() : { total: 0, translated: 0, missing: 0 };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography className={classes.headerTitle}>
          <TranslateIcon style={{ fontSize: 28 }} />
          Gerenciador de Traduções
        </Typography>
        <Typography className={classes.headerSubtitle}>
          Gerencie idiomas e traduções do sistema. As alterações valem para todas as empresas.
        </Typography>
      </Box>

      <Box className={classes.mainGrid}>
        {/* LEFT PANEL - Languages */}
        <Box className={classes.leftPanel}>
          <Box className={classes.card}>
            <Box className={classes.cardHeader}>
              <Typography className={classes.cardTitle}>
                <LanguageIcon style={{ fontSize: 18, marginRight: 8, verticalAlign: "middle" }} />
                Idiomas
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setLangModalMode("create");
                  setLangModalData({ code: "", name: "" });
                  setLangModalOpen(true);
                }}
                style={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}
              >
                Novo
              </Button>
            </Box>
            <Box className={classes.cardBody}>
              {languages.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography>Nenhum idioma cadastrado</Typography>
                </Box>
              ) : (
                languages.map((lang) => (
                  <Box
                    key={lang.id}
                    className={`${classes.langItem} ${
                      selectedLang?.id === lang.id ? classes.langItemActive : ""
                    }`}
                    onClick={() => setSelectedLang(lang)}
                  >
                    <Box>
                      <Typography className={classes.langName}>
                        {lang.name}
                        <span className={classes.langCode}>({lang.code})</span>
                      </Typography>
                    </Box>
                    <Box className={classes.langActions}>
                      <Switch
                        size="small"
                        checked={lang.active}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(lang);
                        }}
                        color="primary"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLangModalMode("edit");
                          setLangModalData({ code: lang.code, name: lang.name });
                          setEditingLangId(lang.id);
                          setLangModalOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingLang(lang);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* RIGHT PANEL - Translation Editor */}
        <Box className={classes.rightPanel}>
          <Box className={classes.card}>
            {!selectedLang ? (
              <Box className={classes.emptyState}>
                <TranslateIcon style={{ fontSize: 48, color: "#e2e8f0", marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: "#94a3b8", fontWeight: 600 }}>
                  Selecione um idioma
                </Typography>
                <Typography style={{ color: "#cbd5e1", fontSize: 14, marginTop: 4 }}>
                  Escolha um idioma na lista à esquerda para editar suas traduções
                </Typography>
              </Box>
            ) : (
              <>
                <Box className={classes.cardHeader}>
                  <Typography className={classes.cardTitle}>
                    Traduções — {selectedLang.name} ({selectedLang.code})
                  </Typography>
                </Box>

                <Box className={classes.toolbar}>
                  <Chip
                    label={`${stats.translated}/${stats.total} traduzidas`}
                    size="small"
                    className={classes.statsChip}
                    style={{
                      backgroundColor: stats.missing === 0 ? "#dcfce7" : "#fef3c7",
                      color: stats.missing === 0 ? "#166534" : "#92400e",
                    }}
                  />
                  {stats.missing > 0 && (
                    <Chip
                      label={`${stats.missing} pendentes`}
                      size="small"
                      className={classes.statsChip}
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                    />
                  )}
                  <Box style={{ flex: 1 }} />
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={
                      autoTranslating ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <TranslateIcon />
                      )
                    }
                    onClick={() => handleAutoTranslate(false)}
                    disabled={autoTranslating || selectedLang?.code === "pt-BR"}
                    style={{
                      borderRadius: 8,
                      textTransform: "none",
                      fontWeight: 600,
                      marginRight: 4,
                    }}
                  >
                    {autoTranslating ? "Traduzindo..." : "Traduzir automaticamente"}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<GetAppIcon />}
                    onClick={handleExport}
                    style={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Exportar JSON
                  </Button>
                  <input
                    accept=".json"
                    className={classes.importInput}
                    id="import-json-file"
                    type="file"
                    onChange={handleImport}
                  />
                  <label htmlFor="import-json-file">
                    <Button
                      size="small"
                      component="span"
                      startIcon={<PublishIcon />}
                      style={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Importar JSON
                    </Button>
                  </label>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveTranslations}
                    disabled={saving || !hasChanges()}
                    style={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}
                  >
                    Salvar
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Buscar chave ou texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={classes.searchField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {loading ? (
                  <Box style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box className={classes.cardBody}>
                    {Object.entries(filteredSections).map(([section, keys]) => (
                      <Box key={section}>
                        <Box
                          className={classes.sectionHeader}
                          onClick={() => toggleSection(section)}
                        >
                          <Typography className={classes.sectionTitle}>
                            {section} ({keys.length})
                          </Typography>
                          {expandedSections[section] ? (
                            <ExpandLessIcon style={{ color: "#94a3b8", fontSize: 20 }} />
                          ) : (
                            <ExpandMoreIcon style={{ color: "#94a3b8", fontSize: 20 }} />
                          )}
                        </Box>
                        <Collapse in={expandedSections[section]}>
                          {keys.map((item) => {
                            const currentValue = editedTranslations[item.key] || "";
                            const isUntranslated = !currentValue.trim();
                            return (
                              <Box key={item.key} className={classes.translationRow}>
                                <Typography className={classes.translationKey}>
                                  {item.key}
                                </Typography>
                                <Typography className={classes.translationPt}>
                                  {item.ptDefault}
                                </Typography>
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  placeholder="Tradução..."
                                  value={currentValue}
                                  onChange={(e) =>
                                    handleTranslationChange(item.key, e.target.value)
                                  }
                                  className={`${classes.translationInput} ${
                                    isUntranslated ? classes.untranslated : ""
                                  }`}
                                />
                              </Box>
                            );
                          })}
                        </Collapse>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal - Criar/Editar Idioma */}
      <Dialog
        open={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {langModalMode === "create" ? "Novo Idioma" : "Editar Idioma"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            label="Código (ex: fr, de, it)"
            value={langModalData.code}
            onChange={(e) =>
              setLangModalData((prev) => ({ ...prev, code: e.target.value }))
            }
            disabled={langModalMode === "edit"}
            style={{ marginBottom: 16, marginTop: 8 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Nome (ex: Français, Deutsch)"
            value={langModalData.name}
            onChange={(e) =>
              setLangModalData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLangModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={
              langModalMode === "create"
                ? handleCreateLanguage
                : handleUpdateLanguage
            }
          >
            {langModalMode === "create" ? "Criar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal - Confirmar Exclusão */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remover Idioma</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover o idioma{" "}
            <strong>{deletingLang?.name}</strong> ({deletingLang?.code})?
            Todas as traduções deste idioma serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#dc2626", color: "#fff" }}
            onClick={handleDeleteLanguage}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranslationManager;
