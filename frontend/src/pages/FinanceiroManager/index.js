import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
  Paper
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import TabPanel from "../../components/TabPanel";
import { useSystemAlert } from "../../components/SystemAlert";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flexWrap: "wrap"
  },
  searchField: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" }
    }
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600
  },
  tabsBar: {
    padding: "0 24px",
    borderBottom: "1px solid #e0e0e0"
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "0 24px 16px"
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
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
      padding: "14px 16px"
    }
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.9rem",
      borderBottom: "1px solid #f1f5f9"
    }
  },
  statusChip: {
    fontWeight: 600,
    borderRadius: 6
  },
  dialogField: {
    marginBottom: theme.spacing(2)
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

const tabs = [
  { value: "categorias", label: "Categorias", icon: <CategoryIcon /> },
  { value: "fornecedores", label: "Fornecedores", icon: <BusinessIcon /> },
  { value: "despesas", label: "Contas a Pagar", icon: <ReceiptIcon /> }
];

const FinanceiroManager = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { showConfirm } = useSystemAlert();

  const [activeTab, setActiveTab] = useState("categorias");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para Categorias
  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({ 
    id: null, 
    nome: "", 
    tipo: "despesa", 
    paiId: "", 
    cor: "#6B7280",
    ativo: true
  });
  const [categoriaSaving, setCategoriaSaving] = useState(false);

  // Estados para Fornecedores
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresLoading, setFornecedoresLoading] = useState(false);
  const [fornecedorDialogOpen, setFornecedorDialogOpen] = useState(false);
  const [fornecedorForm, setFornecedorForm] = useState({ 
    id: null, 
    nome: "", 
    documento: "", 
    email: "", 
    telefone: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    categoria: "",
    observacoes: "",
    ativo: true
  });
  const [fornecedorSaving, setFornecedorSaving] = useState(false);

  // Estados para Despesas
  const [despesas, setDespesas] = useState([]);
  const [despesasLoading, setDespesasLoading] = useState(false);
  const [despesaDialogOpen, setDespesaDialogOpen] = useState(false);
  const [despesaForm, setDespesaForm] = useState({ 
    id: null, 
    fornecedorId: "", 
    categoriaId: "", 
    descricao: "", 
    valor: "", 
    status: "aberta", 
    dataVencimento: new Date(),
    dataPagamento: null,
    metodoPagamentoPrevisto: "",
    metodoPagamentoReal: "",
    observacoes: "",
    recorrente: false,
    dataInicio: null,
    dataFim: null,
    tipoRecorrencia: "mensal",
    quantidadeCiclos: "",
    cicloAtual: 1
  });
  const [despesaSaving, setDespesaSaving] = useState(false);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm.trim()) return categorias;
    const term = searchTerm.toLowerCase();
    return categorias.filter((categoria) =>
      [categoria.nome, categoria.tipo]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [categorias, searchTerm]);

  const filteredFornecedores = useMemo(() => {
    if (!searchTerm.trim()) return fornecedores;
    const term = searchTerm.toLowerCase();
    return fornecedores.filter((fornecedor) =>
      [fornecedor.nome, fornecedor.documento, fornecedor.email, fornecedor.telefone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [fornecedores, searchTerm]);

  const filteredDespesas = useMemo(() => {
    if (!searchTerm.trim()) return despesas;
    const term = searchTerm.toLowerCase();
    return despesas.filter((despesa) =>
      [despesa.descricao, despesa.fornecedor?.nome, despesa.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [despesas, searchTerm]);

  const fetchCategorias = useCallback(async () => {
    setCategoriasLoading(true);
    try {
      const { data } = await api.get("/financeiro/categorias");
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de categorias não encontrado. Backend em desenvolvimento.");
      } else {
        toastError(err);
      }
    } finally {
      setCategoriasLoading(false);
    }
  }, []);

  const fetchFornecedores = useCallback(async () => {
    setFornecedoresLoading(true);
    try {
      const { data } = await api.get("/financeiro/fornecedores");
      setFornecedores(data.fornecedores || []);
    } catch (err) {
      console.error("Erro ao buscar fornecedores:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de fornecedores não encontrado. Backend em desenvolvimento.");
      } else {
        toastError(err);
      }
    } finally {
      setFornecedoresLoading(false);
    }
  }, []);

  const fetchDespesas = useCallback(async () => {
    setDespesasLoading(true);
    try {
      const { data } = await api.get("/financeiro/despesas");
      setDespesas(data.despesas || []);
    } catch (err) {
      console.error("Erro ao buscar despesas:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de despesas não encontrado. Backend em desenvolvimento.");
      } else {
        toastError(err);
      }
    } finally {
      setDespesasLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
    fetchFornecedores();
    fetchDespesas();
  }, [fetchCategorias, fetchFornecedores, fetchDespesas]);

  // Handlers para Categorias
  const handleOpenCategoriaDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaForm({
        id: categoria.id,
        nome: categoria.nome || "",
        tipo: categoria.tipo || "despesa",
        paiId: categoria.paiId || "",
        cor: categoria.cor || "#6B7280",
        ativo: categoria.ativo !== undefined ? categoria.ativo : true
      });
    } else {
      setCategoriaForm({ 
        id: null, 
        nome: "", 
        tipo: "despesa", 
        paiId: "", 
        cor: "#6B7280",
        ativo: true 
      });
    }
    setCategoriaDialogOpen(true);
  };

  const handleSubmitCategoria = async (event) => {
    event.preventDefault();
    if (!categoriaForm.nome.trim()) {
      toast.warning("Informe o nome da categoria");
      return;
    }
    setCategoriaSaving(true);
    try {
      const payload = {
        nome: categoriaForm.nome.trim(),
        tipo: categoriaForm.tipo,
        paiId: categoriaForm.paiId || null,
        cor: categoriaForm.cor,
        ativo: categoriaForm.ativo
      };
      if (categoriaForm.id) {
        await api.put(`/financeiro/categorias/${categoriaForm.id}`, payload);
        toast.success("Categoria atualizada");
      } else {
        await api.post("/financeiro/categorias", payload);
        toast.success("Categoria criada");
      }
      setCategoriaDialogOpen(false);
      await fetchCategorias();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de categorias não encontrado. Backend em desenvolvimento.");
      } else if (err.response?.status === 500) {
        toast.error("Erro interno do servidor ao salvar categoria.");
      } else {
        toastError(err);
      }
    } finally {
      setCategoriaSaving(false);
    }
  };

  const handleDeleteCategoria = async (categoria) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir categoria",
      message: `Deseja excluir a categoria "${categoria.nome}"?`
    });
    if (!confirmed) return;

    try {
      await api.delete(`/financeiro/categorias/${categoria.id}`);
      toast.success("Categoria removida");
      await fetchCategorias();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de categorias não encontrado. Backend em desenvolvimento.");
      } else if (err.response?.status === 500) {
        toast.error("Erro interno do servidor ao excluir categoria.");
      } else {
        toastError(err);
      }
    }
  };

  // Handlers para Fornecedores
  const handleOpenFornecedorDialog = (fornecedor = null) => {
    if (fornecedor) {
      setFornecedorForm({
        id: fornecedor.id,
        nome: fornecedor.nome || "",
        documento: fornecedor.documento || "",
        email: fornecedor.email || "",
        telefone: fornecedor.telefone || "",
        endereco: fornecedor.endereco || "",
        numero: fornecedor.numero || "",
        complemento: fornecedor.complemento || "",
        bairro: fornecedor.bairro || "",
        cidade: fornecedor.cidade || "",
        estado: fornecedor.estado || "",
        cep: fornecedor.cep || "",
        categoria: fornecedor.categoria || "",
        observacoes: fornecedor.observacoes || "",
        ativo: fornecedor.ativo !== undefined ? fornecedor.ativo : true
      });
    } else {
      setFornecedorForm({ 
        id: null, 
        nome: "", 
        documento: "", 
        email: "", 
        telefone: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        categoria: "",
        observacoes: "",
        ativo: true 
      });
    }
    setFornecedorDialogOpen(true);
  };

  const handleSubmitFornecedor = async (event) => {
    event.preventDefault();
    if (!fornecedorForm.nome.trim()) {
      toast.warning("Informe o nome do fornecedor");
      return;
    }
    setFornecedorSaving(true);
    try {
      const payload = {
        nome: fornecedorForm.nome.trim(),
        documento: fornecedorForm.documento?.trim() || null,
        email: fornecedorForm.email?.trim() || null,
        telefone: fornecedorForm.telefone?.trim() || null,
        endereco: fornecedorForm.endereco?.trim() || null,
        numero: fornecedorForm.numero?.trim() || null,
        complemento: fornecedorForm.complemento?.trim() || null,
        bairro: fornecedorForm.bairro?.trim() || null,
        cidade: fornecedorForm.cidade?.trim() || null,
        estado: fornecedorForm.estado?.trim() || null,
        cep: fornecedorForm.cep?.trim() || null,
        categoria: fornecedorForm.categoria?.trim() || null,
        observacoes: fornecedorForm.observacoes?.trim() || null,
        ativo: fornecedorForm.ativo
      };
      if (fornecedorForm.id) {
        await api.put(`/financeiro/fornecedores/${fornecedorForm.id}`, payload);
        toast.success("Fornecedor atualizado");
      } else {
        await api.post("/financeiro/fornecedores", payload);
        toast.success("Fornecedor criado");
      }
      setFornecedorDialogOpen(false);
      await fetchFornecedores();
    } catch (err) {
      console.error("Erro ao salvar fornecedor:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de fornecedores não encontrado. Backend em desenvolvimento.");
      } else if (err.response?.status === 500) {
        toast.error("Erro interno do servidor ao salvar fornecedor.");
      } else {
        toastError(err);
      }
    } finally {
      setFornecedorSaving(false);
    }
  };

  const handleDeleteFornecedor = async (fornecedor) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir fornecedor",
      message: `Deseja excluir o fornecedor "${fornecedor.nome}"?`
    });
    if (!confirmed) return;

    try {
      await api.delete(`/financeiro/fornecedores/${fornecedor.id}`);
      toast.success("Fornecedor removido");
      await fetchFornecedores();
    } catch (err) {
      toastError(err);
    }
  };

  // Handlers para Despesas
  const handleOpenDespesaDialog = (despesa = null) => {
    if (despesa) {
      setDespesaForm({
        id: despesa.id,
        fornecedorId: despesa.fornecedorId || "",
        categoriaId: despesa.categoriaId || "",
        descricao: despesa.descricao || "",
        valor: despesa.valor ? String(despesa.valor) : "",
        status: despesa.status || "aberta",
        dataVencimento: despesa.dataVencimento ? new Date(despesa.dataVencimento) : new Date(),
        dataPagamento: despesa.dataPagamento ? new Date(despesa.dataPagamento) : null,
        metodoPagamentoPrevisto: despesa.metodoPagamentoPrevisto || "",
        metodoPagamentoReal: despesa.metodoPagamentoReal || "",
        observacoes: despesa.observacoes || "",
        recorrente: despesa.recorrente || false,
        dataInicio: despesa.dataInicio ? new Date(despesa.dataInicio) : null,
        dataFim: despesa.dataFim ? new Date(despesa.dataFim) : null,
        tipoRecorrencia: despesa.tipoRecorrencia || "mensal",
        quantidadeCiclos: despesa.quantidadeCiclos ? String(despesa.quantidadeCiclos) : "",
        cicloAtual: despesa.cicloAtual || 1
      });
    } else {
      setDespesaForm({ 
        id: null, 
        fornecedorId: "", 
        categoriaId: "", 
        descricao: "", 
        valor: "", 
        status: "aberta", 
        dataVencimento: new Date(),
        dataPagamento: null,
        metodoPagamentoPrevisto: "",
        metodoPagamentoReal: "",
        observacoes: "",
        recorrente: false,
        dataInicio: null,
        dataFim: null,
        tipoRecorrencia: "mensal",
        quantidadeCiclos: "",
        cicloAtual: 1
      });
    }
    setDespesaDialogOpen(true);
  };

  const handleSubmitDespesa = async (event) => {
    event.preventDefault();
    if (!despesaForm.descricao.trim()) {
      toast.warning("Informe a descrição da despesa");
      return;
    }
    if (!despesaForm.valor || parseFloat(despesaForm.valor) <= 0) {
      toast.warning("Informe um valor válido");
      return;
    }
    setDespesaSaving(true);
    try {
      const payload = {
        fornecedorId: despesaForm.fornecedorId || null,
        categoriaId: despesaForm.categoriaId || null,
        descricao: despesaForm.descricao.trim(),
        valor: parseFloat(despesaForm.valor),
        status: despesaForm.status,
        dataVencimento: despesaForm.dataVencimento,
        dataPagamento: despesaForm.dataPagamento,
        metodoPagamentoPrevisto: despesaForm.metodoPagamentoPrevisto?.trim() || null,
        metodoPagamentoReal: despesaForm.metodoPagamentoReal?.trim() || null,
        observacoes: despesaForm.observacoes?.trim() || null,
        recorrente: despesaForm.recorrente,
        dataInicio: despesaForm.recorrente ? despesaForm.dataInicio : null,
        dataFim: despesaForm.recorrente ? despesaForm.dataFim : null,
        tipoRecorrencia: despesaForm.recorrente ? despesaForm.tipoRecorrencia : "mensal",
        quantidadeCiclos: despesaForm.recorrente && despesaForm.quantidadeCiclos ? parseInt(despesaForm.quantidadeCiclos) : null,
        cicloAtual: despesaForm.cicloAtual
      };
      if (despesaForm.id) {
        await api.put(`/financeiro/despesas/${despesaForm.id}`, payload);
        toast.success("Despesa atualizada");
      } else {
        await api.post("/financeiro/despesas", payload);
        toast.success("Despesa criada");
      }
      setDespesaDialogOpen(false);
      await fetchDespesas();
    } catch (err) {
      console.error("Erro ao salvar despesa:", err);
      if (err.response?.status === 404) {
        toast.warning("Endpoint de despesas não encontrado. Backend em desenvolvimento.");
      } else if (err.response?.status === 500) {
        toast.error("Erro interno do servidor ao salvar despesa.");
      } else {
        toastError(err);
      }
    } finally {
      setDespesaSaving(false);
    }
  };

  const handleDeleteDespesa = async (despesa) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir despesa",
      message: `Deseja excluir a despesa "${despesa.descricao}"?`
    });
    if (!confirmed) return;

    try {
      await api.delete(`/financeiro/despesas/${despesa.id}`);
      toast.success("Despesa removida");
      await fetchDespesas();
    } catch (err) {
      toastError(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "aberta": return "#FF9800";
      case "paga": return "#4CAF50";
      case "vencida": return "#F44336";
      case "cancelada": return "#9E9E9E";
      default: return "#666";
    }
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Contas a Pagar</Typography>
            <Typography className={classes.headerSubtitle}>
              Gerencie categorias, fornecedores e despesas financeiras.
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              )
            }}
          />

          {activeTab === "categorias" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={classes.addButton}
              onClick={() => handleOpenCategoriaDialog()}
            >
              Nova categoria
            </Button>
          )}

          {activeTab === "fornecedores" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={classes.addButton}
              onClick={() => handleOpenFornecedorDialog()}
            >
              Novo fornecedor
            </Button>
          )}

          {activeTab === "despesas" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={classes.addButton}
              onClick={() => handleOpenDespesaDialog()}
            >
              Nova despesa
            </Button>
          )}
        </Box>
      </Box>

      <Box className={classes.tabsBar}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map(tab => (
            <Tab key={tab.value} label={tab.label} value={tab.value} icon={tab.icon} />
          ))}
        </Tabs>
      </Box>

      <Box className={classes.content} style={{ marginTop: 16 }}>
        {/* Tab Categorias */}
        <TabPanel value={activeTab} name="categorias">
          <Box className={classes.tableWrapper}>
            <TableContainer>
              <Table size="small">
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Cor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {categoriasLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCategorias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className={classes.emptyState}>
                          <CategoryIcon style={{ fontSize: 40, opacity: 0.4 }} />
                          <Typography variant="subtitle1">Nenhuma categoria encontrada</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategorias.map((categoria) => (
                      <TableRow key={categoria.id} hover>
                        <TableCell>{categoria.nome}</TableCell>
                        <TableCell>
                          <Chip
                            label={categoria.tipo === "despesa" ? "Despesa" : "Receita"}
                            size="small"
                            color={categoria.tipo === "despesa" ? "secondary" : "primary"}
                          />
                        </TableCell>
                        <TableCell>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: categoria.cor,
                              borderRadius: 4,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoria.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            color={categoria.ativo ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenCategoriaDialog(categoria)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => handleDeleteCategoria(categoria)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab Fornecedores */}
        <TabPanel value={activeTab} name="fornecedores">
          <Box className={classes.tableWrapper}>
            <TableContainer>
              <Table size="small">
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {fornecedoresLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : filteredFornecedores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className={classes.emptyState}>
                          <BusinessIcon style={{ fontSize: 40, opacity: 0.4 }} />
                          <Typography variant="subtitle1">Nenhum fornecedor encontrado</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id} hover>
                        <TableCell>{fornecedor.nome}</TableCell>
                        <TableCell>{fornecedor.documento || "-"}</TableCell>
                        <TableCell>{fornecedor.telefone || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={fornecedor.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            color={fornecedor.ativo ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenFornecedorDialog(fornecedor)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => handleDeleteFornecedor(fornecedor)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab Despesas */}
        <TabPanel value={activeTab} name="despesas">
          <Box className={classes.tableWrapper}>
            <TableContainer>
              <Table size="small">
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Fornecedor</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {despesasLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : filteredDespesas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className={classes.emptyState}>
                          <ReceiptIcon style={{ fontSize: 40, opacity: 0.4 }} />
                          <Typography variant="subtitle1">Nenhuma despesa encontrada</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDespesas.map((despesa) => (
                      <TableRow key={despesa.id} hover>
                        <TableCell>{despesa.descricao}</TableCell>
                        <TableCell>{despesa.fornecedor?.nome || "-"}</TableCell>
                        <TableCell>R$ {parseFloat(despesa.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(despesa.dataVencimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Chip
                            label={despesa.status}
                            size="small"
                            style={{
                              backgroundColor: getStatusColor(despesa.status),
                              color: "#fff",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenDespesaDialog(despesa)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => handleDeleteDespesa(despesa)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Box>

      {/* Dialog Categoria */}
      <Dialog open={categoriaDialogOpen} onClose={() => setCategoriaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{categoriaForm.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        <form onSubmit={handleSubmitCategoria}>
          <DialogContent>
            <TextField
              label="Nome"
              variant="outlined"
              fullWidth
              required
              className={classes.dialogField}
              value={categoriaForm.nome}
              onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
            />
            <FormControl variant="outlined" fullWidth className={classes.dialogField}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={categoriaForm.tipo}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, tipo: e.target.value })}
                label="Tipo"
              >
                <MenuItem value="despesa">Despesa</MenuItem>
                <MenuItem value="receita">Receita</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Cor"
              type="color"
              variant="outlined"
              fullWidth
              className={classes.dialogField}
              value={categoriaForm.cor}
              onChange={(e) => setCategoriaForm({ ...categoriaForm, cor: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoriaDialogOpen(false)}>Cancelar</Button>
            <Button color="primary" variant="contained" type="submit" disabled={categoriaSaving}>
              {categoriaSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Fornecedor */}
      <Dialog open={fornecedorDialogOpen} onClose={() => setFornecedorDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{fornecedorForm.id ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
        <form onSubmit={handleSubmitFornecedor}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  variant="outlined"
                  fullWidth
                  required
                  value={fornecedorForm.nome}
                  onChange={(e) => setFornecedorForm({ ...fornecedorForm, nome: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento"
                  variant="outlined"
                  fullWidth
                  value={fornecedorForm.documento}
                  onChange={(e) => setFornecedorForm({ ...fornecedorForm, documento: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={fornecedorForm.categoria || ""}
                    onChange={(e) => setFornecedorForm({ ...fornecedorForm, categoria: e.target.value })}
                    label="Categoria"
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    <MenuItem value="Material de Escritório">Material de Escritório</MenuItem>
                    <MenuItem value="Serviços">Serviços</MenuItem>
                    <MenuItem value="Aluguel">Aluguel</MenuItem>
                    <MenuItem value="Água/Luz/Telefone">Água/Luz/Telefone</MenuItem>
                    <MenuItem value="Tecnologia">Tecnologia</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Transporte">Transporte</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={fornecedorForm.email}
                  onChange={(e) => setFornecedorForm({ ...fornecedorForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  variant="outlined"
                  fullWidth
                  value={fornecedorForm.telefone}
                  onChange={(e) => setFornecedorForm({ ...fornecedorForm, telefone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={fornecedorForm.observacoes}
                  onChange={(e) => setFornecedorForm({ ...fornecedorForm, observacoes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFornecedorDialogOpen(false)}>Cancelar</Button>
            <Button color="primary" variant="contained" type="submit" disabled={fornecedorSaving}>
              {fornecedorSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Despesa */}
      <Dialog open={despesaDialogOpen} onClose={() => setDespesaDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{despesaForm.id ? "Editar despesa" : "Nova despesa"}</DialogTitle>
        <form onSubmit={handleSubmitDespesa}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  variant="outlined"
                  fullWidth
                  required
                  value={despesaForm.descricao}
                  onChange={(e) => setDespesaForm({ ...despesaForm, descricao: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Fornecedor</InputLabel>
                  <Select
                    value={despesaForm.fornecedorId || ""}
                    onChange={(e) => setDespesaForm({ ...despesaForm, fornecedorId: e.target.value })}
                    label="Fornecedor"
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {fornecedores.map((fornecedor) => (
                      <MenuItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={despesaForm.categoriaId || ""}
                    onChange={(e) => setDespesaForm({ ...despesaForm, categoriaId: e.target.value })}
                    label="Categoria"
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {categorias.filter(cat => cat.tipo === 'despesa').map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor (R$)"
                  variant="outlined"
                  fullWidth
                  required
                  type="number"
                  step="0.01"
                  value={despesaForm.valor}
                  onChange={(e) => setDespesaForm({ ...despesaForm, valor: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={despesaForm.status}
                    onChange={(e) => setDespesaForm({ ...despesaForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="aberta">Aberta</MenuItem>
                    <MenuItem value="paga">Paga</MenuItem>
                    <MenuItem value="vencida">Vencida</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de Vencimento"
                  type="date"
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={despesaForm.dataVencimento instanceof Date ? despesaForm.dataVencimento.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDespesaForm({ ...despesaForm, dataVencimento: new Date(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de Pagamento"
                  type="date"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={despesaForm.status !== "paga"}
                  value={despesaForm.dataPagamento instanceof Date ? despesaForm.dataPagamento.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDespesaForm({ ...despesaForm, dataPagamento: e.target.value ? new Date(e.target.value) : null })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={despesaForm.observacoes}
                  onChange={(e) => setDespesaForm({ ...despesaForm, observacoes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDespesaDialogOpen(false)}>Cancelar</Button>
            <Button color="primary" variant="contained" type="submit" disabled={despesaSaving}>
              {despesaSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FinanceiroManager;
