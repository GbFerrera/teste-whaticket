  import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import * as Yup from "yup";

import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { isNil } from "lodash";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Tab,
  Tabs,
  Paper,
  Box,
  Typography,
  Slide,
  Chip,
  Tooltip
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

import QueueSelect from "../QueueSelect";
import TabPanel from "../TabPanel";
import { Autorenew, FileCopy } from "@material-ui/icons";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import SchedulesForm from "../SchedulesForm";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TOOL_CATALOG, DEFAULT_SENSITIVE_TOOLS } from "../../constants/aiTools";

import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MessageIcon from '@mui/icons-material/Message';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import IntegrationIcon from '@mui/icons-material/Extension';
import FlowIcon from '@mui/icons-material/AccountTree';
import TokenIcon from '@mui/icons-material/VpnKey';
import QueueIcon from '@mui/icons-material/ListAlt';
import TimerIcon from '@mui/icons-material/Timer';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4
  },

  multFieldLine: {
    marginTop: 12,
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },
  importMessage: {
    marginTop: 12,
    marginBottom: 12,
    paddingBottom: 20,
    paddingTop: 3,
    padding: 12,
    border: "solid grey 2px",
    borderRadius: 4,
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  tokenRefresh: {
    minWidth: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogTitle: {
    backgroundColor: "#444394",
    color: "white",
    padding: theme.spacing(2),
  },
  dialogContent: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(3),
  },
  dialogActions: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
  },
  tab: {
    backgroundColor: "#444394",
    color: "white",
    "& .Mui-selected": {
      backgroundColor: "#5c6bc0",
    },
  },
  buttonPrimary: {
    backgroundColor: "#444394",
    color: "white",
    "&:hover": {
      backgroundColor: "#5c6bc0",
    },
  },
  buttonSecondary: {
    backgroundColor: "#db6565",
    color: "white",
    "&:hover": {
      backgroundColor: "#e57373",
    },
  },
  fieldWithIcon: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  icon: {
    color: "#444394",
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Obrigatório"),
  greetingMessage: Yup.string(),
  complationMessage: Yup.string(),
  outOfHoursMessage: Yup.string(),
  ratingMessage: Yup.string(),
  token: Yup.string(),
  maxUseBotQueues: Yup.number(),
  provider: Yup.string(),
  expiresTicket: Yup.number(),
  allowGroup: Yup.boolean(),
  enableImportMessage: Yup.boolean(),
  groupAsTicket: Yup.string(),
  timeUseBotQueues: Yup.string(),
  timeSendQueue: Yup.string(),
  sendIdQueue: Yup.number(),
  expiresTicketNPS: Yup.string(),
  expiresInactiveMessage: Yup.string(),
  timeInactiveMessage: Yup.string(),
  inactiveMessage: Yup.string(),
  maxUseBotQueuesNPS: Yup.number(),
  whenExpiresTicket: Yup.number(),
  timeCreateNewTicket: Yup.number(),
  greetingMediaAttachment: Yup.string(),
  importRecentMessages: Yup.string(),
  importOldMessages: Yup.string(),
  importOldMessagesGroups: Yup.string(),
  integrationId: Yup.number().nullable(),
  promptId: Yup.number().nullable(),
  collectiveVacationEnd: Yup.string(),
  collectiveVacationStart: Yup.string(),
  collectiveVacationMessage: Yup.string(),
  queueIdImportMessages: Yup.number().nullable(),
  wavoip: Yup.string(),
  coexistencePhoneNumberId: Yup.string().when('channel', {
    is: 'whatsapp_official',
    then: Yup.string().required('Phone Number ID é obrigatório para WhatsApp Oficial'),
    otherwise: Yup.string()
  }),
  coexistenceWabaId: Yup.string().when('channel', {
    is: 'whatsapp_official',
    then: Yup.string().required('WABA ID é obrigatório para WhatsApp Oficial'),
    otherwise: Yup.string()
  }),
  coexistencePermanentToken: Yup.string().when('channel', {
    is: 'whatsapp_official',
    then: Yup.string().required('Permanent Token é obrigatório para WhatsApp Oficial'),
    otherwise: Yup.string()
  }),
  channel: Yup.string(),
});

const WhatsAppModal = ({ open, onClose, whatsAppId, channel }) => {
  const classes = useStyles();
  const [autoToken, setAutoToken] = useState("");

  const inputFileRef = useRef(null);

  const [attachment, setAttachment] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')

  const initialState = {
    name: "",
    greetingMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    ratingMessage: "",
    isDefault: false,
    token: "",
    maxUseBotQueues: 3,
    provider: "beta",
    expiresTicket: 0,
    allowGroup: false,
    enableImportMessage: false,
    groupAsTicket: "disabled",
    timeUseBotQueues: '0',
    timeSendQueue: '0',
    sendIdQueue: 0,
    expiresTicketNPS: '0',
    expiresInactiveMessage: "",
    timeInactiveMessage: "",
    inactiveMessage: "",
    maxUseBotQueuesNPS: 3,
    whenExpiresTicket: 0,
    timeCreateNewTicket: 0,
    greetingMediaAttachment: "",
    importRecentMessages: "",
    importOldMessages: "",
    importOldMessagesGroups: "",
    integrationId: null,
    promptId: null,
    collectiveVacationEnd: "",
    collectiveVacationStart: "",
    collectiveVacationMessage: "",
    queueIdImportMessages: null,
    wavoip: "",
    coexistencePhoneNumberId: "",
    coexistenceWabaId: "",
    coexistencePermanentToken: "",
    channel: channel || "whatsapp",
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [queues, setQueues] = useState([]);
  const [tab, setTab] = useState("general");
  const [enableImportMessage, setEnableImportMessage] = useState(false);
  const [importOldMessagesGroups, setImportOldMessagesGroups] = useState(false);
  const [closedTicketsPostImported, setClosedTicketsPostImported] = useState(false);
  const [importOldMessages, setImportOldMessages] = useState(moment().add(-1, "days").format("YYYY-MM-DDTHH:mm"));
  const [importRecentMessages, setImportRecentMessages] = useState(moment().add(-1, "minutes").format("YYYY-MM-DDTHH:mm"));
  const [copied, setCopied] = useState(false);

  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [NPSEnabled, setNPSEnabled] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const { user } = useContext(AuthContext);

  const [schedules, setSchedules] = useState([
    { weekday: i18n.t("queueModal.serviceHours.monday"), weekdayEn: "monday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: i18n.t("queueModal.serviceHours.tuesday"), weekdayEn: "tuesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: i18n.t("queueModal.serviceHours.wednesday"), weekdayEn: "wednesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: i18n.t("queueModal.serviceHours.thursday"), weekdayEn: "thursday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: i18n.t("queueModal.serviceHours.friday"), weekdayEn: "friday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: "Sábado", weekdayEn: "saturday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
    { weekday: "Domingo", weekdayEn: "sunday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00", },
  ]);

  const { get: getSetting } = useCompanySettings();
  const { getPlanCompany } = usePlans();

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);

  const [webhooks, setWebhooks] = useState([]);
  const [flowIdNotPhrase, setFlowIdNotPhrase] = useState();
  const [flowIdWelcome, setFlowIdWelcome] = useState();

  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    if (!whatsAppId && !whatsApp.token) {
      setAutoToken(generateRandomCode(30));
    } else if (whatsAppId && !whatsApp.token) {
      setAutoToken(generateRandomCode(30));
    } else {
      setAutoToken(whatsApp.token);
    }
  }, [whatsAppId, whatsApp.token]);

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
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [whatsAppId]);

  useEffect(() => {
    const fetchData = async () => {
      const settingSchedules = await getSetting({
        "column": "scheduleType"
      });
      setSchedulesEnabled(settingSchedules.scheduleType === "connection");
      const settingNPS = await getSetting({
        "column": "userRating"
      });
      setNPSEnabled(settingNPS.userRating === "enabled");
    }
    fetchData();
  }, []);

  const handleEnableImportMessage = async (e) => {
    setEnableImportMessage(e.target.checked);
  };

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const endpoint = channel === "whatsapp_official" ? `/whatsapp-official/${whatsAppId}` : `whatsapp/${whatsAppId}?session=0`;
        const { data } = await api.get(endpoint);
        
        // Para WhatsApp Oficial, não tentar buscar flows de session
        if (channel !== "whatsapp_official") {
          if (data && data?.flowIdNotPhrase) {
            const { data: flowDefault } = await api.get(`flowbuilder/${data.flowIdNotPhrase}`)
            console.log(flowDefault?.flow.id)
            const selectedFlowIdNotPhrase = flowDefault?.flow.id
            setFlowIdNotPhrase(selectedFlowIdNotPhrase)
          }
          if (data && data?.flowIdWelcome) {
            const { data: flowDefault } = await api.get(`flowbuilder/${data.flowIdWelcome}`)
            console.log(flowDefault?.flow.id)
            const selectedFlowIdWelcome = flowDefault?.flow.id
            setFlowIdWelcome(selectedFlowIdWelcome)
          }
        }
        setWhatsApp(data);
        setAttachmentName(data.greetingMediaAttachment);
        setAutoToken(data.token);
        setSelectedIntegration(data?.integrationId)
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);
        const whatsQueueIds = data.queues?.map((queue) => queue.id).filter(id => typeof id === 'number' && !isNaN(id)) || [];
        setSelectedQueueIds(whatsQueueIds);
        setSchedules(data.schedules)
        if (!isNil(data?.importOldMessages)) {
          setEnableImportMessage(true);
          setImportOldMessages(data?.importOldMessages);
          setImportRecentMessages(data?.importRecentMessages);
          setClosedTicketsPostImported(data?.closedTicketsPostImported);
          setImportOldMessagesGroups(data?.importOldMessagesGroups);
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId, channel]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

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
    (async () => {
      try {
        const { data } = await api.get("/flowbuilder")
        setWebhooks(data.flows)
      } catch (err) {
        toastError(err)
      }
    })();
  }, [])

  const handleChangeQueue = (e) => {
    // Garantir que seja sempre um array de números
    const queueIds = Array.isArray(e) ? e.filter(id => typeof id === 'number' || !isNaN(parseInt(id))).map(id => parseInt(id)) : [];
    setSelectedQueueIds(queueIds);
    setSelectedPrompt(null);
    setSelectedIntegration(null)
  };

  const handleChangeIntegration = (e) => {
    setSelectedIntegration(e.target.value)
    setSelectedPrompt(null)
    setSelectedQueueIds([])
  }

  const handleChangeFlowIdNotPhrase = (e) => {
    console.log(e.target.value)
    setFlowIdNotPhrase(e.target.value)
  }

  const handleChangeFlowIdWelcome = (e) => {
    console.log(e.target.value)
    setFlowIdWelcome(e.target.value)
  }

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
    setSelectedQueueIds([]);
  };

  const handleSaveWhatsApp = async (values) => {
    if (!whatsAppId) setAutoToken(generateRandomCode(30));

    // Validação específica para WhatsApp Oficial
    if (channel === "whatsapp_official") {
      if (!values.coexistencePhoneNumberId || values.coexistencePhoneNumberId.trim() === "") {
        toastError("Phone Number ID é obrigatório para WhatsApp Oficial");
        return;
      }
      if (!values.coexistenceWabaId || values.coexistenceWabaId.trim() === "") {
        toastError("WABA ID é obrigatório para WhatsApp Oficial");
        return;
      }
      if (!values.coexistencePermanentToken || values.coexistencePermanentToken.trim() === "") {
        toastError("Permanent Token é obrigatório para WhatsApp Oficial");
        return;
      }
    }

    if (NPSEnabled) {
      if (isNil(values.ratingMessage)) {
        toastError(i18n.t("whatsappModal.errorRatingMessage"));
        return;
      }

      if (values.expiresTicketNPS === '0' && values.expiresTicketNPS === '' && values.expiresTicketNPS === 0) {
        toastError(i18n.t("whatsappModal.errorExpiresNPS"));
        return;
      }
    }

    if (values.timeSendQueue === '') values.timeSendQueue = '0'

    if ((values.sendIdQueue === 0 || values.sendIdQueue === '' || isNil(values.sendIdQueue)) && (values.timeSendQueue !== 0 && values.timeSendQueue !== '0')) {
      toastError(i18n.t("whatsappModal.errorSendQueue"));
      return;
    }

    const whatsappData = {
      ...values,
      wavoip: values.wavoip,
      flowIdWelcome: flowIdWelcome ? flowIdWelcome : null,
      flowIdNotPhrase: flowIdNotPhrase ? flowIdNotPhrase : null,
      integrationId: selectedIntegration ? selectedIntegration : null,
      queueIds: selectedQueueIds,
      importOldMessages: enableImportMessage ? importOldMessages : null,
      importRecentMessages: enableImportMessage ? importRecentMessages : null,
      importOldMessagesGroups: importOldMessagesGroups ? importOldMessagesGroups : null,
      closedTicketsPostImported: closedTicketsPostImported ? closedTicketsPostImported : null,
      token: autoToken ? autoToken : null,
      schedules,
      promptId: selectedPrompt ? selectedPrompt : null,
      channel: channel || "whatsapp"
    };

    delete whatsappData["queues"];
    delete whatsappData["session"];

    try {
      // Debug: mostrar o que está sendo enviado
      console.log("🔍 Debug - Dados sendo enviados para API:", {
        whatsAppId,
        channel,
        whatsappData: {
          ...whatsappData,
          promptId: whatsappData.promptId,
          integrationId: whatsappData.integrationId
        }
      });

      if (whatsAppId) {
        // Para WhatsApp Oficial, não deletar sessão
        if (whatsAppId && enableImportMessage && whatsApp?.status === "CONNECTED" && channel !== "whatsapp_official") {
          try {
            setWhatsApp({ ...whatsApp, status: "qrcode" });
            await api.delete(`/whatsappsession/${whatsApp.id}`);
          } catch (err) {
            toastError(err);
          }
        }

        // Usar endpoint diferente dependendo do canal
        const endpoint = channel === "whatsapp_official" ? `/whatsapp-official/${whatsAppId}` : `/whatsapp/${whatsAppId}`;
        await api.put(endpoint, whatsappData);
        
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          const mediaEndpoint = channel === "whatsapp_official" ? `/whatsapp-official/${whatsAppId}/media-upload` : `/whatsapp/${whatsAppId}/media-upload`;
          await api.post(mediaEndpoint, formData);
        }
        if (!attachmentName && (whatsApp.greetingMediaAttachment !== null)) {
          const mediaEndpoint = channel === "whatsapp_official" ? `/whatsapp-official/${whatsAppId}/media-upload` : `/whatsapp/${whatsAppId}/media-upload`;
          await api.delete(mediaEndpoint);
        }
      } else {
        // Usar endpoint diferente dependendo do canal
        const endpoint = channel === "whatsapp_official" ? "/whatsapp-official" : "/whatsapp";
        const { data } = await api.post(endpoint, whatsappData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          const mediaEndpoint = channel === "whatsapp_official" ? `/whatsapp-official/${data.id}/media-upload` : `/whatsapp/${data.id}/media-upload`;
          await api.post(mediaEndpoint, formData);
        }
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
      // Não recarregar a página - o socket já atualiza automaticamente
    } catch (err) {
      toastError(err);
    }
  };

  function generateRandomCode(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyvz0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      code += charset.charAt(randomIndex);
    }
    return code;
  }

  const handleRefreshToken = () => {
    setAutoToken(generateRandomCode(30));
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(autoToken);
    setCopied(true);
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
    setEnableImportMessage(false);
    setAttachment(null)
    setAttachmentName("")
    setCopied(false);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleFileUpload = () => {
    const file = inputFileRef.current.files[0];
    setAttachment(file)
    setAttachmentName(file.name)
    inputFileRef.current.value = null
  };

  const handleDeleFile = () => {
    setAttachment(null)
    setAttachmentName(null)
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        TransitionComponent={Transition}
      >
        <DialogTitle className={classes.dialogTitle}>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={{
            ...whatsApp,
            promptId: selectedPrompt,
            integrationId: selectedIntegration
          }}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={() => {
            // Prevenir submit automático do Formik
            return false;
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <Paper className={classes.mainPaper} elevation={1}>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  style={{
                    color: "white",
                    backgroundColor: "#444394",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  scrollButtons="on"
                  variant="scrollable"
                  onChange={handleTabChange}
                  className={classes.tab}
                >
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <SettingsIcon fontSize="small" />
                        {i18n.t("whatsappModal.tabs.general")}
                      </div>
                    }
                    value={"general"}
                  />
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <IntegrationIcon fontSize="small" />
                        {i18n.t("whatsappModal.tabs.integrations")}
                      </div>
                    }
                    value={"integrations"}
                  />
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <MessageIcon fontSize="small" />
                        {i18n.t("whatsappModal.tabs.messages")}
                      </div>
                    }
                    value={"messages"}
                  />
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <ChatIcon fontSize="small" />
                        Chatbot
                      </div>
                    }
                    value={"chatbot"}
                  />
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <AssessmentIcon fontSize="small" />
                        {i18n.t("whatsappModal.tabs.assessments")}
                      </div>
                    }
                    value={"nps"}
                  />
                  <Tab
                    label={
                      <div className={classes.fieldWithIcon}>
                        <FlowIcon fontSize="small" />
                        Fluxo Padrão
                      </div>
                    }
                    value={"flowbuilder"}
                  />
                  {schedulesEnabled && (
                    <Tab
                      label={
                        <div className={classes.fieldWithIcon}>
                          <ScheduleIcon fontSize="small" />
                          {i18n.t("whatsappModal.tabs.schedules")}
                        </div>
                      }
                      value={"schedules"}
                    />
                  )}
                </Tabs>
              </Paper>
              <Paper className={classes.paper} elevation={0}>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"general"}
                >
                  <DialogContent dividers className={classes.dialogContent}>
                    {attachmentName && (
                      <div
                        style={{ display: 'flex', flexDirection: 'row-reverse' }}
                      >
                        <Button
                          variant='outlined'
                          color="primary"
                          endIcon={<DeleteOutlineIcon />}
                          onClick={handleDeleFile}
                        >
                          {attachmentName}
                        </Button>
                      </div>
                    )}
                    <div
                      style={{ display: 'flex', flexDirection: "column-reverse" }}
                    >
                      <input
                        type="file"
                        accept="video/*,image/*"
                        ref={inputFileRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <Button
                        startIcon={<PhotoCameraIcon />}
                        variant="contained"
                        style={{
                          color: "white",
                          backgroundColor: "#4ec24e",
                          boxShadow: "none",
                          borderRadius: "5px",
                        }}
                        onClick={() => inputFileRef.current.click()}
                      >
                        {i18n.t("userModal.buttons.addImage")}
                      </Button>
                    </div>
                    <div className={classes.multFieldLine}>
                      <Grid spacing={2} container>
                        <Grid item>
                          <div className={classes.fieldWithIcon}>
                            <PersonIcon className={classes.icon} />
                            <Field
                              as={TextField}
                              label={i18n.t("whatsappModal.form.name")}
                              autoFocus
                              name="name"
                              error={touched.name && Boolean(errors.name)}
                              helperText={touched.name && errors.name}
                              variant="outlined"
                              margin="dense"
                              className={classes.textField}
                            />
                          </div>
                        </Grid>
                        <Grid style={{ paddingTop: 15 }} item>
                          <FormControlLabel
                            control={
                              <Field
                                as={Switch}
                                color="primary"
                                name="isDefault"
                                checked={values.isDefault}
                              />
                            }
                            label={i18n.t("whatsappModal.form.default")}
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {channel === "whatsapp_official" && (
                      <div className={classes.multFieldLine} style={{ marginTop: 24 }}>
                        <Grid spacing={2} container>
                          <Grid item xs={12} md={4}>
                            <Field
                              as={TextField}
                              label="Phone Number ID"
                              name="coexistencePhoneNumberId"
                              fullWidth
                              variant="outlined"
                              margin="dense"
                              error={touched.coexistencePhoneNumberId && Boolean(errors.coexistencePhoneNumberId)}
                              helperText={touched.coexistencePhoneNumberId && errors.coexistencePhoneNumberId}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Field
                              as={TextField}
                              label="WABA ID"
                              name="coexistenceWabaId"
                              fullWidth
                              variant="outlined"
                              margin="dense"
                              error={touched.coexistenceWabaId && Boolean(errors.coexistenceWabaId)}
                              helperText={touched.coexistenceWabaId && errors.coexistenceWabaId}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Field
                              as={TextField}
                              label="Permanent Token"
                              name="coexistencePermanentToken"
                              fullWidth
                              variant="outlined"
                              margin="dense"
                              type="password"
                              error={touched.coexistencePermanentToken && Boolean(errors.coexistencePermanentToken)}
                              helperText={touched.coexistencePermanentToken && errors.coexistencePermanentToken}
                            />
                          </Grid>
                        </Grid>
                      </div>
                    )}

                    {/* Campos ocultos para garantir que o Formik reconheça promptId e integrationId */}
                    <Field
                      as={TextField}
                      name="promptId"
                      type="hidden"
                      value={selectedPrompt || ""}
                    />
                    <Field
                      as={TextField}
                      name="integrationId"
                      type="hidden"
                      value={selectedIntegration || ""}
                    />

                    {/* Seção "Importar mensagens do aparelho" removida */}

                    <Box display="flex" alignItems="center">
                      <Grid xs={6} md={12} item>
                        <div className={classes.fieldWithIcon}>
                          <TokenIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.token")}
                            type="token"
                            fullWidth
                            name="token"
                            value={autoToken}
                            variant="outlined"
                            margin="dense"
                            disabled
                          />
                        </div>
                      </Grid>
                      <Button
                        onClick={handleRefreshToken}
                        disabled={isSubmitting}
                        className={classes.tokenRefresh}
                        variant="text"
                        startIcon={<Autorenew style={{ marginLeft: 5, color: "green" }} />}
                      />
                      <Button
                        onClick={handleCopyToken}
                        className={classes.tokenRefresh}
                        variant="text"
                        startIcon={<FileCopy style={{ color: copied ? "blue" : "inherit" }} />}
                      />
                    </Box>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <SettingsIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label="Wavoip"
                          fullWidth
                          name="wavoip"
                          variant="outlined"
                          margin="dense"
                        />
                      </div>
                    </div>

                    <div>
                      <h3>{i18n.t("whatsappModal.form.queueRedirection")}</h3>
                      <p>{i18n.t("whatsappModal.form.queueRedirectionDesc")}</p>
                      <Grid spacing={2} container>
                        <Grid xs={6} md={6} item>
                          <div className={classes.fieldWithIcon}>
                            <QueueIcon className={classes.icon} />
                            <FormControl
                              variant="outlined"
                              margin="dense"
                              className={classes.FormControl}
                              fullWidth
                            >
                              <InputLabel id="sendIdQueue-selection-label">
                                {i18n.t("whatsappModal.form.sendIdQueue")}
                              </InputLabel>
                              <Field
                                as={Select}
                                name="sendIdQueue"
                                id="sendIdQueue"
                                value={values.sendIdQueue || '0'}
                                required={values.timeSendQueue > 0}
                                label={i18n.t("whatsappModal.form.sendIdQueue")}
                                placeholder={i18n.t("whatsappModal.form.sendIdQueue")}
                                labelId="sendIdQueue-selection-label"
                              >
                                <MenuItem value={0}>&nbsp;</MenuItem>
                                {queues.map(queue => (
                                  <MenuItem key={queue.id} value={queue.id}>
                                    {queue.name}
                                  </MenuItem>
                                ))}
                              </Field>
                            </FormControl>
                          </div>
                        </Grid>
                        <Grid xs={6} md={6} item>
                          <div className={classes.fieldWithIcon}>
                            <TimerIcon className={classes.icon} />
                            <Field
                              as={TextField}
                              label={i18n.t("whatsappModal.form.timeSendQueue")}
                              fullWidth
                              name="timeSendQueue"
                              variant="outlined"
                              margin="dense"
                              error={touched.timeSendQueue && Boolean(errors.timeSendQueue)}
                              helperText={touched.timeSendQueue && errors.timeSendQueue}
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </DialogContent>
                </TabPanel>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"integrations"}
                >
                  <DialogContent dividers className={classes.dialogContent}>
                    {/* <div className={classes.fieldWithIcon}>
                      <QueueIcon className={classes.icon} />
                      <QueueSelect
                        selectedQueueIds={selectedQueueIds}
                        onChange={(selectedIds) => handleChangeQueue(selectedIds)}
                      />
                    </div> */}
                    {showIntegrations && (
                      <div className={classes.fieldWithIcon}>
                        <IntegrationIcon className={classes.icon} />
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          className={classes.FormControl}
                          fullWidth
                        >
                          <InputLabel id="integrationId-selection-label">
                            {i18n.t("queueModal.form.integrationId")}
                          </InputLabel>
                          <Select
                            label={i18n.t("queueModal.form.integrationId")}
                            name="integrationId"
                            value={selectedIntegration || ""}
                            onChange={handleChangeIntegration}
                            id="integrationId"
                            variant="outlined"
                            margin="dense"
                            placeholder={i18n.t("queueModal.form.integrationId")}
                            labelId="integrationId-selection-label">
                            <MenuItem value={null} >{"Desabilitado"}</MenuItem>
                            {integrations.map((integration) => (
                              <MenuItem key={integration.id} value={integration.id}>
                                {integration.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    )}
                    {showOpenAi && (
                      <div className={classes.fieldWithIcon}>
                        <AutoAwesomeIcon className={classes.icon} />
                        <FormControl
                          margin="dense"
                          variant="outlined"
                          fullWidth
                        >
                          <InputLabel>
                            {i18n.t("whatsappModal.form.prompt")}
                          </InputLabel>
                          <Select
                            labelId="dialog-select-prompt-label"
                            id="dialog-select-prompt"
                            name="promptId"
                            value={selectedPrompt || ""}
                            onChange={handleChangePrompt}
                            label={i18n.t("whatsappModal.form.prompt")}
                            fullWidth
                            MenuProps={{
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                              transformOrigin: {
                                vertical: "top",
                                horizontal: "left",
                              },
                              getContentAnchorEl: null,
                            }}
                          >
                            {prompts.map((prompt) => (
                              <MenuItem
                                key={prompt.id}
                                value={prompt.id}
                              >
                                {prompt.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    )}
                  </DialogContent>
                </TabPanel>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"messages"}
                >
                  <DialogContent dividers className={classes.dialogContent}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={12} xl={12}>
                        <div className={classes.fieldWithIcon}>
                          <MessageIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.greetingMessage")}
                            type="greetingMessage"
                            multiline
                            rows={4}
                            fullWidth
                            name="greetingMessage"
                            error={
                              touched.greetingMessage && Boolean(errors.greetingMessage)
                            }
                            helperText={
                              touched.greetingMessage && errors.greetingMessage
                            }
                            variant="outlined"
                            margin="dense"
                          />
                        </div>
                      </Grid>

                      <Grid item xs={12} md={12} xl={12}>
                        <div className={classes.fieldWithIcon}>
                          <MessageIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.complationMessage")}
                            multiline
                            rows={4}
                            fullWidth
                            name="complationMessage"
                            error={
                              touched.complationMessage &&
                              Boolean(errors.complationMessage)
                            }
                            helperText={
                              touched.complationMessage && errors.complationMessage
                            }
                            variant="outlined"
                            margin="dense"
                          />
                        </div>
                      </Grid>

                      <Grid item xs={12} md={12} xl={12}>
                        <div className={classes.fieldWithIcon}>
                          <MessageIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.outOfHoursMessage")}
                            multiline
                            rows={4}
                            fullWidth
                            name="outOfHoursMessage"
                            error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                            helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                            variant="outlined"
                            margin="dense"
                          />
                        </div>
                      </Grid>
                      <Grid item xs={12} md={12} xl={12}>
                        <div className={classes.fieldWithIcon}>
                          <MessageIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.collectiveVacationMessage")}
                            multiline
                            rows={4}
                            fullWidth
                            name="collectiveVacationMessage"
                            error={touched.collectiveVacationMessage && Boolean(errors.collectiveVacationMessage)}
                            helperText={touched.collectiveVacationMessage && errors.collectiveVacationMessage}
                            variant="outlined"
                            margin="dense"
                          />
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className={classes.fieldWithIcon}>
                          <ScheduleIcon className={classes.icon} />
                          <Field
                            fullWidth
                            as={TextField}
                            label={i18n.t("whatsappModal.form.collectiveVacationStart")}
                            type="date"
                            name="collectiveVacationStart"
                            required={values.collectiveVacationMessage?.length > 0}
                            inputProps={{
                              min: moment()
                                .add(-10, "days")
                                .format("YYYY-MM-DD"),
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            error={
                              touched.collectiveVacationStart &&
                              Boolean(errors.collectiveVacationStart)
                            }
                            helperText={
                              touched.collectiveVacationStart && errors.collectiveVacationStart
                            }
                            variant="outlined"
                          />
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className={classes.fieldWithIcon}>
                          <ScheduleIcon className={classes.icon} />
                          <Field
                            fullWidth
                            as={TextField}
                            label={i18n.t("whatsappModal.form.collectiveVacationEnd")}
                            type="date"
                            name="collectiveVacationEnd"
                            required={values.collectiveVacationMessage?.length > 0}
                            inputProps={{
                              min: moment()
                                .add(-10, "days")
                                .format("YYYY-MM-DD")
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            error={
                              touched.collectiveVacationEnd &&
                              Boolean(errors.collectiveVacationEnd)
                            }
                            helperText={
                              touched.collectiveVacationEnd && errors.collectiveVacationEnd
                            }
                            variant="outlined"
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </TabPanel>

                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"chatbot"}
                >
                  <DialogContent dividers className={classes.dialogContent}>
                    <Grid spacing={2} container>
                      <Grid xs={6} md={4} item>
                        <div className={classes.fieldWithIcon}>
                          <TimerIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.timeCreateNewTicket")}
                            fullWidth
                            name="timeCreateNewTicket"
                            variant="outlined"
                            margin="dense"
                            error={touched.timeCreateNewTicket && Boolean(errors.timeCreateNewTicket)}
                            helperText={touched.timeCreateNewTicket && errors.timeCreateNewTicket}
                          />
                        </div>
                      </Grid>

                      <Grid xs={6} md={4} item>
                        <div className={classes.fieldWithIcon}>
                          <ChatIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.maxUseBotQueues")}
                            fullWidth
                            name="maxUseBotQueues"
                            variant="outlined"
                            margin="dense"
                            error={touched.maxUseBotQueues && Boolean(errors.maxUseBotQueues)}
                            helperText={touched.maxUseBotQueues && errors.maxUseBotQueues}
                          />
                        </div>
                      </Grid>
                      <Grid xs={6} md={4} item>
                        <div className={classes.fieldWithIcon}>
                          <TimerIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.timeUseBotQueues")}
                            fullWidth
                            name="timeUseBotQueues"
                            variant="outlined"
                            margin="dense"
                            error={touched.timeUseBotQueues && Boolean(errors.timeUseBotQueues)}
                            helperText={touched.timeUseBotQueues && errors.timeUseBotQueues}
                          />
                        </div>
                      </Grid>
                    </Grid>
                    <Grid spacing={2} container>
                      <Grid xs={6} md={6} item>
                        <div className={classes.fieldWithIcon}>
                          <TimerIcon className={classes.icon} />
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.expiresTicket")}
                            fullWidth
                            name="expiresTicket"
                            required={values.timeInactiveMessage > 0}
                            variant="outlined"
                            margin="dense"
                            error={touched.expiresTicket && Boolean(errors.expiresTicket)}
                            helperText={touched.expiresTicket && errors.expiresTicket}
                          />
                        </div>
                      </Grid>
                      <Grid xs={6} md={6} item>
                        <div className={classes.fieldWithIcon}>
                          <SettingsIcon className={classes.icon} />
                          <FormControl
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            className={classes.formControl}
                          >
                            <InputLabel id="whenExpiresTicket-selection-label">
                              {i18n.t("whatsappModal.form.whenExpiresTicket")}
                            </InputLabel>
                            <Field
                              as={Select}
                              label={i18n.t("whatsappModal.form.whenExpiresTicket")}
                              placeholder={i18n.t(
                                "whatsappModal.form.whenExpiresTicket"
                              )}
                              labelId="whenExpiresTicket-selection-label"
                              id="whenExpiresTicket"
                              name="whenExpiresTicket"
                            >
                              <MenuItem value={"0"}>{i18n.t("whatsappModal.form.closeLastMessageOptions1")}</MenuItem>
                              <MenuItem value={"1"}>{i18n.t("whatsappModal.form.closeLastMessageOptions2")}</MenuItem>
                            </Field>
                          </FormControl>
                        </div>
                      </Grid>
                    </Grid>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <MessageIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.expiresInactiveMessage")}
                          multiline
                          rows={4}
                          fullWidth
                          name="expiresInactiveMessage"
                          error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)}
                          helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </div>
                    </div>

                    <div className={classes.fieldWithIcon}>
                      <TimerIcon className={classes.icon} />
                      <Field
                        as={TextField}
                        label={i18n.t("whatsappModal.form.timeInactiveMessage")}
                        fullWidth
                        name="timeInactiveMessage"
                        variant="outlined"
                        margin="dense"
                        error={touched.timeInactiveMessage && Boolean(errors.timeInactiveMessage)}
                        helperText={touched.timeInactiveMessage && errors.timeInactiveMessage}
                      />
                    </div>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <MessageIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.inactiveMessage")}
                          multiline
                          rows={4}
                          fullWidth
                          name="inactiveMessage"
                          error={touched.inactiveMessage && Boolean(errors.inactiveMessage)}
                          helperText={touched.inactiveMessage && errors.inactiveMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </TabPanel>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"nps"}
                >
                  <DialogContent dividers className={classes.dialogContent}>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <MessageIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.ratingMessage")}
                          multiline
                          rows={4}
                          fullWidth
                          name="ratingMessage"
                          error={touched.ratingMessage && Boolean(errors.ratingMessage)}
                          helperText={touched.ratingMessage && errors.ratingMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </div>
                    </div>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <AssessmentIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.maxUseBotQueuesNPS")}
                          fullWidth
                          name="maxUseBotQueuesNPS"
                          variant="outlined"
                          margin="dense"
                          error={touched.maxUseBotQueuesNPS && Boolean(errors.maxUseBotQueuesNPS)}
                          helperText={touched.maxUseBotQueuesNPS && errors.maxUseBotQueuesNPS}
                        />
                      </div>
                    </div>
                    <div>
                      <div className={classes.fieldWithIcon}>
                        <TimerIcon className={classes.icon} />
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.expiresTicketNPS")}
                          fullWidth
                          name="expiresTicketNPS"
                          variant="outlined"
                          margin="dense"
                          error={touched.expiresTicketNPS && Boolean(errors.expiresTicketNPS)}
                          helperText={touched.expiresTicketNPS && errors.expiresTicketNPS}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </TabPanel>
                {showIntegrations && (
                  <>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"flowbuilder"}
                    >
                      <DialogContent className={classes.dialogContent}>
                        <h3>
                          <div className={classes.fieldWithIcon}>
                            <FlowIcon className={classes.icon} />
                            Fluxo de boas vindas
                          </div>
                        </h3>
                        <p>Este fluxo é disparado apenas para novos contatos, pessoas que voce não possui em sua lista de contatos e que mandaram uma mensagem
                        </p>
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          className={classes.FormControl}
                          fullWidth
                        >
                          <Select
                            name="flowIdWelcome"
                            value={flowIdWelcome || ""}
                            onChange={handleChangeFlowIdWelcome}
                            id="flowIdWelcome"
                            variant="outlined"
                            margin="dense"
                            labelId="flowIdWelcome-selection-label">
                            <MenuItem value={null} >{"Desabilitado"}</MenuItem>
                            {webhooks.map(webhook => (
                              <MenuItem key={webhook.id} value={webhook.id}>
                                {webhook.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </DialogContent>
                      <DialogContent className={classes.dialogContent}>
                        <h3>
                          <div className={classes.fieldWithIcon}>
                            <FlowIcon className={classes.icon} />
                            Fluxo de resposta padrão
                          </div>
                        </h3>
                        <p>Resposta Padrão é enviada com qualquer caractere diferente de uma palavra chave. ATENÇÃO! Será disparada se o atendimento ja estiver fechado.
                        </p>
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          className={classes.FormControl}
                          fullWidth
                        >
                          <Select
                            name="flowNotIdPhrase"
                            value={flowIdNotPhrase || ""}
                            onChange={handleChangeFlowIdNotPhrase}
                            id="flowNotIdPhrase"
                            variant="outlined"
                            margin="dense"
                            labelId="flowNotIdPhrase-selection-label">
                            <MenuItem value={null} >{"Desabilitado"}</MenuItem>
                            {webhooks.map(webhook => (
                              <MenuItem key={webhook.id} value={webhook.id}>
                                {webhook.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </DialogContent>
                    </TabPanel>
                  </>
                )}
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"schedules"}
                >
                  {tab === "schedules" && (
                    <Paper style={{ padding: 20 }}>
                      <SchedulesForm
                        loading={false}
                        onSubmit={handleSaveSchedules}
                        initialValues={schedules}
                        labelSaveButton={i18n.t("whatsappModal.buttons.okAdd")}
                      />
                    </Paper>
                  )}
                </TabPanel>
              </Paper>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  style={{
                    color: "white",
                    backgroundColor: "#db6565",
                    boxShadow: "none",
                    borderRadius: "5px",
                    fontSize: "12px",
                  }}
                  disabled={isSubmitting}
                  variant="contained"
                  startIcon={<CancelIcon />}
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.log("🔍 DEBUG - Botão salvar clicado! isSubmitting:", isSubmitting);
                    // Chamar direto o handleSaveWhatsApp sem passar pelo Formik
                    const formValues = { ...values, promptId: selectedPrompt, integrationId: selectedIntegration, name: values.name };
                    handleSaveWhatsApp(formValues);
                  }}
                  style={{
                    color: "white",
                    backgroundColor: "#437db5",
                    boxShadow: "none",
                    borderRadius: "5px",
                    fontSize: "12px",
                  }}
                  disabled={isSubmitting}
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
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
    </div>
  );
};

export default React.memo(WhatsAppModal);