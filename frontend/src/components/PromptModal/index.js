import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Typography, Box, Chip, Tooltip, Tabs, Tab, Switch, Paper, Grid } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";
import { AuthContext } from "../../context/Auth/AuthContext";

// Ícones modernos
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Filter9PlusIcon from '@mui/icons-material/Filter9Plus';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import ExtensionIcon from "@material-ui/icons/Extension";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import ScheduleIcon from "@material-ui/icons/Schedule";
import EventNoteIcon from "@material-ui/icons/EventNote";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import EventBusyIcon from "@material-ui/icons/EventBusy";
import EditIcon from "@material-ui/icons/Edit";
import InfoIcon from "@material-ui/icons/Info";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import ForumIcon from "@material-ui/icons/Forum";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import CodeIcon from "@material-ui/icons/Code";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import BusinessIcon from "@material-ui/icons/Business";
import AssignmentIcon from "@material-ui/icons/Assignment";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import LinkIcon from "@material-ui/icons/Link";
import ImageIcon from "@material-ui/icons/Image";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import api from "../../services/api";
import { getBackendUrl } from "../../config";
import toastError from "../../errors/toastError";
import { TOOL_CATALOG, DEFAULT_SENSITIVE_TOOLS } from "../../constants/aiTools";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    multFieldLine: {
        display: "flex",
        gap: theme.spacing(2),
        "& > *": {
            flex: 1,
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            gap: theme.spacing(1),
        }
    },
    dialogPaper: {
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0px 16px 24px rgba(0, 0, 0, 0.12), 0px 6px 30px rgba(0, 0, 0, 0.08)",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "1000px",
        width: "98%",
        margin: "auto",
    },
    dialogHeader: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: theme.spacing(1.2),
        color: "white",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ffffff\" fill-opacity=\"0.05\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>') repeat",
            opacity: 0.3,
        }
    },
    dialogTitle: {
        fontWeight: 600,
        fontSize: "0.875rem",
        flexGrow: 1,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        zIndex: 1,
    },
    dialogIcon: {
        marginRight: theme.spacing(1),
        fontSize: "1.25rem",
        position: "relative",
        zIndex: 1,
    },
    dialogContent: {
        padding: theme.spacing(1.5),
        backgroundColor: "#fafafa",
        fontFamily: "'Inter', sans-serif",
    },
    sectionTitle: {
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#374151",
        marginBottom: theme.spacing(0.6),
        marginTop: theme.spacing(1.5),
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        "&:first-child": {
            marginTop: 0,
        }
    },
    sectionIcon: {
        marginRight: theme.spacing(0.5),
        color: "#6366f1",
        fontSize: "1rem",
    },
    formControl: {
        margin: theme.spacing(0.5, 0),
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "white",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
            "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
                borderWidth: "2px",
            }
        },
        "& .MuiInputLabel-outlined": {
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "0.875rem",
        }
    },
    fieldIcon: {
        color: "#6b7280",
    },
    providerChip: {
        height: 32,
        borderRadius: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        "& .MuiChip-label": {
            paddingLeft: 12,
            paddingRight: 12,
        }
    },
    openaiChip: {
        backgroundColor: "#10b981",
        color: "white",
        "&:hover": {
            backgroundColor: "#059669",
        }
    },
    geminiChip: {
        backgroundColor: "#3b82f6",
        color: "white",
        "&:hover": {
            backgroundColor: "#2563eb",
        }
    },
    modelSelect: {
        "& .MuiSelect-select": {
            display: 'flex',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif",
        },
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "white",
        }
    },
    freeLabel: {
        fontSize: "0.625rem",
        backgroundColor: "#dcfce7",
        color: "#166534",
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: 600,
        marginLeft: theme.spacing(1),
        fontFamily: "'Inter', sans-serif",
    },
    saveButton: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        fontSize: "0.8rem",
        textTransform: "none",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
    },
    cancelButton: {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "white",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        fontSize: "0.8rem",
        textTransform: "none",
        marginRight: theme.spacing(1.5),
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
    },
    dialogActions: {
        padding: theme.spacing(1.5, 3),
        backgroundColor: "white",
        borderTop: "1px solid #e5e7eb",
        justifyContent: "flex-end",
    },
    voiceSection: {
        backgroundColor: "white",
        borderRadius: "8px",
        padding: theme.spacing(1.5),
        border: "1px solid #e5e7eb",
        marginTop: theme.spacing(1),
    },
    configSection: {
        backgroundColor: "white",
        borderRadius: "8px", 
        padding: theme.spacing(1.5),
        border: "1px solid #e5e7eb",
        marginTop: theme.spacing(1),
    },
    toolGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: theme.spacing(1.5),
        marginTop: theme.spacing(1.5),
    },
    toolCard: {
        padding: theme.spacing(1.5),
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        minHeight: 160,
        backgroundColor: "#fff",
    },
    toolHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        gap: theme.spacing(1),
    },
    toolIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#eef2ff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
    },
    toolDescription: {
        fontSize: "0.8rem",
        color: "#4b5563",
        marginBottom: theme.spacing(1),
    },
    toolInstruction: {
        fontSize: "0.75rem",
        color: "#6b7280",
        fontStyle: "italic",
    },
    toolFooter: {
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    knowledgeContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        border: "1px dashed #cbd5f5",
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    knowledgeHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing(1),
    },
    knowledgeList: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1.5),
        width: "100%"
    },
    knowledgeCard: {
        width: "100%",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: theme.spacing(1.5),
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        minWidth: 220
    },
    knowledgeThumb: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        "& img": {
            width: "100%",
            height: "100%",
            objectFit: "cover"
        }
    },
    knowledgeMeta: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column"
    },
    knowledgeActions: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(0.5),
        alignItems: "flex-end"
    },
    knowledgeEmpty: {
        border: "1px dashed #d1d5db",
        borderRadius: 12,
        padding: theme.spacing(2),
        textAlign: "center",
        color: "#6b7280",
        width: "100%",
        backgroundColor: "#f9fafb"
    },
    fileInput: {
        display: "none",
    },
    uploadButton: {
        marginTop: theme.spacing(1),
        textTransform: "none",
    },
    previewChip: {
        paddingRight: theme.spacing(1),
        "& svg": {
            marginLeft: theme.spacing(0.5),
        },
    }
}));

const TOOL_ICONS = {
    send_product: ShoppingCartIcon,
    execute_tool: ExtensionIcon,
    like_message: FavoriteBorderIcon,
    send_contact_file: AttachFileIcon,
    send_emoji: InsertEmoticonIcon,
    get_company_schedule: ScheduleIcon,
    get_contact_schedules: EventNoteIcon,
    create_contact_schedule: EventAvailableIcon,
    update_contact_schedule: EventBusyIcon,
    get_contact_info: InfoIcon,
    update_contact_info: EditIcon,
    get_company_groups: GroupWorkIcon,
    send_group_message: ForumIcon,
    format_message: FormatQuoteIcon,
    execute_command: CodeIcon,
    call_prompt_agent: CallSplitIcon,
    list_professionals: PeopleOutlineIcon,
    get_asaas_second_copy: LocalOfferIcon,
    create_company: BusinessIcon,
    list_plans: AssignmentIcon,
    auto_variables: TextFieldsIcon,
};

const TOOL_INSTRUCTIONS = {
    send_product: 'Diga: "Use send_product com o código PROD-123".',
    execute_tool: 'Instrua: "Chame execute_tool usando o conector cobrança".',
    like_message: 'Comando simples: "like_message".',
    send_contact_file: 'Peça: "Use send_contact_file enviando o contrato".',
    send_emoji: 'Diga: "send_emoji 😀".',
    get_company_schedule: 'Pergunte: "get_company_schedule".',
    get_contact_schedules: 'Use: "get_contact_schedules".',
    create_contact_schedule: 'Exemplo: "create_contact_schedule dia 10 às 15h".',
    update_contact_schedule: 'Exemplo: "update_contact_schedule reagende para amanhã".',
    get_contact_info: 'Instrua: "get_contact_info".',
    update_contact_info: 'Instrua: "update_contact_info campo=telefone valor=55999999999".',
    get_company_groups: 'Comando: "get_company_groups".',
    send_group_message: 'Diga: "send_group_message para grupo ClientesVIP".',
    format_message: 'Use: "format_message "{{ms}}, {{name}}!"".',
    execute_command: 'Sempre use JSON: #{ "queueId":"5", "userId":"1", "tagId":"14" }.',
    call_prompt_agent: 'Fale: "call_prompt_agent vendedor_pro".',
    list_professionals: 'Comando: "list_professionals".',
    get_asaas_second_copy: 'Instrua: "Use get_asaas_second_copy com o CPF informado pelo cliente".',
    create_company: 'Somente matriz: "create_company" com os dados exigidos.',
    list_plans: 'Apenas matriz: "list_plans".',
    auto_variables: 'Use variáveis diretamente: "{{ms}} {{firstName}}!" - IMPORTANTE: deixe espaço antes da pontuação (correto: "{{queue}} ," / errado: "{{queue}},")'
};

const openaiModels = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" }
];

const geminiModels = [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", free: true },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite", free: false },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", free: false },
    { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash-8B", free: false },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", free: false },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", free: false },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", free: false }
];

const PromptModal = ({ open, onClose, promptId }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("openai");
    const [selectedModel, setSelectedModel] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [savedPrompts, setSavedPrompts] = useState([]);
    const [selectedSavedPrompt, setSelectedSavedPrompt] = useState("");
    const [knowledgeUploading, setKnowledgeUploading] = useState(false);
    const imageInputRef = useRef(null);
    const [linkForm, setLinkForm] = useState({ title: "", url: "" });
    const [textForm, setTextForm] = useState({ title: "", content: "" });

    const backendBaseUrl = useMemo(() => {
        const url = getBackendUrl();
        if (!url) return "";
        return url.replace(/\/+$/, "");
    }, []);

    const buildPublicUrl = useCallback(
        (path = "") => {
            if (!path) return "";
            if (path.startsWith("http://") || path.startsWith("https://")) {
                return path;
            }
            const sanitized = path.replace(/^\/+/, "");
            if (!backendBaseUrl) {
                return sanitized.startsWith("public/")
                    ? `/${sanitized}`
                    : `/public/${sanitized}`;
            }
            if (sanitized.startsWith("public/")) {
                return `${backendBaseUrl}/${sanitized}`;
            }
            return `${backendBaseUrl}/public/${sanitized}`;
        },
        [backendBaseUrl]
    );

    const resolveKnowledgeUrl = useCallback(
        (item) => {
            if (!item) return "";
            if (item.url) return buildPublicUrl(item.url);
            if (item.path) return buildPublicUrl(item.path);
            return "";
        },
        [buildPublicUrl]
    );

    const inferKnowledgeType = useCallback((item) => {
        if (item?.type) return item.type;
        if (item?.content) return "text";
        const reference = `${item?.title || ""} ${item?.url || ""} ${item?.path || ""}`.toLowerCase();
        if (/\.(png|jpe?g|gif|bmp|webp|svg)$/.test(reference)) return "image";
        if (/\.pdf$/.test(reference)) return "pdf";
        return "link";
    }, []);

    const handleCopyToClipboard = useCallback(async (text) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Link copiado!");
        } catch (err) {
            console.error(err);
            toastError("Não foi possível copiar o link.");
        }
    }, []);

    const uploadKnowledgeFile = useCallback(async (file) => {
        if (!file) return "";
        setKnowledgeUploading(true);
        const formData = new FormData();
        formData.append("medias", file);

        try {
            const { data } = await api.post("/flowbuilder/content", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (Array.isArray(data)) {
                return data[0];
            }

            if (typeof data === "string") {
                return data;
            }

            return data?.url || data?.path || "";
        } catch (err) {
            console.error(err);
            toastError(err);
            return "";
        } finally {
            setKnowledgeUploading(false);
        }
    }, []);

    const handleKnowledgeFileAdd = useCallback(async (file, type, values, setFieldValue) => {
        if (!file) return;
        const storedPath = await uploadKnowledgeFile(file);

        if (!storedPath) {
            toast.error("Não foi possível enviar o arquivo.");
            return;
        }

        const resource = {
            id: `${type}-${Date.now()}-${file.name}`,
            type,
            title: file.name,
            path: storedPath,
            size: file.size,
            mimeType: file.type,
            createdAt: new Date().toISOString()
        };

        const nextKnowledge = [...(values.knowledgeBase || []), resource];
        setFieldValue("knowledgeBase", nextKnowledge);
        toast.success("Arquivo adicionado à base de conhecimento!");
    }, [uploadKnowledgeFile]);

    const handleRemoveKnowledge = useCallback((resourceIndex, values, setFieldValue) => {
        const current = values.knowledgeBase || [];
        const next = current.filter((_, index) => index !== resourceIndex);
        setFieldValue("knowledgeBase", next);
    }, []);

    const isValidUrl = useCallback((url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }, []);

    const handleAddLinkResource = useCallback((values, setFieldValue) => {
        if (!linkForm.title.trim() || !linkForm.url.trim()) {
            toast.error("Informe o título e o link.");
            return;
        }

        if (!isValidUrl(linkForm.url.trim())) {
            toast.error("Informe um link válido (https://...).");
            return;
        }

        const resource = {
            id: `link-${Date.now()}`,
            type: "link",
            title: linkForm.title.trim(),
            url: linkForm.url.trim(),
            createdAt: new Date().toISOString()
        };

        const next = [...(values.knowledgeBase || []), resource];
        setFieldValue("knowledgeBase", next);
        setLinkForm({ title: "", url: "" });
        toast.success("Link adicionado à base de conhecimento!");
    }, [isValidUrl, linkForm]);

    const handleLinkInputChange = useCallback(
        field => event => {
            const value = event?.target?.value ?? "";
            setLinkForm(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleTextInputChange = useCallback(
        field => event => {
            const value = event?.target?.value ?? "";
            setTextForm(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleAddTextResource = useCallback((values, setFieldValue) => {
        if (!textForm.title.trim() || !textForm.content.trim()) {
            toast.error("Informe o título e o conteúdo do texto.");
            return;
        }

        const resource = {
            id: `text-${Date.now()}`,
            type: "text",
            title: textForm.title.trim(),
            content: textForm.content.trim(),
            createdAt: new Date().toISOString()
        };

        const next = [...(values.knowledgeBase || []), resource];
        setFieldValue("knowledgeBase", next);
        setTextForm({ title: "", content: "" });
        toast.success("Texto adicionado à base de conhecimento!");
    }, [textForm]);

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const handleTabChange = (_event, newValue) => {
        setActiveTab(newValue);
    };

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: null,
        maxMessages: 10,
        provider: "openai",
        model: "",
        toolsEnabled: [],
        knowledgeBase: []
    };

    const [prompt, setPrompt] = useState(initialState);
    const restrictedTools = useMemo(
        () => new Set(["create_company", "list_plans", "get_company_groups", "send_group_message"]),
        []
    );
    const filteredTools = useMemo(() => {
        return TOOL_CATALOG.filter(tool => {
            if (restrictedTools.has(tool.value)) {
                return user?.companyId === 1;
            }
            return true;
        });
    }, [user, restrictedTools]);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                setSelectedProvider("openai");
                setSelectedModel("");
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return {
                        ...prevState,
                        ...data,
                        toolsEnabled: data.toolsEnabled || [],
                        knowledgeBase: data.knowledgeBase || []
                    };
                });
                setSelectedVoice(data.voice);
                setSelectedProvider(data.provider || "openai");
                setSelectedModel(data.model || "");
            } catch (err) {
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    useEffect(() => {
        const fetchSavedPrompts = async () => {
            if (!open) return;
            try {
                const { data } = await api.get("/prompt");
                setSavedPrompts(Array.isArray(data) ? data : []);
            } catch (err) {
                toastError(err);
            }
        };

        fetchSavedPrompts();
    }, [open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        setSelectedProvider("openai");
        setSelectedModel("");
        setActiveTab(0);
        setSelectedSavedPrompt("");
        onClose();
    };

    const handleProviderChange = (e) => {
        const newProvider = e.target.value;
        setSelectedProvider(newProvider);
        setSelectedModel(""); // Reset model when provider changes
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    const getCurrentModels = () => {
        return selectedProvider === "openai" ? openaiModels : geminiModels;
    };

    const handleSavePrompt = async values => {
        const promptData = { 
            ...values, 
            voice: selectedVoice, 
            provider: selectedProvider,
            model: selectedModel,
            toolsEnabled: values.toolsEnabled || []
        };
        console.log("[PromptModal] Saving prompt with toolsEnabled:", promptData.toolsEnabled);
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        if (!selectedProvider) {
            toastError("Selecione o provedor de IA");
            return;
        }
        if (!selectedModel) {
            toastError("Selecione o modelo");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
                classes={{ paper: classes.dialogPaper }}
            >
                <div className={classes.dialogHeader}>
                    <SmartToyIcon className={classes.dialogIcon} />
                    <Typography variant="h6" className={classes.dialogTitle}>
                        {promptId
                            ? `${i18n.t("promptModal.title.edit")}`
                            : `${i18n.t("promptModal.title.add")}`}
                    </Typography>
                </div>
                
                <DialogContent className={classes.dialogContent}>
                    <Formik
                        initialValues={prompt}
                        enableReinitialize={true}
                        onSubmit={async (values, actions) => {
                            console.log("[Formik] onSubmit called with values:", values);
                            await handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }}
                    >
                        {({ touched, errors, isSubmitting, values, setFieldValue, submitForm }) => (
                            <Form style={{ width: "100%" }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Tab label="Identificação" />
                                    <Tab label="Prompt & Fila" />
                                    <Tab label="Configuração IA" />
                                    <Tab label="Ferramentas" />
                                    <Tab label="Conhecimento" />
                                </Tabs>

                                {activeTab === 0 && (
                                    <>
                                        {/* Etapa 1: Nome */}
                                        <Typography className={classes.sectionTitle}>
                                            <PersonIcon className={classes.sectionIcon} />
                                            Nome do Prompt
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary">
                                            Escolha um nome curto e fácil de identificar para este prompt.
                                        </Typography>

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.name")}
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            required
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </>
                                )}

                                {activeTab === 1 && (
                                    <>
                                        {/* Etapa 3: Prompt gerado e fila */}
                                        <Typography className={classes.sectionTitle}>
                                            Prompt principal
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary">
                                            Revise, ajuste ou substitua o texto do prompt antes de escolher a fila de atendimento.
                                        </Typography>

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.prompt")}
                                            name="prompt"
                                            error={touched.prompt && Boolean(errors.prompt)}
                                            helperText={touched.prompt && errors.prompt}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            rows={18}
                                            className={classes.formControl}
                                            InputProps={{
                                                style: { minHeight: 260 }
                                            }}
                                        />

                                        <Typography className={classes.sectionTitle}>
                                            <AccountTreeIcon className={classes.sectionIcon} />
                                            Fila de atendimento
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary">
                                            Selecione a fila/setor onde este assistente de IA será utilizado.
                                        </Typography>

                                        <QueueSelectSingle 
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccountTreeIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </>
                                )}

                                {activeTab === 2 && (
                                    <>
                                        {/* Etapa 4: Configuração de IA */}
                                        <Typography className={classes.sectionTitle}>
                                            <SmartToyIcon className={classes.sectionIcon} />
                                            Configuração de IA
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary">
                                            Escolha o provedor, modelo de IA e a chave de acesso que serão usados por este prompt.
                                        </Typography>

                                        <div className={classes.multFieldLine}>
                                            <FormControl 
                                                variant="outlined" 
                                                className={classes.formControl}
                                                margin="dense"
                                            >
                                                <InputLabel>Provedor de IA</InputLabel>
                                                <Select
                                                    value={selectedProvider}
                                                    onChange={handleProviderChange}
                                                    label="Provedor de IA"
                                                    className={classes.modelSelect}
                                                >
                                                    <MenuItem value="openai">
                                                        OpenAI
                                                    </MenuItem>
                                                    <MenuItem value="gemini">
                                                        Google Gemini
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControl 
                                                variant="outlined" 
                                                className={classes.formControl}
                                                margin="dense"
                                            >
                                                <InputLabel>Modelo</InputLabel>
                                                <Select
                                                    value={selectedModel}
                                                    onChange={handleModelChange}
                                                    label="Modelo"
                                                    className={classes.modelSelect}
                                                >
                                                    {getCurrentModels().map((model) => (
                                                        <MenuItem key={model.value} value={model.value}>
                                                            <Box display="flex" alignItems="center" width="100%">
                                                                {model.label}
                                                                {model.free && (
                                                                    <span className={classes.freeLabel}>
                                                                        Grátis
                                                                    </span>
                                                                )}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.apikey")}
                                            name="apiKey"
                                            type={showApiKey ? 'text' : 'password'}
                                            error={touched.apiKey && Boolean(errors.apiKey)}
                                            helperText={touched.apiKey && errors.apiKey}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            required
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <VpnKeyIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleToggleApiKey}>
                                                            {showApiKey ? <VisibilityOff style={{ color: "#ef4444" }} /> : <Visibility style={{ color: "#6366f1" }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Typography className={classes.sectionTitle} style={{ marginTop: 16 }}>
                                            <ThermostatIcon className={classes.sectionIcon} />
                                            Parâmetros do Modelo
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                                            Ajuste a criatividade e o tamanho das respostas do modelo de IA.
                                        </Typography>

                                        <div className={classes.multFieldLine}>
                                            <Field
                                                as={TextField}
                                                label="Temperatura"
                                                name="temperature"
                                                type="number"
                                                error={touched.temperature && Boolean(errors.temperature)}
                                                helperText={touched.temperature && errors.temperature || "0 = mais preciso, 2 = mais criativo"}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                inputProps={{ 
                                                    min: 0, 
                                                    max: 2, 
                                                    step: 0.1 
                                                }}
                                                className={classes.formControl}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <ThermostatIcon className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            <Field
                                                as={TextField}
                                                label="Max Tokens"
                                                name="maxTokens"
                                                type="number"
                                                error={touched.maxTokens && Boolean(errors.maxTokens)}
                                                helperText={touched.maxTokens && errors.maxTokens || "Tamanho máximo da resposta"}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                inputProps={{ 
                                                    min: 50, 
                                                    max: 4096, 
                                                    step: 50 
                                                }}
                                                className={classes.formControl}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Filter9PlusIcon className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 3 && (
                                    <>
                                        <div className={classes.configSection}>
                                            <Typography className={classes.sectionTitle}>
                                                <SettingsInputAntennaIcon className={classes.sectionIcon} />
                                                Ferramentas disponíveis para este prompt
                                            </Typography>

                                            <Typography variant="body2" color="textSecondary">
                                                Marque somente as ferramentas que este agente deve usar. Funções sensíveis (ex.: integrações externas ou criação de empresa) ficam desabilitadas até você ativar explicitamente.
                                            </Typography>

                                            <Box className={classes.toolGrid}>
                                                {filteredTools.map(tool => {
                                                    const checked = values.toolsEnabled?.includes(tool.value);
                                                    const isSensitive = DEFAULT_SENSITIVE_TOOLS.includes(tool.value);
                                                    const Icon = TOOL_ICONS[tool.value] || SmartToyIcon;
                                                    return (
                                                        <Paper key={tool.value} className={classes.toolCard} elevation={0}>
                                                            <div className={classes.toolHeader}>
                                                                <div className={classes.toolIcon}>
                                                                    <Icon fontSize="small" />
                                                                </div>
                                                                <div>
                                                                    <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                                                                        {tool.title}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        {tool.value}
                                                                    </Typography>
                                                                </div>
                                                                {isSensitive && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Sensível"
                                                                        style={{ marginLeft: "auto", backgroundColor: "#fee2e2", color: "#b91c1c" }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <Typography className={classes.toolDescription}>
                                                                {tool.description}
                                                            </Typography>
                                                            <Typography className={classes.toolInstruction}>
                                                                {TOOL_INSTRUCTIONS[tool.value] || "Instrua a IA mencionando o nome da ferramenta quando precisar usá-la."}
                                                            </Typography>
                                                            <div className={classes.toolFooter}>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {checked ? "Ativa para este agente" : "Desativada"}
                                                                </Typography>
                                                                <Switch
                                                                    color={isSensitive ? "secondary" : "primary"}
                                                                    checked={checked}
                                                                    onChange={(_, newValue) => {
                                                                        const current = values.toolsEnabled || [];
                                                                        const next = newValue
                                                                            ? [...current, tool.value]
                                                                            : current.filter(name => name !== tool.value);
                                                                        setFieldValue("toolsEnabled", next);
                                                                    }}
                                                                />
                                                            </div>
                                                        </Paper>
                                                    );
                                                })}
                                            </Box>
                                        </div>
                                    </>
                                )}

                                {activeTab === 4 && (
                                    <>
                                        <div className={classes.configSection}>
                                            <Typography className={classes.sectionTitle}>
                                                <LibraryBooksIcon className={classes.sectionIcon} />
                                                Base de conhecimento
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                                                Adicione textos, imagens ou links para fornecer contexto adicional à IA. Esses materiais serão usados para enriquecer as respostas do agente.
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <div className={classes.knowledgeContainer}>
                                                        <div className={classes.knowledgeHeader}>
                                                            <Box display="flex" alignItems="center" gap={8}>
                                                                <ImageIcon color="primary" />
                                                                <Typography variant="subtitle2">Adicionar imagem</Typography>
                                                            </Box>
                                                        </div>
                                                        <Button
                                                            variant="outlined"
                                                            fullWidth
                                                            startIcon={<ImageIcon />}
                                                            className={classes.uploadButton}
                                                            disabled={knowledgeUploading}
                                                            onClick={() => imageInputRef.current?.click()}
                                                        >
                                                            {knowledgeUploading ? "Enviando..." : "Selecionar imagem"}
                                                        </Button>
                                                        <input
                                                            ref={imageInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            className={classes.fileInput}
                                                            onChange={event => {
                                                                const file = event.target.files?.[0];
                                                                if (file) {
                                                                    handleKnowledgeFileAdd(file, "image", values, setFieldValue);
                                                                }
                                                                event.target.value = null;
                                                            }}
                                                        />
                                                    </div>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <div className={classes.knowledgeContainer}>
                                                        <div className={classes.knowledgeHeader}>
                                                            <Box display="flex" alignItems="center" gap={8}>
                                                                <TextFieldsIcon color="action" />
                                                                <Typography variant="subtitle2">Adicionar texto</Typography>
                                                            </Box>
                                                        </div>
                                                        <Grid container spacing={1}>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    label="Título do texto"
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    value={textForm.title}
                                                                    onChange={handleTextInputChange("title")}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    label="Conteúdo"
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    multiline
                                                                    rows={4}
                                                                    value={textForm.content}
                                                                    onChange={handleTextInputChange("content")}
                                                                    placeholder="Digite o texto que será usado como base de conhecimento..."
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    fullWidth
                                                                    onClick={() => handleAddTextResource(values, setFieldValue)}
                                                                >
                                                                    Adicionar texto
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </div>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <div className={classes.knowledgeContainer}>
                                                        <div className={classes.knowledgeHeader}>
                                                            <Box display="flex" alignItems="center" gap={8}>
                                                                <LinkIcon color="action" />
                                                                <Typography variant="subtitle2">Adicionar link</Typography>
                                                            </Box>
                                                        </div>
                                                        <Grid container spacing={1}>
                                                            <Grid item xs={12} md={4}>
                                                                <TextField
                                                                    label="Título do link"
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    value={linkForm.title}
                                                                    onChange={handleLinkInputChange("title")}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <TextField
                                                                    label="URL (https://...)"
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    value={linkForm.url}
                                                                    onChange={handleLinkInputChange("url")}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} md={2}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    fullWidth
                                                                    style={{ height: "100%" }}
                                                                    onClick={() => handleAddLinkResource(values, setFieldValue)}
                                                                >
                                                                    Adicionar
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </div>
                                                </Grid>
                                            </Grid>

                                            <Box mt={2}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Recursos adicionados
                                                </Typography>
                                                <div className={classes.knowledgeList}>
                                                    {(values.knowledgeBase || []).length === 0 && (
                                                        <div className={classes.knowledgeEmpty}>
                                                            <Typography variant="body2">
                                                                Nenhum conteúdo cadastrado ainda. Adicione textos, imagens ou links para disponibilizar conhecimento à IA.
                                                            </Typography>
                                                        </div>
                                                    )}

                                                    {(values.knowledgeBase || []).map((item, index) => {
                                                        const type = inferKnowledgeType(item);
                                                        const url = resolveKnowledgeUrl(item);

                                                        const Icon = type === "image" ? ImageIcon : type === "text" ? TextFieldsIcon : LinkIcon;

                                                        return (
                                                            <div key={item.id || `${type}-${index}`} className={classes.knowledgeCard}>
                                                                <div className={classes.knowledgeThumb}>
                                                                    {type === "image" && url ? (
                                                                        <img src={url} alt={item.title} />
                                                                    ) : (
                                                                        <Icon color={type === "pdf" ? "secondary" : "primary"} />
                                                                    )}
                                                                </div>

                                                                <div style={{ flex: 1, marginLeft: 12 }} className={classes.knowledgeMeta}>
                                                                    <Typography variant="subtitle2" noWrap>
                                                                        {item.title || (type === "link" ? "Link salvo" : "Imagem")}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary" noWrap>
                                                                        {item.url || item.path || "Sem URL"}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={
                                                                            type === "image" ? "Imagem" : "Link"
                                                                        }
                                                                        size="small"
                                                                        style={{ marginTop: 4, width: "fit-content" }}
                                                                    />
                                                                </div>

                                                                <div className={classes.knowledgeActions}>
                                                                    {url && (
                                                                        <Box display="flex" gap={4}>
                                                                            <Tooltip title="Abrir">
                                                                                <IconButton size="small" onClick={() => window.open(url, "_blank")}>
                                                                                    <OpenInNewIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Copiar link">
                                                                                <IconButton size="small" onClick={() => handleCopyToClipboard(url)}>
                                                                                    <FileCopyIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    )}
                                                                    <Tooltip title="Remover">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleRemoveKnowledge(index, values, setFieldValue)}
                                                                        >
                                                                            <DeleteOutlineIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Box>
                                        </div>
                                    </>
                                )}

                                <DialogActions className={classes.dialogActions}>
                                    <Button
                                        startIcon={<CancelIcon />}
                                        onClick={handleClose}
                                        className={classes.cancelButton}
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {i18n.t("promptModal.buttons.cancel")}
                                    </Button>

                                    <Button
                                        startIcon={<SaveIcon />}
                                        type="button"
                                        onClick={() => {
                                            console.log("[Button] onClick - calling submitForm");
                                            submitForm();
                                        }}
                                        className={classes.saveButton}
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        Salvar agente
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                style={{ color: green[500], marginLeft: 15 }}
                                            />
                                        )}
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromptModal;