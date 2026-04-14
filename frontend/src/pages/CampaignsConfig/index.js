import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

import SettingsIcon from "@material-ui/icons/Settings";
import SaveIcon from "@material-ui/icons/Save";
import TimerIcon from "@material-ui/icons/Timer";

import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#1976d2",
    },
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
  content: {
    flex: 1,
    padding: "24px",
  },
  configCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    "& svg": {
      color: "#1976d2",
    },
  },
  sectionTitleText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  fieldsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  fieldWrapper: {
    flex: "1 1 280px",
    minWidth: 280,
  },
  formControl: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  saveButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 24px",
    textTransform: "none",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
  sabado: "false",
  domingo: "false",
  startHour: "09:00",
  endHour: "18:00"
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const history = useHistory();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const { user, socket } = useContext(AuthContext);

  const [sabado, setSabado] = React.useState(false);
  const [domingo, setDomingo] = React.useState(false);

  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("19:00");

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      console.log(data)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, item.value]);
          if (item.key === "sabado") setSabado(item?.value === "true");
          if (item.key === "domingo") setDomingo(item?.value === "true");
          if (item.key === "startHour") setStartHour(item?.value);
          if (item.key === "endHour") setEndHour(item?.value);

        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      if (!Array.isArray(prev.variables)) {
        // Lidar com o caso em que prev.variables não é um array
        return { ...prev, variables: [Object.assign({}, variable)] };
      }
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  const handleChange = (event) => {
    if (event.target.name === "sabado") {
      setSabado(event.target.checked);
    }
    if (event.target.name === "domingo") {
      setDomingo(event.target.checked);
    }
  };

  const handleSaveTimeMass = async () => {
    let settings = {
      sabado: sabado,
      domingo: domingo,
      startHour: startHour,
      endHour: endHour
    }

    try {
      await api.post(`/campaign-settings/`, { settings });

      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <Box className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <SettingsIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>
              {i18n.t("campaignsConfig.title")}
            </Typography>
            <Typography className={classes.headerSubtitle}>
              Configure os intervalos de disparo das campanhas
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        <Box className={classes.configCard}>
          {/* Section Title */}
          <Box className={classes.sectionTitle}>
            <TimerIcon />
            <Typography className={classes.sectionTitleText}>
              Intervalos de Disparo
            </Typography>
          </Box>

          {/* Fields */}
          <Box className={classes.fieldsContainer}>
            <Box className={classes.fieldWrapper}>
              <FormControl
                variant="outlined"
                className={classes.formControl}
              >
                <InputLabel id="messageInterval-label">
                  {i18n.t("campaigns.settings.randomInterval")}
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label={i18n.t("campaigns.settings.randomInterval")}
                  value={settings.messageInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={60}>40 segundos</MenuItem>
                  <MenuItem value={70}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.fieldWrapper}>
              <FormControl
                variant="outlined"
                className={classes.formControl}
              >
                <InputLabel id="longerIntervalAfter-label">
                  {i18n.t("campaigns.settings.intervalGapAfter")}
                </InputLabel>
                <Select
                  name="longerIntervalAfter"
                  id="longerIntervalAfter"
                  labelId="longerIntervalAfter-label"
                  label={i18n.t("campaigns.settings.intervalGapAfter")}
                  value={settings.longerIntervalAfter}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.undefined")}</MenuItem>
                  <MenuItem value={5}>5 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={10}>10 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={15}>15 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={20}>20 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={30}>30 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={40}>40 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={50}>50 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  <MenuItem value={60}>60 {i18n.t("campaigns.settings.messages")}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.fieldWrapper}>
              <FormControl
                variant="outlined"
                className={classes.formControl}
              >
                <InputLabel id="greaterInterval-label">
                  {i18n.t("campaigns.settings.laggerTriggerRange")}
                </InputLabel>
                <Select
                  name="greaterInterval"
                  id="greaterInterval"
                  labelId="greaterInterval-label"
                  label={i18n.t("campaigns.settings.laggerTriggerRange")}
                  value={settings.greaterInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={50}>50 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                  <MenuItem value={70}>70 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={90}>90 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={110}>110 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                  <MenuItem value={130}>130 segundos</MenuItem>
                  <MenuItem value={140}>140 segundos</MenuItem>
                  <MenuItem value={150}>150 segundos</MenuItem>
                  <MenuItem value={160}>160 segundos</MenuItem>
                  <MenuItem value={170}>170 segundos</MenuItem>
                  <MenuItem value={180}>180 segundos</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Save Button */}
          <Box className={classes.actionsContainer}>
            <Button
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              className={classes.saveButton}
              variant="contained"
            >
              {i18n.t("campaigns.settings.save")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignsConfig;
