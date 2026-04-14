import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Grid,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import VisibilityIcon from "@material-ui/icons/Visibility";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import ShoppingBasketIcon from "@material-ui/icons/ShoppingBasket";
import CategoryIcon from "@material-ui/icons/Category";
import BallotIcon from "@material-ui/icons/Ballot";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import api from "../../services/api";
import { useSystemAlert } from "../../components/SystemAlert";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#fff3e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#ff9800",
    },
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
    gap: "12px",
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
    },
  },
  filterSelect: {
    minWidth: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#333",
      transform: "scale(1.05)",
    },
  },
  content: {
    flex: 1,
    padding: "16px 24px",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    },
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#fff3e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#ff9800",
    },
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    objectFit: "cover",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  itemName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  itemDetails: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: "0.8rem",
    color: "#666",
  },
  itemValue: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#4caf50",
  },
  statusChip: {
    fontWeight: 500,
    fontSize: "0.75rem",
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    "&:hover": {
      backgroundColor: "#bbdefb",
    },
  },
  editButton: {
    backgroundColor: "#fff3e0",
    color: "#ff9800",
    "&:hover": {
      backgroundColor: "#ffe0b2",
    },
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    "&:hover": {
      backgroundColor: "#ffcdd2",
    },
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
    "& svg": {
      fontSize: 64,
      marginBottom: 16,
      opacity: 0.5,
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
  },
  categoriesPanel: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    minWidth: 280,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  categoriesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryList: {
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  categoryItem: {
    borderRadius: 8,
    marginBottom: 6,
    border: "1px solid rgba(15,23,42,0.08)",
  },
  categoryActions: {
    display: "flex",
    gap: 8,
  },
  variationModalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  variationAccordion: {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  variationOptionRow: {
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  variationsPanel: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  variationHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  variationGroupList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: 320,
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  variationGroupItem: {
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  variationGroupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  variationGroupTitle: {
    fontWeight: 600,
    color: "#1a1a1a",
  },
  variationGroupActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  variationOptionsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  variationOptionItem: {
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: "6px 10px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid rgba(15,23,42,0.08)",
  },
  variationOptionName: {
    fontSize: "0.85rem",
    color: "#333",
  },
  productsWrapper: {
    flex: 1,
    marginLeft: 24,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
}));

const TIPOS = [
  { value: "fisico", label: "Produto físico" },
  { value: "digital", label: "Produto digital" }
];

const STATUS_LIST = [
  { value: "disponivel", label: "Disponível" },
  { value: "indisponivel", label: "Indisponível" }
];

const ProdutosPage = () => {
  const classes = useStyles();
  const { showConfirm } = useSystemAlert();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const [filterTipo, setFilterTipo] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1); // 1 = escolher tipo, 2 = demais campos, 3 = selecionar variações, 4 = configurar variações
  const [editingId, setEditingId] = useState(null);

  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState("disponivel");
  const [imagemPrincipal, setImagemPrincipal] = useState(""); // caminho/identificador futuro
  const [imagemPrincipalFile, setImagemPrincipalFile] = useState(null); // File selecionado
  const [galeriaFiles, setGaleriaFiles] = useState([]); // Novos Files da galeria (ainda não enviados)
  const [galeriaAtual, setGaleriaAtual] = useState([]); // Galeria já salva no banco
  const [saving, setSaving] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [controleEstoque, setControleEstoque] = useState(false);
  const [estoqueAtual, setEstoqueAtual] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProduto, setViewProduto] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [editingCategoriaId, setEditingCategoriaId] = useState(null);
  const [categoriaNome, setCategoriaNome] = useState("");
  const [categoriaSlug, setCategoriaSlug] = useState("");
  const [categoriaDescricao, setCategoriaDescricao] = useState("");
  const [categoriaSaving, setCategoriaSaving] = useState(false);

  const [variacaoGrupos, setVariacaoGrupos] = useState([]);
  const [variacoesLoading, setVariacoesLoading] = useState(false);
  const [grupoModalOpen, setGrupoModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [grupoSaving, setGrupoSaving] = useState(false);
  const [opcaoModalOpen, setOpcaoModalOpen] = useState(false);
  const [grupoSelecionadoOpcao, setGrupoSelecionadoOpcao] = useState(null);
  const [editingOpcao, setEditingOpcao] = useState(null);
  const [opcaoSaving, setOpcaoSaving] = useState(false);

  const [produtoVariacoes, setProdutoVariacoes] = useState([]);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationModalProduct, setVariationModalProduct] = useState(null);
  const [variationSelections, setVariationSelections] = useState({});
  const [expandedVariationGroup, setExpandedVariationGroup] = useState(false);
  const [variationSaving, setVariationSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setDialogStep(1);
    setTipo("");
    setNome("");
    setDescricao("");
    setValor("");
    setStatus("disponivel");
    setImagemPrincipal("");
    setImagemPrincipalFile(null);
    setGaleriaFiles([]);
    setGaleriaAtual([]);
    setCategoriaSelecionada("");
    setControleEstoque(false);
    setEstoqueAtual("");
    setEstoqueMinimo("");
    setProdutoVariacoes([]);
  };

  const handleOpenVariationsModal = produto => {
    setVariationModalProduct(produto);
    const selections = {};
    (produto.variacoes || []).forEach(variacao => {
      const grupoId = variacao.opcao?.grupoId;
      if (grupoId) {
        const key = String(grupoId);
        if (!selections[key]) selections[key] = [];
        if (!selections[key].includes(variacao.opcaoId)) {
          selections[key].push(variacao.opcaoId);
        }
      }
    });
    setVariationSelections(selections);
    setExpandedVariationGroup(false);
    setVariationModalOpen(true);
  };

  const handleCloseVariationsModal = () => {
    setVariationModalOpen(false);
    setVariationModalProduct(null);
    setVariationSelections({});
    setExpandedVariationGroup(false);
  };

  const handleToggleGroup = (grupo, checked) => {
    setVariationSelections(prev => {
      const next = { ...prev };
      const key = String(grupo.id);
      if (checked) {
        const defaults = (grupo.opcoes || []).map(opcao => opcao.id);
        const current = next[key] || [];
        const merged = Array.from(new Set([...(current || []), ...defaults]));
        next[key] = merged;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleToggleVariationOption = (grupoId, opcaoId) => {
    setVariationSelections(prev => {
      const next = { ...prev };
      const key = String(grupoId);
      const current = new Set(next[key] || []);
      if (current.has(opcaoId)) {
        current.delete(opcaoId);
      } else {
        current.add(opcaoId);
      }
      if (current.size === 0) {
        delete next[key];
      } else {
        next[key] = Array.from(current);
      }
      return next;
    });
  };

  const handleSaveVariations = async () => {
    if (!variationModalProduct) return;
    setVariationSaving(true);
    try {
      const variacoesPayload = [];
      Object.values(variationSelections).forEach(lista => {
        lista.forEach(opcaoId => {
          variacoesPayload.push({ opcaoId: Number(opcaoId) });
        });
      });

      await api.put(`/produtos/${variationModalProduct.id}`, {
        variacoes: variacoesPayload
      });

      await loadProdutos(filterTipo, filterCategoria);
      handleCloseVariationsModal();
    } catch (err) {
      console.error("Erro ao salvar variações", err);
    } finally {
      setVariationSaving(false);
    }
  };

  const handleOpenGrupoModal = grupo => {
    setEditingGrupo(grupo || null);
    setGrupoModalOpen(true);
  };

  const handleCloseGrupoModal = () => {
    setGrupoModalOpen(false);
    setEditingGrupo(null);
  };

  const handleSubmitGrupo = async ({ nome }) => {
    if (grupoSaving) return;
    setGrupoSaving(true);
    try {
      if (editingGrupo) {
        await api.put(`/produto-variacoes/grupos/${editingGrupo.id}`, { nome });
      } else {
        await api.post("/produto-variacoes/grupos", { nome });
      }
      await loadVariacoes();
      handleCloseGrupoModal();
    } catch (err) {
      console.error("Erro ao salvar grupo de variação", err);
    } finally {
      setGrupoSaving(false);
    }
  };

  const handleDeleteGrupo = async grupo => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir grupo",
      message: `Tem certeza que deseja excluir o grupo "${grupo.nome}" e todas as suas opções?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });

    if (!confirmed) return;

    try {
      await api.delete(`/produto-variacoes/grupos/${grupo.id}`);
      await loadVariacoes();
    } catch (err) {
      console.error("Erro ao excluir grupo", err);
    }
  };

  const handleOpenOpcaoModal = (grupo, opcao = null) => {
    setGrupoSelecionadoOpcao(grupo);
    setEditingOpcao(opcao);
    setOpcaoModalOpen(true);
  };

  const handleCloseOpcaoModal = () => {
    setOpcaoModalOpen(false);
    setGrupoSelecionadoOpcao(null);
    setEditingOpcao(null);
  };

  const handleSubmitOpcao = async ({ nome, ordem }) => {
    if (opcaoSaving) return;
    if (!grupoSelecionadoOpcao) return;
    setOpcaoSaving(true);
    try {
      if (editingOpcao) {
        await api.put(`/produto-variacoes/opcoes/${editingOpcao.id}`, {
          nome,
          ordem
        });
      } else {
        await api.post("/produto-variacoes/opcoes", {
          grupoId: grupoSelecionadoOpcao.id,
          nome,
          ordem
        });
      }
      await loadVariacoes();
      handleCloseOpcaoModal();
    } catch (err) {
      console.error("Erro ao salvar opção de variação", err);
    } finally {
      setOpcaoSaving(false);
    }
  };

  const handleDeleteOpcao = async opcao => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir opção",
      message: `Confirma a exclusão da opção "${opcao.nome}"?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });

    if (!confirmed) return;

    try {
      await api.delete(`/produto-variacoes/opcoes/${opcao.id}`);
      await loadVariacoes();
    } catch (err) {
      console.error("Erro ao excluir opção", err);
    }
  };

  const loadProdutos = async (tipoFiltro = filterTipo, categoriaFiltro = filterCategoria) => {
    setLoading(true);
    try {
      const params = {};
      if (tipoFiltro) {
        params.tipo = tipoFiltro;
      }
      if (categoriaFiltro) {
        params.categoriaId = categoriaFiltro;
      }

      const { data } = await api.get("/produtos", { params });
      setProdutos(data || []);
    } catch (err) {
      console.error("Erro ao carregar produtos", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    setCategoriasLoading(true);
    try {
      const { data } = await api.get("/produto-categorias");
      setCategorias(data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    } finally {
      setCategoriasLoading(false);
    }
  };

  const loadVariacoes = async () => {
    setVariacoesLoading(true);
    try {
      const { data } = await api.get("/produto-variacoes");
      setVariacaoGrupos(data || []);
    } catch (err) {
      console.error("Erro ao carregar variações", err);
    } finally {
      setVariacoesLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
    loadCategorias();
    loadVariacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tipo !== "fisico") {
      setControleEstoque(false);
      setEstoqueAtual("");
      setEstoqueMinimo("");
    }
  }, [tipo]);

  const handleFilterChange = async event => {
    const value = event.target.value;
    setFilterTipo(value);
    await loadProdutos(value, filterCategoria);
  };

  const handleCategoriaFilterChange = async event => {
    const value = event.target.value;
    setFilterCategoria(value);
    await loadProdutos(filterTipo, value);
  };

  const handleOpenCategoriaDialog = categoria => {
    if (categoria) {
      setEditingCategoriaId(categoria.id);
      setCategoriaNome(categoria.nome || "");
      setCategoriaSlug(categoria.slug || "");
      setCategoriaDescricao(categoria.descricao || "");
    } else {
      setEditingCategoriaId(null);
      setCategoriaNome("");
      setCategoriaSlug("");
      setCategoriaDescricao("");
    }
    setCategoriaDialogOpen(true);
  };

  const handleCloseCategoriaDialog = () => {
    setCategoriaDialogOpen(false);
  };

  const handleSaveCategoria = async event => {
    event.preventDefault();
    if (!categoriaNome) return;
    setCategoriaSaving(true);
    try {
      const payload = {
        nome: categoriaNome,
        slug: categoriaSlug || null,
        descricao: categoriaDescricao || null
      };

      if (editingCategoriaId) {
        await api.put(`/produto-categorias/${editingCategoriaId}`, payload);
      } else {
        await api.post("/produto-categorias", payload);
      }

      await loadCategorias();
      await loadProdutos();
      setCategoriaDialogOpen(false);
    } catch (err) {
      console.error("Erro ao salvar categoria", err);
    } finally {
      setCategoriaSaving(false);
    }
  };

  const handleDeleteCategoria = async categoria => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir categoria",
      message: `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });

    if (!confirmed) return;

    try {
      await api.delete(`/produto-categorias/${categoria.id}`);
      if (filterCategoria === String(categoria.id)) {
        setFilterCategoria("");
      }
      await loadCategorias();
      await loadProdutos();
    } catch (err) {
      console.error("Erro ao excluir categoria", err);
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = produto => {
    setEditingId(produto.id);
    setTipo(produto.tipo || "");
    setNome(produto.nome || "");
    setDescricao(produto.descricao || "");
    setValor(produto.valor != null ? String(produto.valor) : "");
    setStatus(produto.status || "disponivel");
    setImagemPrincipal(produto.imagem_principal || "");
    setImagemPrincipalFile(null);
    setGaleriaFiles([]);
    setGaleriaAtual(Array.isArray(produto.galeria) ? produto.galeria : []);
    setCategoriaSelecionada(produto.categoriaId ? String(produto.categoriaId) : "");
    setControleEstoque(Boolean(produto.controleEstoque));
    setEstoqueAtual(
      produto.controleEstoque && produto.estoqueAtual != null ? String(produto.estoqueAtual) : ""
    );
    setEstoqueMinimo(
      produto.controleEstoque && produto.estoqueMinimo != null ? String(produto.estoqueMinimo) : ""
    );
    setProdutoVariacoes(
      Array.isArray(produto.variacoes)
        ? produto.variacoes.map(v => ({
            opcaoId: v.opcaoId,
            valorOverride: v.valorOverride || null,
            estoqueOverride: v.estoqueOverride || null
          }))
        : []
    );
    setDialogStep(2);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleNextStep = () => {
    if (!tipo) return;
    setDialogStep(2);
  };

  const handleNextToVariacoes = () => {
    setDialogStep(3);
  };

  const handleNextToConfigVariacoes = () => {
    setDialogStep(4);
  };

  const handleOpenEditVariacoes = produto => {
    setEditingId(produto.id);
    setNome(produto.nome || "");
    setProdutoVariacoes(
      Array.isArray(produto.variacoes)
        ? produto.variacoes.map(v => ({
            opcaoId: v.opcaoId,
            valorOverride: v.valorOverride || null,
            estoqueOverride: v.estoqueOverride || null
          }))
        : []
    );
    setDialogStep(3);
    setDialogOpen(true);
  };

  const handleSave = async event => {
    event.preventDefault();
    if (!tipo || !nome || !valor) return;

    console.log("Iniciando salvamento do produto...");
    console.log("produtoVariacoes:", produtoVariacoes);
    console.log("dialogStep:", dialogStep);
    console.log("editingId:", editingId);

    setSaving(true);

    try {
      // 1) Upload da imagem principal, se um novo arquivo foi selecionado
      let mainImage = imagemPrincipal || null;
      if (imagemPrincipalFile) {
        const formData = new FormData();
        formData.append("typeArch", "produtos");
        formData.append("file", imagemPrincipalFile);

        const { data } = await api.post("/produtos/upload-imagem", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        mainImage = data.filename || null;
      }

      // 2) Upload da galeria, se houver novos arquivos selecionados
      let galeriaNovas = [];
      if (galeriaFiles.length > 0) {
        const filenames = [];
        for (const file of galeriaFiles) {
          const formData = new FormData();
          formData.append("typeArch", "produtos");
          formData.append("file", file);

          const { data } = await api.post("/produtos/upload-imagem", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          if (data.filename) {
            filenames.push(data.filename);
          }
        }

        if (filenames.length > 0) {
          galeriaNovas = filenames;
        }
      }

      const galeriaFinal = [...(Array.isArray(galeriaAtual) ? galeriaAtual : []), ...galeriaNovas];

      const isProdutoFisico = tipo === "fisico";
      const payload = {
        tipo,
        nome,
        descricao,
        valor: Number(valor),
        status,
        imagem_principal: mainImage,
        ...(galeriaFinal.length ? { galeria: galeriaFinal } : {}),
        ...(categoriaSelecionada ? { categoriaId: Number(categoriaSelecionada) } : {}),
        ...(isProdutoFisico
          ? {
              controleEstoque,
              estoqueAtual: controleEstoque ? Number(estoqueAtual || 0) : 0,
              estoqueMinimo: controleEstoque ? Number(estoqueMinimo || 0) : 0
            }
          : {
              controleEstoque: false,
              estoqueAtual: 0,
              estoqueMinimo: 0
            }),
        ...(produtoVariacoes.length ? { variacoes: produtoVariacoes } : {})
      };

      console.log("Payload enviado ao backend:", payload);

      try {
        if (editingId) {
          await api.put(`/produtos/${editingId}`, payload);
        } else {
          await api.post("/produtos", payload);
        }

        await loadProdutos();
        setDialogOpen(false);
        resetForm();
      } catch (err) {
        console.error("Erro ao salvar produto", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
      } finally {
        setSaving(false);
      }
    } catch (err) {
      console.error("Erro ao salvar produto", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir Produto",
      message: "Deseja realmente excluir este produto?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/produtos/${id}`);
      await loadProdutos();
    } catch (err) {
      console.error("Erro ao excluir produto", err);
    }
  };

  const renderTipoLabel = value => {
    const item = TIPOS.find(t => t.value === value);
    return item ? item.label : value;
  };

  const renderStatusLabel = value => {
    const item = STATUS_LIST.find(s => s.value === value);
    return item ? item.label : value;
  };

  const getImageUrl = (companyId, filename) => {
    if (!filename) return null;
    const baseUrl = process.env.REACT_APP_BACKEND_URL || "";

    // Novo formato: já vem com caminho completo relativo (ex.: company1/produtos/arquivo.png)
    if (filename.includes("company")) {
      return `${baseUrl}/public/${filename}`;
    }

    // Formato legado: apenas o nome do arquivo salvo na raiz da pasta da company
    if (companyId) {
      return `${baseUrl}/public/company${companyId}/${filename}`;
    }

    // Fallback genérico
    return `${baseUrl}/public/${filename}`;
  };

  const handleRemoveGaleriaImage = async (produto, index) => {
    if (!Array.isArray(produto.galeria)) return;

    const novaGaleria = produto.galeria.filter((_, i) => i !== index);

    try {
      await api.put(`/produtos/${produto.id}`, { galeria: novaGaleria });

      // atualiza lista completa
      await loadProdutos(filterTipo);

      // atualiza produto em visualização, se for o mesmo
      if (viewProduto && viewProduto.id === produto.id) {
        setViewProduto({ ...viewProduto, galeria: novaGaleria });
      }
    } catch (err) {
      console.error("Erro ao remover imagem da galeria", err);
    }
  };

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome?.toLowerCase().includes(searchParam.toLowerCase())
  );

  const getStatusChip = (status) => {
    if (status === "disponivel") {
      return (
        <Chip
          label="Disponível"
          size="small"
          className={classes.statusChip}
          style={{ backgroundColor: "#e8f5e9", color: "#4caf50" }}
        />
      );
    }
    return (
      <Chip
        label="Indisponível"
        size="small"
        className={classes.statusChip}
        style={{ backgroundColor: "#ffebee", color: "#d32f2f" }}
      />
    );
  };

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <ShoppingBasketIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>Produtos</Typography>
            <Typography className={classes.headerSubtitle}>
              {produtos.length} {produtos.length === 1 ? "produto cadastrado" : "produtos cadastrados"}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel id="filter-tipo-label">Tipo</InputLabel>
            <Select
              labelId="filter-tipo-label"
              value={filterTipo}
              onChange={handleFilterChange}
              label="Tipo"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {TIPOS.map(t => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel id="filter-categoria-label">Categoria</InputLabel>
            <Select
              labelId="filter-categoria-label"
              value={filterCategoria}
              onChange={handleCategoriaFilterChange}
              label="Categoria"
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {categorias.map(cat => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            placeholder="Buscar produto..."
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
          <Tooltip title="Adicionar Produto">
            <button className={classes.addButton} onClick={handleOpenCreate}>
              <AddIcon style={{ fontSize: 24 }} />
            </button>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        <Box className={classes.productsWrapper}>
          {loading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredProdutos.length === 0 ? (
            <Box className={classes.emptyState}>
              <ShoppingBasketIcon />
              <Typography>Nenhum produto encontrado</Typography>
            </Box>
          ) : (
            <>
              {filteredProdutos.map((produto) => (
              <Box key={produto.id} className={classes.listItem}>
                {produto.imagem_principal ? (
                  <img
                    src={getImageUrl(produto.companyId, produto.imagem_principal)}
                    alt={produto.nome}
                    className={classes.itemImage}
                  />
                ) : (
                  <Box className={classes.itemIcon}>
                    <ShoppingBasketIcon />
                  </Box>
                )}

                <Box className={classes.itemInfo}>
                  <Typography className={classes.itemName}>{produto.nome}</Typography>
                  <Box className={classes.itemDetails}>
                    <span>ID: {produto.id}</span>
                    <span>•</span>
                    <span>{renderTipoLabel(produto.tipo)}</span>
                    {produto.categoria?.nome && (
                      <>
                        <span>•</span>
                        <span>{produto.categoria.nome}</span>
                      </>
                    )}
                    <span>•</span>
                    {getStatusChip(produto.status)}
                  </Box>
                </Box>

                <Typography className={classes.itemValue}>
                  R$ {Number(produto.valor || 0).toFixed(2)}
                </Typography>

                <Box className={classes.itemActions} style={{ marginLeft: 16 }}>
                  <Tooltip title="Visualizar Imagens">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.viewButton}`}
                      onClick={() => {
                        setViewProduto(produto);
                        setViewDialogOpen(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.editButton}`}
                      onClick={() => handleOpenEdit(produto)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.deleteButton}`}
                      onClick={() => handleDelete(produto.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Gerenciar variações">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.editButton}`}
                      onClick={() => handleOpenVariationsModal(produto)}
                    >
                      <BallotIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
            </>
          )}
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingId ? "Editar produto" : "Adicionar produto"}
        </DialogTitle>
        <DialogContent>
          {dialogStep === 1 && (
            <FormControl variant="outlined" fullWidth className={classes.field}>
              <InputLabel id="tipo-label">Tipo do produto</InputLabel>
              <Select
                labelId="tipo-label"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                label="Tipo do produto"
              >
                {TIPOS.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {dialogStep === 2 && (
            <form id="produto-form" onSubmit={handleSave}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl variant="outlined" fullWidth className={classes.field}>
                    <InputLabel id="tipo-edit-label">Tipo do produto</InputLabel>
                    <Select
                      labelId="tipo-edit-label"
                      value={tipo}
                      onChange={e => setTipo(e.target.value)}
                      label="Tipo do produto"
                      required
                    >
                      {TIPOS.map(t => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {tipo === "fisico" && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          color="primary"
                          checked={controleEstoque}
                          onChange={e => setControleEstoque(e.target.checked)}
                        />
                      }
                      label="Habilitar controle de estoque"
                    />
                  </Grid>
                )}

                {tipo === "fisico" && controleEstoque && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Estoque atual"
                        type="number"
                        value={estoqueAtual}
                        onChange={e => setEstoqueAtual(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className={classes.field}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Estoque mínimo"
                        type="number"
                        value={estoqueMinimo}
                        onChange={e => setEstoqueMinimo(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className={classes.field}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth className={classes.field}>
                    <InputLabel id="categoria-label">Categoria</InputLabel>
                    <Select
                      labelId="categoria-label"
                      value={categoriaSelecionada}
                      onChange={e => setCategoriaSelecionada(e.target.value)}
                      label="Categoria"
                    >
                      <MenuItem value="">
                        <em>Sem categoria</em>
                      </MenuItem>
                      {categorias.map(cat => (
                        <MenuItem key={cat.id} value={String(cat.id)}>
                          {cat.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl variant="outlined" fullWidth className={classes.field}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      label="Status"
                      required
                    >
                      {STATUS_LIST.map(s => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nome do produto"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    variant="outlined"
                    fullWidth
                    className={classes.field}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Descrição"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    className={classes.field}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor"
                    type="number"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    variant="outlined"
                    fullWidth
                    className={classes.field}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <div className={classes.field}>
                    <Typography variant="subtitle2" gutterBottom>
                      Imagem principal
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files && e.target.files[0];
                        setImagemPrincipalFile(file || null);
                      }}
                    />
                    {imagemPrincipal && (
                      <Typography variant="caption" display="block">
                        Arquivo atual: {imagemPrincipal}
                      </Typography>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <div className={classes.field}>
                    <Typography variant="subtitle2" gutterBottom>
                      Galeria de imagens
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setGaleriaFiles(files);
                      }}
                    />
                    {galeriaFiles.length > 0 && (
                      <Typography variant="caption" display="block">
                        {galeriaFiles.length} arquivo(s) selecionado(s) para galeria
                      </Typography>
                    )}
                  </div>
                </Grid>
              </Grid>
            </form>
          )}

          {dialogStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selecionar Variações
              </Typography>
              {variacaoGrupos.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Nenhum grupo de variações cadastrado. Use o painel lateral para criar grupos e opções.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {variacaoGrupos.map(grupo => (
                    <Grid item xs={12} sm={6} key={grupo.id}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>{grupo.nome}</InputLabel>
                        <Select
                          label={grupo.nome}
                          multiple
                          value={produtoVariacoes
                            .filter(v => grupo.opcoes.some(o => o.id === v.opcaoId))
                            .map(v => v.opcaoId)}
                          onChange={e => {
                            const selected = e.target.value;
                            const novas = produtoVariacoes.filter(v => !grupo.opcoes.some(o => o.id === v.opcaoId));
                            selected.forEach(opcaoId => {
                              if (!novas.find(v => v.opcaoId === opcaoId)) {
                                novas.push({ opcaoId, valorOverride: null, estoqueOverride: null });
                              }
                            });
                            setProdutoVariacoes(novas);
                          }}
                          renderValue={selectedIds => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selectedIds.map(id => {
                                const opt = grupo.opcoes.find(o => o.id === id);
                                return <Chip key={id} label={opt?.nome || id} size="small" />;
                              })}
                            </Box>
                          )}
                        >
                          {grupo.opcoes.map(opcao => (
                            <MenuItem key={opcao.id} value={opcao.id}>
                              {opcao.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {dialogStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Configurar Variações
              </Typography>
              {produtoVariacoes.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma variação selecionada.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {produtoVariacoes.map((variacao, idx) => {
                    const opt = variacaoGrupos.flatMap(g => g.opcoes).find(o => o.id === variacao.opcaoId);
                    return (
                      <Grid item xs={12} key={variacao.opcaoId}>
                        <Box p={2} border={1} borderColor="grey.300" borderRadius={4}>
                          <Typography variant="subtitle2">{opt?.nome || `Opção ${variacao.opcaoId}`}</Typography>
                          <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Valor"
                                type="number"
                                value={variacao.valorOverride ?? ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  const updated = [...produtoVariacoes];
                                  updated[idx].valorOverride = val ? Number(val) : null;
                                  setProdutoVariacoes(updated);
                                }}
                                variant="outlined"
                                fullWidth
                                inputProps={{ min: 0, step: 0.01 }}
                                helperText="Deixe em branco para usar o valor padrão"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Estoque"
                                type="number"
                                value={variacao.estoqueOverride ?? ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  const updated = [...produtoVariacoes];
                                  updated[idx].estoqueOverride = val ? Number(val) : null;
                                  setProdutoVariacoes(updated);
                                }}
                                variant="outlined"
                                fullWidth
                                inputProps={{ min: 0 }}
                                helperText="Deixe em branco para usar o estoque padrão"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {dialogStep === 1 && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleNextStep}
              disabled={!tipo}
            >
              Próximo
            </Button>
          )}
          {dialogStep === 2 && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleNextToVariacoes}
              disabled={!nome || !valor}
            >
              Próximo
            </Button>
          )}
          {dialogStep === 3 && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleNextToConfigVariacoes}
            >
              Próximo
            </Button>
          )}
          {dialogStep === 4 && (
            <form id="produto-form" onSubmit={handleSave}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={saving}
              >
                {editingId ? "Salvar alterações" : "Criar produto"}
              </Button>
            </form>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={categoriaDialogOpen} onClose={handleCloseCategoriaDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editingCategoriaId ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        <DialogContent>
          <form id="categoria-form" onSubmit={handleSaveCategoria}>
            <TextField
              label="Nome"
              value={categoriaNome}
              onChange={e => setCategoriaNome(e.target.value)}
              variant="outlined"
              fullWidth
              className={classes.field}
              required
            />
            <TextField
              label="Slug (opcional)"
              value={categoriaSlug}
              onChange={e => setCategoriaSlug(e.target.value)}
              variant="outlined"
              fullWidth
              className={classes.field}
            />
            <TextField
              label="Descrição"
              value={categoriaDescricao}
              onChange={e => setCategoriaDescricao(e.target.value)}
              variant="outlined"
              fullWidth
              className={classes.field}
              multiline
              rows={3}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoriaDialog}>Cancelar</Button>
          <Button color="primary" variant="contained" type="submit" form="categoria-form" disabled={categoriaSaving}>
            {categoriaSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setViewProduto(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Imagens do produto</DialogTitle>
        <DialogContent>
          {viewProduto && (
            <Grid container spacing={2}>
              {viewProduto.imagem_principal && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Imagem principal
                  </Typography>
                  <img
                    src={getImageUrl(viewProduto.companyId, viewProduto.imagem_principal)}
                    alt={viewProduto.nome}
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                </Grid>
              )}

              {Array.isArray(viewProduto.galeria) && viewProduto.galeria.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Galeria
                  </Typography>
                  <Grid container spacing={2}>
                    {viewProduto.galeria.map((img, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`${img}-${index}`}>
                        <div style={{ position: "relative" }}>
                          <img
                            src={getImageUrl(viewProduto.companyId, img)}
                            alt={`${viewProduto.nome} ${index + 1}`}
                            style={{ width: "100%", borderRadius: 8, objectFit: "cover" }}
                          />
                          <IconButton
                            size="small"
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: "rgba(0,0,0,0.6)",
                              color: "#fff"
                            }}
                            onClick={() => handleRemoveGaleriaImage(viewProduto, index)}
                          >
                            <CloseIcon style={{ fontSize: 16 }} />
                          </IconButton>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {!viewProduto.imagem_principal &&
                (!viewProduto.galeria || viewProduto.galeria.length === 0) && (
                  <Grid item xs={12}>
                    <Typography>Nenhuma imagem cadastrada para este produto.</Typography>
                  </Grid>
                )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setViewProduto(null);
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog open={variationModalOpen} onClose={handleCloseVariationsModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Gerenciar variações {variationModalProduct ? `- ${variationModalProduct.nome}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {variacaoGrupos.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhum grupo de variações cadastrado.
            </Typography>
          ) : (
            <Box className={classes.variationModalContent}>
              {variacaoGrupos.map(grupo => {
                const key = String(grupo.id);
                const selectedIds = variationSelections[key] || [];
                const isGroupSelected = selectedIds.length > 0;
                return (
                  <Accordion
                    key={grupo.id}
                    className={classes.variationAccordion}
                    expanded={expandedVariationGroup === grupo.id}
                    onChange={(_, expanded) => setExpandedVariationGroup(expanded ? grupo.id : false)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Checkbox
                            color="primary"
                            checked={isGroupSelected}
                            onClick={event => event.stopPropagation()}
                            onChange={event => handleToggleGroup(grupo, event.target.checked)}
                          />
                          <Typography>{grupo.nome}</Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {selectedIds.length} selecionada(s)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {grupo.opcoes && grupo.opcoes.length ? (
                        <Grid container spacing={1}>
                          {grupo.opcoes.map(opcao => {
                            const optionSelected = selectedIds.includes(opcao.id);
                            return (
                              <Grid item xs={12} sm={6} key={opcao.id}>
                                <Box className={classes.variationOptionRow}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        color="primary"
                                        checked={optionSelected}
                                        onChange={() => handleToggleVariationOption(grupo.id, opcao.id)}
                                      />
                                    }
                                    label={opcao.nome}
                                  />
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma opção cadastrada.
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariationsModal}>Cancelar</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSaveVariations}
            disabled={saving}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProdutosPage;