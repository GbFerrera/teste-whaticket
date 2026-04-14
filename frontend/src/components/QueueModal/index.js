import React, { useState, useEffect, useRef, useContext, Fragment } from "react";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import { 
  FormControl, 
  FormControlLabel, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select,
  Tab, 
  Tabs 
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { i18n } from "../../translate/i18n";
import Switch from "@material-ui/core/Switch";
import { isArray } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@material-ui/core";
import { Colorize } from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import ConfirmationModal from "../ConfirmationModal";
import Checkbox from '@mui/material/Checkbox';
import CancelIcon from '@mui/icons-material/Cancel';
import OptionsChatBot from "../ChatBots/options";
import CustomToolTip from "../ToolTips";
import SchedulesForm from "../SchedulesForm";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { AuthContext } from "../../context/Auth/AuthContext";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import useQueues from "../../hooks/useQueues";
import UserStatusIcon from "../UserModal/statusIcon";
import usePlans from "../../hooks/usePlans";
import ColorBoxModal from "../ColorBoxModal";
import Slide from '@material-ui/core/Slide';
import PersonIcon from '@material-ui/icons/Person';
import ScheduleIcon from '@material-ui/icons/Schedule';
import MessageIcon from '@material-ui/icons/Message';
import SettingsIcon from '@material-ui/icons/Settings';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import FolderIcon from '@material-ui/icons/Folder';
import IntegrationIcon from '@material-ui/icons/Extension';
import QueueIcon from '@material-ui/icons/Queue';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import AttachFileIcon from '@material-ui/icons/AttachFile';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  textField1: {
    margin: theme.spacing(1),
    minWidth: 120,
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
  colorAdorment: {
    width: 20,
    height: 20,
  },
  greetingMessage: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  custom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    borderRadius: '8px',
    overflow: 'hidden',
  },
  dialogTitle: {
    backgroundColor: "#3f51b5",
    color: "white",
    padding: "16px 24px",
    fontSize: "1.25rem",
    fontWeight: 500,
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  dialogContent: {
    padding: theme.spacing(3),
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  dialogActions: {
    padding: theme.spacing(2),
    background: "#f5f5f5",
    borderTop: "1px solid #e0e0e0",
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
  },
  cancelButton: {
    color: "white",
    backgroundColor: "#db6565",
    boxShadow: "none",
    borderRadius: "5px",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#c65454",
    },
  },
  saveButton: {
    color: "white",
    backgroundColor: "#437db5",
    boxShadow: "none",
    borderRadius: "5px",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#356a9a",
    },
  },
  fieldIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  scheduleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(3),
  },
  scheduleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  scheduleDay: {
    width: "120px",
    textAlign: "left",
    fontWeight: theme.typography.fontWeightMedium,
  },
  scheduleTimeContainer: {
    display: "flex",
    alignItems: "center",
  },
  scheduleTimeGroup: {
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(0, 2),
  },
  scheduleTimeField: {
    width: "120px",
    margin: theme.spacing(0, 1),
  },
  scheduleDivider: {
    margin: theme.spacing(0, 1),
    color: theme.palette.text.secondary,
  },
  scheduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  scheduleHeaderText: {
    fontWeight: theme.typography.fontWeightMedium,
    flex: 1,
    textAlign: "center",
  },
  colorOrderContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  colorFieldContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  orderFieldContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  formContent: {
    flex: 1,
    overflowY: 'auto',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Obrigatório"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required("A cor é Obrigatório"),
  greetingMessage: Yup.string(),
  chatbots: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().min(4, "too short").required("Obrigatório"),
      })
    )
    .required("Must have friends"),
});

const QueueModal = ({ open, onClose, queueId, onEdit }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
    chatbots: [],
    outOfHoursMessage: "",
    orderQueue: "",
    tempoRoteador: 0,
    ativarRoteador: false,
    integrationId: "",
    fileListId: "",
    closeTicket: false
  };

  const initialStateSchedule = [
    { weekday: i18n.t("queueModal.serviceHours.monday"), weekdayEn: "monday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: i18n.t("queueModal.serviceHours.tuesday"), weekdayEn: "tuesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: i18n.t("queueModal.serviceHours.wednesday"), weekdayEn: "wednesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: i18n.t("queueModal.serviceHours.thursday"), weekdayEn: "thursday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: i18n.t("queueModal.serviceHours.friday"), weekdayEn: "friday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: "Sábado", weekdayEn: "saturday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" },
    { weekday: "Domingo", weekdayEn: "sunday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "12:01", endTimeB: "23:00" }
  ];

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const greetingRef = useRef();
  const [activeStep, setActiveStep] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isStepContent, setIsStepContent] = useState(true);
  const [isNameEdit, setIsNamedEdit] = useState(null);
  const [isGreetingMessageEdit, setGreetingMessageEdit] = useState(null);
  const [queues, setQueues] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState(null);
  const { user, socket } = useContext(AuthContext);
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedQueueOption, setSelectedQueueOption] = useState("");
  const { findAll: findAllQueues } = useQueues();
  const [allQueues, setAllQueues] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const isMounted = useRef(true);
  const [schedules, setSchedules] = useState(initialStateSchedule);
  const companyId = user.companyId;
  const { get: getSetting } = useCompanySettings();
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const setting = await getSetting({
        "column": "scheduleType"
      });
      if (setting.scheduleType === "queue") setSchedulesEnabled(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });

        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);

        setQueue((prevState) => {
          return { ...prevState, ...data };
        });

        if (isArray(data.schedules) && data.schedules.length > 0)
          setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
        chatbots: [],
        outOfHoursMessage: "",
        orderQueue: "",
        tempoRoteador: "",
        ativarRoteador: false,
        integrationId: "",
        fileListId: "",
        closeTicket: false
      });
    };
  }, [queueId, open]);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParam.length < 3) {
      setLoading(false);
      setSelectedQueueOption("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setUserOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration");

        setIntegrations(data.queueIntegrations);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeStep) {
      setSelectedQueueOption(queue.chatbots[activeStep]?.optQueueId)
    }

    if (activeStep === isNameEdit) {
      setIsStepContent(false);
    } else {
      setIsStepContent(true);
    }
  }, [isNameEdit, activeStep]);

  const handleClose = () => {
    onClose();
    setIsNamedEdit(null);
    setActiveStep(null);
    setGreetingMessageEdit(null);
  };

  const handleSaveSchedules = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, { ...queue, schedules: values });
        toast.success("Horários atualizados com sucesso!");
      } else {
        toast.success("Horários configurados com sucesso!");
      }
      setSchedules(values);
      setTab(0);
    } catch (err) {
      toastError(err);
    }
  };

  const filterOptions = createFilterOptions({
    trim: true,
  });

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (optionsId) => {
    try {
      await api.delete(`/chatbot/${optionsId}`);
      const { data } = await api.get(`/queue/${queueId}`);
      setQueue(initialState);
      setQueue(data);

      setIsNamedEdit(null);
      setGreetingMessageEdit(null);
      toast.success(`${i18n.t("queues.toasts.deleted")}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, { ...values, schedules });
      } else {
        await api.post("/queue", { ...values, schedules });
      }

      toast.success(`${i18n.t("queues.toasts.success")}`);
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveBot = async (values) => {
    try {
      if (queueId) {
        const { data } = await api.put(`/queue/${queueId}`, values);
        if (data.chatbots && data.chatbots.length) {
          onEdit(data);
          setQueue(data);
        }
      } else {
        const { data } = await api.post("/queue", values);
        if (data.chatbots && data.chatbots.length) {
          setQueue(data);
          onEdit(data);
          handleClose();
        }
      }

      setIsNamedEdit(null)
      setGreetingMessageEdit(null)
      toast.success(`${i18n.t("queues.toasts.success")}`);

    } catch (err) {
      toastError(err);
    }
  };

  const renderSchedulesTab = () => {
    return (
      <div className={classes.scheduleContainer}>
        <div className={classes.scheduleHeader}>
          <div className={classes.scheduleDay}>
            <Typography variant="subtitle2">Dia da Semana</Typography>
          </div>
          <div className={classes.scheduleTimeContainer}>
            <Typography variant="subtitle2" className={classes.scheduleHeaderText}>Jornada de Trabalho</Typography>
          </div>
        </div>

        {schedules.map((schedule, index) => (
          <div key={index} className={classes.scheduleRow}>
            <div className={classes.scheduleDay}>
              <Typography variant="body1">{schedule.weekday}</Typography>
            </div>
            <div className={classes.scheduleTimeContainer}>
              <div className={classes.scheduleTimeGroup}>
                <TextField
                  label="Início"
                  type="time"
                  value={schedule.startTimeA}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  size="small"
                  className={classes.scheduleTimeField}
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].startTimeA = e.target.value;
                    setSchedules(newSchedules);
                  }}
                />
                <Typography className={classes.scheduleDivider}>às</Typography>
                <TextField
                  label="Fim"
                  type="time"
                  value={schedule.endTimeA}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  size="small"
                  className={classes.scheduleTimeField}
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].endTimeA = e.target.value;
                    setSchedules(newSchedules);
                  }}
                />
              </div>

              <div className={classes.scheduleTimeGroup}>
                <TextField
                  label="Início"
                  type="time"
                  value={schedule.startTimeB}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  size="small"
                  className={classes.scheduleTimeField}
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].startTimeB = e.target.value;
                    setSchedules(newSchedules);
                  }}
                />
                <Typography className={classes.scheduleDivider}>às</Typography>
                <TextField
                  label="Fim"
                  type="time"
                  value={schedule.endTimeB}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  size="small"
                  className={classes.scheduleTimeField}
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].endTimeB = e.target.value;
                    setSchedules(newSchedules);
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSaveSchedules(schedules)}
          style={{
            color: "white",
            backgroundColor: "#437db5",
            boxShadow: "none",
            borderRadius: "5px",
            fontSize: "12px",
          }}
          startIcon={<SaveIcon />}
        >
          Salvar Horários
        </Button>
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queueModal.title.confirmationDelete")}
      </ConfirmationModal>
      <Dialog
        maxWidth="md"
        fullWidth
        open={open}
        onClose={handleClose}
        scroll="paper"
        TransitionComponent={Transition}
        transitionDuration={300}
        classes={{ paper: classes.dialog }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {queueId
            ? `${i18n.t("queueModal.title.edit")}`
            : `${i18n.t("queueModal.title.add")}`}
        </DialogTitle>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(e, v) => setTab(v)}
          aria-label="disabled tabs example"
        >
          <Tab label={i18n.t("queueModal.title.queueData")} />
          {schedulesEnabled && <Tab label={i18n.t("Horários de Atendimento")} />}
        </Tabs>
        {tab === 0 && (
          <Formik
            initialValues={queue}
            validateOnChange={false}
            enableReinitialize={true}
            validationSchema={QueueSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                handleSaveQueue(values);
                actions.setSubmitting(false);
              }, 400);
            }}
          >
            {({ setFieldValue, touched, errors, isSubmitting, values }) => (
              <Form className={classes.formContainer}>
                <DialogContent dividers className={classes.dialogContent}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon className={classes.fieldIcon} />
                    <Field
                      as={TextField}
                      label={i18n.t("queueModal.form.name")}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      className={classes.textField}
                    />
                  </div>
                  
                  <div className={classes.colorOrderContainer}>
                    <div className={classes.colorFieldContainer}>
                      <Colorize className={classes.fieldIcon} />
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.color")}
                        name="color"
                        id="color"
                        onFocus={() => {
                          setColorPickerModalOpen(true);
                          greetingRef.current.focus();
                        }}
                        error={touched.color && Boolean(errors.color)}
                        helperText={touched.color && errors.color}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <div
                                style={{ backgroundColor: values.color }}
                                className={classes.colorAdorment}
                              ></div>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}
                            >
                              <Colorize />
                            </IconButton>
                          ),
                        }}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                      />
                    </div>
                    
                    <div className={classes.orderFieldContainer}>
                      <QueueIcon className={classes.fieldIcon} />
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.orderQueue")}
                        name="orderQueue"
                        type="orderQueue"
                        error={touched.orderQueue && Boolean(errors.orderQueue)}
                        helperText={touched.orderQueue && errors.orderQueue}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                      />
                    </div>
                  </div>
                  
                  <ColorBoxModal
                    open={colorPickerModalOpen}
                    handleClose={() => setColorPickerModalOpen(false)}
                    onChange={(color) => {
                      setFieldValue("color", `#${color.hex}`);
                      setQueue(prev => ({ ...prev, color: `#${color.hex}` }));
                    }}
                    currentColor={values.color}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RotateLeftIcon className={classes.fieldIcon} />
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          color="primary"
                          name="ativarRoteador"
                          checked={values.ativarRoteador}
                        />
                      }
                      label={i18n.t("queueModal.form.rotate")}
                    />
                    <Field
                      as={Select}
                      label={i18n.t("queueModal.form.timeRotate")}
                      name="tempoRoteador"
                      id="tempoRoteador"
                      variant="outlined"
                      margin="dense"
                      className={classes.selectField}
                    >
                      <MenuItem value="0" selected disabled>{i18n.t("queueModal.form.timeRotate")}</MenuItem>
                      <MenuItem value="2">2 minutos</MenuItem>
                      <MenuItem value="5">5 minutos</MenuItem>
                      <MenuItem value="10">10 minutos</MenuItem>
                      <MenuItem value="15">15 minutos</MenuItem>
                      <MenuItem value="30">30 minutos</MenuItem>
                      <MenuItem value="45">45 minutos</MenuItem>
                      <MenuItem value="60">60 minutos</MenuItem>
                    </Field>
                  </div>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                  <Button
                    onClick={handleClose}
                    className={classes.cancelButton}
                    startIcon={<CancelIcon />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    className={classes.saveButton}
                    startIcon={isSubmitting ? <CircularProgress size={20} className={classes.buttonProgress} /> : (queueId ? <EditIcon /> : <SaveIcon />)}
                  >
                    {queueId ? "Editar" : "Salvar"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </Dialog>
    </div>
  );
};

export default QueueModal;