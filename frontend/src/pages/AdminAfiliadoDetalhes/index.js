import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@material-ui/core";
import {
  ArrowBack,
  Person,
  MonetizationOn,
  TrendingUp,
  Link as LinkIcon,
  Refresh,
  FileCopy
} from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    marginBottom: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: "1.5rem",
  },
  statsCard: {
    height: "100%",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  statLabel: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  tableContainer: {
    marginBottom: theme.spacing(3),
  },
  amountCell: {
    fontWeight: 600,
    color: theme.palette.success.main,
  },
  codeCell: {
    fontFamily: "monospace",
    fontSize: "0.9rem",
  },
  active: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  inactive: {
    backgroundColor: "#fff3e0",
    color: "#e65100",
  },
  suspended: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  pending: {
    backgroundColor: "#fff3e0",
    color: "#e65100",
  },
  approved: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
  paid: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  cancelled: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  rejected: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
  },
  infoLabel: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  infoValue: {
    fontWeight: 500,
  },
  progressBar: {
    marginTop: theme.spacing(1),
    height: 8,
    borderRadius: 4,
  },
}));

const AdminAfiliadoDetalhes = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState(null);

  useEffect(() => {
    if (id) {
      loadAffiliateData();
    }
  }, [id]);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/affiliate/detail/${id}`);
      setAffiliateData(response.data);
    } catch (error) {
      console.error("Error loading affiliate details:", error);
      toast.error("Erro ao carregar detalhes do afiliado");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipClass = (status) => {
    return classes[status] || "";
  };

  const getStatusText = (status) => {
    const map = {
      active: "Ativo",
      inactive: "Inativo",
      suspended: "Suspenso",
      pending: "Pendente",
      approved: "Aprovada",
      paid: "Paga",
      cancelled: "Cancelada",
      rejected: "Rejeitado",
    };
    return map[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!affiliateData || !affiliateData.affiliate) {
    return (
      <Container className={classes.container}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => history.push("/admin/afiliados")}
          style={{ marginBottom: 16 }}
        >
          Voltar
        </Button>
        <Typography variant="h6" color="error">
          Afiliado não encontrado.
        </Typography>
      </Container>
    );
  }

  const { affiliate, links, commissions, withdrawals } = affiliateData;
  const totalEarned = parseFloat(affiliate.totalEarned || 0);
  const totalWithdrawn = parseFloat(affiliate.totalWithdrawn || 0);
  const availableBalance = totalEarned - totalWithdrawn;

  return (
    <Container className={classes.container}>
      {/* Header */}
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => history.push("/admin/afiliados")}
          >
            Voltar
          </Button>
          <Avatar className={classes.avatar}>
            {affiliate.company?.name?.charAt(0) || "A"}
          </Avatar>
          <div>
            <Typography variant="h5">
              {affiliate.company?.name || "Afiliado"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Código: {affiliate.affiliateCode}
            </Typography>
          </div>
          <Chip
            label={getStatusText(affiliate.status)}
            className={getStatusChipClass(affiliate.status)}
            size="small"
          />
        </div>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadAffiliateData}
        >
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <div className={classes.statValue}>
                R$ {totalEarned.toFixed(2)}
              </div>
              <div className={classes.statLabel}>Total Ganho</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <div className={classes.statValue}>
                R$ {totalWithdrawn.toFixed(2)}
              </div>
              <div className={classes.statLabel}>Total Sacado</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <div className={classes.statValue}>
                R$ {availableBalance.toFixed(2)}
              </div>
              <div className={classes.statLabel}>Saldo Disponível</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <div className={classes.statValue}>
                {parseFloat(affiliate.commissionRate || 0)}%
              </div>
              <div className={classes.statLabel}>Taxa de Comissão</div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informações do Afiliado */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informações da Conta</Typography>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Empresa:</span>
                <span className={classes.infoValue}>{affiliate.company?.name || "N/A"}</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Código:</span>
                <span className={classes.infoValue} style={{ fontFamily: "monospace" }}>{affiliate.affiliateCode}</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Taxa de Comissão:</span>
                <span className={classes.infoValue}>{parseFloat(affiliate.commissionRate || 0)}%</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Mínimo para Saque:</span>
                <span className={classes.infoValue}>R$ {parseFloat(affiliate.minWithdrawAmount || 0).toFixed(2)}</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Criado em:</span>
                <span className={classes.infoValue}>{formatDate(affiliate.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Total Ganho:</span>
                <span className={classes.infoValue}>R$ {totalEarned.toFixed(2)}</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Total Sacado:</span>
                <span className={classes.infoValue}>R$ {totalWithdrawn.toFixed(2)}</span>
              </div>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Saldo Disponível:</span>
                <span className={classes.infoValue} style={{ color: "#2e7d32", fontWeight: 700 }}>
                  R$ {availableBalance.toFixed(2)}
                </span>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <Typography variant="body2" color="textSecondary">
                Progresso para próximo saque
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  parseFloat(affiliate.minWithdrawAmount || 0) > 0
                    ? (availableBalance / parseFloat(affiliate.minWithdrawAmount || 1)) * 100
                    : 0,
                  100
                )}
                className={classes.progressBar}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Links */}
      <Typography variant="h6" className={classes.sectionTitle}>
        Links de Indicação ({links?.length || 0})
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>URL</TableCell>
              <TableCell align="center">Cliques</TableCell>
              <TableCell align="center">Cadastros</TableCell>
              <TableCell align="center">Conversões</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links && links.length > 0 ? (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className={classes.codeCell}>{link.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap style={{ maxWidth: 250 }}>
                      {link.url}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{link.clicks}</TableCell>
                  <TableCell align="center">{link.signups}</TableCell>
                  <TableCell align="center">{link.conversions}</TableCell>
                  <TableCell>{formatDate(link.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title="Copiar link">
                      <IconButton size="small" onClick={() => handleCopyLink(link.url)}>
                        <FileCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum link encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comissões */}
      <Typography variant="h6" className={classes.sectionTitle}>
        Comissões ({commissions?.length || 0})
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Taxa</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions && commissions.length > 0 ? (
              commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{formatDate(commission.createdAt)}</TableCell>
                  <TableCell className={classes.amountCell}>
                    R$ {parseFloat(commission.commissionAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{commission.commissionRate}%</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(commission.status)}
                      className={getStatusChipClass(commission.status)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhuma comissão encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Saques */}
      <Typography variant="h6" className={classes.sectionTitle}>
        Saques ({withdrawals?.length || 0})
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Processado em</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals && withdrawals.length > 0 ? (
              withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                  <TableCell className={classes.amountCell}>
                    R$ {parseFloat(withdrawal.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{withdrawal.paymentMethod?.toUpperCase() || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(withdrawal.status)}
                      className={getStatusChipClass(withdrawal.status)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(withdrawal.processedAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum saque encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminAfiliadoDetalhes;
