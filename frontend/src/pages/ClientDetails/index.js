import React, { useEffect, useMemo, useState, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import RefreshIcon from "@material-ui/icons/Refresh";
import ReceiptIcon from "@material-ui/icons/Receipt";
import PaymentIcon from "@material-ui/icons/Payment";
import TimelineIcon from "@material-ui/icons/Timeline";
import EventNoteIcon from "@material-ui/icons/EventNote";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import BarChartIcon from "@material-ui/icons/BarChart";
import DescriptionIcon from "@material-ui/icons/Description";
import SearchIcon from "@material-ui/icons/Search";
import EditIcon from "@material-ui/icons/Edit";

import api from "../../services/api";
import { listFinanceiroFaturas } from "../../services/financeiroFaturas";
import toastError from "../../errors/toastError";
import FaturaModal from "../../components/FaturaModal";
import PagamentoModal from "../../components/PagamentoModal";
import ClientModal from "../../components/ClientModal";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    padding: theme.spacing(4),
    background: theme.palette.type === "light"
      ? "linear-gradient(135deg, #f5f7ff 0%, #ffffff 60%)"
      : theme.palette.background.default,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2)
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    flexWrap: "wrap"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  backButton: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)"
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: "24px",
    backgroundColor: theme.palette.primary.light,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.contrastText,
    fontSize: 28,
    fontWeight: 600
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  statusChip: {
    alignSelf: "flex-start",
    marginTop: theme.spacing(1)
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      "& > *": {
        flex: 1
      }
    }
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: "0 20px 60px rgba(15,23,42,0.12)"
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  infoGrid: {
    marginTop: theme.spacing(2)
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.type === "light" ? "#f8fafc" : "#1f2937",
    borderRadius: 12
  },
  infoLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    letterSpacing: 1
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  tabsContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
    overflow: "hidden"
  },
  tabs: {
    padding: theme.spacing(0, 2),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  tabPanel: {
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2)
    }
  },
  faturaCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5)
  },
  faturaHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(1)
  },
  faturaActions: {
    display: "flex",
    gap: theme.spacing(1)
  },
  metricsGrid: {
    marginTop: theme.spacing(2)
  },
  metricCard: {
    padding: theme.spacing(2),
    borderRadius: 20,
    background: "linear-gradient(135deg, #eef2ff, #fdf2f8)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 140,
    color: "#1e1b4b",
    "&.success": {
      background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
      color: "#064e3b"
    },
    "&.warning": {
      background: "linear-gradient(135deg, #fff7ed, #fffbeb)",
      color: "#78350f"
    }
  },
  metricLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.7
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  timelineItem: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "flex-start"
  },
  timelineBar: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    marginTop: 6
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  filtersRow: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    marginBottom: theme.spacing(2)
  },
  filterField: {
    minWidth: 220,
    [theme.breakpoints.down("sm")]: {
      flex: 1,
      minWidth: "unset"
    }
  },
  loadMoreBox: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2)
  }
}));

const STATUS_COLORS = {
  active: "#059669",
  inactive: "#6b7280",
  blocked: "#dc2626"
};

const ClientDetails = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();
  const { clientId } = useParams();

  const { socket, user } = useContext(AuthContext);
  const [tab, setTab] = useState("overview");
  const [client, setClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [faturas, setFaturas] = useState([]);
  const [faturasLoading, setFaturasLoading] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [paymentFatura, setPaymentFatura] = useState(null);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [faturasPage, setFaturasPage] = useState(1);
  const [faturasHasMore, setFaturasHasMore] = useState(false);
  const [faturasFilters, setFaturasFilters] = useState({
    search: "",
    status: ""
  });
  const [faturasSearchInput, setFaturasSearchInput] = useState("");

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  useEffect(() => {
    setFaturasPage(1);
    setFaturasFilters({ search: "", status: "" });
    setFaturasSearchInput("");
  }, [clientId]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFaturasFilters((prev) => ({
        ...prev,
        search: faturasSearchInput
      }));
      setFaturasPage(1);
    }, 350);

    return () => clearTimeout(debounce);
  }, [faturasSearchInput]);

  useEffect(() => {
    if (!clientId) return;
    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setFaturasLoading(true);
        const data = await listFinanceiroFaturas({
          clientId,
          pageNumber: faturasPage,
          searchParam: faturasFilters.search || undefined,
          status: faturasFilters.status || undefined
        });
        if (!isMounted) return;
        const fetched = data.faturamentos || [];
        setFaturas((prev) => {
          if (faturasPage === 1) {
            return fetched;
          }
          const existing = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          fetched.forEach((item) => {
            if (!existing.has(item.id)) {
              merged.push(item);
            }
          });
          return merged;
        });
        setFaturasHasMore(Boolean(data.hasMore));
      } catch (err) {
        if (err.name !== "CanceledError") {
          toastError(err);
        }
      } finally {
        if (isMounted) {
          setFaturasLoading(false);
        }
      }
    };

    if (faturasPage === 1) {
      setFaturas([]);
    }

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [clientId, faturasPage, faturasFilters, refreshToken]);

  useEffect(() => {
    if (!socket || !user?.companyId) return;
    const eventName = `company-${user.companyId}-financeiro`;

    const upsertFatura = newFatura => {
      if (!newFatura || String(newFatura.clientId) !== String(clientId)) return;
      setFaturas(prev => {
        const next = [...prev];
        const index = next.findIndex(item => item.id === newFatura.id);
        if (index > -1) {
          next[index] = newFatura;
        } else {
          next.unshift(newFatura);
        }
        return next;
      });
    };

    const handler = ({ action, payload }) => {
      if (!payload) return;
      switch (action) {
        case "fatura:created":
        case "fatura:updated":
          upsertFatura(payload);
          break;
        case "fatura:deleted":
          if (payload.id) {
            setFaturas(prev => prev.filter(item => item.id !== payload.id));
          }
          break;
        case "pagamento:created":
        case "pagamento:updated":
        case "pagamento:deleted":
          if (payload.fatura) {
            upsertFatura(payload.fatura);
          }
          break;
        default:
          break;
      }
    };

    socket.on(eventName, handler);
    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, user?.companyId, clientId]);

  const fetchClient = async () => {
    try {
      setClientLoading(true);
      const { data } = await api.get(`/crm/clients/${clientId}`);
      setClient(data);
    } catch (err) {
      toastError(err);
    } finally {
      setClientLoading(false);
    }
  };

  const refreshData = () => {
    setFaturasPage(1);
    setRefreshToken((prev) => prev + 1);
    fetchClient();
  };

  const handleOpenFaturaModal = (fatura = null) => {
    if (fatura) {
      setSelectedFatura(fatura);
    } else if (client) {
      setSelectedFatura({
        clientId: client.id,
        client,
        descricao: "",
        valor: ""
      });
    }
    setFaturaModalOpen(true);
  };

  const handleCloseFaturaModal = () => {
    setSelectedFatura(null);
    setFaturaModalOpen(false);
  };

  const handleSavedFatura = () => {
    handleCloseFaturaModal();
    refreshData();
  };

  const handleOpenPaymentModal = (fatura) => {
    setPaymentFatura(fatura);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentFatura(null);
    refreshData();
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      if (typeof value === "string") {
        const isoPart = value.split("T")[0];
        const [year, month, day] = isoPart.split("-");
        if (year && month && day) {
          return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR");
        }
      }
      return new Date(value).toLocaleDateString("pt-BR");
    } catch {
      return value;
    }
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const clientInitials = useMemo(() => {
    if (!client?.name) return "CL";
    const parts = client.name.trim().split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [client]);

  const relatorioStats = useMemo(() => {
    if (!faturas?.length) {
      return {
        total: 0,
        totalValor: 0,
        totalPago: 0,
        aberto: 0,
        porStatus: {}
      };
    }
    const porStatus = faturas.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const totalValor = faturas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const totalPago = faturas.reduce((sum, item) => sum + Number(item.valorPago || 0), 0);
    return {
      total: faturas.length,
      totalValor,
      totalPago,
      aberto: Math.max(totalValor - totalPago, 0),
      porStatus
    };
  }, [faturas]);

  const recentTimeline = useMemo(() => {
    if (!faturas?.length) return [];
    return [...faturas]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 5)
      .map((fatura) => ({
        id: fatura.id,
        title: `Fatura ${fatura.status}`,
        date: formatDate(fatura.updatedAt || fatura.createdAt),
        description: `${formatCurrency(fatura.valor)} • venc. ${formatDate(fatura.dataVencimento)}`
      }));
  }, [faturas]);

  const renderProfileHighlights = () => (
    <Paper className={classes.card}>
      <Typography variant="h6" className={classes.sectionTitle}>
        <PersonOutlineIcon /> Informações principais
      </Typography>
      <Grid container spacing={2} className={classes.infoGrid}>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Nome</span>
            <span className={classes.infoValue}>{client?.name || client?.companyName || "Não informado"}</span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Documento</span>
            <span className={classes.infoValue}>{client?.document || "Não informado"}</span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Email</span>
            <span className={classes.infoValue}>{client?.email || "Não informado"}</span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Telefone</span>
            <span className={classes.infoValue}>{client?.phone || "Não informado"}</span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Tipo</span>
            <span className={classes.infoValue}>
              {client?.type === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
            </span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Cliente desde</span>
            <span className={classes.infoValue}>{formatDate(client?.clientSince) || "—"}</span>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className={classes.infoItem}>
            <span className={classes.infoLabel}>Data de nascimento</span>
            <span className={classes.infoValue}>{formatDate(client?.birthDate) || "—"}</span>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Paper className={classes.card}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <TimelineIcon /> Perfil do cliente
          </Typography>
          <Grid container spacing={2} className={classes.infoGrid}>
            <Grid item xs={12} sm={6}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Nome completo</span>
                <span className={classes.infoValue}>{client?.name || "Não informado"}</span>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Documento</span>
                <span className={classes.infoValue}>{client?.document || "Não informado"}</span>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Email</span>
                <span className={classes.infoValue}>{client?.email || "Não informado"}</span>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Telefone</span>
                <span className={classes.infoValue}>{client?.phone || "Não informado"}</span>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Endereço</span>
                <span className={classes.infoValue}>
                  {client?.address
                    ? `${client.address}, ${client.number || "s/n"} - ${client.city || ""} ${client.state || ""}`
                    : "Endereço não cadastrado"}
                </span>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Notas</span>
                <span className={classes.infoValue}>{client?.notes || "Sem observações adicionais."}</span>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.infoItem}>
                <span className={classes.infoLabel}>Data de nascimento</span>
                <span className={classes.infoValue}>{formatDate(client?.birthDate) || "—"}</span>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper className={classes.card}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <EventNoteIcon /> Atividade recente
          </Typography>
          {recentTimeline.length === 0 ? (
            <Box className={classes.emptyState}>
              Nenhuma movimentação recente para este cliente.
            </Box>
          ) : (
            <Box className={classes.timeline}>
              {recentTimeline.map((item) => (
                <Box key={item.id} className={classes.timelineItem}>
                  <span className={classes.timelineBar} />
                  <Box>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.date}
                    </Typography>
                    <Typography variant="body2">{item.description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  const renderFaturas = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gridGap={16}>
        <Typography variant="h6">Faturas deste cliente</Typography>
        <Box display="flex" gap={8}>
          <Button startIcon={<RefreshIcon />} onClick={refreshData}>
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={() => handleOpenFaturaModal(null)}
            disabled={!client}
          >
            Nova fatura
          </Button>
        </Box>
      </Box>
      <Box className={classes.filtersRow}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por descrição ou status"
          value={faturasSearchInput}
          onChange={(event) => setFaturasSearchInput(event.target.value)}
          className={classes.filterField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          variant="outlined"
          size="small"
          label="Status"
          value={faturasFilters.status}
          onChange={(event) => {
            setFaturasFilters((prev) => ({
              ...prev,
              status: event.target.value
            }));
            setFaturasPage(1);
          }}
          className={classes.filterField}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="aberta">Aberta</MenuItem>
          <MenuItem value="paga">Paga</MenuItem>
          <MenuItem value="vencida">Vencida</MenuItem>
          <MenuItem value="cancelada">Cancelada</MenuItem>
        </TextField>
      </Box>
      {faturasLoading ? (
        <Box className={classes.emptyState}>
          <CircularProgress size={28} />
        </Box>
      ) : faturas.length === 0 ? (
        <Box className={classes.emptyState}>
          Nenhuma fatura criada para este cliente ainda.
        </Box>
      ) : (
        <>
          {faturas.map((fatura) => (
            <Box key={fatura.id} className={classes.faturaCard}>
              <Box className={classes.faturaHeader}>
                <Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                    #{fatura.id} • {fatura.descricao}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Vencimento: {formatDate(fatura.dataVencimento)} • Valor: {formatCurrency(fatura.valor)}
                  </Typography>
                </Box>
                <Chip
                  label={fatura.status || "aberta"}
                  style={{ backgroundColor: "#eef2ff", textTransform: "capitalize" }}
                />
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gridGap={16}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Pago
                  </Typography>
                  <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                    {formatCurrency(fatura.valorPago || 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Última atualização
                  </Typography>
                  <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                    {formatDate(fatura.updatedAt || fatura.createdAt)}
                  </Typography>
                </Box>
                <Box className={classes.faturaActions}>
                  <Tooltip title="Editar fatura">
                    <IconButton onClick={() => handleOpenFaturaModal(fatura)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Pagamentos">
                    <IconButton onClick={() => handleOpenPaymentModal(fatura)}>
                      <PaymentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
          {faturasHasMore && (
            <Box className={classes.loadMoreBox}>
              <Button onClick={() => setFaturasPage((prev) => prev + 1)} disabled={faturasLoading}>
                Carregar mais
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const renderRelatorios = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Relatórios financeiros
      </Typography>
      <Grid container spacing={3} className={classes.metricsGrid}>
        <Grid item xs={12} md={4}>
          <Box className={`${classes.metricCard} success`}>
            <span className={classes.metricLabel}>Receita total</span>
            <span className={classes.metricValue}>{formatCurrency(relatorioStats.totalValor)}</span>
            <Typography variant="body2">Somatório de todas as faturas emitidas.</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box className={`${classes.metricCard}`}>
            <span className={classes.metricLabel}>Valor recebido</span>
            <span className={classes.metricValue}>{formatCurrency(relatorioStats.totalPago)}</span>
            <Typography variant="body2">Pagamentos registrados até o momento.</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box className={`${classes.metricCard} warning`}>
            <span className={classes.metricLabel}>Em aberto</span>
            <span className={classes.metricValue}>{formatCurrency(relatorioStats.aberto)}</span>
            <Typography variant="body2">Diferença entre o emitido e o recebido.</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} style={{ marginTop: 16 }}>
        <Grid item xs={12} md={6}>
          <Paper style={{ borderRadius: 20, padding: 24 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribuição por status
            </Typography>
            {Object.keys(relatorioStats.porStatus).length === 0 ? (
              <Typography color="textSecondary">Nenhuma fatura para exibir.</Typography>
            ) : (
              Object.entries(relatorioStats.porStatus).map(([status, quantity]) => (
                <Box key={status} display="flex" justifyContent="space-between" py={1}>
                  <Typography style={{ textTransform: "capitalize" }}>{status}</Typography>
                  <Typography>{quantity} fatura(s)</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ borderRadius: 20, padding: 24 }}>
            <Typography variant="subtitle1" gutterBottom>
              Últimas movimentações
            </Typography>
            {recentTimeline.length === 0 ? (
              <Typography color="textSecondary">Sem movimentações.</Typography>
            ) : (
              recentTimeline.map((item) => (
                <Box key={item.id} py={1}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.date}
                  </Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  if (clientLoading) {
    return (
      <Box className={classes.root} justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box className={classes.root} justifyContent="center" alignItems="center">
        <Paper className={classes.card}>
          <Typography variant="h6">Cliente não encontrado</Typography>
          <Button onClick={() => history.push("/clientes")} style={{ marginTop: 16 }}>
            Voltar para clientes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <IconButton className={classes.backButton} onClick={() => history.push("/clientes")}>
            <ArrowBackIcon />
          </IconButton>
          <Box className={classes.avatarWrapper}>
            <span>{clientInitials}</span>
          </Box>
          <Box className={classes.headerInfo}>
            <Typography variant="h5" style={{ fontWeight: 700 }}>
              {client.name || client.companyName || `Cliente #${client.id}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cliente desde {formatDate(client.clientSince) || "–"}
            </Typography>
            <Chip
              label={client.status || "active"}
              className={classes.statusChip}
              style={{
                backgroundColor: STATUS_COLORS[client.status] || STATUS_COLORS.active,
                color: "#fff",
                textTransform: "capitalize"
              }}
            />
          </Box>
        </Box>
        <Box className={classes.actions}>
          <Button variant="outlined" onClick={() => history.push("/clientes")}>
            Voltar
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setClientModalOpen(true)}
          >
            Editar cliente
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={() => handleOpenFaturaModal(null)}
          >
            Nova fatura
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {renderProfileHighlights()}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.card}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Resumo financeiro
            </Typography>
            <Box className={classes.infoItem}>
              <span className={classes.infoLabel}>Faturas</span>
              <span className={classes.infoValue}>{relatorioStats.total} registradas</span>
            </Box>
            <Box className={classes.infoItem}>
              <span className={classes.infoLabel}>Valor emitido</span>
              <span className={classes.infoValue}>{formatCurrency(relatorioStats.totalValor)}</span>
            </Box>
            <Box className={classes.infoItem}>
              <span className={classes.infoLabel}>Recebido</span>
              <span className={classes.infoValue}>{formatCurrency(relatorioStats.totalPago)}</span>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box className={classes.tabsContainer}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : "off"}
          className={classes.tabs}
        >
          <Tab label="Resumo" value="overview" />
          <Tab label="Faturas" value="faturas" />
          <Tab label="Relatórios" value="relatorios" />
        </Tabs>
        <Box className={classes.tabPanel}>
          {tab === "overview" && renderOverviewTab()}
          {tab === "faturas" && renderFaturas()}
          {tab === "relatorios" && renderRelatorios()}
        </Box>
      </Box>

      <FaturaModal
        open={faturaModalOpen}
        onClose={handleCloseFaturaModal}
        fatura={selectedFatura}
        onSaved={handleSavedFatura}
      />

      <PagamentoModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        fatura={paymentFatura}
      />

      <ClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        clientId={client?.id || null}
        onSuccess={() => {
          setClientModalOpen(false);
          fetchClient();
        }}
      />
    </Box>
  );
};

export default ClientDetails;
