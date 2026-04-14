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
  ListAlt as ListAltIcon
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
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: theme.spacing(2),
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1)
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5)
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
  { value: "categorias", label: "Categorias" },
  { value: "variacoes", label: "Variações" }
];

const CatalogoProdutos = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { showConfirm } = useSystemAlert();

  const [activeTab, setActiveTab] = useState("categorias");
  const [searchTerm, setSearchTerm] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({ id: null, nome: "", slug: "", descricao: "" });
  const [categoriaSaving, setCategoriaSaving] = useState(false);

  const [variacaoGrupos, setVariacaoGrupos] = useState([]);
  const [variacoesLoading, setVariacoesLoading] = useState(false);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [grupoForm, setGrupoForm] = useState({ id: null, nome: "" });
  const [grupoSaving, setGrupoSaving] = useState(false);
  const [opcaoDialogOpen, setOpcaoDialogOpen] = useState(false);
  const [opcaoForm, setOpcaoForm] = useState({ id: null, nome: "", ordem: "", grupoId: null });
  const [opcaoSaving, setOpcaoSaving] = useState(false);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm.trim()) return categorias;
    const term = searchTerm.toLowerCase();
    return categorias.filter((categoria) =>
      [categoria.nome, categoria.slug, categoria.descricao]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [categorias, searchTerm]);

  const filteredVariacoes = useMemo(() => {
    if (!searchTerm.trim()) return variacaoGrupos;
    const term = searchTerm.toLowerCase();
    return variacaoGrupos.filter((grupo) =>
      grupo.nome.toLowerCase().includes(term) ||
      grupo.opcoes?.some((opcao) => opcao.nome?.toLowerCase().includes(term))
    );
  }, [variacaoGrupos, searchTerm]);

  const fetchCategorias = useCallback(async () => {
    setCategoriasLoading(true);
    try {
      const { data } = await api.get("/produto-categorias");
      setCategorias(data || []);
    } catch (err) {
      toastError(err);
    } finally {
      setCategoriasLoading(false);
    }
  }, []);

  const fetchVariacoes = useCallback(async () => {
    setVariacoesLoading(true);
    try {
      const { data } = await api.get("/produto-variacoes");
      setVariacaoGrupos(data || []);
    } catch (err) {
      toastError(err);
    } finally {
      setVariacoesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
    fetchVariacoes();
  }, [fetchCategorias, fetchVariacoes]);

  const handleOpenCategoriaDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaForm({
        id: categoria.id,
        nome: categoria.nome || "",
        slug: categoria.slug || "",
        descricao: categoria.descricao || ""
      });
    } else {
      setCategoriaForm({ id: null, nome: "", slug: "", descricao: "" });
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
        slug: categoriaForm.slug?.trim() || null,
        descricao: categoriaForm.descricao?.trim() || null
      };
      if (categoriaForm.id) {
        await api.put(`/produto-categorias/${categoriaForm.id}`, payload);
        toast.success("Categoria atualizada");
      } else {
        await api.post("/produto-categorias", payload);
        toast.success("Categoria criada");
      }
      setCategoriaDialogOpen(false);
      await fetchCategorias();
    } catch (err) {
      toastError(err);
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
      await api.delete(`/produto-categorias/${categoria.id}`);
      toast.success("Categoria removida");
      await fetchCategorias();
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenGrupoDialog = (grupo = null) => {
    if (grupo) {
      setGrupoForm({ id: grupo.id, nome: grupo.nome || "" });
    } else {
      setGrupoForm({ id: null, nome: "" });
    }
    setGrupoDialogOpen(true);
  };

  const handleSubmitGrupo = async (event) => {
    event.preventDefault();
    if (!grupoForm.nome.trim()) {
      toast.warning("Informe o nome do grupo");
      return;
    }
    setGrupoSaving(true);
    try {
      const payload = { nome: grupoForm.nome.trim() };
      if (grupoForm.id) {
        await api.put(`/produto-variacoes/grupos/${grupoForm.id}`, payload);
        toast.success("Grupo atualizado");
      } else {
        await api.post("/produto-variacoes/grupos", payload);
        toast.success("Grupo criado");
      }
      setGrupoDialogOpen(false);
      await fetchVariacoes();
    } catch (err) {
      toastError(err);
    } finally {
      setGrupoSaving(false);
    }
  };

  const handleDeleteGrupo = async (grupo) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir grupo",
      message: `Excluir o grupo "${grupo.nome}" e suas opções?`
    });
    if (!confirmed) return;

    try {
      await api.delete(`/produto-variacoes/grupos/${grupo.id}`);
      toast.success("Grupo removido");
      await fetchVariacoes();
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenOpcaoDialog = (grupo, opcao = null) => {
    setOpcaoForm({
      id: opcao?.id || null,
      nome: opcao?.nome || "",
      ordem: opcao?.ordem != null ? String(opcao.ordem) : "",
      grupoId: grupo.id
    });
    setOpcaoDialogOpen(true);
  };

  const handleSubmitOpcao = async (event) => {
    event.preventDefault();
    if (!opcaoForm.nome.trim()) {
      toast.warning("Informe o nome da opção");
      return;
    }
    if (!opcaoForm.grupoId) return;

    setOpcaoSaving(true);
    try {
      const payload = {
        nome: opcaoForm.nome.trim(),
        ordem: opcaoForm.ordem ? Number(opcaoForm.ordem) : undefined
      };
      if (opcaoForm.id) {
        await api.put(`/produto-variacoes/opcoes/${opcaoForm.id}`, payload);
        toast.success("Opção atualizada");
      } else {
        await api.post("/produto-variacoes/opcoes", { ...payload, grupoId: opcaoForm.grupoId });
        toast.success("Opção criada");
      }
      setOpcaoDialogOpen(false);
      await fetchVariacoes();
    } catch (err) {
      toastError(err);
    } finally {
      setOpcaoSaving(false);
    }
  };

  const handleDeleteOpcao = async (opcao) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir opção",
      message: `Excluir a opção "${opcao.nome}"?`
    });
    if (!confirmed) return;

    try {
      await api.delete(`/produto-variacoes/opcoes/${opcao.id}`);
      toast.success("Opção removida");
      await fetchVariacoes();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Catálogo de Produtos</Typography>
            <Typography className={classes.headerSubtitle}>
              Gerencie categorias e grupos de variações utilizados nos produtos.
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

          {activeTab === "categorias" ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={classes.addButton}
              onClick={() => handleOpenCategoriaDialog()}
            >
              Nova categoria
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className={classes.addButton}
              onClick={() => handleOpenGrupoDialog()}
            >
              Novo grupo
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
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      <Box className={classes.content} style={{ marginTop: 16 }}>
        <TabPanel value={activeTab} name="categorias">
          <Box className={classes.tableWrapper}>
            <TableContainer>
              <Table size="small">
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {categoriasLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCategorias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
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
                        <TableCell>{categoria.slug || "-"}</TableCell>
                        <TableCell>{categoria.descricao || "-"}</TableCell>
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

        <TabPanel value={activeTab} name="variacoes">
          <Grid container spacing={3}>
            {variacoesLoading ? (
              <Grid item xs={12}>
                <Box className={classes.emptyState}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : filteredVariacoes.length === 0 ? (
              <Grid item xs={12}>
                <Box className={classes.emptyState}>
                  <ListAltIcon style={{ fontSize: 40, opacity: 0.4 }} />
                  <Typography variant="subtitle1">Nenhum grupo cadastrado</Typography>
                </Box>
              </Grid>
            ) : (
              filteredVariacoes.map((grupo) => (
                <Grid item xs={12} md={6} key={grupo.id}>
                  <Paper className={classes.listContainer}>
                    <Box className={classes.listHeader}>
                      <Box>
                        <Typography variant="h6">{grupo.nome}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {grupo.opcoes?.length || 0} opção(ões)
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Editar grupo">
                          <IconButton size="small" onClick={() => handleOpenGrupoDialog(grupo)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nova opção">
                          <IconButton size="small" onClick={() => handleOpenOpcaoDialog(grupo)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir grupo">
                          <IconButton size="small" onClick={() => handleDeleteGrupo(grupo)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider style={{ margin: "8px 0" }} />
                    <Box className={classes.chipsContainer}>
                      {grupo.opcoes && grupo.opcoes.length > 0 ? (
                        grupo.opcoes.map((opcao) => (
                          <Chip
                            key={opcao.id}
                            label={`${opcao.nome}${opcao.ordem != null ? ` • ${opcao.ordem}` : ""}`}
                            onDelete={() => handleDeleteOpcao(opcao)}
                            deleteIcon={<DeleteIcon style={{ fontSize: 16 }} />}
                            onClick={() => handleOpenOpcaoDialog(grupo, opcao)}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma opção cadastrada.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Box>

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
            <TextField
              label="Slug (opcional)"
              variant="outlined"
              fullWidth
              className={classes.dialogField}
              value={categoriaForm.slug}
              onChange={(e) => setCategoriaForm({ ...categoriaForm, slug: e.target.value })}
            />
            <TextField
              label="Descrição"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              className={classes.dialogField}
              value={categoriaForm.descricao}
              onChange={(e) => setCategoriaForm({ ...categoriaForm, descricao: e.target.value })}
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

      <Dialog open={grupoDialogOpen} onClose={() => setGrupoDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{grupoForm.id ? "Editar grupo" : "Novo grupo"}</DialogTitle>
        <form onSubmit={handleSubmitGrupo}>
          <DialogContent>
            <TextField
              label="Nome do grupo"
              variant="outlined"
              fullWidth
              required
              value={grupoForm.nome}
              onChange={(e) => setGrupoForm({ ...grupoForm, nome: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGrupoDialogOpen(false)}>Cancelar</Button>
            <Button color="primary" variant="contained" type="submit" disabled={grupoSaving}>
              {grupoSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={opcaoDialogOpen} onClose={() => setOpcaoDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{opcaoForm.id ? "Editar opção" : "Nova opção"}</DialogTitle>
        <form onSubmit={handleSubmitOpcao}>
          <DialogContent>
            <TextField
              label="Nome da opção"
              variant="outlined"
              fullWidth
              required
              className={classes.dialogField}
              value={opcaoForm.nome}
              onChange={(e) => setOpcaoForm({ ...opcaoForm, nome: e.target.value })}
            />
            <TextField
              label="Ordem (opcional)"
              variant="outlined"
              fullWidth
              type="number"
              className={classes.dialogField}
              value={opcaoForm.ordem}
              onChange={(e) => setOpcaoForm({ ...opcaoForm, ordem: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpcaoDialogOpen(false)}>Cancelar</Button>
            <Button color="primary" variant="contained" type="submit" disabled={opcaoSaving}>
              {opcaoSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CatalogoProdutos;
