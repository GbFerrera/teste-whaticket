import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import MomentsUser from "../../components/MomentsUser";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  pageHeader: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  breadcrumb: {
    fontSize: 14,
    color: '#64748b',
    '& span': {
      margin: '0 8px',
      '&:last-child': {
        color: '#3b82f6',
        fontWeight: 500,
      },
    },
  },
  contentCard: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: 24,
    minHeight: 'calc(100vh - 180px)',
    [theme.breakpoints.down('sm')]: {
      padding: 16,
      borderRadius: 12,
    },
  },
}));

const ChatMoments = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  if (user.profile === "user" && user.allowRealTime === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.container}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item>
            <Typography className={classes.pageTitle}>Painel de Atendimentos</Typography>
            <Typography className={classes.pageSubtitle}>
              Acompanhe em tempo real os atendimentos da sua equipe
            </Typography>
          </Grid>
          <Grid item>
            <div className={classes.breadcrumb}>
              Lar <span>›</span> <span>Painel de Atendimentos</span>
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Conteúdo */}
      <div className={classes.contentCard}>
        <MomentsUser />
      </div>
    </div>
  );
};

export default ChatMoments;