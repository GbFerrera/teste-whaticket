import React, { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import EventIcon from "@material-ui/icons/Event";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import PersonIcon from "@material-ui/icons/Person";
import BuildIcon from "@material-ui/icons/Build";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  listUserSchedules,
  listAppointments,
  updateAppointment,
  deleteAppointment
} from "../../services/userScheduleService";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";
import AppointmentModal from "../../components/AppointmentModal";
import { AuthContext } from "../../context/Auth/AuthContext";

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
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  titleSection: {
    display: "flex",
    flexDirection: "column"
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
  filters: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    alignItems: "center"
  },
  filterField: {
    minWidth: 150
  },
  tableContainer: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  tableHead: {
    backgroundColor: theme.palette.grey[100]
  },
  tableHeadCell: {
    fontWeight: 600
  },
  statusChip: {
    fontWeight: 600,
    fontSize: 12
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary
  },
  appointmentInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  appointmentTitle: {
    fontWeight: 600
  },
  appointmentMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 13,
    color: theme.palette.text.secondary
  },
  actionsBox: {
    display: "flex",
    justifyContent: "center",
    gap: 4
  }
}));

const statusColors = {
  scheduled: { bg: "#3b82f6", label: "Agendado" },
  confirmed: { bg: "#059669", label: "Confirmado" },
  completed: { bg: "#6b7280", label: "Concluído" },
  cancelled: { bg: "#ef4444", label: "Cancelado" },
  no_show: { bg: "#f59e0b", label: "Não compareceu" }
};

const Agenda = () => {
  const classes = useStyles();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const normalizedUserType = (user?.userType || "").toLowerCase();
  const isRestrictedUserType = ["attendant", "professional"].includes(normalizedUserType);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [filters, setFilters] = useState({
    scheduleId: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (location && location.search) {
      const queryParams = new URLSearchParams(location.search);
      const scheduleIdParam = queryParams.get("scheduleId");
      if (scheduleIdParam) {
        setFilters(prev => ({ ...prev, scheduleId: scheduleIdParam }));
      }
    }
  }, [location]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.scheduleId) params.scheduleId = filters.scheduleId;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await listAppointments(params);
      setAppointments(data.appointments || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await listUserSchedules();
      setSchedules(data.schedules || []);

      if (isRestrictedUserType) {
        const ownSchedule = data.schedules?.[0];
        if (ownSchedule) {
          setFilters(prev => ({ ...prev, scheduleId: String(ownSchedule.id) }));
        }
      }
    } catch (err) {
      console.error("Erro ao buscar agendas:", err);
    }
  }, [isRestrictedUserType]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleOpenModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(selectedAppointment.id);
      toast.success("Compromisso excluído com sucesso");
      setConfirmModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setConfirmModalOpen(true);
  };

  const handleStatusChange = async (appointment, newStatus) => {
    try {
      await updateAppointment(appointment.id, { status: newStatus });
      toast.success("Status atualizado");
      fetchAppointments();
    } catch (err) {
      toastError(err);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.titleSection}>
          <Typography className={classes.title}>Compromissos</Typography>
          <Typography className={classes.subtitle}>
            {appointments.length} compromisso(s) encontrado(s)
          </Typography>
        </Box>

        <Box className={classes.filters}>
          <FormControl variant="outlined" size="small" className={classes.filterField}>
            <InputLabel>Agenda</InputLabel>
            <Select
              value={filters.scheduleId}
              onChange={handleFilterChange("scheduleId")}
              label="Agenda"
            >
              <MenuItem value="">Todas</MenuItem>
              {schedules.map((schedule) => (
                <MenuItem key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" className={classes.filterField}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange("status")}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(statusColors).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Data Início"
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={handleFilterChange("startDate")}
          />

          <TextField
            type="date"
            label="Data Fim"
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={handleFilterChange("endDate")}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Novo Compromisso
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Box className={classes.emptyState}>
          <EventIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
          <Typography variant="h6">Nenhum compromisso encontrado</Typography>
          <Typography variant="body2">
            Clique em "Novo Compromisso" para agendar
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>Compromisso</TableCell>
                <TableCell className={classes.tableHeadCell}>Agenda</TableCell>
                <TableCell className={classes.tableHeadCell}>Data/Hora</TableCell>
                <TableCell className={classes.tableHeadCell}>Duração</TableCell>
                <TableCell className={classes.tableHeadCell}>Serviço</TableCell>
                <TableCell className={classes.tableHeadCell}>Status</TableCell>
                <TableCell className={classes.tableHeadCell} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>
                    <Box className={classes.appointmentInfo}>
                      <Typography className={classes.appointmentTitle}>
                        {appointment.title}
                      </Typography>
                      {appointment.description && (
                        <Typography variant="body2" color="textSecondary">
                          {appointment.description.substring(0, 50)}
                          {appointment.description.length > 50 ? "..." : ""}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className={classes.appointmentMeta}>
                      <PersonIcon fontSize="small" />
                      {appointment.schedule?.name || "-"}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className={classes.appointmentMeta}>
                      <EventIcon fontSize="small" />
                      {formatDateTime(appointment.startDatetime)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className={classes.appointmentMeta}>
                      <AccessTimeIcon fontSize="small" />
                      {formatDuration(appointment.durationMinutes)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {appointment.service ? (
                      <Box className={classes.appointmentMeta}>
                        <BuildIcon fontSize="small" />
                        {appointment.service.nome}
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusColors[appointment.status]?.label || appointment.status}
                      size="small"
                      className={classes.statusChip}
                      style={{
                        backgroundColor: statusColors[appointment.status]?.bg || "#6b7280",
                        color: "#fff"
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box className={classes.actionsBox}>
                      {appointment.status === "scheduled" && (
                        <Tooltip title="Confirmar">
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(appointment, "confirmed")}
                          >
                            <CheckCircleIcon fontSize="small" style={{ color: "#059669" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                        <Tooltip title="Cancelar">
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(appointment, "cancelled")}
                          >
                            <CancelIcon fontSize="small" style={{ color: "#ef4444" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(appointment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteModal(appointment)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        onSave={fetchAppointments}
        initialScheduleId={filters.scheduleId || ""}
      />

      <ConfirmationModal
        title="Excluir Compromisso"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir o compromisso "{selectedAppointment?.title}"?
      </ConfirmationModal>
    </Box>
  );
};

export default Agenda;