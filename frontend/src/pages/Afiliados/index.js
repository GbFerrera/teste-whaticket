import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import {
  AccountBalanceWallet,
  Link,
  Assessment,
  Refresh,
  TrendingUp,
  MonetizationOn,
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import AffiliateLinks from "../../components/AffiliateLinks";
import AffiliateReferrals from "../../components/AffiliateReferrals";
import AffiliateCommissions from "../../components/AffiliateCommissions";
import AffiliateWithdrawals from "../../components/AffiliateWithdrawals";

const useStyles = makeStyles((theme) => ({
  scrollWrapper: {
    height: "100%",
    overflowY: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  statsCardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
  tabPanel: {
    padding: theme.spacing(3),
  },
  linkCard: {
    marginBottom: theme.spacing(2),
    position: "relative",
  },
  linkUrl: {
    fontFamily: "monospace",
    fontSize: "0.875rem",
    wordBreak: "break-all",
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1),
  },
  copyButton: {
    marginTop: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`affiliate-tabpanel-${index}`}
      aria-labelledby={`affiliate-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const AffiliateDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [affiliateInfo, setAffiliateInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notAffiliateDialogOpen, setNotAffiliateDialogOpen] = useState(false);

  useEffect(() => {
    loadAffiliateInfo();
    loadStats();
  }, [refreshKey]);

  const loadAffiliateInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get("/affiliate/my-info");
      setAffiliateInfo(response.data);
      if (!response.data) {
        setNotAffiliateDialogOpen(true);
      } else {
        setNotAffiliateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error loading affiliate info:", error);
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/affiliate/commissions/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
      toastError(error);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado com sucesso!");
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <MainContainer>
        <Container className={classes.container}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </MainContainer>
    );
  }

  if (!affiliateInfo) {
    return (
      <MainContainer>
        <Container className={classes.container}>
          <Dialog
            open={notAffiliateDialogOpen}
            onClose={() => setNotAffiliateDialogOpen(false)}
          >
            <DialogTitle>Programa de afiliados</DialogTitle>
            <DialogContent>
              <Typography>
                Sua empresa ainda não faz parte do programa de afiliados. Entre em contato com o administrador para solicitar o acesso.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNotAffiliateDialogOpen(false)} color="primary">
                Entendi
              </Button>
            </DialogActions>
          </Dialog>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" align="center">
                Você ainda não é um afiliado. Entre em contato com o administrador para se tornar um afiliado.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <div className={classes.scrollWrapper}>
      <Container className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Painel do Afiliado
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Gerencie seus links, acompanhe comissões e solicite saques
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Atualizar
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} style={{ marginBottom: 32 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <CardContent className={classes.statsCardContent}>
                <div>
                  <div className={classes.statItem}>
                    <AccountBalanceWallet className={classes.statIcon} />
                    <div>
                      <div className={classes.statValue}>
                        R$ {parseFloat(stats?.availableBalance || 0).toFixed(2)}
                      </div>
                      <div className={classes.statLabel}>Saldo Disponível</div>
                    </div>
                  </div>
                  <div className={classes.statItem}>
                    <TrendingUp className={classes.statIcon} />
                    <div>
                      <div className={classes.statValue}>
                        R$ {parseFloat(stats?.totalEarned || 0).toFixed(2)}
                      </div>
                      <div className={classes.statLabel}>Total Ganho</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <CardContent className={classes.statsCardContent}>
                <div>
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
                    <Assessment className={classes.statIcon} />
                    <div>
                      <div className={classes.statValue}>
                        {stats?.approved || 0}
                      </div>
                      <div className={classes.statLabel}>Comissões Aprovadas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <CardContent className={classes.statsCardContent}>
                <div>
                  <div className={classes.statItem}>
                    <Link className={classes.statIcon} />
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
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statsCard}>
              <CardContent className={classes.statsCardContent}>
                <div>
                  <div className={classes.statItem}>
                    <AccountBalanceWallet className={classes.statIcon} />
                    <div>
                      <div className={classes.statValue}>
                        {parseFloat(affiliateInfo.commissionRate || 0)}%
                      </div>
                      <div className={classes.statLabel}>Taxa de Comissão</div>
                    </div>
                  </div>
                  <div className={classes.statItem}>
                    <MonetizationOn className={classes.statIcon} />
                    <div>
                      <div className={classes.statValue}>
                        R$ {parseFloat(affiliateInfo.minWithdrawAmount || 0).toFixed(2)}
                      </div>
                      <div className={classes.statLabel}>Mínimo para Saque</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Links de Indicação" />
            <Tab label="Indicações" />
            <Tab label="Comissões" />
            <Tab label="Saques" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <AffiliateLinks
              affiliateId={affiliateInfo.id}
              onRefresh={handleRefresh}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AffiliateReferrals
              affiliateId={affiliateInfo.id}
              onRefresh={handleRefresh}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <AffiliateCommissions
              affiliateId={affiliateInfo.id}
              onRefresh={handleRefresh}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <AffiliateWithdrawals
              affiliateId={affiliateInfo.id}
              minWithdrawAmount={affiliateInfo.minWithdrawAmount}
              onRefresh={handleRefresh}
            />
          </TabPanel>
        </Paper>
      </Container>
      </div>
    </MainContainer>
  );
};

export default AffiliateDashboard;
