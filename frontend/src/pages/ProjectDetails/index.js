import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import EditIcon from "@material-ui/icons/Edit";
import PersonIcon from "@material-ui/icons/Person";
import BusinessIcon from "@material-ui/icons/Business";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ScheduleIcon from "@material-ui/icons/Schedule";
import AssignmentIcon from "@material-ui/icons/Assignment";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import PeopleIcon from "@material-ui/icons/People";
import BuildIcon from "@material-ui/icons/Build";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import DescriptionIcon from "@material-ui/icons/Description";
import ReceiptIcon from "@material-ui/icons/Receipt";

import api from "../../services/api";
import { getProject } from "../../services/projectService";
import ProjectModal from "../../components/ProjectModal";
import ProjectTasksModal from "../../components/ProjectTasksModal";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  titleContainer: {
    flex: 1
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
  statusChip: {
    fontWeight: 600,
    color: "#fff"
  },
  card: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 600,
    marginBottom: theme.spacing(2)
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.secondary
  },
  infoLabel: {
    fontWeight: 500,
    minWidth: 120
  },
  infoValue: {
    color: theme.palette.text.primary
  },
  progressContainer: {
    marginTop: theme.spacing(2)
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: theme.spacing(1)
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none"
    }
  },
  taskCompleted: {
    textDecoration: "line-through",
    color: theme.palette.text.secondary
  },
  userChip: {
    margin: theme.spacing(0.5)
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(3),
    color: theme.palette.text.secondary
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400
  },
  section: {
    marginTop: theme.spacing(3)
  }
}));

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

const ProjectDetails = () => {
  const classes = useStyles();
  const history = useHistory();
  const { projectId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [faturas, setFaturas] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      toastError(err);
      history.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaturas = async () => {
    try {
      const { data } = await api.get("/financeiro/faturas", {
        params: { projectId }
      });
      setFaturas(data.faturamentos || data.records || data.faturas || []);
    } catch (err) {
      console.error("Erro ao buscar faturas:", err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchFaturas();
    }
  }, [projectId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Não definido";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getProjectDays = () => {
    if (!project?.startDate) return null;
    const start = new Date(project.startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const getTaskProgress = () => {
    const tasks = project?.tasks || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getUsers = () => {
    return (project?.users || []).map(pu => pu.user).filter(u => u && u.id);
  };

  const getServices = () => {
    return (project?.services || []).map(ps => ({
      ...ps.service,
      quantity: ps.quantity
    })).filter(s => s && s.id);
  };

  const getProducts = () => {
    return (project?.products || []).map(pp => ({
      ...pp.product,
      quantity: pp.quantity
    })).filter(p => p && p.id);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchProject();
  };

  const handleTasksSuccess = () => {
    fetchProject();
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const getFaturaStatusColor = (status) => {
    const colors = {
      aberta: "#f59e0b",
      paga: "#059669",
      vencida: "#dc2626",
      cancelada: "#6b7280"
    };
    return colors[status] || "#6b7280";
  };

  const getFaturaStatusLabel = (status) => {
    const labels = {
      aberta: "Aberta",
      paga: "Paga",
      vencida: "Vencida",
      cancelada: "Cancelada"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box className={classes.root}>
        <Typography>Projeto não encontrado</Typography>
        <Button onClick={() => history.push("/projects")}>Voltar</Button>
      </Box>
    );
  }

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const users = getUsers();
  const services = getServices();
  const products = getProducts();
  const projectDays = getProjectDays();

  return (
    <Box className={classes.root}>
      <ProjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        projectId={project.id}
        onSuccess={handleEditSuccess}
      />

      <ProjectTasksModal
        open={tasksModalOpen}
        onClose={() => setTasksModalOpen(false)}
        projectId={project.id}
        onSuccess={handleTasksSuccess}
      />

      <Box className={classes.header}>
        <IconButton className={classes.backButton} onClick={() => history.push("/projects")}>
          <ArrowBackIcon />
        </IconButton>
        <Box className={classes.titleContainer}>
          <Typography className={classes.title}>{project.name}</Typography>
          <Typography className={classes.subtitle}>
            ID: {project.id} • Criado em {formatDate(project.createdAt)}
          </Typography>
        </Box>
        <Chip
          label={STATUS_LABEL[project.status] || "Rascunho"}
          className={classes.statusChip}
          style={{ backgroundColor: STATUS_COLORS[project.status] || STATUS_COLORS.draft }}
        />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditModalOpen(true)}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <DescriptionIcon color="primary" />
                Informações do Projeto
              </Typography>
              
              <Box className={classes.infoRow}>
                <BusinessIcon fontSize="small" />
                <span className={classes.infoLabel}>Cliente:</span>
                <span className={classes.infoValue}>
                  {project.client?.name || "Não definido"}
                  {project.client?.companyName && ` (${project.client.companyName})`}
                </span>
              </Box>

              <Box className={classes.infoRow}>
                <CalendarTodayIcon fontSize="small" />
                <span className={classes.infoLabel}>Data de Início:</span>
                <span className={classes.infoValue}>{formatDate(project.startDate)}</span>
              </Box>

              <Box className={classes.infoRow}>
                <CalendarTodayIcon fontSize="small" />
                <span className={classes.infoLabel}>Data de Término:</span>
                <span className={classes.infoValue}>{formatDate(project.endDate)}</span>
              </Box>

              {projectDays !== null && (
                <Box className={classes.infoRow}>
                  <ScheduleIcon fontSize="small" />
                  <span className={classes.infoLabel}>Duração:</span>
                  <span className={classes.infoValue}>{projectDays} dias</span>
                </Box>
              )}

              {project.warranty && (
                <Box className={classes.infoRow}>
                  <CheckCircleIcon fontSize="small" />
                  <span className={classes.infoLabel}>Garantia:</span>
                  <span className={classes.infoValue}>{project.warranty}</span>
                </Box>
              )}

              {project.description && (
                <>
                  <Divider style={{ margin: "16px 0" }} />
                  <Typography variant="subtitle2" gutterBottom>Descrição</Typography>
                  <Typography variant="body2" color="textSecondary" component="span">
                    {showFullDescription ? project.description : truncateText(project.description, 30)}
                    {project.description.length > 30 && (
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        style={{ marginLeft: 4 }}
                      >
                        {showFullDescription ? "Ler menos" : "Ler mais"}
                      </Link>
                    )}
                  </Typography>
                </>
              )}

              {project.terms && (
                <>
                  <Divider style={{ margin: "16px 0" }} />
                  <Typography variant="subtitle2" gutterBottom>Termos e Condições</Typography>
                  <Typography variant="body2" color="textSecondary" component="span">
                    {showFullTerms ? project.terms : truncateText(project.terms, 30)}
                    {project.terms.length > 30 && (
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => setShowFullTerms(!showFullTerms)}
                        style={{ marginLeft: 4 }}
                      >
                        {showFullTerms ? "Ler menos" : "Ler mais"}
                      </Link>
                    )}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={`${classes.card} ${classes.section}`}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography className={classes.cardTitle}>
                  <AssignmentIcon color="primary" />
                  Tarefas ({completedTasks}/{tasks.length})
                </Typography>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => setTasksModalOpen(true)}
                >
                  Gerenciar
                </Button>
              </Box>

              <Box className={classes.progressContainer}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Progresso</Typography>
                  <Typography variant="body2">{getTaskProgress()}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getTaskProgress()}
                  className={classes.progressBar}
                />
              </Box>

              {tasks.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography>Nenhuma tarefa cadastrada</Typography>
                </Box>
              ) : (
                <Box mt={2}>
                  {tasks.slice(0, 5).map((task) => (
                    <Box key={task.id} className={classes.taskItem}>
                      <CheckCircleIcon
                        fontSize="small"
                        color={task.status === "completed" ? "primary" : "disabled"}
                      />
                      <Typography
                        variant="body2"
                        className={task.status === "completed" ? classes.taskCompleted : ""}
                      >
                        {task.title}
                      </Typography>
                    </Box>
                  ))}
                  {tasks.length > 5 && (
                    <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 8 }}>
                      +{tasks.length - 5} tarefas
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <PeopleIcon color="primary" />
                Equipe ({users.length})
              </Typography>
              
              {users.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography variant="body2">Nenhum membro na equipe</Typography>
                </Box>
              ) : (
                <Box>
                  {users.map((user) => (
                    <Chip
                      key={user.id}
                      icon={<PersonIcon />}
                      label={user.name}
                      className={classes.userChip}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className={`${classes.card} ${classes.section}`}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <BuildIcon color="primary" />
                Serviços ({services.length})
              </Typography>
              
              {services.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography variant="body2">Nenhum serviço vinculado</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Serviço</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>{service.name || service.nome}</TableCell>
                          <TableCell align="right">{service.quantity || 1}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Card className={`${classes.card} ${classes.section}`}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <ShoppingCartIcon color="primary" />
                Produtos ({products.length})
              </Typography>
              
              {products.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography variant="body2">Nenhum produto vinculado</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name || product.nome}</TableCell>
                          <TableCell align="right">{product.quantity || 1}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Card className={`${classes.card} ${classes.section}`}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <ReceiptIcon color="primary" />
                Faturas ({faturas.length})
              </Typography>
              
              {faturas.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography variant="body2">Nenhuma fatura vinculada</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faturas.map((fatura) => (
                        <TableRow key={fatura.id}>
                          <TableCell>{truncateText(fatura.descricao, 25)}</TableCell>
                          <TableCell align="right">{formatCurrency(fatura.valor)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getFaturaStatusLabel(fatura.status)}
                              size="small"
                              style={{
                                backgroundColor: getFaturaStatusColor(fatura.status),
                                color: "#fff",
                                fontSize: 11
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetails;
