import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Refresh } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  commissionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  commissionAmount: {
    fontWeight: 600,
    color: theme.palette.success.main,
  },
  commissionDetails: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
}));

const AffiliateCommissions = ({ commissions, onRefresh }) => {
  const classes = useStyles();

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovada";
      case "paid":
        return "Paga";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "primary";
      case "paid":
        return "primary";
      case "cancelled":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Comissões ({commissions?.length || 0})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            Atualizar
          </Button>
        </Box>

        {(!commissions || commissions.length === 0) ? (
          <div className={classes.emptyState}>
            <Typography variant="body1" color="textSecondary">
              Nenhuma comissão encontrada.
            </Typography>
          </div>
        ) : (
          commissions.map((commission) => (
            <div key={commission.id} className={classes.commissionItem}>
              <div>
                <Typography variant="body1" className={classes.commissionAmount}>
                  R$ {commission.commissionAmount?.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  {commission.referredCompany?.name || "Empresa não identificada"}
                </Typography>
                <Typography variant="body2" className={classes.commissionDetails}>
                  {formatDate(commission.createdAt)} | Taxa: {commission.commissionRate}%
                </Typography>
              </div>
              <Chip
                size="small"
                label={getStatusText(commission.status)}
                color={getStatusColor(commission.status)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateCommissions;
