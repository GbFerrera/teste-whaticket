import React, { useState, useEffect, useCallback, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import EventIcon from "@material-ui/icons/Event";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import PersonIcon from "@material-ui/icons/Person";
import ScheduleIcon from "@material-ui/icons/Schedule";
import SyncIcon from "@material-ui/icons/Sync";
import SyncDisabledIcon from "@material-ui/icons/SyncDisabled";
import LanguageIcon from "@material-ui/icons/Language";
import { toast } from "react-toastify";

import api from "../../services/api";
import {
  listUserSchedules,
  createUserSchedule,
  updateUserSchedule,
  deleteUserSchedule
} from "../../services/userScheduleService";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";

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
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5)
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
  card: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
    }
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2)
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 18
  },
  cardInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary
  },
  statusChip: {
    fontWeight: 600
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1)
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  workHours: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: 13,
    color: theme.palette.text.secondary
  }
}));

const UserSchedules = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user: loggedUser } = useContext(AuthContext);

  const isAdmin = loggedUser?.profile === "admin" || loggedUser?.userType === "admin";

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [googleIntegration, setGoogleIntegration] = useState(null);
  const [loadingGoogleIntegration, setLoadingGoogleIntegration] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    userId: ""
  });

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listUserSchedules({
        userType: loggedUser?.userType
      });
      setSchedules(data.schedules || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [loggedUser?.userType]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  }, []);

  const fetchGoogleIntegration = useCallback(async () => {
    try {
      setLoadingGoogleIntegration(true);
      const { data } = await api.get("/user-google-calendar/integration");
      setGoogleIntegration(data);
    } catch (err) {
      console.error("Erro ao buscar integração Google:", err);
      setGoogleIntegration(null);
    } finally {
      setLoadingGoogleIntegration(false);
    }
  }, []);

  // Removido - não precisamos mais de integrações empresariais
  // Cada usuário terá sua própria integração
  
  // Removendo funções desnecessárias
  const handleCloseIntegrationModal = () => {
    setIntegrationModalOpen(false);
  };

  useEffect(() => {
    fetchSchedules();
    fetchUsers();
    fetchGoogleIntegration();
  }, [fetchSchedules, fetchUsers, fetchGoogleIntegration]);

  // Verificar se veio do redirect de sucesso do Google Calendar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleCalendarSuccess = urlParams.get('google-calendar-success');
    
    if (googleCalendarSuccess === 'true') {
      toast.success('Google Calendar conectado com sucesso!');
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verificar se tinha uma integração de agenda pendente
      const pendingScheduleId = sessionStorage.getItem('pendingScheduleIntegration');
      console.log("DEBUG - pendingScheduleId:", pendingScheduleId);
      
      if (pendingScheduleId) {
        // Vincular agenda diretamente com a integração do usuário
        console.log("DEBUG - Vinculando agenda diretamente...");
        api.get("/user-google-calendar/integration")
          .then((response) => {
            console.log("DEBUG - Integração do usuário:", response.data);
            if (response.data) {
              // Vincular agenda com a integração do usuário
              return api.post(`/user-schedules/${pendingScheduleId}/google-integration`, {
                userGoogleCalendarIntegrationId: response.data.id
              });
            } else {
              throw new Error("Integração do usuário não encontrada");
            }
          })
          .then((response) => {
            console.log("DEBUG - Agenda vinculada:", response.data);
            toast.success('Agenda integrada com seu Google Calendar!');
            sessionStorage.removeItem('pendingScheduleIntegration');
            fetchSchedules(); // Atualizar lista de agendas
          })
          .catch((error) => {
            console.error("DEBUG - Erro na integração:", error);
            console.error("DEBUG - Response:", error.response?.data);
            toast.error('Erro ao integrar agenda automaticamente');
          });
      }
      
      // Atualizar integração e agendas
      fetchGoogleIntegration();
      fetchSchedules();
    }
  }, [fetchGoogleIntegration]);

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData({
        name: schedule.name || "",
        description: schedule.description || "",
        active: schedule.active ?? true,
        userId: schedule.userId || ""
      });
    } else {
      setSelectedSchedule(null);
      // Se não for admin, já define o userId como o próprio usuário
      setFormData({
        name: "",
        description: "",
        active: true,
        userId: isAdmin ? "" : loggedUser?.id
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleChange = (field) => (event) => {
    const value = field === "active" ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!selectedSchedule && !formData.userId) {
      toast.error("Selecione um usuário");
      return;
    }

    try {
      if (selectedSchedule) {
        await updateUserSchedule(selectedSchedule.id, {
          name: formData.name,
          description: formData.description,
          active: formData.active
        });
        toast.success("Agenda atualizada com sucesso");
      } else {
        await createUserSchedule(formData);
        toast.success("Agenda criada com sucesso");
      }
      handleCloseModal();
      fetchSchedules();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserSchedule(selectedSchedule.id);
      toast.success("Agenda excluída com sucesso");
      setConfirmModalOpen(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenDeleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setConfirmModalOpen(true);
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      const { data } = await api.get("/user-google-calendar/auth-url");
      window.location.href = data.url;
    } catch (err) {
      toastError(err);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    try {
      await api.delete("/user-google-calendar/integration");
      toast.success("Integração com Google Calendar desconectada");
      setGoogleIntegration(null);
      fetchSchedules(); // Atualizar agendas para remover vínculos
    } catch (err) {
      toastError(err);
    }
  };

  const handleLinkGoogleCalendar = async (scheduleId) => {
    try {
      await api.post("/user-google-calendar/link-schedule", { scheduleId });
      toast.success("Google Calendar vinculado à agenda");
      fetchSchedules(); // Atualizar agendas
    } catch (err) {
      toastError(err);
    }
  };

  const handleUnlinkGoogleCalendar = async (scheduleId) => {
    try {
      await api.delete("/user-google-calendar/unlink-schedule", { 
        data: { scheduleId } 
      });
      toast.success("Google Calendar desvinculado da agenda");
      fetchSchedules(); // Atualizar agendas
    } catch (err) {
      toastError(err);
    }
  };

  const handleIntegrateScheduleGoogle = async (schedule) => {
    try {
      // Verificar se o usuário já tem integração pessoal
      const { data: userIntegration } = await api.get("/user-google-calendar/integration");
      
      if (userIntegration) {
        // Usuário já tem integração, vincular diretamente
        await api.post(`/user-schedules/${schedule.id}/google-integration`, {
          userGoogleCalendarIntegrationId: userIntegration.id
        });
        toast.success("Agenda vinculada ao seu Google Calendar com sucesso!");
        fetchSchedules(); // Atualizar lista
      } else {
        // Usuário não tem integração, criar nova
        const { data: authData } = await api.get("/google-calendar/auth-url");
        sessionStorage.setItem('pendingScheduleIntegration', schedule.id);
        window.location.href = authData.url;
      }
    } catch (err) {
      console.error("Erro ao verificar integrações:", err);
      toastError("Erro ao verificar integrações disponíveis");
    }
  };

  // Função removida - não precisamos mais de seleção de integrações empresariais
  // Cada usuário tem sua própria integração

  const getAvailableUsers = () => {
    const usedUserIds = schedules.map((s) => s.userId);
    return users.filter((u) => !usedUserIds.includes(u.id) || (selectedSchedule && selectedSchedule.userId === u.id));
  };

  // Verifica se o usuário comum já tem uma agenda
  const userAlreadyHasSchedule = !isAdmin && schedules.some((s) => s.userId === loggedUser?.id);

  // Verifica se pode criar nova agenda (admin sempre pode, usuário só se não tiver)
  const canCreateSchedule = isAdmin || !userAlreadyHasSchedule;

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.titleContainer}>
          <EventAvailableIcon className={classes.titleIcon} />
          <Box>
            <Typography className={classes.title}>Agendas</Typography>
            <Typography className={classes.subtitle}>
              {schedules.length} agenda(s) cadastrada(s)
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          {canCreateSchedule && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Nova Agenda
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : schedules.length === 0 ? (
        <Box className={classes.emptyState}>
          <EventIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
          <Typography variant="h6">Nenhuma agenda cadastrada</Typography>
          <Typography variant="body2">
            Clique em "Nova Agenda" para criar sua primeira agenda
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {schedules.map((schedule) => (
            <Grid item xs={12} sm={6} md={4} key={schedule.id}>
              <Card className={classes.card}>
                <CardContent>
                  <Box className={classes.cardHeader}>
                    <Box>
                      <Typography className={classes.cardTitle}>
                        {schedule.name}
                      </Typography>
                      {schedule.description && (
                        <Typography variant="body2" color="textSecondary">
                          {schedule.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={schedule.active ? "Ativa" : "Inativa"}
                      size="small"
                      className={classes.statusChip}
                      style={{
                        backgroundColor: schedule.active ? "#059669" : "#6b7280",
                        color: "#fff"
                      }}
                    />
                  </Box>

                  <Box className={classes.cardInfo}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {schedule.user?.name || "Usuário não definido"}
                    </Typography>
                  </Box>

                  {schedule.user && (
                    <Box className={classes.workHours}>
                      <ScheduleIcon fontSize="small" />
                      <span>
                        Horário: {schedule.user.startWork || "00:00"} - {schedule.user.endWork || "23:59"}
                      </span>
                    </Box>
                  )}

                  {/* Status da integração Google Calendar */}
                  {!isAdmin && (
                    <Box className={classes.cardInfo} style={{ marginTop: 8 }}>
                      <LanguageIcon fontSize="small" style={{ 
                        color: schedule.googleCalendarIntegration ? '#4285f4' : '#999' 
                      }} />
                      <Typography variant="body2">
                        {schedule.googleCalendarIntegration 
                          ? `Conectado: ${schedule.googleCalendarIntegration.email}`
                          : "Google Calendar não conectado"
                        }
                      </Typography>
                    </Box>
                  )}

                  <Box className={classes.actions} style={{ marginTop: 16 }}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(schedule)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteModal(schedule)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Botões de integração Google Calendar por agenda - SEMPRE VISÍVEL */}
                    {schedule.userGoogleCalendarIntegrationId ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<LanguageIcon fontSize="small" />}
                        onClick={() => handleUnlinkGoogleCalendar(schedule.id)}
                        style={{ marginRight: 8, backgroundColor: '#4285f4' }}
                      >
                        Google
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<LanguageIcon fontSize="small" />}
                        onClick={() => handleIntegrateScheduleGoogle(schedule)}
                        style={{ marginRight: 8, color: '#f44336', borderColor: '#f44336' }}
                      >
                        Google
                      </Button>
                    )}
                    
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<EventIcon />}
                      href={`/appointments?scheduleId=${schedule.id}`}
                    >
                      Compromissos
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSchedule ? "Editar Agenda" : "Nova Agenda"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome da Agenda"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange("name")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange("description")}
              />
            </Grid>
            {!selectedSchedule && (
              <Grid item xs={12}>
                {isAdmin ? (
                  <TextField
                    select
                    label="Usuário"
                    fullWidth
                    required
                    value={formData.userId}
                    onChange={handleChange("userId")}
                    helperText="Cada usuário pode ter apenas uma agenda"
                  >
                    <MenuItem value="">
                      <em>Selecione um usuário</em>
                    </MenuItem>
                    {getAvailableUsers().map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.startWork || "00:00"} - {user.endWork || "23:59"})
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    label="Usuário"
                    fullWidth
                    value={loggedUser?.name || ""}
                    disabled
                    helperText="A agenda será criada para você"
                  />
                )}
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleChange("active")}
                    color="primary"
                  />
                }
                label="Agenda ativa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedSchedule ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        title="Excluir Agenda"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir a agenda "{selectedSchedule?.name}"?
        Todos os compromissos vinculados também serão excluídos.
      </ConfirmationModal>

    </Box>
  );
};

export default UserSchedules;
