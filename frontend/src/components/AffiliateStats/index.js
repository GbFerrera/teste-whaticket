import React from "react";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  AccountBalanceWallet,
  TrendingUp,
  People,
  MonetizationOn,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  statCard: {
    height: "100%",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  statIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  statLabel: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
}));

const AffiliateStats = ({ stats }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card className={classes.statCard}>
          <CardContent>
            <div className={classes.statItem}>
              <AccountBalanceWallet className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  R$ {stats?.availableBalance?.toFixed(2) || "0,00"}
                </div>
                <div className={classes.statLabel}>Saldo Disponível</div>
              </div>
            </div>
            <div className={classes.statItem}>
              <TrendingUp className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  R$ {stats?.totalEarned?.toFixed(2) || "0,00"}
                </div>
                <div className={classes.statLabel}>Total Ganho</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className={classes.statCard}>
          <CardContent>
            <div className={classes.statItem}>
              <MonetizationOn className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  {stats?.pending || 0}
                </div>
                <div className={classes.statLabel}>Comissões Pendentes</div>
              </div>
            </div>
            <div className={classes.statItem}>
              <MonetizationOn className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  {stats?.approved || 0}
                </div>
                <div className={classes.statLabel}>Comissões Aprovadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className={classes.statCard}>
          <CardContent>
            <div className={classes.statItem}>
              <People className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  {stats?.conversions || 0}
                </div>
                <div className={classes.statLabel}>Conversões</div>
              </div>
            </div>
            <div className={classes.statItem}>
              <TrendingUp className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  {stats?.clicks || 0}
                </div>
                <div className={classes.statLabel}>Cliques</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className={classes.statCard}>
          <CardContent>
            <div className={classes.statItem}>
              <AccountBalanceWallet className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  {stats?.commissionRate || 0}%
                </div>
                <div className={classes.statLabel}>Taxa de Comissão</div>
              </div>
            </div>
            <div className={classes.statItem}>
              <MonetizationOn className={classes.statIcon} />
              <div>
                <div className={classes.statValue}>
                  R$ {stats?.minWithdrawAmount?.toFixed(2) || "0,00"}
                </div>
                <div className={classes.statLabel}>Mínimo para Saque</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AffiliateStats;
