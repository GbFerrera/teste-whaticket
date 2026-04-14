import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Link as MuiLink,
  TextField,
  Button,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  Switch
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import GetAppIcon from "@material-ui/icons/GetApp";
import LinkIcon from "@material-ui/icons/Link";
import CloseIcon from "@material-ui/icons/Close";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { TagsContainer } from "../TagsContainer";
import { TagsKanbanContainer } from "../TagsKanbanContainer";
import { ContactNotes } from "../ContactNotes";
import api from "../../services/api";
import { toast } from "react-toastify";

const channelStyles = {
  whatsapp: { label: "WhatsApp", color: "#25d366" },
  facebook: { label: "Facebook", color: "#1877F2" },
  instagram: { label: "Instagram", color: "#E4405F" },
  messenger: { label: "Messenger", color: "#0099FF" },
  telegram: { label: "Telegram", color: "#229ED9" },
};

const useStyles = makeStyles(() => ({
  drawerPaper: {
    width: 420,
    maxWidth: "100%",
    backgroundColor: "#ffffff",
    color: "#1f2c34",
    borderLeft: "1px solid #e2e8f0",
    overflowX: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    border: "2px solid rgba(255,255,255,0.1)",
  },
  content: {
    padding: "24px 24px 32px",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 12,
  },
  contactInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  contactInfoItem: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 12,
    backgroundColor: "#ffffff",
  },
  summaryCard: {
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    color: "#64748b",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
  },
  section: {
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tabsRoot: {
    borderBottom: "1px solid #e2e8f0",
  },
  tabPanel: {
    marginTop: 16,
  },
  closeButton: {
    color: "#475569",
    marginLeft: "auto",
  },
  chipTag: {
    fontWeight: 600,
    color: "#0f172a",
  },
}));

const TicketTagsKanbanModal = ({ open, onClose, contact, ticket, onUpdate }) => {
  const classes = useStyles();
  const ITEMS_PER_BATCH = 3;
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(ticket?.queueId || "");
  const [loading, setLoading] = useState(false);
  const [savingValue, setSavingValue] = useState(false);
  const [leadValue, setLeadValue] = useState(ticket?.leadValue || "");
  const [currentLeadValue, setCurrentLeadValue] = useState(
    ticket?.leadValue ?? null
  );
  const [activeTab, setActiveTab] = useState("files");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [imageMessages, setImageMessages] = useState([]);
  const [fileMessages, setFileMessages] = useState([]);
  const [linkMessages, setLinkMessages] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(ticket || null);
  const [contactDetails, setContactDetails] = useState(contact || null);
  const [botToggleLoading, setBotToggleLoading] = useState(false);
  const [audioToggleLoading, setAudioToggleLoading] = useState(false);
  const [activeToggleLoading, setActiveToggleLoading] = useState(false);
  const [extraInfoFields, setExtraInfoFields] = useState([]);
  const [extraInfoSaving, setExtraInfoSaving] = useState(false);
  const [fileVisibleCount, setFileVisibleCount] = useState(ITEMS_PER_BATCH);
  const [linkVisibleCount, setLinkVisibleCount] = useState(ITEMS_PER_BATCH);
  const [imageVisibleCount, setImageVisibleCount] = useState(ITEMS_PER_BATCH);
  const autoSaveTimeoutRef = useRef(null);
  const latestExtraInfoRef = useRef(extraInfoFields);
  const resolvedTicket = ticketDetails || ticket;
  const resolvedContact = contactDetails || resolvedTicket?.contact || contact;

  useEffect(() => {
    if (open && ticket?.id) {
      setTicketDetails(ticket);
      setSelectedQueue(ticket?.queueId || "");
      setLeadValue(ticket?.leadValue || "");
      setCurrentLeadValue(ticket?.leadValue ?? null);
      loadQueues();
      loadTicketDetails(ticket.id);
      loadTicketMedia(ticket.id);
      const contactId = ticket?.contact?.id || contact?.id;
      if (contactId) {
        loadContactDetails(contactId);
      } else {
        setContactDetails(contact || null);
      }
    }
  }, [open, ticket?.id, contact?.id]);

  useEffect(() => {
    if (!open) {
      setTicketDetails(ticket || null);
      setContactDetails(contact || null);
    }
  }, [open, ticket, contact]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    if (resolvedContact?.extraInfo) {
      setExtraInfoFields(
        resolvedContact.extraInfo.map((info) => ({
          id: info.id ?? null,
          tempId: `info-${info.id || Math.random()}`,
          name: info.name || "",
          value: info.value || "",
        }))
      );
    } else {
      setExtraInfoFields([]);
    }
    setExtraInfoSaving(false);
  }, [resolvedContact?.extraInfo]);

  useEffect(() => {
    setFileVisibleCount(ITEMS_PER_BATCH);
  }, [fileMessages.length]);

  useEffect(() => {
    setLinkVisibleCount(ITEMS_PER_BATCH);
  }, [linkMessages.length]);

  useEffect(() => {
    setImageVisibleCount(ITEMS_PER_BATCH);
  }, [imageMessages.length]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    latestExtraInfoRef.current = extraInfoFields;
  }, [extraInfoFields]);

  const persistExtraInfo = useCallback(
    async (fieldsSnapshot) => {
      if (!resolvedContact?.id) return;
      try {
        const payload = fieldsSnapshot
          .filter(
            (info) =>
              info.id ||
              info.name?.trim() ||
              info.value?.trim()
          )
          .map((info) => ({
            id: info.id || undefined,
            name: info.name?.trim() || "",
            value: info.value?.trim() || ""
          }));

        const body = {
          extraInfo: payload,
          name: resolvedContact.name,
          number: resolvedContact.number,
          email: resolvedContact.email
        };

        const { data } = await api.put(`/contacts/${resolvedContact.id}`, body);
        setContactDetails(data);
      } catch (err) {
        console.error("Erro ao salvar informações adicionais:", err);
        toast.error("Não foi possível salvar as informações adicionais.");
      } finally {
        setExtraInfoSaving(false);
        autoSaveTimeoutRef.current = null;
      }
    },
    [resolvedContact?.id, resolvedContact?.name, resolvedContact?.number, resolvedContact?.email]
  );

  const scheduleExtraInfoSave = useCallback(
    (fieldsSnapshot) => {
      if (!resolvedContact?.id) return;
      setExtraInfoSaving(true);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        persistExtraInfo(fieldsSnapshot);
      }, 700);
    },
    [persistExtraInfo, resolvedContact?.id]
  );

  const loadTicketDetails = async (ticketId) => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/tickets/${ticketId}`);
      setTicketDetails(data);
      setLeadValue(data?.leadValue || "");
      setCurrentLeadValue(data?.leadValue ?? null);
      setSelectedQueue(data?.queueId || "");
    } catch (err) {
      console.error("Erro ao carregar ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContactDetails = async (contactId) => {
    if (!contactId) return;
    try {
      const { data } = await api.get(`/contacts/${contactId}`);
      setContactDetails(data);
    } catch (err) {
      console.error("Erro ao carregar contato:", err);
    }
  };

  const loadQueues = async () => {
    try {
      const { data } = await api.get("/queue");
      setQueues(data);
    } catch (err) {
      console.error("Erro ao carregar filas:", err);
    }
  };

  const handleSaveLeadValue = async () => {
    if (!ticket?.id) return;
    setSavingValue(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        leadValue: leadValue === "" ? null : Number(leadValue)
      });
      toast.success("Valor do ticket atualizado!");
      const normalizedValue = leadValue === "" ? null : Number(leadValue);
      setCurrentLeadValue(normalizedValue);
      setTicketDetails((prev) =>
        prev ? { ...prev, leadValue: normalizedValue } : prev
      );
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Erro ao salvar valor do ticket:", err);
      toast.error("Não foi possível salvar o valor.");
      setLeadValue(ticket?.leadValue || "");
    } finally {
      setSavingValue(false);
    }
  };

  const handleQueueChange = async (event) => {
    const queueId = event.target.value;
    setSelectedQueue(queueId);
    if (!ticket?.id) return;
    setLoadingQueue(true);

    try {
      await api.put(`/tickets/${ticket.id}`, {
        queueId: queueId || null,
      });
      toast.success("Fila atualizada!");
      setTicketDetails((prev) =>
        prev ? { ...prev, queueId: queueId || null } : prev
      );
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar fila.");
      setSelectedQueue(ticket?.queueId || "");
    } finally {
      setLoadingQueue(false);
    }
  };

  const loadTicketMedia = async (ticketId) => {
    const idToUse = ticketId || resolvedTicket?.id;
    if (!idToUse) return;
    setMediaLoading(true);

    try {
      let page = 1;
      let hasMore = true;
      const allMessages = [];
      const MAX_PAGES = 10;

      while (hasMore && page <= MAX_PAGES) {
        const { data } = await api.get(`/messages/${idToUse}`, {
          params: { pageNumber: page }
        });

        if (data?.messages?.length) {
          allMessages.push(...data.messages);
        }

        hasMore = Boolean(data?.hasMore && data.messages?.length);
        page += 1;
      }

      const images = [];
      const files = [];
      const links = [];
      const urlRegex = /(https?:\/\/[^\s]+)/gi;

      allMessages.forEach((message) => {
        const isBase64Image = message.body && message.body.startsWith("data:image/");
        const isImage = message.mediaType === "image" || isBase64Image;
        const mediaUrl = isBase64Image ? message.body : message.mediaUrl;

        if (isImage && mediaUrl) {
          images.push({
            id: message.id,
            url: mediaUrl,
            caption: message.body && !isBase64Image ? message.body : "",
            createdAt: message.createdAt,
            fromMe: message.fromMe
          });
        } else if (message.mediaUrl && !isBase64Image) {
          const fileName =
            message.body ||
            message.mediaUrl?.split("/").pop()?.split("?")[0] ||
            "arquivo";

          files.push({
            id: message.id,
            url: message.mediaUrl,
            name: fileName,
            fileSize: message.fileSize,
            createdAt: message.createdAt,
            mediaType: message.mediaType
          });
        }

        if (message.body) {
          const matches = message.body.match(urlRegex);
          if (matches) {
            matches.forEach((url, index) => {
              links.push({
                id: `${message.id}-${index}`,
                url,
                text: message.body,
                createdAt: message.createdAt
              });
            });
          }
        }
      });

      setImageMessages(images);
      setFileMessages(files);
      setLinkMessages(links);
    } catch (err) {
      console.error("Erro ao carregar mídias do ticket:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDateTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString("pt-BR");
    } catch {
      return "";
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === "" || typeof value === "undefined") {
      return "R$ 0,00";
    }
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      return "R$ 0,00";
    }
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const formatFileName = (name, maxLength = 15) => {
    if (!name) return "arquivo";
    if (name.length <= maxLength) return name;
    const dotIndex = name.lastIndexOf(".");
    const extension = dotIndex > 0 ? name.slice(dotIndex) : "";
    const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
    const allowedBase = Math.max(1, maxLength - extension.length - 3);
    return `${base.slice(0, allowedBase)}...${extension}`;
  };

  const renderEmptyState = (text) => (
    <Typography style={{ textAlign: "center", color: "#667781", marginTop: 24 }}>
      {text}
    </Typography>
  );

  const formatDate = (value) => {
    if (!value) return "Não informado";
    try {
      return new Date(value).toLocaleDateString("pt-BR");
    } catch {
      return "Não informado";
    }
  };

  const renderFilesTab = () => {
    if (mediaLoading) {
      return (
        <Box display="flex" justifyContent="center" padding={3}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (fileMessages.length === 0) {
      return renderEmptyState("Nenhum arquivo encontrado nesta conversa.");
    }

    const visibleFiles = fileMessages.slice(0, fileVisibleCount);

    return (
      <Box mt={2} display="flex" flexDirection="column" gridGap={12}>
        {visibleFiles.map((file) => (
          <Box
            key={file.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12
            }}
          >
            <Box display="flex" alignItems="center" gridGap={12} style={{ flex: 1 }}>
              <InsertDriveFileIcon style={{ color: "#54656f" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography style={{ fontWeight: 500, color: "#111b21" }}>
                  {formatFileName(file.name)}
                </Typography>
                <Typography style={{ fontSize: 12, color: "#667781" }}>
                  {formatDateTime(file.createdAt)}
                </Typography>
              </div>
            </Box>
            <IconButton component="a" href={file.url} target="_blank" rel="noopener">
              <GetAppIcon />
            </IconButton>
          </Box>
        ))}
        {fileVisibleCount < fileMessages.length && (
          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFileVisibleCount((prev) =>
                  Math.min(prev + ITEMS_PER_BATCH, fileMessages.length)
                )
              }
            >
              Ver mais
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const renderImagesTab = () => {
    if (mediaLoading) {
      return (
        <Box display="flex" justifyContent="center" padding={3}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (imageMessages.length === 0) {
      return renderEmptyState("Nenhuma imagem encontrada nesta conversa.");
    }

    const visibleImages = imageMessages.slice(0, imageVisibleCount);

    return (
      <>
        <Box
          mt={2}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12
          }}
        >
          {visibleImages.map((image) => (
            <Box
              key={image.id}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #e5e5e5",
                cursor: "pointer"
              }}
              onClick={() => window.open(image.url, "_blank")}
            >
              <img
                src={image.url}
                alt=""
                style={{ width: "100%", height: 120, objectFit: "cover" }}
              />
              <Box p={1}>
                <Typography style={{ fontSize: 12, color: "#667781" }}>
                  {formatDateTime(image.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        {imageVisibleCount < imageMessages.length && (
          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setImageVisibleCount((prev) =>
                  Math.min(prev + ITEMS_PER_BATCH, imageMessages.length)
                )
              }
            >
              Ver mais
            </Button>
          </Box>
        )}
      </>
    );
  };

  const renderLinksTab = () => {
    if (mediaLoading) {
      return (
        <Box display="flex" justifyContent="center" padding={3}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (linkMessages.length === 0) {
      return renderEmptyState("Nenhum link encontrado nesta conversa.");
    }

    const visibleLinks = linkMessages.slice(0, linkVisibleCount);

    return (
      <Box mt={2} display="flex" flexDirection="column" gridGap={12}>
        {visibleLinks.map((link) => (
          <Box
            key={link.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12
            }}
          >
            <Box display="flex" alignItems="center" gridGap={8} mb={1}>
              <LinkIcon style={{ fontSize: 18, color: "#54656f" }} />
              <MuiLink href={link.url} target="_blank" rel="noopener">
                {link.url}
              </MuiLink>
            </Box>
            <Typography style={{ fontSize: 12, color: "#667781" }}>
              {formatDateTime(link.createdAt)}
            </Typography>
          </Box>
        ))}
        {linkVisibleCount < linkMessages.length && (
          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setLinkVisibleCount((prev) =>
                  Math.min(prev + ITEMS_PER_BATCH, linkMessages.length)
                )
              }
            >
              Ver mais
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const contactName =
    resolvedContact?.name ||
    resolvedContact?.number ||
    "Contato sem nome";
  const contactNumber = resolvedContact?.number || resolvedContact?.email || "";
  const channelInfo = channelStyles[resolvedTicket?.channel] || {
    label: (resolvedTicket?.channel || "Canal indefinido")?.toUpperCase(),
    color: "#54656f",
  };
  const contactAvatar =
    resolvedContact?.profilePicUrl ||
    resolvedContact?.urlPicture ||
    "https://ui-avatars.com/api/?background=00a884&color=fff&name=" +
      encodeURIComponent(contactName);

  const kanbanStage = useMemo(() => {
    const tags = resolvedTicket?.tags || [];
    const firstKanbanTag = tags.find((tag) => tag?.kanban === 1);
    const fallbackTag = tags[0];
    return firstKanbanTag?.name || fallbackTag?.name || "Sem etapa";
  }, [resolvedTicket?.tags]);

  const handleKanbanUpdated = () => {
    loadTicketDetails(resolvedTicket?.id || ticket?.id);
  };

  const linkedClient = resolvedTicket?.crmClient || resolvedContact?.crmClient;

  const summaryCards = [
    {
      label: "Valor potencial",
      value: formatCurrency(currentLeadValue),
    },
    {
      label: "Fila",
      value: queues.find(q => q.id === selectedQueue)?.name || "Sem fila",
    },
    {
      label: "Etapa Kanban",
      value: kanbanStage,
    },
    {
      label: "Tags do contato",
      value: `${resolvedContact?.tags?.length || 0}`,
    },
  ];

  const contactInfoCards = useMemo(() => {
    if (!resolvedContact) return [];
    return [
      {
        label: "CPF/CNPJ",
        value: resolvedContact?.cpfCnpj || "Não informado",
      },
      {
        label: "Data aniversário",
        value: formatDate(resolvedContact?.birthday),
      },
      {
        label: "Endereço",
        value: resolvedContact?.address || "Não informado",
      },
      {
        label: "Email",
        value: resolvedContact?.email || "Não informado",
        isEmail: Boolean(resolvedContact?.email),
      },
    ];
  }, [resolvedContact]);

  const handleToggleDisableBot = async () => {
    if (!resolvedContact?.id) return;
    setBotToggleLoading(true);
    try {
      const { data } = await api.put(
        `/contacts/toggleDisableBot/${resolvedContact.id}`
      );
      setContactDetails((prev) =>
        prev ? { ...prev, disableBot: data.disableBot } : prev
      );
      toast.success(
        data.disableBot ? "Chatbot desabilitado" : "Chatbot habilitado"
      );
    } catch (err) {
      console.error("Erro ao alternar chatbot:", err);
      toast.error("Não foi possível atualizar o chatbot.");
    } finally {
      setBotToggleLoading(false);
    }
  };

  const handleToggleAcceptAudio = async () => {
    if (!resolvedContact?.id) return;
    setAudioToggleLoading(true);
    try {
      const { data } = await api.put(
        `/contacts/toggleAcceptAudio/${resolvedContact.id}`
      );
      setContactDetails((prev) =>
        prev ? { ...prev, acceptAudioMessage: data.acceptAudioMessage } : prev
      );
      toast.success(
        data.acceptAudioMessage
          ? "Áudio permitido para o contato."
          : "Áudio desativado para o contato."
      );
    } catch (err) {
      console.error("Erro ao alternar áudio:", err);
      toast.error("Não foi possível atualizar a permissão de áudio.");
    } finally {
      setAudioToggleLoading(false);
    }
  };

  const handleToggleActiveContact = async () => {
    if (!resolvedContact?.id) return;
    setActiveToggleLoading(true);
    const nextStatus = !resolvedContact?.active;
    try {
      await api.put(`/contacts/block/${resolvedContact.id}`, {
        active: nextStatus,
      });
      setContactDetails((prev) =>
        prev ? { ...prev, active: nextStatus } : prev
      );
      toast.success(
        nextStatus ? "Contato ativado com sucesso." : "Contato desativado."
      );
    } catch (err) {
      console.error("Erro ao alterar status do contato:", err);
      toast.error("Não foi possível alterar o status do contato.");
    } finally {
      setActiveToggleLoading(false);
    }
  };

  const renderSwitchRow = (label, value, onChange, loadingState, helperText) => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding="8px 0"
      style={{
        borderBottom: "1px solid rgba(148,163,184,0.2)",
      }}
    >
      <Box>
        <Typography style={{ fontWeight: 600 }}>{label}</Typography>
        {helperText && (
          <Typography style={{ fontSize: 12, color: "#64748b" }}>
            {helperText}
          </Typography>
        )}
      </Box>
      <Switch
        checked={Boolean(value)}
        onChange={onChange}
        color="primary"
        disabled={loadingState}
      />
    </Box>
  );

  const updateExtraInfoFields = useCallback(
    (producer, options = { schedule: false }) => {
      setExtraInfoFields((prev) => {
        const next =
          typeof producer === "function" ? producer(prev) : producer || prev;
        if (options.schedule) {
          scheduleExtraInfoSave(next);
        }
        return next;
      });
    },
    [scheduleExtraInfoSave]
  );

  const handleExtraInfoFieldChange = (uniqueId, field, value) => {
    updateExtraInfoFields((prev) =>
      prev.map((info) =>
        info.tempId === uniqueId ? { ...info, [field]: value } : info
      )
    );
  };

  const handleAddExtraInfoField = () => {
    updateExtraInfoFields((prev) => [
      ...prev,
      {
        id: null,
        tempId: `temp-${Date.now()}`,
        name: "",
        value: "",
      }
    ]);
  };

  const handleRemoveExtraInfoField = (uniqueId) => {
    updateExtraInfoFields(
      (prev) => prev.filter((info) => info.tempId !== uniqueId),
      { schedule: true }
    );
  };

  const handleExtraInfoFieldBlur = () => {
    scheduleExtraInfoSave(latestExtraInfoRef.current);
  };

  if (!ticket || !ticket.id) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.drawerPaper }}
    >
      <Box className={classes.header}>
        <Avatar src={contactAvatar} className={classes.avatar} />
        <Box>
          <Typography style={{ fontWeight: 600 }}>{contactName}</Typography>
          <Typography style={{ fontSize: 13, color: "#475569" }}>
            {contactNumber}
          </Typography>
          <Typography style={{ fontSize: 12, color: channelInfo.color }}>
            {channelInfo.label}
          </Typography>
        </Box>
        <IconButton onClick={onClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.summaryGrid}>
          {summaryCards.map((card) => (
            <Box key={card.label} className={classes.summaryCard}>
              <Typography className={classes.summaryLabel}>{card.label}</Typography>
              <Typography className={classes.summaryValue}>{card.value}</Typography>
            </Box>
          ))}
        </Box>

        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Valor do Lead</Typography>
          <Box display="flex" alignItems="center" gap={12}>
            <TextField
              label="Atualizar valor"
              variant="outlined"
              size="small"
              fullWidth
              value={leadValue}
              onChange={(e) => setLeadValue(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveLeadValue}
              disabled={savingValue}
            >
              {savingValue ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        </Box>

        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Fila do ticket</Typography>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Selecione a fila</InputLabel>
            <Select
              value={selectedQueue}
              onChange={handleQueueChange}
              label="Selecione a fila"
              disabled={loading || loadingQueue}
            >
              <MenuItem value="">
                <em>Sem fila</em>
              </MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: queue.color,
                      }}
                    />
                    {queue.name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {resolvedContact && (
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>
              Status do contato
            </Typography>
            {renderSwitchRow(
              "Desabilitar chatbot",
              resolvedContact?.disableBot,
              () => handleToggleDisableBot(),
              botToggleLoading,
              "Impede interações automáticas com este contato"
            )}
            {renderSwitchRow(
              "Áudio permitido",
              resolvedContact?.acceptAudioMessage,
              () => handleToggleAcceptAudio(),
              audioToggleLoading,
              "Define se o contato pode receber mensagens de voz"
            )}
            {renderSwitchRow(
              "Contato ativo",
              resolvedContact?.active,
              () => handleToggleActiveContact(),
              activeToggleLoading,
              "Desative para impedir novas conversas"
            )}
            {linkedClient?.id && (
              <Box mt={2}>
                <Divider style={{ margin: "12px 0" }} />
                <Typography
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 6,
                    fontWeight: 500
                  }}
                >
                  Vinculado ao cliente
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => window.open(`/clientes/${linkedClient.id}`, "_blank")}
                  style={{
                    textTransform: "none",
                    borderRadius: 999,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontWeight: 600,
                    background: "#2563eb"
                  }}
                >
                  Ver detalhes de {linkedClient.name || "cliente"}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {resolvedContact && (
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>
              Informações adicionais
            </Typography>
            <Typography style={{ fontSize: 12, color: extraInfoSaving ? "#0ea5e9" : "#94a3b8", marginBottom: 8 }}>
              {extraInfoSaving ? "Salvando alterações..." : "Alterações salvas automaticamente"}
            </Typography>
            <Box display="flex" flexDirection="column" gap={10}>
              {extraInfoFields.length === 0 && (
                <Typography style={{ color: "#64748b", fontSize: 14 }}>
                  Nenhuma informação cadastrada.
                </Typography>
              )}
              {extraInfoFields.map((info) => (
                <Box
                  key={info.tempId}
                  style={{
                    border: "1px solid #dbeafe",
                    borderRadius: 16,
                    padding: 12,
                    background: "#eff6ff",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={8}>
                    <TextField
                      placeholder="Título"
                      value={info.name}
                      onChange={(e) =>
                        handleExtraInfoFieldChange(info.tempId, "name", e.target.value)
                      }
                      variant="outlined"
                      size="small"
                      fullWidth
                      onBlur={handleExtraInfoFieldBlur}
                      InputProps={{
                        style: {
                          borderRadius: 999,
                          background: "#fff",
                          fontSize: 13,
                          height: 38,
                        },
                      }}
                    />
                    <TextField
                      placeholder="Valor"
                      value={info.value}
                      onChange={(e) =>
                        handleExtraInfoFieldChange(info.tempId, "value", e.target.value)
                      }
                      variant="outlined"
                      size="small"
                      fullWidth
                      onBlur={handleExtraInfoFieldBlur}
                      InputProps={{
                        style: {
                          borderRadius: 999,
                          background: "#fff",
                          fontSize: 13,
                          height: 38,
                        },
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveExtraInfoField(info.tempId)}
                      size="small"
                      style={{
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "#fff",
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddExtraInfoField}
                style={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Adicionar informação
              </Button>
            </Box>
          </Box>
        )}

        {resolvedContact && resolvedContact.id && (
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Tags do contato</Typography>
            <TagsContainer contact={resolvedContact} />
          </Box>
        )}

        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Kanban</Typography>
          <TagsKanbanContainer
            ticket={resolvedTicket}
            onStageChange={handleKanbanUpdated}
          />
        </Box>

        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Mídias, links e docs</Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="primary"
            className={classes.tabsRoot}
            variant="scrollable"
          >
            <Tab label={`Arquivos (${fileMessages.length})`} value="files" />
            <Tab label={`Links (${linkMessages.length})`} value="links" />
            <Tab label={`Imagens (${imageMessages.length})`} value="images" />
            <Tab label="Observações" value="notes" />
          </Tabs>
          <div className={classes.tabPanel}>
            {activeTab === "files" && renderFilesTab()}
            {activeTab === "links" && renderLinksTab()}
            {activeTab === "images" && renderImagesTab()}
            {activeTab === "notes" && (
              <Box mt={2}>
                <ContactNotes ticket={ticket} />
              </Box>
            )}
          </div>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TicketTagsKanbanModal;
