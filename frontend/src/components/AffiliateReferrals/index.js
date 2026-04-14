import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Business,
  Person,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  HourglassEmpty,
  TrendingUp,
  Refresh,
} from "@material-ui/icons";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  statsRow: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 140px",
    padding: theme.spacing(2),
    borderRadius: 12,
    textAlign: "center",
    border: `1px solid ${theme.palette.divider}`,
    minWidth: 140,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  statLabel: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: 4,
  },
  referralCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    transition: "box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    },
  },
  referralHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1.5),
  },
  companyName: {
    fontWeight: 600,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  companyIcon: {
    color: theme.palette.primary.main,
    fontSize: 20,
  },
  contactInfo: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    flexWrap: "wrap",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  contactIcon: {
    fontSize: 14,
    color: theme.palette.text.disabled,
  },
  metricsRow: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  metricItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#f0f4f8",
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  metricIcon: {
    fontSize: "1rem",
  },
  metricValue: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: 4,
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
  },
  emptyIcon: {
    fontSize: 64,
    color: theme.palette.text.disabled,
    marginBottom: theme.spacing(2),
  },
  dateText: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  planBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "#e8eaf6",
    color: theme.palette.primary.main,
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: "0.75rem",
    fontWeight: 600,
  },
}));

const statusConfig = {
  teste: { label: "Em Teste", color: "default", icon: HourglassEmpty },
  ativa: { label: "Ativa", color: "primary", icon: CheckCircle },
  inadimplente: { label: "Inadimplente", color: "secondary", icon: Warning },
  inativa: { label: "Inativa", color: "default", icon: ErrorIcon },
};

const AffiliateReferrals = ({ affiliateId, onRefresh }) => {
  const classes = useStyles();
  const [data, setData] = useState({ referrals: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, [affiliateId]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/affiliate/my-referrals");
      setData(response.data || { referrals: [], stats: {} });
    } catch (error) {
      console.error("Error loading referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const { referrals, stats } = data;

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          Empresas Indicadas ({referrals.length})
        </Typography>
        <Tooltip title="Atualizar">
          <IconButton size="small" onClick={loadReferrals}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </div>

      {/* Stats */}
      <div className={classes.statsRow}>
        <div className={classes.statCard}>
          <div className={classes.statValue}>{stats.totalReferrals || 0}</div>
          <div className={classes.statLabel}>Total Indicadas</div>
        </div>
        <div className={classes.statCard} style={{ borderColor: "#4caf50" }}>
          <div className={classes.statValue} style={{ color: "#4caf50" }}>{stats.activeReferrals || 0}</div>
          <div className={classes.statLabel}>Ativas</div>
        </div>
        <div className={classes.statCard} style={{ borderColor: "#ff9800" }}>
          <div className={classes.statValue} style={{ color: "#ff9800" }}>{stats.trialReferrals || 0}</div>
          <div className={classes.statLabel}>Em Teste</div>
        </div>
        <div className={classes.statCard} style={{ borderColor: "#f44336" }}>
          <div className={classes.statValue} style={{ color: "#f44336" }}>{stats.overdueReferrals || 0}</div>
          <div className={classes.statLabel}>Inadimplentes</div>
        </div>
        <div className={classes.statCard} style={{ borderColor: "#2196f3" }}>
          <div className={classes.statValue} style={{ color: "#2196f3" }}>{formatCurrency(stats.totalCommissions)}</div>
          <div className={classes.statLabel}>Total Comissões</div>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <div className={classes.emptyState}>
          <Person className={classes.emptyIcon} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhuma indicação ainda
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Compartilhe seu link de indicação para começar a ganhar comissões!
          </Typography>
        </div>
      ) : (
        referrals.map((referral) => {
          const config = statusConfig[referral.companyStatus] || statusConfig.teste;
          const StatusIcon = config.icon;

          return (
            <div key={referral.id} className={classes.referralCard}>
              <div className={classes.referralHeader}>
                <div>
                  <Typography className={classes.companyName}>
                    <Business className={classes.companyIcon} />
                    {referral.name}
                  </Typography>
                </div>
                <Chip
                  icon={<StatusIcon style={{ fontSize: 16 }} />}
                  label={config.label}
                  color={config.color}
                  size="small"
                  className={classes.statusChip}
                />
              </div>

              {referral.plan && (
                <div style={{ marginBottom: 12 }}>
                  <span className={classes.planBadge}>
                    {referral.plan.name}
                  </span>
                </div>
              )}

              <div className={classes.metricsRow}>
                <div className={classes.metricItem}>
                  <AttachMoney className={classes.metricIcon} style={{ color: "#4caf50" }} />
                  <span className={classes.metricValue}>{formatCurrency(referral.totalCommission)}</span>
                  comissão total
                </div>
                <div className={classes.metricItem}>
                  <HourglassEmpty className={classes.metricIcon} style={{ color: "#ff9800" }} />
                  <span className={classes.metricValue}>{formatCurrency(referral.pendingCommission)}</span>
                  pendente
                </div>
                <div className={classes.metricItem}>
                  <CheckCircle className={classes.metricIcon} style={{ color: "#2196f3" }} />
                  <span className={classes.metricValue}>{referral.faturasPagas}</span>
                  faturas pagas
                </div>
                {referral.faturasVencidas > 0 && (
                  <div className={classes.metricItem}>
                    <Warning className={classes.metricIcon} style={{ color: "#f44336" }} />
                    <span className={classes.metricValue}>{referral.faturasVencidas}</span>
                    vencidas
                  </div>
                )}
                <span className={classes.dateText}>
                  <Schedule style={{ fontSize: 14 }} />
                  Cadastro: {formatDate(referral.createdAt)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AffiliateReferrals;
