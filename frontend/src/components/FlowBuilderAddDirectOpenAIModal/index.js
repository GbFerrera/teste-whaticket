import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, Typography, Tabs, Tab, Paper, Grid, Tooltip, IconButton, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MdSmartToy } from "react-icons/md";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from "@material-ui/icons/Image";
import LinkIcon from "@material-ui/icons/Link";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
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
import api from "../../services/api";
import { getBackendUrl } from "../../config";
import toastError from "../../errors/toastError";
import { TOOL_CATALOG, DEFAULT_SENSITIVE_TOOLS } from "../../constants/aiTools";
import { TOOL_ICONS, TOOL_INSTRUCTIONS } from "./toolConfig";

// Componente Error Boundary simples
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro no modal:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={this.props.open} onClose={this.props.close}>
          <DialogTitle>Erro</DialogTitle>
          <DialogContent>
            <Typography>Ocorreu um erro ao carregar o formulário. Tente novamente.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.close}>Fechar</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDialog-paper": {
      minWidth: "700px",
      maxWidth: "900px"
    }
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "200px"
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1)
  },
  chip: {
    margin: theme.spacing(0.25)
  },
  providerChip: {
    marginBottom: theme.spacing(2)
  },
  dialogTitle: {
    backgroundColor: "#3f51b5",
    color: "white",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  btnWrapper: {
    position: "relative",
  },
  tabPanel: {
    padding: theme.spacing(2),
    minHeight: "400px"
  },
  tabContent: {
    marginTop: theme.spacing(2)
  },
  promptField: {
    "& .MuiOutlinedInput-root": {
      minHeight: "200px",
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "normal !important"
    },
    "& .MuiOutlinedInput-input": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "normal !important"
    },
    "& .MuiInputBase-inputMultiline": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "normal !important"
    },
    "& .MuiInputBase-input": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "normal !important"
    },
    "& textarea": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "normal !important"
    }
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
  }
}));

const FlowBuilderAddDirectOpenAIModal = ({ open, onSave, data, close }) => {
  const classes = useStyles();
  const [activeModal, setActiveModal] = useState(false);
  const [labels, setLabels] = useState({
    title: "Configurar Agente de IA Direto",
    btn: "Salvar",
  });
  const [tabValue, setTabValue] = useState(0);
  
  const [config, setConfig] = useState({
    provider: "gemini",
    apiKey: "",
    model: "",
    prompt: "Você é um assistente de IA útil e amigável.",
    temperature: 0.7,
    maxTokens: 1000,
    toolsEnabled: [],
    knowledgeBase: []
  });

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box className={classes.tabPanel}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const availableTools = TOOL_CATALOG.map(tool => tool.value);

  const openaiModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo"
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

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar Agente de IA Direto",
        btn: "Salvar",
      });
      const current = data?.data || {};
      try {
        // Validar e limitar o prompt para evitar problemas
        const promptValue = current.prompt || "Você é um assistente de IA útil e amigável.";
        const safePrompt = typeof promptValue === 'string' && promptValue.length <= 5000 
          ? promptValue 
          : promptValue.substring(0, 5000);
        
        setConfig({
          provider: current.provider || "gemini",
          apiKey: current.apiKey || "",
          model: current.model || "",
          prompt: safePrompt,
          temperature: current.temperature || 0.7,
          maxTokens: current.maxTokens || 1000,
          toolsEnabled: current.toolsEnabled || [],
          knowledgeBase: current.knowledgeBase || []
        });
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
        // Fallback para configuração padrão
        setConfig({
          provider: "gemini",
          apiKey: "",
          model: "",
          prompt: "Você é um assistente de IA útil e amigável.",
          temperature: 0.7,
          maxTokens: 1000,
          toolsEnabled: []
        });
      }
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar Agente de IA Direto",
        btn: "Salvar",
      });
      setConfig({
        provider: "gemini",
        apiKey: "",
        model: "gemini-2.0-flash",
        prompt: "Você é um assistente de IA útil e amigável.",
        temperature: 0.7,
        maxTokens: 1000,
        toolsEnabled: [],
        knowledgeBase: []
      });
      setActiveModal(true);
    }

    return () => {
      // Cleanup
    };
  }, [open, data]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleToolToggle = (tool) => {
    setConfig(prev => ({
      ...prev,
      toolsEnabled: prev.toolsEnabled.includes(tool)
        ? prev.toolsEnabled.filter(t => t !== tool)
        : [...prev.toolsEnabled, tool]
    }));
  };

  const handleSave = (values) => {
    handleClose();
    onSave({
      ...values
    });
  };

  const isGemini = config.provider === "gemini";
  const availableModels = isGemini ? geminiModels : openaiModels;

  return (
    <ErrorBoundary open={activeModal} close={handleClose}>
      <Dialog open={activeModal} onClose={handleClose} className={classes.root} maxWidth="md" fullWidth>
        <DialogTitle className={classes.dialogTitle}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <MdSmartToy style={{ marginRight: 8 }} />
            {labels.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={config}
            enableReinitialize={true}
            onSubmit={(values, actions) => {
              handleSave(values);
              actions.setSubmitting(false);
            }}
          >
            {({ values, setFieldValue, submitForm }) => (
              <Form style={{ width: "100%" }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="Configurações do Agente IA">
                  <Tab label="1. Prompt de Sistema" />
                  <Tab label="2. Provider e Configurações" />
                  <Tab label="3. Ferramentas Habilitadas" />
                  <Tab label="4. Base de Conhecimento" />
                </Tabs>

          {/* Aba 1: Prompt de Sistema */}
          <TabPanel value={tabValue} index={0}>
            <Box className={classes.tabContent}>
              <Field
                as={TextField}
                label="Prompt do Sistema"
                name="prompt"
                multiline
                rows={18}
                fullWidth
                variant="outlined"
                margin="dense"
                className={classes.formControl}
                InputProps={{
                  style: { minHeight: 260 }
                }}
              />
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                O prompt define como a IA deve se comportar, seu tom, personalidade e limitações. Seja específico para obter melhores resultados.
              </Typography>
            </Box>
          </TabPanel>

          {/* Aba 2: Provider e Configurações */}
          <TabPanel value={tabValue} index={1}>
            <Box className={classes.tabContent}>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel>Provider</InputLabel>
                <Field
                  as={Select}
                  name="provider"
                  label="Provider"
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="gemini">Gemini</MenuItem>
                </Field>
              </FormControl>

              <Field
                as={TextField}
                label="API Key"
                name="apiKey"
                type="password"
                fullWidth
                className={classes.formControl}
                helperText="Chave da API do provedor"
              />

              <FormControl className={classes.formControl}>
                <InputLabel>Model</InputLabel>
                <Field
                  as={Select}
                  name="model"
                  label="Model"
                >
                  {(values.provider === "gemini" ? geminiModels : openaiModels.map(m => ({ value: m, label: m }))).map(model => (
                    <MenuItem key={model.value || model} value={model.value || model}>
                      {model.label || model}
                    </MenuItem>
                  ))}
                </Field>
              </FormControl>

              <Box display="flex" gap={2}>
                <Field
                  as={TextField}
                  label="Temperature"
                  name="temperature"
                  type="number"
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  className={classes.formControl}
                  helperText="0-2 (mais criativo)"
                />
                <Field
                  as={TextField}
                  label="Max Tokens"
                  name="maxTokens"
                  type="number"
                  inputProps={{ min: 1, max: 4000 }}
                  className={classes.formControl}
                  helperText="1-4000 (tamanho da resposta)"
                />
              </Box>

              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                <strong>Dicas:</strong><br />
                • Temperature: 0.7 é um bom equilíbrio entre criatividade e consistência<br />
                • Max Tokens: 1000 é suficiente para respostas médias, 2000+ para respostas longas<br />
                • Gemini 2.0 Flash é rápido e gratuito, ideal para a maioria dos casos
              </Typography>
            </Box>
          </TabPanel>

          {/* Aba 3: Ferramentas Habilitadas */}
          <TabPanel value={tabValue} index={2}>
            <Box className={classes.tabContent}>
              <Typography variant="subtitle2" gutterBottom>
                Ferramentas disponíveis para este agente
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Marque somente as ferramentas que este agente deve usar. Funções sensíveis (ex.: integrações externas ou criação de empresa) ficam desabilitadas até você ativar explicitamente.
              </Typography>
              <Box className={classes.toolGrid}>
                {TOOL_CATALOG.map(tool => {
                  const checked = (values.toolsEnabled || []).includes(tool.value);
                  const isSensitive = DEFAULT_SENSITIVE_TOOLS.includes(tool.value);
                  const Icon = TOOL_ICONS[tool.value] || MdSmartToy;
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
            </Box>
          </TabPanel>

          {/* Aba 4: Base de Conhecimento */}
          <TabPanel value={tabValue} index={3}>
            <Box className={classes.tabContent}>
              <Typography variant="subtitle2" gutterBottom>
                <LibraryBooksIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Base de conhecimento
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Adicione textos, imagens ou links para fornecer contexto adicional à IA. Esses materiais serão usados para enriquecer as respostas do agente.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: 16, border: '1px dashed #cbd5f5' }}>
                    <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
                      <ImageIcon color="primary" />
                      <Typography variant="subtitle2">Adicionar imagem</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ImageIcon />}
                      disabled={knowledgeUploading}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {knowledgeUploading ? "Enviando..." : "Selecionar imagem"}
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleKnowledgeFileAdd(file, "image", values, setFieldValue);
                        }
                        event.target.value = null;
                      }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: 16, border: '1px dashed #cbd5f5' }}>
                    <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
                      <TextFieldsIcon color="action" />
                      <Typography variant="subtitle2">Adicionar texto</Typography>
                    </Box>
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
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper style={{ padding: 16, border: '1px dashed #cbd5f5' }}>
                    <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
                      <LinkIcon color="action" />
                      <Typography variant="subtitle2">Adicionar link</Typography>
                    </Box>
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
                  </Paper>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Recursos adicionados
                </Typography>
                <div>
                  {(values.knowledgeBase || []).length === 0 && (
                    <Paper style={{ padding: 16, textAlign: 'center', border: '1px dashed #d1d5db', backgroundColor: '#f9fafb' }}>
                      <Typography variant="body2" color="textSecondary">
                        Nenhum conteúdo cadastrado ainda. Adicione textos, imagens ou links para disponibilizar conhecimento à IA.
                      </Typography>
                    </Paper>
                  )}

                  {(values.knowledgeBase || []).map((item, index) => {
                    const type = inferKnowledgeType(item);
                    const url = resolveKnowledgeUrl(item);
                    const Icon = type === "image" ? ImageIcon : type === "text" ? TextFieldsIcon : LinkIcon;

                    return (
                      <Paper key={item.id || `${type}-${index}`} style={{ padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {type === "image" && url ? (
                            <img src={url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Icon color="primary" />
                          )}
                        </div>

                        <div style={{ flex: 1, marginLeft: 12 }}>
                          <Typography variant="subtitle2" noWrap>
                            {item.title || (type === "link" ? "Link salvo" : "Imagem")}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {item.url || item.path || "Sem URL"}
                          </Typography>
                          <Chip
                            label={type === "image" ? "Imagem" : "Link"}
                            size="small"
                            style={{ marginTop: 4 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          {url && (
                            <>
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
                            </>
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
                      </Paper>
                    );
                  })}
                </div>
              </Box>
            </Box>
          </TabPanel>
              </Form>
            )}
          </Formik>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            style={{
              color: "white",
              backgroundColor: "#db6565",
            }}
            variant="contained"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            startIcon={<SaveIcon />}
            style={{
              color: "white",
              backgroundColor: "#437db5",
            }}
            variant="contained"
            className={classes.btnWrapper}
          >
            {labels.btn}
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
};

export default FlowBuilderAddDirectOpenAIModal;
