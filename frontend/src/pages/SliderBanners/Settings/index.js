import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Select,
  Box,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ViewCarouselIcon from "@material-ui/icons/ViewCarousel";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    width: "100%",
    margin: 0,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9",
    gap: 16,
    marginBottom: 12
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24
    }
  },
  cardInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  cardDescription: {
    fontSize: "0.85rem",
    color: "#666"
  },
  selectControl: {
    minWidth: 150,
    "& .MuiSelect-select": {
      padding: "10px 14px",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      "&:focus": {
        backgroundColor: "#f5f5f5",
        borderRadius: 8
      }
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #e0e0e0",
      borderRadius: 8
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#7c4dff"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#7c4dff"
    }
  }
}));

const Settings = () => {
  const classes = useStyles();
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const [settings, setSettings] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    // const socket = socketManager.GetSocket();

    const onSettingsEvent = (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    };
    socket.on(`company-${companyId}-settings`, onSettingsEvent);

    return () => {
      socket.off(`company-${companyId}-settings`, onSettingsEvent);
    };
  }, [socket]);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;

    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const { value } = settings.find((s) => s.key === key);
    return value;
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.container}>
      <div className={classes.pageHeader}>
        <Typography className={classes.pageTitle}>Configurações</Typography>
        <Typography className={classes.pageSubtitle}>
          Gerencie as configurações do sistema
        </Typography>
      </div>

      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>Geral</Typography>

        <Box className={classes.card}>
          <Box
            className={classes.cardIcon}
            style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
          >
            <PersonAddIcon />
          </Box>
          <Box className={classes.cardInfo}>
            <Typography className={classes.cardTitle}>
              {i18n.t("settings.settings.userCreation.name")}
            </Typography>
            <Typography className={classes.cardDescription}>
              Permitir que usuários criem novas contas
            </Typography>
          </Box>
          <FormControl variant="outlined" className={classes.selectControl}>
            <Select
              id="userCreation-setting"
              name="userCreation"
              value={
                settings && settings.length > 0 ? getSettingValue("userCreation") : ""
              }
              onChange={handleChangeSetting}
            >
              <MenuItem value="enabled">
                {i18n.t("settings.settings.userCreation.options.enabled")}
              </MenuItem>
              <MenuItem value="disabled">
                {i18n.t("settings.settings.userCreation.options.disabled")}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {user.profile === "super" && (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Super Admin</Typography>

          <Box className={classes.card}>
            <Box
              className={classes.cardIcon}
              style={{ backgroundColor: "#fff3e0", color: "#ff9800" }}
            >
              <ViewCarouselIcon />
            </Box>
            <Box className={classes.cardInfo}>
              <Typography className={classes.cardTitle}>
                Slider / Banners
              </Typography>
              <Typography className={classes.cardDescription}>
                Área para gestão de banners do slider (apenas Super Admin)
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Settings;
