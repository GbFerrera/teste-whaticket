import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
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
}));

const Settings = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

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

      {/* Apenas abas Opções e Horários serão mantidas */}
    </div>
  );
};

export default Settings;
