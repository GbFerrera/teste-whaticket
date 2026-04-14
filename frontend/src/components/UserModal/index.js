import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green, purple, deepPurple, blue, grey } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Slide from '@material-ui/core/Slide';
import whatsappIcon from '../../assets/nopicture.png';
import { i18n } from "../../translate/i18n";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WorkIcon from '@mui/icons-material/Work';
import MessageIcon from '@mui/icons-material/Message';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { PagePermissionsProvider } from "../../context/PagePermissionsContext";
import useWhatsApps from "../../hooks/useWhatsApps";
import { Can } from "../Can";
import { Avatar, Box, Grid, Input, Paper, Tab, Tabs, Typography, InputAdornment } from "@material-ui/core";
import { getBackendUrl } from "../../config";
import TabPanel from "../TabPanel";
import AvatarUploader from "../AvatarUpload";
import TwoFactorSetup from "../TwoFactorSetup";
import AppointmentModal from "../AppointmentModal";
import PagePermissionsTab from "./PagePermissionsTab";
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";

const backendUrl = getBackendUrl();
const path = require('path');

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: theme.spacing(2),
    cursor: 'pointer',
    borderRadius: '50%',
    border: `2px solid ${deepPurple[300]}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  updateDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateInput: {
    display: 'none',
  },
  updateLabel: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textTransform: 'uppercase',
    textAlign: 'center',
    cursor: 'pointer',
    border: '2px solid #ccc',
    borderRadius: '5px',
    minWidth: 160,
    fontWeight: 'bold',
    color: '#555',
  },
  errorUpdate: {
    border: '2px solid red',
  },
  errorText: {
    color: 'red',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  dialog: {
    borderRadius: '8px',
    boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    width: '90vw',
    maxWidth: '1000px',
    height: '90vh',
    maxHeight: '800px',
  },
  dialogTitle: {
    backgroundColor: "#3f51b5",
    color: 'white',
    padding: theme.spacing(1.5, 3),
    borderBottom: `1px solid ${deepPurple[100]}`,
    display: 'flex',
    alignItems: 'center',
    minHeight: '60px',
  },
  titleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  titleIcon: {
    fontSize: '1.2rem',
  },
  dialogContent: {
    padding: theme.spacing(4),
    backgroundColor: '#f9f9ff',
    overflowY: 'auto',
    height: 'calc(100% - 120px)',
  },
  dialogActions: {
    backgroundColor: '#ffffff',
    padding: theme.spacing(2),
    borderTop: `1px solid ${grey[200]}`,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'sticky',
    bottom: 0,
  },
  tab: {
    backgroundColor: 'transparent',
    color: grey[700],
    fontWeight: 600,
    minHeight: 48,
    '&.Mui-selected': {
      color: deepPurple[500],
      fontWeight: 700,
    },
  },
  tabIndicator: {
    backgroundColor: deepPurple[500],
    height: 3,
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
    height: '100%',
    overflowY: 'auto',
  },
  sectionTitle: {
    color: deepPurple[500],
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  avatarActions: {
    marginTop: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(1),
  },
  deleteButton: {
    color: "white",
    backgroundColor: "#db6565",
    boxShadow: "none",
    borderRadius: 0,
    fontSize: "12px",
  },
  saveButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    padding: '8px 24px',
    borderRadius: '8px',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd1 0%, #6a3d9a 100%)',
    },
  },
  cancelButton: {
    color: grey[600],
    fontWeight: 600,
    border: `1px solid ${grey[300]}`,
    padding: '8px 24px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: grey[100],
    },
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '& fieldset': {
        borderColor: grey[300],
      },
      '&:hover fieldset': {
        borderColor: deepPurple[300],
      },
      '&.Mui-focused fieldset': {
        borderColor: deepPurple[500],
      },
    },
  },
  selectField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
  timePicker: {
    '& .MuiOutlinedInput-input': {
      padding: '13.5px 14px',
    },
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  inputIcon: {
    color: deepPurple[500],
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: "admin",
    startWork: "00:00",
    endWork: "23:59",
    farewellMessage: "",
    allTicket: "disable",
    allowGroup: false,
    defaultTheme: "light",
    defaultMenu: "open",
    allHistoric: "disabled",
    allUserChat: "disabled",
    userClosePendingTicket: "enabled",
    showDashboard: "disabled",
    allowRealTime: "disabled",
    allowConnections: "disabled",
    allowContacts: "disabled",
    userType: "admin",
    workDays: "1,2,3,4,5",
    lunchStart: "",
    lunchEnd: "",
    pagePermissionsMode: "inherit",
  };

  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [services, setServices] = useState([]);
  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();
  const [profileUrl, setProfileUrl] = useState(null);
  const [tab, setTab] = useState("general");
  const [avatar, setAvatar] = useState(null);
  const startWorkRef = useRef();
  const isSelfEditing = userId && Number(userId) === loggedInUser.id;
  const endWorkRef = useRef();

  // Estados para aba de compromissos
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [userScheduleId, setUserScheduleId] = useState(null);

  // Estados para aba de tarefas
  const [userTasks, setUserTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/servicos");
        setServices(data.servicos || data || []);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      }
    };

    if (open) {
      fetchServices();
    }
  }, [open]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser(prevState => {
          return { ...prevState, ...data, profile: "admin", password: "", confirmPassword: "" };
        });

        const { profileImage } = data;
        setProfileUrl(`${backendUrl}/public/company${data.companyId}/user/${profileImage}`);

        const userQueueIds = data.queues?.map(queue => queue.id);
        setSelectedQueueIds(userQueueIds);

        const userServiceIds = data.services?.map(service => service.id) || [];
        setSelectedServiceIds(userServiceIds);

        setWhatsappId(data.whatsappId ? data.whatsappId : '');
      } catch (err) {
        toastError(err);
      }
    };

    fetchUser();
  }, [userId, open]);

  // Buscar compromissos do usuário profissional
  const fetchAppointments = async () => {
    if (!userId || user.userType !== "professional") return;
    
    setLoadingAppointments(true);
    try {
      // Primeiro buscar a agenda do usuário
      const { data: schedulesData } = await api.get("/user-schedules", {
        params: { userId }
      });
      
      const userSchedules = schedulesData.schedules || [];
      if (userSchedules.length > 0) {
        const scheduleId = userSchedules[0].id;
        setUserScheduleId(scheduleId);
        
        // Buscar compromissos da agenda
        const { data: appointmentsData } = await api.get("/appointments", {
          params: { scheduleId }
        });
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (err) {
      console.error("Erro ao buscar compromissos:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (tab === "appointments" && userId && user.userType === "professional") {
      fetchAppointments();
    }
  }, [tab, userId, user.userType]);

  // Buscar tarefas do usuário
  const fetchUserTasks = async () => {
    if (!userId) return;
    
    setLoadingTasks(true);
    try {
      const { data } = await api.get(`/users/${userId}/tasks`);
      setUserTasks(data.tasks || []);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (tab === "tasks" && userId) {
      fetchUserTasks();
    }
  }, [tab, userId]);

  // Agrupar tarefas por projeto
  const getTasksByProject = () => {
    const grouped = {};
    userTasks.forEach(task => {
      const projectId = task.project?.id || 0;
      const projectName = task.project?.name || "Sem Projeto";
      if (!grouped[projectId]) {
        grouped[projectId] = {
          projectName,
          projectStatus: task.project?.status || "unknown",
          tasks: []
        };
      }
      grouped[projectId].tasks.push(task);
    });
    return Object.values(grouped);
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      in_progress: "#2196f3",
      review: "#9c27b0",
      completed: "#4caf50",
      cancelled: "#9e9e9e"
    };
    return colors[status] || "#9e9e9e";
  };

  const getTaskStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      in_progress: "Em Progresso",
      review: "Em Revisão",
      completed: "Concluída",
      cancelled: "Cancelada"
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const handleOpenAppointmentModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    setAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentSaved = () => {
    fetchAppointments();
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "#2196f3",
      confirmed: "#4caf50",
      completed: "#9e9e9e",
      cancelled: "#f44336",
      no_show: "#ff9800"
    };
    return colors[status] || "#9e9e9e";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Agendado",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
      no_show: "Não compareceu"
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleClose = () => {
    onClose();
    setUser(initialState);
    setAppointments([]);
    setUserScheduleId(null);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSaveUser = async (values) => {
    const uploadAvatar = async (file) => {
      const formData = new FormData();
      formData.append('userId', file.id);
      formData.append('typeArch', "user");
      formData.append('profileImage', avatar);

      const { data } = await api.post(`/users/${file.id}/media-upload`, formData);

      localStorage.setItem("profileImage", data.user.profileImage);
    };

    // Se o usuário está editando a si mesmo, não enviar profile/userType
    // para permitir que seed user edite nome/email/senha
    const baseData = {
      ...values,
      whatsappId,
      queueIds: selectedQueueIds,
      serviceIds: selectedServiceIds
    };

    // Remover profile e userType se estiver editando a si mesmo
    if (isSelfEditing) {
      delete baseData.profile;
      delete baseData.userType;
    } else {
      baseData.profile = "admin";
    }

    const userData = userId && !values.password 
      ? {
          ...baseData,
          password: undefined,
          confirmPassword: undefined
        }
      : baseData;

    console.log("userData being sent:", userData);
    
    try {
      if (userId) {
        const { data } = await api.put(`/users/${userId}`, userData);
        if (avatar && (!user?.profileImage || !user?.profileImage !== avatar.name)) {
          uploadAvatar(data);
        }
      } else {
        await api.post("/users", userData);
        if (!user?.profileImage && avatar) {
          uploadAvatar(user);
        }
      }
      if (userId === loggedInUser.id) {
        handleClose();
        toast.success(i18n.t("userModal.success"));
        window.location.reload();
      } else {
        handleClose();
        toast.success(i18n.t("userModal.success"));
      }
    } catch (err) {
      toastError(err);
    }
  };

  const getValidationSchema = () => {
    const baseSchema = {
      name: Yup.string()
        .min(2, "Curto!")
        .max(50, "Longo!")
        .required("Obrigatório"),
      email: Yup.string()
        .email("Email Inválido")
        .required("Obrigatório"),
    };

    if (!userId) {
      return Yup.object().shape({
        ...baseSchema,
        password: Yup.string()
          .min(5, "Senha muito curta")
          .required("Senha é Obrigatório"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], "As senhas não correspondem")
          .required("Confirme sua senha"),
      });
    } else {
      return Yup.object().shape({
        ...baseSchema,
        password: Yup.string()
          .min(5, "Senha muito curta")
          .nullable()
          .notRequired(),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], "As senhas não correspondem")
          .when('password', {
            is: (val) => val && val.length > 0,
            then: Yup.string().required('Confirme sua senha'),
            otherwise: Yup.string().notRequired()
          }),
      });
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialog }}
        TransitionComponent={Transition}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          <div className={classes.titleContent}>
            <PersonIcon className={classes.titleIcon} />
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              {userId
                ? `${i18n.t("userModal.title.edit")}`
                : `${i18n.t("userModal.title.add")}`}
            </Typography>
          </div>
        </DialogTitle>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={getValidationSchema()}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveUser(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => (
            <Form className={classes.formContainer}>
              <DialogContent dividers className={classes.dialogContent}>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handleTabChange}
                  aria-label="user form tabs"
                  classes={{
                    indicator: classes.tabIndicator,
                  }}
                >
                  <Tab 
                    label={i18n.t("userModal.tabs.general")} 
                    value={"general"} 
                    className={classes.tab}
                    icon={<SettingsIcon fontSize="small" />}
                  />
                  {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                    <Tab 
                      label={i18n.t("userModal.tabs.permissions")} 
                      value={"permissions"} 
                      className={classes.tab}
                      icon={<SecurityIcon fontSize="small" />}
                    />
                  )}
                  {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                    <Tab 
                      label="Acesso a Páginas" 
                      value={"pages"} 
                      className={classes.tab}
                      icon={<AssignmentIcon fontSize="small" />}
                    />
                  )}
                  {values.userType === "professional" && (
                    <Tab 
                      label="Compromissos" 
                      value={"appointments"} 
                      className={classes.tab}
                      icon={<EventIcon fontSize="small" />}
                    />
                  )}
                  {userId && (
                    <Tab 
                      label="Tarefas" 
                      value={"tasks"} 
                      className={classes.tab}
                      icon={<AssignmentIcon fontSize="small" />}
                    />
                  )}
                  {userId && Number(userId) === loggedInUser.id && (
                    <Tab 
                      label="Segurança" 
                      value={"security"} 
                      className={classes.tab}
                      icon={<LockIcon fontSize="small" />}
                    />
                  )}
                </Tabs>

                <TabPanel
                  className={classes.tabPanel}
                  value={tab}
                  name={"general"}
                >
                  <Paper elevation={0} className={classes.card}>
                    <Typography className={classes.sectionTitle}>
                      <PersonIcon fontSize="small" /> Informações do Perfil
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("userModal.form.name")}
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon className={classes.inputIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("userModal.form.email")}
                          name="email"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon className={classes.inputIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} style={{ marginTop: 8 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("userModal.form.password")}
                          type="password"
                          name="password"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          placeholder={userId ? "Deixe em branco para manter a senha atual" : ""}
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon className={classes.inputIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("Confirme sua senha")}
                          type="password"
                          name="confirmPassword"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          placeholder={userId ? "Deixe em branco para manter a senha atual" : ""}
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon className={classes.inputIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                    <Paper elevation={0} className={classes.card}>
                      <Typography className={classes.sectionTitle}>
                        <GroupIcon fontSize="small" /> Configuração de Filas e Conexão
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Can
                            role={loggedInUser.profile}
                            perform="user-modal:editQueues"
                            yes={() => (
                              <QueueSelect
                                selectedQueueIds={selectedQueueIds}
                                onChange={values => setSelectedQueueIds(values)}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Can
                            role={loggedInUser.profile}
                            perform="user-modal:editProfile"
                            yes={() => (
                              <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                <InputLabel>
                                  {i18n.t("userModal.form.whatsapp")}
                                </InputLabel>
                                <Field
                                  as={Select}
                                  value={whatsappId}
                                  onChange={(e) => setWhatsappId(e.target.value)}
                                  label={i18n.t("userModal.form.whatsapp")}
                                >
                                  <MenuItem value={''}>&nbsp;</MenuItem>
                                  {whatsApps.map((whatsapp) => (
                                    <MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
                                  ))}
                                </Field>
                              </FormControl>
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                    <Paper elevation={0} className={classes.card}>
                      <Typography className={classes.sectionTitle}>
                        <WorkIcon fontSize="small" /> Jornada de Trabalho
                      </Typography>
                      
                      <Can
                        role={loggedInUser.profile}
                        perform="user-modal:editProfile"
                        yes={() => (
                          <Grid container spacing={2}>
                          {/* Tipo de Usuário / Papel */}
                          <Grid item xs={12} sm={6} md={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                              <InputLabel>Tipo de Usuário</InputLabel>
                              <Field
                                as={Select}
                                name="userType"
                                label="Tipo de Usuário"
                                disabled={isSelfEditing}
                              >
                                <MenuItem value="admin">Administrador</MenuItem>
                                <MenuItem value="manager">Gerente</MenuItem>
                                <MenuItem value="attendant">Atendente</MenuItem>
                                <MenuItem value="professional">Profissional</MenuItem>
                              </Field>
                            </FormControl>
                          </Grid>

                          {/* Dias de Trabalho */}
                          <Grid item xs={12} sm={6} md={8}>
                            <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                              <InputLabel>Dias de Trabalho</InputLabel>
                              <Field
                                as={Select}
                                name="workDays"
                                label="Dias de Trabalho"
                                multiple
                                value={values.workDays ? values.workDays.split(",") : []}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFieldValue("workDays", Array.isArray(value) ? value.join(",") : value);
                                }}
                                renderValue={(selected) => {
                                  const dayNames = { "0": "Dom", "1": "Seg", "2": "Ter", "3": "Qua", "4": "Qui", "5": "Sex", "6": "Sáb" };
                                  return selected.map(d => dayNames[d] || d).join(", ");
                                }}
                              >
                                <MenuItem value="0">Domingo</MenuItem>
                                <MenuItem value="1">Segunda-feira</MenuItem>
                                <MenuItem value="2">Terça-feira</MenuItem>
                                <MenuItem value="3">Quarta-feira</MenuItem>
                                <MenuItem value="4">Quinta-feira</MenuItem>
                                <MenuItem value="5">Sexta-feira</MenuItem>
                                <MenuItem value="6">Sábado</MenuItem>
                              </Field>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6} md={3}>
                            <Field
                              as={TextField}
                              label={i18n.t("userModal.form.startWork")}
                              type="time"
                              ampm={false}
                              inputRef={startWorkRef}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 600,
                              }}
                              fullWidth
                              name="startWork"
                              error={touched.startWork && Boolean(errors.startWork)}
                              helperText={touched.startWork && errors.startWork}
                              variant="outlined"
                              margin="dense"
                              className={classes.timePicker}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ScheduleIcon className={classes.inputIcon} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Field
                              as={TextField}
                              label={i18n.t("userModal.form.endWork")}
                              type="time"
                              ampm={false}
                              inputRef={endWorkRef}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 600,
                              }}
                              fullWidth
                              name="endWork"
                              error={touched.endWork && Boolean(errors.endWork)}
                              helperText={touched.endWork && errors.endWork}
                              variant="outlined"
                              margin="dense"
                              className={classes.timePicker}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ScheduleIcon className={classes.inputIcon} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          {/* Horário de Almoço */}
                          <Grid item xs={12} sm={6} md={3}>
                            <Field
                              as={TextField}
                              label="Início Almoço"
                              type="time"
                              ampm={false}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 600,
                              }}
                              fullWidth
                              name="lunchStart"
                              variant="outlined"
                              margin="dense"
                              className={classes.timePicker}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ScheduleIcon className={classes.inputIcon} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Field
                              as={TextField}
                              label="Fim Almoço"
                              type="time"
                              ampm={false}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 600,
                              }}
                              fullWidth
                              name="lunchEnd"
                              variant="outlined"
                              margin="dense"
                              className={classes.timePicker}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ScheduleIcon className={classes.inputIcon} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          {/* Serviços vinculados - só aparece se for profissional */}
                          {values.userType === "professional" && (
                            <Grid item xs={12}>
                              <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                <InputLabel>Serviços Vinculados</InputLabel>
                                <Select
                                  multiple
                                  value={selectedServiceIds}
                                  onChange={(e) => setSelectedServiceIds(e.target.value)}
                                  label="Serviços Vinculados"
                                  renderValue={(selected) => {
                                    return services
                                      .filter(s => selected.includes(s.id))
                                      .map(s => s.nome)
                                      .join(", ");
                                  }}
                                >
                                  {services.map((service) => (
                                    <MenuItem key={service.id} value={service.id}>
                                      {service.nome} - R$ {Number(service.valorOriginal || 0).toFixed(2)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}
                          </Grid>
                        )}
                      />
                    </Paper>
                  )}

                  <Paper elevation={0} className={classes.card}>
                    <Typography className={classes.sectionTitle}>
                      <MessageIcon fontSize="small" /> Configurações Adicionais
                    </Typography>
                    
                    <Field
                      as={TextField}
                      label={i18n.t("userModal.form.farewellMessage")}
                      type="farewellMessage"
                      multiline
                      rows={4}
                      fullWidth
                      name="farewellMessage"
                      error={touched.farewellMessage && Boolean(errors.farewellMessage)}
                      helperText={touched.farewellMessage && errors.farewellMessage}
                      variant="outlined"
                      margin="dense"
                      className={classes.inputField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MessageIcon className={classes.inputIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Paper>
                </TabPanel>

                {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                  <TabPanel
                    className={classes.tabPanel}
                    value={tab}
                    name={"permissions"}
                  >
                    <Paper elevation={0} className={classes.card}>
                      <Typography className={classes.sectionTitle}>
                        <SecurityIcon fontSize="small" /> Permissões de Ticket
                      </Typography>
                      
                      <Can
                        role={loggedInUser.profile}
                        perform="user-modal:editProfile"
                        yes={() => (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.allTicket")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.allTicket")}
                                    name="allTicket"
                                    type="allTicket"
                                    required
                                  >
                                    <MenuItem value="enable">{i18n.t("userModal.form.allTicketEnable")}</MenuItem>
                                    <MenuItem value="disable">{i18n.t("userModal.form.allTicketDisable")}</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.allowGroup")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.allowGroup")}
                                    name="allowGroup"
                                    type="allowGroup"
                                    required
                                  >
                                    <MenuItem value={true}>Habilitado</MenuItem>
                                    <MenuItem value={false}>Desabilitado</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.userClosePendingTicket")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.userClosePendingTicket")}
                                    name="userClosePendingTicket"
                                    type="userClosePendingTicket"
                                    required
                                  >
                                    <MenuItem value="disabled">{i18n.t("userModal.form.allHistoricDisabled")}</MenuItem>
                                    <MenuItem value="enabled">{i18n.t("userModal.form.allHistoricEnabled")}</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </>
                        )}
                      />
                    </Paper>

                    <Paper elevation={0} className={classes.card}>
                      <Typography className={classes.sectionTitle}>
                        <DashboardIcon fontSize="small" /> Permissões de acesso
                      </Typography>
                      
                      <Can
                        role={loggedInUser.profile}
                        perform="user-modal:editProfile"
                        yes={() => (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.allHistoric")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.allHistoric")}
                                    name="allHistoric"
                                    type="allHistoric"
                                    required
                                  >
                                    <MenuItem value="disabled">{i18n.t("userModal.form.allHistoricDisabled")}</MenuItem>
                                    <MenuItem value="enabled">{i18n.t("userModal.form.allHistoricEnabled")}</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.allUserChat")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.allUserChat")}
                                    name="allUserChat"
                                    type="allUserChat"
                                    required
                                  >
                                    <MenuItem value="disabled">{i18n.t("userModal.form.allHistoricDisabled")}</MenuItem>
                                    <MenuItem value="enabled">{i18n.t("userModal.form.allHistoricEnabled")}</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                  <InputLabel>
                                    {i18n.t("userModal.form.allowConnections")}
                                  </InputLabel>
                                  <Field
                                    as={Select}
                                    label={i18n.t("userModal.form.allowConnections")}
                                    name="allowConnections"
                                    type="allowConnections"
                                    required
                                  >
                                    <MenuItem value="disabled">{i18n.t("userModal.form.allHistoricDisabled")}</MenuItem>
                                    <MenuItem value="enabled">{i18n.t("userModal.form.allHistoricEnabled")}</MenuItem>
                                  </Field>
                                </FormControl>
                              </Grid>
                              {(values.userType === "professional" || values.userType === "attendant" || values.userType === "admin" || values.userType === "manager") && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <FormControl variant="outlined" margin="dense" fullWidth className={classes.selectField}>
                                    <InputLabel>
                                      Acesso a Contatos
                                    </InputLabel>
                                    <Field
                                      as={Select}
                                      label="Acesso a Contatos"
                                      name="allowContacts"
                                      type="allowContacts"
                                      required
                                    >
                                      <MenuItem value="disabled">Desabilitado</MenuItem>
                                      <MenuItem value="enabled">Habilitado</MenuItem>
                                    </Field>
                                  </FormControl>
                                </Grid>
                              )}
                            </Grid>
                          </>
                        )}
                      />
                    </Paper>

                    {/* Admin: Desativar 2FA de outro usuário */}
                    {loggedInUser.profile === "admin" && userId && Number(userId) !== loggedInUser.id && user.twoFactorEnabled && (
                      <Paper elevation={0} className={classes.card}>
                        <Typography className={classes.sectionTitle}>
                          <LockIcon fontSize="small" /> Autenticação em Dois Fatores
                        </Typography>
                        <Box marginTop={1}>
                          <Typography variant="body2" color="textSecondary">
                            Clique no botão abaixo para desativar o 2FA deste usuário.
                          </Typography>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ marginTop: 8 }}
                            onClick={async () => {
                              try {
                                await api.delete(`/users/${userId}/2fa`);
                                toast.success("2FA desativado com sucesso!");
                                setUser(prev => ({ ...prev, twoFactorEnabled: false }));
                              } catch (err) {
                                toastError(err);
                              }
                            }}
                          >
                            Desativar 2FA
                          </Button>
                        </Box>
                      </Paper>
                    )}

                  </TabPanel>
                )}

                {/* Aba de Acesso a Páginas - apenas para admin */}
                {!(isSelfEditing && (values.userType === "attendant" || values.userType === "professional")) && (
                  <TabPanel
                    className={classes.tabPanel}
                    value={tab}
                    name={"pages"}
                  >
                    <PagePermissionsProvider>
                      <PagePermissionsTab
                        userId={userId}
                        profile={values.profile}
                        pagePermissionsMode={values.pagePermissionsMode || "inherit"}
                        setPagePermissionsMode={(value) => setFieldValue('pagePermissionsMode', value)}
                      />
                    </PagePermissionsProvider>
                  </TabPanel>
                )}

                {/* Aba de Compromissos - só para profissionais */}
                {values.userType === "professional" && (
                  <TabPanel
                    className={classes.tabPanel}
                    value={tab}
                    name={"appointments"}
                  >
                    <Paper elevation={0} className={classes.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <Typography className={classes.sectionTitle}>
                          <EventIcon fontSize="small" /> Compromissos do Profissional
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenAppointmentModal()}
                          disabled={!userScheduleId}
                          size="small"
                        >
                          Novo Compromisso
                        </Button>
                      </div>

                      {!userScheduleId && (
                        <Typography color="textSecondary" style={{ textAlign: "center", padding: 20 }}>
                          Este profissional ainda não possui uma agenda. Crie uma agenda primeiro na página de Agendas.
                        </Typography>
                      )}

                      {loadingAppointments ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                          <CircularProgress />
                        </div>
                      ) : appointments.length === 0 && userScheduleId ? (
                        <Typography color="textSecondary" style={{ textAlign: "center", padding: 20 }}>
                          Nenhum compromisso encontrado.
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Título</TableCell>
                              <TableCell>Data/Hora</TableCell>
                              <TableCell>Duração</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="center">Ações</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {appointments.map((appointment) => (
                              <TableRow key={appointment.id}>
                                <TableCell>{appointment.title}</TableCell>
                                <TableCell>{formatDateTime(appointment.startDatetime)}</TableCell>
                                <TableCell>{appointment.durationMinutes} min</TableCell>
                                <TableCell>
                                  <Chip
                                    label={getStatusLabel(appointment.status)}
                                    size="small"
                                    style={{
                                      backgroundColor: getStatusColor(appointment.status),
                                      color: "white"
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenAppointmentModal(appointment)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </Paper>
                  </TabPanel>
                )}

                {/* Aba de Segurança - 2FA */}
                {userId && Number(userId) === loggedInUser.id && (
                  <TabPanel
                    className={classes.tabPanel}
                    value={tab}
                    name={"security"}
                  >
                    <TwoFactorSetup />
                  </TabPanel>
                )}

                {/* Aba de Tarefas */}
                {userId && (
                  <TabPanel
                    className={classes.tabPanel}
                    value={tab}
                    name={"tasks"}
                  >
                    <Paper elevation={0} className={classes.card}>
                      <Typography className={classes.sectionTitle}>
                        <AssignmentIcon fontSize="small" /> Tarefas por Projeto
                      </Typography>

                      {loadingTasks ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                          <CircularProgress />
                        </div>
                      ) : userTasks.length === 0 ? (
                        <Typography color="textSecondary" style={{ textAlign: "center", padding: 20 }}>
                          Nenhuma tarefa atribuída a este usuário.
                        </Typography>
                      ) : (
                        getTasksByProject().map((projectGroup, index) => (
                          <Accordion key={index} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <FolderIcon color="primary" />
                                <Typography style={{ fontWeight: 500 }}>
                                  {projectGroup.projectName}
                                </Typography>
                                <Chip
                                  label={`${projectGroup.tasks.length} tarefa(s)`}
                                  size="small"
                                  style={{ marginLeft: 8 }}
                                />
                              </div>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Table size="small" style={{ width: "100%" }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Tarefa</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Prazo</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {projectGroup.tasks.map((task) => (
                                    <TableRow key={task.id}>
                                      <TableCell>
                                        <div>
                                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                                            {task.title}
                                          </Typography>
                                          {task.description && (
                                            <Typography variant="caption" color="textSecondary">
                                              {task.description.substring(0, 100)}
                                              {task.description.length > 100 ? "..." : ""}
                                            </Typography>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={getTaskStatusLabel(task.status)}
                                          size="small"
                                          style={{
                                            backgroundColor: getTaskStatusColor(task.status),
                                            color: "white"
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {task.dueDate ? (
                                          <Typography
                                            variant="body2"
                                            style={{
                                              color: new Date(task.dueDate) < new Date() && task.status !== "completed"
                                                ? "#f44336"
                                                : "inherit"
                                            }}
                                          >
                                            {formatDate(task.dueDate)}
                                          </Typography>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </AccordionDetails>
                          </Accordion>
                        ))
                      )}
                    </Paper>
                  </TabPanel>
                )}
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleClose}
                  style={{
                  color: "white",
                  backgroundColor: "#db6565",
                  boxShadow: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  }}
                  disabled={isSubmitting}
                >
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button
                  startIcon={<SaveIcon />}
                  type="submit"
                  style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  }}
                  disabled={isSubmitting}
                >
                  {userId
                    ? `${i18n.t("userModal.buttons.okEdit")}`
                    : `${i18n.t("userModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Modal de Compromisso */}
      <AppointmentModal
        open={appointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        appointment={selectedAppointment}
        onSave={handleAppointmentSaved}
        initialScheduleId={userScheduleId}
        userServices={user.services || services.filter(s => selectedServiceIds.includes(s.id))}
        userConfig={{
          workDays: user.workDays || "1,2,3,4,5",
          startWork: user.startWork || "00:00",
          endWork: user.endWork || "23:59",
          lunchStart: user.lunchStart || null,
          lunchEnd: user.lunchEnd || null
        }}
        existingAppointments={appointments}
      />
    </div>
  );
};

export default UserModal;