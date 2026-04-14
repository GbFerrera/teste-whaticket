import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Tooltip,
  Avatar,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import ScheduleIcon from "@material-ui/icons/Schedule";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TodayIcon from "@material-ui/icons/Today";
import PersonIcon from "@material-ui/icons/Person";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import "moment/locale/pt-br";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";

moment.locale("pt-br");

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_SCHEDULES":
      const schedules = action.payload;
      const newState = [...state];
      const newSchedules = [];
      schedules.forEach((schedule) => {
        const scheduleIndex = newState.findIndex((s) => s.id === schedule.id);
        if (scheduleIndex !== -1) {
          newState[scheduleIndex] = schedule;
        } else {
          newSchedules.push(schedule);
        }
      });
      return [...newState, ...newSchedules];

    case "UPDATE_SCHEDULES":
      const schedule = action.payload;
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        // Criar novo array sem mutar o estado original
        const newState = [...state];
        newState[scheduleIndex] = schedule;
        return newState;
      } else {
        return [schedule, ...state];
      }

    case "DELETE_SCHEDULE":
      const scheduleId = action.payload;
      return state.filter((s) => s.id !== scheduleId);

    case "RESET":
      return [];

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
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  titleIcon: {
    color: theme.palette.primary.main,
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    minWidth: 200,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    width: 40,
    height: 40,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  content: {
    display: "flex",
    gap: theme.spacing(3),
    flex: 1,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  // Lista de agendamentos
  listColumn: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(2),
    "&:last-child": {
      borderBottom: "none",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  itemAvatar: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemDetails: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  itemActions: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  actionButton: {
    width: 32,
    height: 32,
  },
  editButton: {
    backgroundColor: "rgba(63, 81, 181, 0.1)",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "rgba(63, 81, 181, 0.2)",
    },
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    color: "#f44336",
    "&:hover": {
      backgroundColor: "rgba(244, 67, 54, 0.2)",
    },
  },
  // Calendário moderno
  calendarColumn: {
    flex: 1,
    minWidth: 320,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    padding: theme.spacing(2),
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
    textTransform: "capitalize",
  },
  calendarNav: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  navButton: {
    width: 32,
    height: 32,
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  todayButton: {
    fontSize: 12,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 16,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginBottom: theme.spacing(1),
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5),
    textTransform: "uppercase",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  calendarDay: {
    aspectRatio: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    cursor: "pointer",
    position: "relative",
    fontSize: 14,
    color: theme.palette.text.primary,
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  dayOtherMonth: {
    color: theme.palette.text.disabled,
  },
  dayToday: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  daySelected: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  dayHasEvent: {
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 4,
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: "#ff9800",
    },
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  statusBadge: {
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 12,
    fontWeight: 600,
  },
  statusPending: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    color: "#ff9800",
  },
  statusSent: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    color: "#4caf50",
  },
  statusError: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    color: "#f44336",
  },
}));

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  // Calendário
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      const plan = planConfigs?.plan;
      if (!plan?.useSchedules) {
        toast.error("Esta empresa não possui permissão para acessar essa página!");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchSchedules]);

  useEffect(() => {
    const onCompanySchedule = (data) => {
      console.log("[Lembretes] Socket event received:", data.action, "schedule:", data.schedule?.id, "status:", data.schedule?.status);
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };

    console.log("[Lembretes] Listening on:", `company${user.companyId}-schedule`);
    socket.on(`company${user.companyId}-schedule`, onCompanySchedule);

    return () => {
      socket.off(`company${user.companyId}-schedule`, onCompanySchedule);
    };
  }, [socket, user.companyId]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setConfirmModalOpen(false);
    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  // Funções do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
  };

  const goToToday = () => {
    setCurrentDate(moment());
    setSelectedDate(moment());
  };

  const getDaysInMonth = () => {
    const startOfMonth = currentDate.clone().startOf("month");
    const endOfMonth = currentDate.clone().endOf("month");
    const startDay = startOfMonth.clone().startOf("week");
    const endDay = endOfMonth.clone().endOf("week");

    const days = [];
    let day = startDay.clone();

    while (day.isSameOrBefore(endDay)) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  const hasEventOnDay = (day) => {
    return schedules.some((schedule) =>
      moment(schedule.sendAt).isSame(day, "day")
    );
  };

  const getSchedulesForSelectedDate = () => {
    if (!selectedDate) return schedules;
    return schedules.filter((schedule) =>
      moment(schedule.sendAt).isSame(selectedDate, "day")
    );
  };

  const getContactName = (schedule) => {
    if (schedule.contact) {
      return schedule.contact.name || schedule.contact.number || "Contato sem nome";
    }
    return "Contato sem nome";
  };

  const getStatusBadge = (schedule) => {
    const status = schedule.status || "PENDENTE";
    const statusMap = {
      PENDENTE: { label: "Pendente", class: classes.statusPending },
      AGENDADA: { label: "Agendada", class: classes.statusPending },
      ENVIADA: { label: "Enviado", class: classes.statusSent },
      ERRO: { label: "Erro", class: classes.statusError },
    };
    const statusInfo = statusMap[status] || statusMap.PENDENTE;
    return (
      <span className={`${classes.statusBadge} ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredSchedules = getSchedulesForSelectedDate();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Box className={classes.root}>
      {/* Modais */}
      <ConfirmationModal
        title={i18n.t("schedules.confirmationModal.deleteTitle")}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule?.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          reload={fetchSchedules}
          scheduleId={selectedSchedule ? selectedSchedule.id : null}
          contactId={contactId}
          cleanContact={cleanContact}
        />
      )}

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.titleContainer}>
          <ScheduleIcon className={classes.titleIcon} />
          <Box>
            <Typography className={classes.title}>
              {i18n.t("schedules.title")}
            </Typography>
            <Typography className={classes.subtitle}>
              Gerencie seus agendamentos • {schedules.length} agendamento(s)
              {selectedDate && ` • ${selectedDate.format("DD/MM/YYYY")}`}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.actions}>
          <TextField
            size="small"
            variant="outlined"
            placeholder={i18n.t("contacts.searchPlaceholder")}
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Novo agendamento">
            <IconButton
              className={classes.addButton}
              onClick={handleOpenScheduleModal}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content - 2 colunas */}
      <Box className={classes.content}>
        {/* Coluna da Lista */}
        <Box className={classes.listColumn}>
          <Typography className={classes.listHeader}>
            {selectedDate
              ? `Agendamentos de ${selectedDate.format("DD/MM/YYYY")}`
              : "Todos os agendamentos"}
          </Typography>

          {filteredSchedules.length === 0 ? (
            <Box className={classes.emptyState}>
              <ScheduleIcon style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography>Nenhum agendamento encontrado</Typography>
            </Box>
          ) : (
            filteredSchedules.map((schedule) => (
              <Box key={schedule.id} className={classes.listItem}>
                <Avatar className={classes.itemAvatar}>
                  <PersonIcon />
                </Avatar>
                <Box className={classes.itemInfo}>
                  <Typography className={classes.itemName}>
                    {getContactName(schedule)}
                  </Typography>
                  <Box className={classes.itemDetails}>
                    <span>ID: {schedule.id}</span>
                    <span>•</span>
                    <span>{moment(schedule.sendAt).format("DD/MM/YYYY HH:mm")}</span>
                    <span>•</span>
                    {getStatusBadge(schedule)}
                  </Box>
                </Box>
                <Box className={classes.itemActions}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.editButton}`}
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      className={`${classes.actionButton} ${classes.deleteButton}`}
                      onClick={() => {
                        setDeletingSchedule(schedule);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Coluna do Calendário */}
        <Box className={classes.calendarColumn}>
          <Box className={classes.calendarHeader}>
            <Typography className={classes.calendarTitle}>
              {currentDate.format("MMMM YYYY")}
            </Typography>
            <Box className={classes.calendarNav}>
              <button className={classes.todayButton} onClick={goToToday}>
                Hoje
              </button>
              <IconButton
                className={classes.navButton}
                onClick={goToPreviousMonth}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton className={classes.navButton} onClick={goToNextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>

          <Box className={classes.weekDays}>
            {weekDays.map((day) => (
              <Typography key={day} className={classes.weekDay}>
                {day}
              </Typography>
            ))}
          </Box>

          <Box className={classes.calendarGrid}>
            {getDaysInMonth().map((day, index) => {
              const isCurrentMonth = day.isSame(currentDate, "month");
              const isToday = day.isSame(moment(), "day");
              const isSelected = selectedDate && day.isSame(selectedDate, "day");
              const hasEvent = hasEventOnDay(day);

              return (
                <Box
                  key={index}
                  className={`
                    ${classes.calendarDay}
                    ${!isCurrentMonth ? classes.dayOtherMonth : ""}
                    ${isToday ? classes.dayToday : ""}
                    ${isSelected && !isToday ? classes.daySelected : ""}
                    ${hasEvent ? classes.dayHasEvent : ""}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  {day.date()}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Schedules;