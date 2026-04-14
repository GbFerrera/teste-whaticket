import React, { useReducer, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  LinearProgress
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import FolderSpecialIcon from "@material-ui/icons/FolderSpecial";
import LaunchIcon from "@material-ui/icons/Launch";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PeopleIcon from "@material-ui/icons/People";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import ScheduleIcon from "@material-ui/icons/Schedule";
import ReceiptIcon from "@material-ui/icons/Receipt";
import VisibilityIcon from "@material-ui/icons/Visibility";

import { listProjects, deleteProject } from "../../services/projectService";
import ProjectModal from "../../components/ProjectModal";
import ProjectTasksModal from "../../components/ProjectTasksModal";
import FaturaModal from "../../components/FaturaModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const STATUS_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Rascunho", value: "draft" },
  { label: "Ativo", value: "active" },
  { label: "Pausado", value: "paused" },
  { label: "Concluído", value: "completed" },
  { label: "Cancelado", value: "cancelled" }
];

const STATUS_LABEL = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  cancelled: "Cancelado"
};

const STATUS_COLORS = {
  draft: "#6b7280",
  active: "#059669",
  paused: "#f59e0b",
  completed: "#3b82f6",
  cancelled: "#dc2626"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return [];
    case "LOAD_PROJECTS": {
      const incoming = action.payload || [];
      const clone = [...state];
      incoming.forEach((project) => {
        const index = clone.findIndex((item) => item.id === project.id);
        if (index > -1) {
          clone[index] = project;
        } else {
          clone.push(project);
        }
      });
      return clone;
    }
    case "DELETE_PROJECT":
      return state.filter((project) => project.id !== action.payload);
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      gap: theme.spacing(1)
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch"
    }
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },
  titleIcon: {
    fontSize: 36,
    color: theme.palette.primary.main
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },
  searchField: {
    minWidth: 220,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8
    },
    [theme.breakpoints.down("sm")]: {
      flex: 1,
      minWidth: "unset"
    }
  },
  selectField: {
    minWidth: 160,
    [theme.breakpoints.down("sm")]: {
      flex: 1,
      minWidth: "unset"
    }
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  },
  content: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    overflow: "hidden"
  },
  list: {
    display: "flex",
    flexDirection: "column"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none"
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start"
    }
  },
  itemAvatar: {
    width: 56,
    height: 56,
    fontSize: 20,
    fontWeight: 600,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText
  },
  itemInfo: {
    flex: 1,
    minWidth: 0
  },
  itemNameRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap"
  },
  itemName: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  itemDetails: {
    fontSize: 13,
    color: theme.palette.text.secondary,
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5)
  },
  itemMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: 13
  },
  statusChip: {
    textTransform: "capitalize",
    fontWeight: 600,
    color: "#fff"
  },
  actionsColumn: {
    display: "flex",
    gap: theme.spacing(1)
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: 120
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3
  },
  statsRow: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: 12,
    color: theme.palette.text.secondary
  }
}));

const Projects = () => {
  const classes = useStyles();
  const history = useHistory();

  const [projects, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [tasksProjectId, setTasksProjectId] = useState(null);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [faturaInitialData, setFaturaInitialData] = useState(null);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParam, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const controller = new AbortController();

    const fetchProjects = async () => {
      try {
        const data = await listProjects({
          searchParam,
          status: statusFilter,
          pageNumber
        });

        if (isMounted) {
          dispatch({ type: "LOAD_PROJECTS", payload: data.projects });
          setHasMore(data.hasMore);
        }
      } catch (err) {
        if (isMounted && err.name !== "CanceledError") {
          toastError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchParam, statusFilter, pageNumber, refreshToken]);

  const handleScroll = (event) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleOpenModal = (projectId = null) => {
    setSelectedProjectId(projectId);
    setProjectModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProjectId(null);
    setProjectModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id);
      dispatch({ type: "DELETE_PROJECT", payload: deletingProject.id });
    } catch (err) {
      toastError(err);
    } finally {
      setConfirmModalOpen(false);
      setDeletingProject(null);
      setRefreshToken((prev) => prev + 1);
    }
  };

  const getInitials = (name = "") => {
    if (!name.trim()) return "P";
    const pieces = name.trim().split(" ");
    return pieces
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const formatStatus = (status) => STATUS_LABEL[status] || "Rascunho";
  const statusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.draft;

  const getTaskProgress = (project) => {
    const tasks = project.tasks || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getProjectDays = (project) => {
    if (!project.startDate) return null;
    const start = new Date(project.startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const handleOpenTasksModal = (projectId) => {
    setTasksProjectId(projectId);
    setTasksModalOpen(true);
  };

  const handleCloseTasksModal = () => {
    setTasksProjectId(null);
    setTasksModalOpen(false);
  };

  const handleTasksSuccess = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const handleOpenFaturaModal = (project) => {
    // Pegar o primeiro serviço do projeto se existir
    const firstService = project.services?.[0];
    const serviceId = firstService?.service?.id || firstService?.serviceId;
    
    setFaturaInitialData({
      projectId: project.id,
      clientId: project.clientId,
      client: project.client,
      descricao: `Projeto: ${project.name}${project.description ? ` - ${project.description}` : ""}`,
      tipoReferencia: serviceId ? "servico" : "",
      referenciaId: serviceId || ""
    });
    setFaturaModalOpen(true);
  };

  const handleCloseFaturaModal = () => {
    setFaturaInitialData(null);
    setFaturaModalOpen(false);
  };

  return (
    <Box className={classes.root} onScroll={handleScroll}>
      <ProjectModal
        open={projectModalOpen}
        onClose={handleCloseModal}
        projectId={selectedProjectId}
        onSuccess={handleModalSuccess}
      />

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Excluir projeto"
        onConfirm={handleDeleteProject}
      >
        Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <ProjectTasksModal
        open={tasksModalOpen}
        onClose={handleCloseTasksModal}
        projectId={tasksProjectId}
        onSuccess={handleTasksSuccess}
      />

      <FaturaModal
        open={faturaModalOpen}
        onClose={handleCloseFaturaModal}
        initialData={faturaInitialData}
        onSaved={handleCloseFaturaModal}
      />

      <Box className={classes.header}>
        <Box className={classes.titleContainer}>
          <FolderSpecialIcon className={classes.titleIcon} />
          <Box>
            <Typography className={classes.title}>Projetos</Typography>
            <Typography className={classes.subtitle}>
              Gerencie seus projetos e tarefas • {projects.length} projeto(s)
            </Typography>
          </Box>
        </Box>

        <Box className={classes.actions}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Pesquisar por nome"
            value={searchParam}
            onChange={(event) => setSearchParam(event.target.value)}
            className={classes.searchField}
            autoComplete="off"
            inputProps={{ autoComplete: "off" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            size="small"
            label="Status"
            variant="outlined"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={classes.selectField}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => handleOpenModal()}
          >
            Novo Projeto
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        {projects.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <FolderSpecialIcon style={{ fontSize: 48, marginBottom: 12 }} color="disabled" />
            <Typography variant="h6">Nenhum projeto encontrado</Typography>
            <Typography variant="body2">
              Ajuste os filtros ou crie um novo projeto para começar.
            </Typography>
          </Box>
        ) : (
          <Box className={classes.list}>
            {projects.map((project) => (
              <Box key={project.id} className={classes.listItem}>
                <Avatar className={classes.itemAvatar}>{getInitials(project.name)}</Avatar>

                <Box className={classes.itemInfo}>
                  <Box className={classes.itemNameRow}>
                    <Typography className={classes.itemName}>
                      {project.name || "Projeto sem nome"}
                    </Typography>
                    <Chip
                      size="small"
                      label={formatStatus(project.status)}
                      className={classes.statusChip}
                      style={{ backgroundColor: statusColor(project.status) }}
                    />
                  </Box>
                  <Box className={classes.itemDetails}>
                    <span>ID: {project.id}</span>
                    <span>•</span>
                    <span>Cliente: {project.client?.name || "N/A"}</span>
                  </Box>
                  <Box className={classes.statsRow}>
                    <Box className={classes.statItem}>
                      <AssignmentIcon fontSize="small" />
                      {project.tasks?.length || 0} tarefas
                    </Box>
                    <Box className={classes.statItem}>
                      <PeopleIcon fontSize="small" />
                      {project.users?.length || 0} membros
                    </Box>
                    <Box className={classes.progressContainer}>
                      <LinearProgress
                        variant="determinate"
                        value={getTaskProgress(project)}
                        className={classes.progressBar}
                      />
                      <span>{getTaskProgress(project)}%</span>
                    </Box>
                  </Box>
                  <Box className={classes.itemMeta}>
                    <span>Início: {formatDate(project.startDate)}</span>
                    <span>•</span>
                    <span>Término: {formatDate(project.endDate)}</span>
                    {getProjectDays(project) !== null && (
                      <>
                        <span>•</span>
                        <Box component="span" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <ScheduleIcon style={{ fontSize: 14 }} />
                          {getProjectDays(project)} dias
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>

                <Box className={classes.actionsColumn}>
                  <Tooltip title="Tarefas">
                    <IconButton size="small" onClick={() => handleOpenTasksModal(project.id)}>
                      <PlaylistAddCheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Gerar Fatura">
                    <IconButton size="small" onClick={() => handleOpenFaturaModal(project)}>
                      <ReceiptIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Detalhes">
                    <IconButton size="small" onClick={() => history.push(`/projects/${project.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpenModal(project.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingProject(project);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {loading && (
          <Box className={classes.loadingBox}>
            <CircularProgress size={20} />
            <Typography variant="body2">Carregando projetos...</Typography>
          </Box>
        )}
        {!loading && hasMore && (
          <Box className={classes.loadingBox}>
            <Button size="small" onClick={() => setPageNumber((prev) => prev + 1)}>
              Carregar mais
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Projects;
