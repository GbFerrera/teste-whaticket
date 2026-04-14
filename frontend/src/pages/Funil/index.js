import React, { useEffect, useState, useMemo } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import api from "../../services/api";
import useUsers from "../../hooks/useUsers";
import TagModal from "../../components/TagModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import { useSystemAlert } from "../../components/SystemAlert";
import TabPanel from "../../components/TabPanel";

const useStyles = makeStyles(theme => ({
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
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  tabsBar: {
    padding: "0 24px",
    borderBottom: "1px solid #e0e0e0",
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
  form: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  field: {
    marginBottom: theme.spacing(2),
  },
}));

const NegociosPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { showConfirm } = useSystemAlert();

  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kanbanBoards, setKanbanBoards] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [kanbanTags, setKanbanTags] = useState([]);
  const [kanbanTagToAdd, setKanbanTagToAdd] = useState("");
  const [tagsLoading, setTagsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("negocios");
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  const { users, loading: loadingUsers } = useUsers();

  const [viewOpen, setViewOpen] = useState(false);
  const [viewNegocio, setViewNegocio] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const [tablePage, setTablePage] = useState(0);
  const [tagTablePage, setTagTablePage] = useState(0);
  const rowsPerPage = 10;

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setKanbanBoards([]);
    setSelectedUsers([]);
    setFormOpen(false);
  };

  const loadNegocios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/negocios");
      setNegocios(data || []);
    } catch (err) {
      console.error("Erro ao carregar negócios", err);
    } finally {
      setLoading(false);
    }
  };

  const truncate = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const getKanbanCount = negocio => {
    return Array.isArray(negocio.kanbanBoards) ? negocio.kanbanBoards.length : 0;
  };

  const getKanbanDetails = negocio => {
    if (!negocio || !Array.isArray(negocio.kanbanBoards)) return [];
    return negocio.kanbanBoards.map(id => {
      const tag = kanbanTags.find(t => t.id === id);
      return {
        id,
        name: tag ? tag.name : String(id)
      };
    });
  };

  const loadKanbanTags = async () => {
    setTagsLoading(true);
    try {
      const { data } = await api.get("/tags", {
        params: { kanban: 1 }
      });
      setKanbanTags(data.tags || []);
    } catch (err) {
      console.error("Erro ao carregar tags do Kanban", err);
      toastError(err);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    loadNegocios();
    loadKanbanTags();
  }, []);

  const usedKanbanTags = useMemo(() => {
    const used = new Set();
    negocios.forEach(negocio => {
      if (editingId && negocio.id === editingId) {
        return;
      }
      if (Array.isArray(negocio.kanbanBoards)) {
        negocio.kanbanBoards.forEach(tagId => used.add(tagId));
      }
    });
    return used;
  }, [negocios, editingId]);

  const availableKanbanTags = useMemo(() => {
    return kanbanTags.filter(tag => !usedKanbanTags.has(tag.id) || kanbanBoards.includes(tag.id));
  }, [kanbanTags, usedKanbanTags, kanbanBoards]);

  const filteredKanbanTags = useMemo(() => {
    if (!tagSearchTerm.trim()) {
      return kanbanTags;
    }
    const term = tagSearchTerm.trim().toLowerCase();
    return kanbanTags.filter(tag => (tag.name || "").toLowerCase().includes(term));
  }, [kanbanTags, tagSearchTerm]);

  const handleAddKanbanBoard = tagId => {
    if (!tagId) return;
    setKanbanBoards(prev => {
      if (prev.includes(tagId)) {
        return prev;
      }
      return [...prev, tagId];
    });
    setKanbanTagToAdd("");
  };

  const handleMoveKanbanBoard = (index, direction) => {
    setKanbanBoards(prev => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleRemoveKanbanBoard = tagId => {
    setKanbanBoards(prev => prev.filter(id => id !== tagId));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name,
      description,
      kanbanBoards,
      users: selectedUsers
    };

    try {
      if (editingId) {
        await api.put(`/negocios/${editingId}`, payload);
      } else {
        await api.post("/negocios", payload);
      }

      await loadNegocios();
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar negócio", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = negocio => {
    setEditingId(negocio.id);
    setName(negocio.name || "");
    setDescription(negocio.description || "");
    setKanbanBoards(Array.isArray(negocio.kanbanBoards) ? negocio.kanbanBoards : []);
    setSelectedUsers(Array.isArray(negocio.users) ? negocio.users : []);
    setFormOpen(true);
  };

  const handleDelete = async id => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Excluir Negócio",
      message: "Deseja realmente excluir este negócio?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/negocios/${id}`);
      await loadNegocios();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Erro ao excluir negócio", err);
    }
  };

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
    loadKanbanTags();
  };

  const handleEditTag = tag => {
    setSelectedTag(tag);
    setActiveTab("tags");
    setTagModalOpen(true);
  };

  const handleDeleteTag = async tagId => {
    const confirmedTag = await showConfirm({
      type: "error",
      title: "Excluir Tag Kanban",
      message: "Deseja realmente excluir esta Tag Kanban?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!confirmedTag) return;
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success("Tag Kanban excluída com sucesso.");
      loadKanbanTags();
    } catch (err) {
      toastError(err);
    }
  };

  const filteredNegocios = negocios.filter(negocio => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (negocio.name || "").toLowerCase().includes(term) ||
      (negocio.description || "").toLowerCase().includes(term)
    );
  });

  const paginatedNegocios = filteredNegocios.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalNegociosPages = Math.ceil(filteredNegocios.length / rowsPerPage);

  const paginatedTags = filteredKanbanTags.slice(
    tagTablePage * rowsPerPage,
    tagTablePage * rowsPerPage + rowsPerPage
  );
  const totalTagPages = Math.ceil(filteredKanbanTags.length / rowsPerPage);

  const renderPagination = (items, page, setPage, total, totalPgs) => {
    if (items.length === 0) return null;
    return (
      <Box className={classes.paginationBar}>
        <Typography variant="body2" style={{ color: "#666" }}>
          Exibindo {page * rowsPerPage + 1} a{" "}
          {Math.min((page + 1) * rowsPerPage, total)} de {total} resultado(s)
        </Typography>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage(page - 1)} className={classes.actionBtn}>
            Anterior
          </Button>
          {Array.from({ length: Math.min(totalPgs, 5) }, (_, i) => {
            let pageIdx = i;
            if (totalPgs > 5) {
              const start = Math.max(0, Math.min(page - 2, totalPgs - 5));
              pageIdx = start + i;
            }
            return (
              <Button
                key={pageIdx}
                size="small"
                variant={pageIdx === page ? "contained" : "text"}
                color={pageIdx === page ? "primary" : "default"}
                onClick={() => setPage(pageIdx)}
                style={{ minWidth: 32, borderRadius: 6, fontWeight: pageIdx === page ? 700 : 400 }}
              >
                {pageIdx + 1}
              </Button>
            );
          })}
          <Button size="small" disabled={page >= totalPgs - 1} onClick={() => setPage(page + 1)} className={classes.actionBtn}>
            Próximo
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagId={selectedTag ? selectedTag.id : null}
        kanban={1}
      />

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Funil</Typography>
            <Typography className={classes.headerSubtitle}>
              {negocios.length} negócio(s) • {kanbanTags.length} tag(s) kanban
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          {activeTab === "negocios" ? (
            <>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Pesquisar negócios..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                onClick={() => { resetForm(); setFormOpen(true); }}
              >
                Novo Negócio
              </Button>
            </>
          ) : (
            <>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Buscar tags..."
                value={tagSearchTerm}
                onChange={e => setTagSearchTerm(e.target.value)}
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
                onClick={handleOpenTagModal}
              >
                Nova Tag Kanban
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box className={classes.tabsBar}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Negócios" value="negocios" />
          <Tab label="Tags Kanban" value="tags" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box className={classes.content} style={{ marginTop: 16 }}>
        <TabPanel value={activeTab} name="negocios">
          <Box className={classes.tableWrapper}>
            <Table size="small">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">Descrição</TableCell>
                  <TableCell align="center">Kanbans</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {loading ? (
                  <TableRowSkeleton columns={4} />
                ) : paginatedNegocios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box className={classes.emptyState}>
                        <Typography>Nenhum negócio encontrado</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedNegocios.map(negocio => (
                    <TableRow
                      key={negocio.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(negocio)}
                    >
                      <TableCell>
                        <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                          {negocio.name}
                        </Typography>
                        <Typography variant="caption" style={{ color: "#999" }}>
                          ID: {negocio.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {truncate(negocio.description, 40) || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${getKanbanCount(negocio)} kanban(s)`}
                          style={{ backgroundColor: "#e3f2fd", color: "#1976d2", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewNegocio(negocio);
                                setViewOpen(true);
                              }}
                              style={{ color: "#059669" }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(negocio);
                              }}
                              style={{ color: "#1976d2" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(negocio.id);
                              }}
                              style={{ color: "#ef4444" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {renderPagination(filteredNegocios, tablePage, setTablePage, filteredNegocios.length, totalNegociosPages)}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} name="tags">
          <Box className={classes.tableWrapper}>
            <Table size="small">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell>Tag</TableCell>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Cor</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {tagsLoading ? (
                  <TableRowSkeleton columns={4} />
                ) : paginatedTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box className={classes.emptyState}>
                        <Typography>Nenhuma tag encontrada</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTags.map(tag => (
                    <TableRow
                      key={tag.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditTag(tag)}
                    >
                      <TableCell>
                        <Chip
                          label={tag.name}
                          style={{
                            backgroundColor: tag.color || "#4B5563",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{tag.id}</TableCell>
                      <TableCell align="center">
                        <Box
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            backgroundColor: tag.color || "#4B5563",
                            margin: "0 auto",
                            border: "1px solid #e0e0e0",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTag(tag);
                              }}
                              style={{ color: "#1976d2" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTag(tag.id);
                              }}
                              style={{ color: "#ef4444" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {renderPagination(filteredKanbanTags, tagTablePage, setTagTablePage, filteredKanbanTags.length, totalTagPages)}
          </Box>
        </TabPanel>
      </Box>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Editar negócio" : "Adicionar negócio"}
        </DialogTitle>
        <DialogContent>
          <form className={classes.form} id="negocio-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome do negócio"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  className={classes.field}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Descrição"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  variant="outlined"
                  fullWidth
                  className={classes.field}
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" fullWidth className={classes.field}>
                      <InputLabel id="kanbanBoards-label">Adicionar Tag Kanban</InputLabel>
                      <Select
                        labelId="kanbanBoards-label"
                        value={kanbanTagToAdd}
                        onChange={e => {
                          const value = e.target.value;
                          setKanbanTagToAdd(value);
                          handleAddKanbanBoard(value);
                        }}
                        label="Adicionar Tag Kanban"
                      >
                        {availableKanbanTags.length === 0 && (
                          <MenuItem value="" disabled>
                            Nenhuma tag disponível
                          </MenuItem>
                        )}
                        {availableKanbanTags.map(tag => (
                          <MenuItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Ordem das Tags Kanban (arraste com os botões para reordenar)
                    </Typography>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {kanbanBoards.length === 0 && (
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma tag selecionada.
                        </Typography>
                      )}
                      {kanbanBoards.map((id, index) => {
                        const tagInfo = kanbanTags.find(tag => tag.id === id);
                        return (
                          <Chip
                            key={id}
                            label={
                              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <strong>{index + 1}.</strong> {tagInfo?.name || id}
                              </span>
                            }
                            onDelete={() => handleRemoveKanbanBoard(id)}
                            deleteIcon={<CloseIcon />}
                            style={{ backgroundColor: "#f0f4ff" }}
                            icon={
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <IconButton
                                  size="small"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleMoveKanbanBoard(index, -1);
                                  }}
                                  disabled={index === 0}
                                >
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleMoveKanbanBoard(index, 1);
                                  }}
                                  disabled={index === kanbanBoards.length - 1}
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </div>
                            }
                          />
                        );
                      })}
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth className={classes.field}>
                  <InputLabel id="users-label">Usuários</InputLabel>
                  <Select
                    labelId="users-label"
                    multiple
                    value={selectedUsers}
                    onChange={e => setSelectedUsers(e.target.value)}
                    label="Usuários"
                    renderValue={selected => {
                      const selectedIds = selected || [];
                      const names = (users || [])
                        .filter(u => selectedIds.includes(u.id))
                        .map(u => u.name);
                      return names.join(", ");
                    }}
                  >
                    {(users || []).map(u => (
                      <MenuItem key={u.id} value={u.id}>
                        <Checkbox checked={selectedUsers.includes(u.id)} />
                        <ListItemText primary={u.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancelar</Button>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            form="negocio-form"
            disabled={saving}
          >
            {editingId ? "Salvar alterações" : "Criar negócio"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewNegocio(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do negócio</DialogTitle>
        <DialogContent>
          {viewNegocio && (
            <>
              <Typography variant="h6" gutterBottom>
                {viewNegocio.name}
              </Typography>
              {viewNegocio.description && (
                <Typography variant="body2" paragraph>
                  <strong>Descrição completa:</strong> {viewNegocio.description}
                </Typography>
              )}
              <Typography variant="subtitle1" gutterBottom>
                Kanbans
              </Typography>
              {getKanbanDetails(viewNegocio).length > 0 ? (
                getKanbanDetails(viewNegocio).map(k => (
                  <Typography key={k.id} variant="body2">
                    ID: {k.id} - {k.name}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">Nenhum kanban vinculado.</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewOpen(false);
              setViewNegocio(null);
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NegociosPage;