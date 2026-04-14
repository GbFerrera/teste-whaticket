import React, { useEffect, useMemo, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SearchIcon from "@material-ui/icons/Search";
import api, { openApi } from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { useSystemAlert } from "../../components/SystemAlert";

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
  filterSelect: {
    minWidth: 130,
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
  methodChip: {
    fontWeight: 600,
    fontSize: "0.7rem",
  },
  statusChip: {
    fontWeight: 500,
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
  jsonField: {
    marginTop: theme.spacing(2),
  },
  testResult: {
    marginTop: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
    borderRadius: 8,
    maxHeight: 200,
    overflow: "auto",
    fontFamily: "monospace",
    fontSize: "0.75rem",
  },
}));

const METODOS = ["GET", "POST", "PUT", "DELETE"];

const normalizePlaceholderEntries = placeholders => {
  if (!placeholders) return [];

  const ensureKey = (key, fallback) => {
    if (typeof key === "string" && key.trim()) return key.trim();
    if (typeof key === "number" && !Number.isNaN(key)) return String(key);
    return fallback;
  };

  if (Array.isArray(placeholders)) {
    return placeholders
      .map((item, index) => {
        if (typeof item === "string") {
          const key = item.trim();
          return key ? { key, label: key } : null;
        }

        if (item && typeof item === "object") {
          const key = ensureKey(item.key || item.name || item.id, `placeholder_${index}`);
          if (!key) return null;
          const label =
            typeof item.label === "string" && item.label.trim()
              ? item.label.trim()
              : typeof item.description === "string" && item.description.trim()
              ? item.description.trim()
              : key;

          return { key, label };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof placeholders === "string") {
    const key = placeholders.trim();
    return key ? [{ key, label: key }] : [];
  }

  if (typeof placeholders === "object") {
    return Object.entries(placeholders)
      .map(([rawKey, value]) => {
        const key = ensureKey(rawKey, "");
        if (!key) return null;

        let label = key;
        if (typeof value === "string" && value.trim()) {
          label = value.trim();
        } else if (value && typeof value === "object") {
          label = value.label || value.description || key;
          if (typeof label === "string") {
            label = label.trim() || key;
          }
        }

        return { key, label };
      })
      .filter(Boolean);
  }

  return [];
};

const FerramentasPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { showConfirm } = useSystemAlert();

  const [ferramentas, setFerramentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [url, setUrl] = useState("");
  const [metodo, setMetodo] = useState("GET");
  const [headersText, setHeadersText] = useState("{}");
  const [bodyText, setBodyText] = useState("{}");
  const [queryParamsText, setQueryParamsText] = useState("{}");
  const [placeholdersText, setPlaceholdersText] = useState("{}");
  const [status, setStatus] = useState("ativo");
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [jsonErrors, setJsonErrors] = useState({ placeholders: "" });

  const resetForm = () => {
    setEditingId(null);
    setNome("");
    setDescricao("");
    setUrl("");
    setMetodo("GET");
    setHeadersText("{}");
    setBodyText("{}");
    setQueryParamsText("{}");
    setPlaceholdersText("{}");
    setStatus("ativo");
    setPlaceholderValues({});
    setJsonErrors({ placeholders: "" });
    setTestResult(null);
  };

  const loadFerramentas = async (statusValue = statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (statusValue) params.status = statusValue;
      const { data } = await api.get("/ferramentas", { params });
      setFerramentas(data || []);
    } catch (err) {
      console.error("Erro ao carregar ferramentas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFerramentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = ferramenta => {
    setEditingId(ferramenta.id);
    setNome(ferramenta.nome || "");
    setDescricao(ferramenta.descricao || "");
    setUrl(ferramenta.url || "");
    setMetodo(ferramenta.metodo || "GET");
    setHeadersText(JSON.stringify(ferramenta.headers || {}, null, 2));
    setBodyText(JSON.stringify(ferramenta.body || {}, null, 2));
    setQueryParamsText(JSON.stringify(ferramenta.query_params || {}, null, 2));
    setPlaceholdersText(JSON.stringify(ferramenta.placeholders || {}, null, 2));
    setStatus(ferramenta.status || "ativo");
    setPlaceholderValues({});
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const parseJsonSafe = (text, fallback) => {
    if (!text || !text.trim()) return fallback;
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON inválido:", err);
      return fallback;
    }
  };

  const handleSave = async event => {
    event.preventDefault();
    if (!nome || !url || !metodo) return;

    const payload = {
      nome,
      descricao,
      url,
      metodo,
      headers: parseJsonSafe(headersText, {}),
      body: parseJsonSafe(bodyText, {}),
      query_params: parseJsonSafe(queryParamsText, {}),
      placeholders: parseJsonSafe(placeholdersText, {}),
      status
    };

    try {
      if (editingId) {
        await api.put(`/ferramentas/${editingId}`, payload);
      } else {
        await api.post("/ferramentas", payload);
      }

      await loadFerramentas();
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar ferramenta", err);
    }
  };

  const handleDelete = async id => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir Ferramenta",
      message: "Deseja realmente excluir esta ferramenta?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/ferramentas/${id}`);
      await loadFerramentas();
    } catch (err) {
      console.error("Erro ao excluir ferramenta", err);
    }
  };

  const handleToggleStatus = async ferramenta => {
    const novoStatus = ferramenta.status === "ativo" ? "inativo" : "ativo";
    try {
      await api.put(`/ferramentas/${ferramenta.id}`, { status: novoStatus });
      await loadFerramentas();
    } catch (err) {
      console.error("Erro ao alterar status da ferramenta", err);
    }
  };

  const currentPlaceholders = parseJsonSafe(placeholdersText, {});
  const placeholderEntries = useMemo(
    () => normalizePlaceholderEntries(currentPlaceholders),
    [currentPlaceholders]
  );

  const formatJsonText = text => {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  };

  const updateJsonError = (key, message) => {
    setJsonErrors(prev => ({ ...prev, [key]: message }));
  };

  const handlePlaceholdersChange = event => {
    const value = event.target.value;
    setPlaceholdersText(value);
    if (!value.trim()) {
      updateJsonError("placeholders", "");
      return;
    }
    try {
      JSON.parse(value);
      updateJsonError("placeholders", "");
    } catch (err) {
      updateJsonError("placeholders", "JSON inválido: verifique as chaves e aspas.");
    }
  };

  const handlePlaceholdersBlur = () => {
    if (!placeholdersText.trim()) return;
    try {
      setPlaceholdersText(formatJsonText(placeholdersText));
      updateJsonError("placeholders", "");
    } catch (err) {
      updateJsonError("placeholders", "JSON inválido: não foi possível formatar.");
    }
  };

  const handlePlaceholdersPaste = event => {
    const pasted = event.clipboardData?.getData("text");
    if (!pasted) return;
    event.preventDefault();
    try {
      const formatted = formatJsonText(pasted);
      setPlaceholdersText(formatted);
      updateJsonError("placeholders", "");
    } catch (err) {
      setPlaceholdersText(pasted);
      updateJsonError("placeholders", "Conteúdo colado não é um JSON válido.");
    }
  };

  const handlePlaceholderChange = (key, value) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  const applyPlaceholders = (text, values) => {
    if (!text) return text;
    return Object.keys(values || {}).reduce((acc, key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      return acc.replace(regex, values[key] ?? "");
    }, text);
  };

  const handleTest = async () => {
    if (!url || !metodo) return;

    setTesting(true);
    setTestResult(null);

    try {
      const headers = parseJsonSafe(headersText, {});
      const body = parseJsonSafe(bodyText, {});
      const queryParams = parseJsonSafe(queryParamsText, {});

      const resolvedUrl = applyPlaceholders(url, placeholderValues);

      const config = {
        method: metodo,
        url: resolvedUrl,
        headers,
        params: queryParams,
        data: metodo === "GET" || metodo === "DELETE" ? undefined : body
      };

      // usando openApi (axios simples) para evitar interferir com o backend
      const response = await openApi(config);
      setTestResult({
        ok: true,
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error("Erro ao testar API", err);
      const status = err.response?.status;
      const data = err.response?.data;
      setTestResult({ ok: false, status, data: data || String(err) });
    } finally {
      setTesting(false);
    }
  };

  const renderTestResult = () => {
    if (!testResult) return null;
    return (
      <div className={classes.testResult}>
        <Typography variant="subtitle2">
          Resultado do teste ({testResult.ok ? "sucesso" : "erro"}
          {testResult.status ? ` - HTTP ${testResult.status}` : ""})
        </Typography>
        <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
      </div>
    );
  };

  const filteredFerramentas = ferramentas.filter((f) =>
    f.nome?.toLowerCase().includes(searchParam.toLowerCase())
  );

  const getMethodColor = (method) => {
    switch (method) {
      case "GET": return { bg: "#e3f2fd", color: "#1976d2" };
      case "POST": return { bg: "#e8f5e9", color: "#4caf50" };
      case "PUT": return { bg: "#fff3e0", color: "#ff9800" };
      case "DELETE": return { bg: "#ffebee", color: "#d32f2f" };
      default: return { bg: "#f5f5f5", color: "#666" };
    }
  };

  const getStatusChip = (statusVal) => {
    if (statusVal === "ativo") {
      return (
        <Chip
          label="Ativo"
          size="small"
          className={classes.statusChip}
          style={{ backgroundColor: "#e8f5e9", color: "#4caf50" }}
        />
      );
    }
    return (
      <Chip
        label="Inativo"
        size="small"
        className={classes.statusChip}
        style={{ backgroundColor: "#f5f5f5", color: "#9e9e9e" }}
      />
    );
  };

  const paginatedItems = filteredFerramentas.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filteredFerramentas.length / rowsPerPage);

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Ferramentas</Typography>
            <Typography className={classes.headerSubtitle}>
              {ferramentas.length} {ferramentas.length === 1 ? "API configurada" : "APIs configuradas"}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={async (e) => {
                const value = e.target.value;
                setStatusFilter(value);
                await loadFerramentas(value);
              }}
              label="Status"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Buscar ferramenta..."
            variant="outlined"
            size="small"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
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
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={handleOpenCreate}
          >
            Nova API
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Método</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={4} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhuma ferramenta encontrada</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((f) => {
                  const methodStyle = getMethodColor(f.metodo);
                  return (
                    <TableRow
                      key={f.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenEdit(f)}
                    >
                      <TableCell>
                        <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                          {f.nome}
                        </Typography>
                        <Typography variant="caption" style={{ color: "#999" }}>
                          ID: {f.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={f.metodo}
                          size="small"
                          className={classes.methodChip}
                          style={{ backgroundColor: methodStyle.bg, color: methodStyle.color }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(f.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(f);
                              }}
                              style={{ color: "#1976d2" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={f.status === "ativo" ? "Desativar" : "Ativar"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(f);
                              }}
                              style={{ color: f.status === "ativo" ? "#4caf50" : "#9e9e9e" }}
                            >
                              <PowerSettingsNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(f.id);
                              }}
                              style={{ color: "#ef4444" }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {filteredFerramentas.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredFerramentas.length)} de{" "}
                {filteredFerramentas.length} resultado(s)
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? "Editar ferramenta" : "Nova ferramenta"}
        </DialogTitle>
        <DialogContent>
          <form id="ferramenta-form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome da ferramenta"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="metodo-label">Método</InputLabel>
                  <Select
                    labelId="metodo-label"
                    value={metodo}
                    onChange={e => setMetodo(e.target.value)}
                    label="Método"
                    required
                  >
                    {METODOS.map(m => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="URL da API (pode conter {{placeholders}})"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Headers (JSON)"
                  value={headersText}
                  onChange={e => setHeadersText(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  className={classes.jsonField}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Query Params (JSON)"
                  value={queryParamsText}
                  onChange={e => setQueryParamsText(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  className={classes.jsonField}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Body (JSON)"
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  className={classes.jsonField}
                  helperText="Usado para métodos POST e PUT"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Placeholders (JSON)"
                  value={placeholdersText}
                  onChange={handlePlaceholdersChange}
                  onBlur={handlePlaceholdersBlur}
                  onPaste={handlePlaceholdersPaste}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  className={classes.jsonField}
                  error={Boolean(jsonErrors.placeholders)}
                  helperText={
                    jsonErrors.placeholders || 'Ex.: { "cep": "Digite o CEP" }'
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                {placeholderEntries.length > 0 && (
                  <>
                    <Typography variant="subtitle2">Valores para teste</Typography>
                    <Grid container spacing={1}>
                      {placeholderEntries.map(({ key, label }) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <TextField
                            label={label || key}
                            value={placeholderValues[key] || ""}
                            onChange={e =>
                              handlePlaceholderChange(key, e.target.value)
                            }
                            variant="outlined"
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </form>

          {renderTestResult()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? "Testando..." : "Testar API"}
          </Button>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            form="ferramenta-form"
          >
            {editingId ? "Salvar alterações" : "Criar ferramenta"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FerramentasPage;