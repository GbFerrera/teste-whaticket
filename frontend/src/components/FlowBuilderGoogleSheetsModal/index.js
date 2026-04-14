import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Box,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MessageVariablesPicker from "../MessageVariablesPicker";
import { toast } from "react-toastify";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth.js";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "0.9rem",
    marginBottom: theme.spacing(1.5),
    color: "#111827",
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  keyValueRow: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  keyField: {
    flex: 1,
  },
  valueField: {
    flex: 2,
  },
  testButton: {
    marginTop: theme.spacing(1),
    height: "40px",
  },
  testResult: {
    marginTop: theme.spacing(1),
  },
  authSection: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    marginBottom: theme.spacing(2),
  },
  alertPaper: {
    padding: theme.spacing(2),
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  alertSuccess: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    color: '#0c4a6e',
  },
  alertWarning: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fed7aa',
    color: '#92400e',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
  },
}));

const defaultData = {
  sheetsConfig: {
    spreadsheetId: "",
    spreadsheetName: "",
    sheetName: "",
    range: "A:Z",
  },
  operation: "list",
  searchColumn: "",
  searchValue: "",
  rowData: {},
  outputVariable: "",
  variables: [],
};

const operations = [
  { value: "list", label: "📋 Listar linhas", description: "Lista dados da planilha" },
  { value: "add", label: "➕ Adicionar linha", description: "Adiciona nova linha" },
  { value: "edit", label: "✏️ Editar linha", description: "Edita linha existente" },
  { value: "delete", label: "🗑️ Deletar linha", description: "Remove linha" },
  { value: "search", label: "🔍 Buscar dados", description: "Busca valores específicos" },
];

const FlowBuilderGoogleSheetsModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const { user } = useAuth();
  const companyId = user?.companyId;
  const [activeModal, setActiveModal] = useState(false);
  const [labels, setLabels] = useState({ title: "", btn: "" });
  const [formData, setFormData] = useState(defaultData);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const authPollingRef = useRef(null);

  const mergedData = useMemo(() => {
    if (!data?.data) return defaultData;
    
    console.log("GoogleSheets Modal - Data recebida:", data);
    
    return {
      sheetsConfig: { ...defaultData.sheetsConfig, ...(data.data.sheetsConfig || {}) },
      operation: data.data.operation || "list",
      searchColumn: data.data.searchColumn || "",
      searchValue: data.data.searchValue || "",
      rowData: data.data.rowData || {},
      outputVariable: data.data.outputVariable || "",
      variables: data.data.variables || [],
    };
  }, [data]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar Google Sheets", btn: "Salvar" });
      setFormData(mergedData);
      setActiveModal(true);
      checkAuthStatus({ showToast: false }); // Verificar status da autenticação
    } else if (open === "create") {
      setLabels({ title: "Adicionar Google Sheets", btn: "Adicionar" });
      setFormData(defaultData);
      setActiveModal(true);
      checkAuthStatus({ showToast: false }); // Verificar status da autenticação
    } else {
      setActiveModal(false);
    }
  }, [open, mergedData]);

  useEffect(() => {
    return () => {
      stopAuthPolling();
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
    stopAuthPolling();
  };

  const handleChange = (section, field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleChangeDirect = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowDataChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      rowData: {
        ...prev.rowData,
        [key]: value,
      },
    }));
  };

  const addRowDataField = () => {
    const newKey = `campo_${Object.keys(formData.rowData).length + 1}`;
    handleRowDataChange(newKey, "");
  };

  const removeRowDataField = (key) => {
    const newRowData = { ...formData.rowData };
    delete newRowData[key];
    setFormData((prev) => ({
      ...prev,
      rowData: newRowData,
    }));
  };

  const handleInsertVariable = (variable) => {
    if (!focusedField) return;
    
    if (focusedField.startsWith("rowData.")) {
      const key = focusedField.replace("rowData.", "");
      handleRowDataChange(key, (formData.rowData[key] || "") + variable);
    } else if (focusedField === "searchValue") {
      setFormData((prev) => ({
        ...prev,
        searchValue: prev.searchValue + variable,
      }));
    }
  };

  // Função para testar conexão
  const handleTestConnection = async () => {
    if (!formData.sheetsConfig.spreadsheetId) {
      toast.error("Informe o ID da planilha");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await api.post("/google-sheets/test", {
        companyId,
        spreadsheetId: formData.sheetsConfig.spreadsheetId,
        sheetName: formData.sheetsConfig.sheetName || "Sheet1",
      });

      setTestResult({
        success: true,
        message: `Conectado com sucesso à planilha: ${response.data.spreadsheetName}`,
        data: response.data,
      });
      
      toast.success("Conexão testada com sucesso!");
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || "Erro ao testar conexão",
      });
      
      toast.error("Erro ao testar conexão");
    } finally {
      setTestLoading(false);
    }
  };

  const stopAuthPolling = () => {
    if (authPollingRef.current) {
      clearInterval(authPollingRef.current);
      authPollingRef.current = null;
    }
  };

  // Função para autenticar com Google
  const handleAuthenticate = async () => {
    try {
      const response = await api.post("/google-sheets/auth", {
        companyId
      });
      setAuthUrl(response.data.authUrl);
      setIsCheckingAuth(true);

      // Abrir URL em nova janela
      window.open(response.data.authUrl, "_blank", "width=500,height=600");

      toast.info("Conclua a autenticação na janela aberta");

      if (!authPollingRef.current) {
        authPollingRef.current = setInterval(() => {
          checkAuthStatus();
        }, 4000);
      }
    } catch (error) {
      setIsCheckingAuth(false);
      toast.error("Erro ao iniciar autenticação");
    }
  };

  // Verificar status da autenticação
  const checkAuthStatus = async ({ showToast = true } = {}) => {
    try {
      const response = await api.get("/google-sheets/auth-status", {
        params: { companyId }
      });

      setIsAuthenticated(response.data.authenticated);

      if (response.data.authenticated) {
        stopAuthPolling();
        setIsCheckingAuth(false);
        if (showToast) {
          toast.success("Autenticado com Google Sheets!");
        }
      } else if (showToast) {
        toast.info("Ainda aguardando autenticação no Google");
      }
    } catch (error) {
      console.error("Erro ao verificar status da autenticação:", error);
    }
  };

  const handleSave = () => {
    // Validações básicas
    if (!formData.sheetsConfig.spreadsheetId) {
      toast.error("Selecione uma planilha");
      return;
    }

    if (!formData.sheetsConfig.sheetName) {
      toast.error("Informe o nome da aba");
      return;
    }

    if ((formData.operation === "add" || formData.operation === "edit") && Object.keys(formData.rowData).length === 0) {
      toast.error("Adicione pelo menos um campo de dados");
      return;
    }

    if ((formData.operation === "search" || formData.operation === "delete") && (!formData.searchColumn || !formData.searchValue)) {
      toast.error("Informe a coluna e valor para busca");
      return;
    }

    const nodeData = {
      sheetsConfig: formData.sheetsConfig,
      operation: formData.operation,
      searchColumn: formData.searchColumn,
      searchValue: formData.searchValue,
      rowData: formData.rowData,
      outputVariable: formData.outputVariable,
      variables: formData.variables,
    };

    if (open === "edit") {
      onUpdate(data.id, nodeData);
    } else {
      onSave(nodeData);
    }
    
    handleClose();
  };

  const textFieldProps = (section, field) => ({
    value: formData[section]?.[field] || "",
    onChange: handleChange(section, field),
    onFocus: () => setFocusedField(`${section}.${field}`),
    variant: "outlined",
    size: "small",
    fullWidth: true,
    className: classes.textField,
  });

  const currentOperation = operations.find(op => op.value === formData.operation);

  return (
    <Dialog open={activeModal} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{labels.title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Seção de Autenticação */}
          <Grid item xs={12}>
            <Paper className={classes.authSection} elevation={0}>
              <Typography className={classes.sectionTitle}>
                🔐 Autenticação Google
              </Typography>
              
              {isAuthenticated ? (
              <Paper className={`${classes.alertPaper} ${classes.alertSuccess}`}>
                <CheckCircleIcon style={{ color: '#0c4a6e' }} />
                <Typography variant="body2">
                  Autenticado com Google Sheets
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Paper className={`${classes.alertPaper} ${classes.alertWarning}`} style={{ marginBottom: 16 }}>
                  <ErrorIcon style={{ color: '#92400e' }} />
                  <Typography variant="body2">
                    Você precisa autenticar com Google para usar esta integração
                    {isCheckingAuth && " • verificando autenticação..."}
                  </Typography>
                </Paper>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAuthenticate}
                  startIcon={<span style={{ fontSize: "16px" }}>🔗</span>}
                  fullWidth
                >
                  Conectar com Google
                </Button>
                {isCheckingAuth && (
                  <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 8 }}>
                    Assim que finalizar a autenticação na janela aberta, voltaremos a verificar automaticamente.
                  </Typography>
                )}
              </Box>
            )}
            </Paper>
          </Grid>

          {/* Configuração da Planilha */}
          <Grid item xs={12}>
            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                📊 Configuração da Planilha
              </Typography>
              <TextField
                label="ID da Planilha"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                {...textFieldProps("sheetsConfig", "spreadsheetId")}
              />
              <TextField
                label="Nome da Planilha"
                placeholder="Minha Planilha"
                {...textFieldProps("sheetsConfig", "spreadsheetName")}
              />
              <TextField
                label="Nome da Aba"
                placeholder="Sheet1"
                {...textFieldProps("sheetsConfig", "sheetName")}
              />
              <TextField
                label="Intervalo (Opcional)"
                placeholder="A:Z"
                {...textFieldProps("sheetsConfig", "range")}
              />
              
              {/* Botão de Teste */}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestConnection}
                disabled={
                  testLoading ||
                  !formData.sheetsConfig.spreadsheetId ||
                  !isAuthenticated ||
                  isCheckingAuth
                }
                startIcon={testLoading ? <CircularProgress size={16} /> : <span>🧪</span>}
                className={classes.testButton}
                fullWidth
              >
                {testLoading ? "Testando..." : "Testar Conexão"}
              </Button>

              {!isAuthenticated && (
                <Typography className={classes.helperText} style={{ marginTop: 8 }}>
                  Faça a autenticação antes de testar a conexão.
                </Typography>
              )}
              
              {/* Resultado do Teste */}
              {testResult && (
                <Paper 
                  className={`${classes.alertPaper} ${classes.testResult} ${testResult.success ? classes.alertSuccess : classes.alertError}`}
                >
                  {testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                  <Typography variant="body2">
                    {testResult.message}
                  </Typography>
                </Paper>
              )}
              
              <Typography className={classes.helperText}>
                O ID da planilha está na URL: /d/ID_DA_PLANILHA/edit
              </Typography>
            </Paper>
          </Grid>

          {/* Operação */}
          <Grid item xs={12}>
            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                ⚙️ Operação
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Selecione a operação</InputLabel>
                <Select
                  value={formData.operation}
                  onChange={handleChangeDirect("operation")}
                  label="Selecione a operação"
                >
                  {operations.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      <Box>
                        <Typography variant="body2">{op.label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {op.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Configurações específicas da operação */}
          {(formData.operation === "search" || formData.operation === "delete") && (
            <Grid item xs={12}>
              <Paper className={classes.section} elevation={0}>
                <Typography className={classes.sectionTitle}>
                  🔍 Configuração de Busca
                </Typography>
                <TextField
                  label="Coluna para buscar"
                  placeholder="email"
                  {...textFieldProps("", "searchColumn")}
                />
                <TextField
                  label="Valor para buscar"
                  placeholder="{{email}}"
                  {...textFieldProps("", "searchValue")}
                />
                <Typography className={classes.helperText}>
                  Use variáveis do fluxo: {"{{name}}"}, {"{{email}}"}, etc.
                </Typography>
              </Paper>
            </Grid>
          )}

          {(formData.operation === "add" || formData.operation === "edit") && (
            <Grid item xs={12}>
              <Paper className={classes.section} elevation={0}>
                <Typography className={classes.sectionTitle}>
                  📝 Dados da Linha
                </Typography>
                {Object.entries(formData.rowData).map(([key, value], index) => (
                  <div key={key} className={classes.keyValueRow}>
                    <TextField
                      label="Coluna"
                      placeholder="nome"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newRowData = { ...formData.rowData };
                        delete newRowData[key];
                        newRowData[newKey] = value;
                        setFormData(prev => ({ ...prev, rowData: newRowData }));
                      }}
                      className={classes.keyField}
                      size="small"
                    />
                    <TextField
                      label="Valor"
                      placeholder="{{name}}"
                      value={value}
                      onChange={(e) => handleRowDataChange(key, e.target.value)}
                      onFocus={() => setFocusedField(`rowData.${key}`)}
                      className={classes.valueField}
                      size="small"
                    />
                    <IconButton
                      onClick={() => removeRowDataField(key)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addRowDataField}
                  variant="outlined"
                  size="small"
                  style={{ marginTop: 8 }}
                >
                  Adicionar Campo
                </Button>
                <Typography className={classes.helperText}>
                  Use variáveis do fluxo nos valores: {"{{name}}"}, {"{{email}}"}, etc.
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Variável de Saída */}
          <Grid item xs={12}>
            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                📤 Variável de Saída
              </Typography>
              <TextField
                label="Nome da variável"
                placeholder="dados_planilha"
                {...textFieldProps("", "outputVariable")}
              />
              <Typography className={classes.helperText}>
                Os dados retornados serão armazenados nesta variável para uso posterior.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider style={{ margin: "16px 0" }} />

        <MessageVariablesPicker onClick={handleInsertVariable} />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Typography className={classes.helperText}>
          Configure a integração com Google Sheets para manipular planilhas.
        </Typography>
        <div>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            style={{ marginRight: 8 }}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            {labels.btn}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderGoogleSheetsModal;
