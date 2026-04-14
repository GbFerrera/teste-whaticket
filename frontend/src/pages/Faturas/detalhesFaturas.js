import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  makeStyles
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  Edit as EditIcon,
  Payment as PaymentIcon,
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Link as LinkIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import moment from "moment";
import FaturaModal from "../../components/FaturaModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary
  },
  statusChip: {
    fontWeight: 600,
    color: "#fff"
  },
  card: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 600,
    marginBottom: theme.spacing(2)
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.secondary
  },
  infoLabel: {
    fontWeight: 500,
    minWidth: 120
  },
  infoValue: {
    color: theme.palette.text.primary
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400
  }
}));

const formatCurrency = (value) => {
  if (value == null) return "R$ 0,00";
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const calcularDiasAtraso = (dataVencimento) => {
  if (!dataVencimento) return 0;
  const vencimento = moment(dataVencimento);
  const hoje = moment();
  return hoje.diff(vencimento, 'days');
};

const getReferenciaInfo = (tipoReferencia, referenciaId) => {
  if (!tipoReferencia || !referenciaId) return null;
  
  const tipos = {
    'servico': { label: 'Serviço', icon: '🔧' },
    'produto': { label: 'Produto', icon: '📦' },
    'ordem_servico': { label: 'Ordem de Serviço', icon: '📋' }
  };
  
  return tipos[tipoReferencia] || { label: tipoReferencia, icon: '📄' };
};

const DetalhesFaturas = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const [fatura, setFatura] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrosPagamento, setRegistrosPagamento] = useState([]);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFatura();
    }
  }, [id]);

  useEffect(() => {
    if (fatura) {
      fetchRegistrosPagamento();
    }
  }, [fatura]);

  const fetchFatura = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/financeiro/faturas/${id}`);
      setFatura(data);
    } catch (err) {
      toast.error("Erro ao buscar fatura");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrosPagamento = async () => {
    try {
      console.log("🔍 Buscando registros de pagamento para fatura:", id);
      console.log("📊 Fatura atual:", fatura);
      
      // Se a fatura estiver paga, vamos usar os dados dela como registro
      if (fatura && fatura.dataPagamento) {
        const registro = {
          dataPagamento: fatura.dataPagamento,
          valor: fatura.valorPago || fatura.valor,
          formaPagamento: fatura.paymentProvider ? "cartao" : "manual",
          gateway: fatura.paymentProvider,
          idTransacao: fatura.paymentExternalId
        };
        
        console.log("📊 Registro de pagamento criado a partir da fatura:", registro);
        setRegistrosPagamento([registro]);
      } else {
        console.log("⚠️ Fatura não está paga ou não tem dataPagamento");
        
        // Tentar buscar endpoint específico
        try {
          console.log("📡 Tentando buscar endpoint /financeiro/pagamentos?faturaId=", id);
          const { data } = await api.get(`/financeiro/pagamentos?faturaId=${id}`);
          console.log("📊 Registros de pagamento encontrados:", data);
          setRegistrosPagamento(data.pagamentos || []);
        } catch (err) {
          console.log("⚠️ Endpoint não encontrado, usando fallback");
          console.log("💥 Erro do endpoint:", err);
          setRegistrosPagamento([]);
        }
      }
      
    } catch (err) {
      console.error("💥 Erro completo ao buscar registros de pagamento:", err);
      setRegistrosPagamento([]);
    }
  };

  const handleEditFatura = () => {
    setFaturaModalOpen(true);
  };

  const handlePayment = (faturaId) => {
    history.push(`/faturas?payment=${faturaId}`);
  };

  const getPaymentLink = (fatura) => {
    if (fatura.paymentProvider === "asaas" && fatura.paymentLink) {
      return fatura.paymentLink;
    }
    if (fatura.paymentProvider === "mercadopago" && fatura.paymentLink) {
      return fatura.paymentLink;
    }
    return null;
  };

  const getStatusColor = (status) => {
    const colors = {
      aberta: "#f59e0b",
      paga: "#059669",
      vencida: "#dc2626",
      cancelada: "#6b7280"
    };
    return colors[status] || "#6b7280";
  };

  const getStatusLabel = (status) => {
    const labels = {
      aberta: "Aberta",
      paga: "Paga",
      vencida: "Vencida",
      cancelada: "Cancelada"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!fatura) {
    return (
      <Box className={classes.root}>
        <Typography>Fatura não encontrada</Typography>
        <Button onClick={() => history.push("/faturas")}>Voltar</Button>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <IconButton className={classes.backButton} onClick={() => history.push("/faturas")}>
          <ArrowBackIcon />
        </IconButton>
        <Box className={classes.titleContainer}>
          <Typography className={classes.title}>📄 Detalhes da Fatura #{fatura.id}</Typography>
          <Typography className={classes.subtitle}>
            Criada em {fatura.createdAt ? new Date(fatura.createdAt).toLocaleDateString("pt-BR") : "Data não informada"}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(fatura.status)}
          className={classes.statusChip}
          style={{ backgroundColor: getStatusColor(fatura.status) }}
        />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditFatura}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Sessão: Informações do Cliente */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card} style={{ height: '100%' }}>
            <CardContent style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography className={classes.cardTitle}>
                <BusinessIcon color="primary" />
                Informações do Cliente
              </Typography>
              
              <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                <Box className={classes.infoRow} style={{ alignItems: 'flex-start' }}>
                  <BusinessIcon fontSize="small" style={{ marginTop: 2 }} />
                  <span className={classes.infoLabel} style={{ minWidth: 80 }}>Nome:</span>
                  <span className={classes.infoValue}>
                    {fatura.client?.name || fatura.client?.companyName || "Cliente não informado"}
                  </span>
                </Box>

                {fatura.client?.phone && (
                  <Box className={classes.infoRow} style={{ alignItems: 'flex-start' }}>
                    <PhoneIcon fontSize="small" style={{ marginTop: 2 }} />
                    <span className={classes.infoLabel} style={{ minWidth: 80 }}>Telefone:</span>
                    <span className={classes.infoValue}>
                      {fatura.client.phone}
                    </span>
                  </Box>
                )}
                
                {fatura.client?.email && (
                  <Box className={classes.infoRow} style={{ alignItems: 'flex-start' }}>
                    <EmailIcon fontSize="small" style={{ marginTop: 2 }} />
                    <span className={classes.infoLabel} style={{ minWidth: 80 }}>Email:</span>
                    <span className={classes.infoValue}>
                      {fatura.client.email}
                    </span>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessão: Informações da Fatura */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card} style={{ height: '100%' }}>
            <CardContent style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography className={classes.cardTitle}>
                <ReceiptIcon color="primary" />
                Informações da Fatura
              </Typography>
              
              <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                {/* Alerta de dias de atraso */}
                {fatura.status === "aberta" && fatura.dataVencimento && calcularDiasAtraso(fatura.dataVencimento) > 0 && (
                  <Box style={{ marginBottom: 16 }}>
                    <Alert severity="warning">
                      <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon fontSize="small" />
                        <Typography variant="body2">
                          <strong>{calcularDiasAtraso(fatura.dataVencimento)} dias de atraso</strong>
                        </Typography>
                      </Box>
                    </Alert>
                  </Box>
                )}
                
                <Box className={classes.infoRow}>
                  <AttachMoneyIcon fontSize="small" />
                  <span className={classes.infoLabel}>Valor:</span>
                  <span className={classes.infoValue} style={{ fontWeight: 600, color: "#4caf50" }}>
                    {formatCurrency(fatura.valor)}
                  </span>
                </Box>

                <Box className={classes.infoRow}>
                  <CalendarTodayIcon fontSize="small" />
                  <span className={classes.infoLabel}>Vencimento:</span>
                  <span className={classes.infoValue}>
                    {fatura.dataVencimento ? new Date(fatura.dataVencimento).toLocaleDateString("pt-BR") : "-"}
                  </span>
                </Box>

                {fatura.dataPagamento && (
                  <Box className={classes.infoRow}>
                    <CalendarTodayIcon fontSize="small" />
                    <span className={classes.infoLabel}>Pagamento:</span>
                    <span className={classes.infoValue}>
                      {new Date(fatura.dataPagamento).toLocaleDateString("pt-BR")}
                    </span>
                  </Box>
                )}

                <Box className={classes.infoRow}>
                  <AssignmentIcon fontSize="small" />
                  <span className={classes.infoLabel}>Recorrência:</span>
                  <span className={classes.infoValue}>
                    {fatura.tipoRecorrencia === "unica" ? "Única" :
                     fatura.tipoRecorrencia === "mensal" ? "Mensal" :
                     fatura.tipoRecorrencia === "anual" ? "Anual" :
                     fatura.tipoRecorrencia || "-"}
                  </span>
                </Box>

                {fatura.tipoRecorrencia !== "unica" && fatura.quantidadeCiclos && (
                  <Box className={classes.infoRow}>
                    <AssignmentIcon fontSize="small" />
                    <span className={classes.infoLabel}>Ciclos:</span>
                    <span className={classes.infoValue}>
                      {fatura.cicloAtual || 1} / {fatura.quantidadeCiclos}
                    </span>
                  </Box>
                )}

                {fatura.tipoReferencia && fatura.referenciaId && (
                  <Box className={classes.infoRow}>
                    <DescriptionIcon fontSize="small" />
                    <span className={classes.infoLabel}>Referência:</span>
                    <span className={classes.infoValue}>
                      {getReferenciaInfo(fatura.tipoReferencia)?.icon} {getReferenciaInfo(fatura.tipoReferencia)?.label} #{fatura.referenciaId}
                    </span>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessão: Descrição */}
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <InfoIcon color="primary" />
                Descrição
              </Typography>
              
              <Typography variant="body1" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {fatura.descricao || "Sem descrição"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessão: Gateway de Pagamento */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <CreditCardIcon color="primary" />
                Gateway de Pagamento
              </Typography>
              
              <Box className={classes.infoRow}>
                <AccountBalanceIcon fontSize="small" />
                <span className={classes.infoLabel}>Gateway:</span>
                <span className={classes.infoValue}>
                  {fatura.paymentProvider === "asaas" ? "Asaas" : 
                   fatura.paymentProvider === "mercadopago" ? "Mercado Pago" : 
                   "Não gerado"}
                </span>
              </Box>

              {getPaymentLink(fatura) && (
                <Box style={{ marginTop: 16 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LinkIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText(getPaymentLink(fatura));
                      toast.success("Link de pagamento copiado!");
                    }}
                  >
                    Copiar Link de Pagamento
                  </Button>
                </Box>
              )}

              {!getPaymentLink(fatura) && fatura.status !== "paga" && (
                <Box style={{ marginTop: 16 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    startIcon={<LinkIcon />}
                    onClick={() => {
                      // Gerar link de pagamento
                      toast.info("Gerando link de pagamento...");
                    }}
                  >
                    Gerar Link de Pagamento
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sessão: Registros de Pagamentos */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>
                <ReceiptIcon color="primary" />
                Registros de Pagamentos
              </Typography>
              
              {registrosPagamento.length > 0 ? (
                <Box>
                  {registrosPagamento.map((registro, index) => (
                    <Box key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        Pagamento #{index + 1}
                      </Typography>
                      
                      <Box className={classes.infoRow}>
                        <CalendarTodayIcon fontSize="small" />
                        <span className={classes.infoLabel}>Pago em:</span>
                        <span className={classes.infoValue}>
                          {registro.dataPagamento ? new Date(registro.dataPagamento).toLocaleDateString("pt-BR") : "-"}
                        </span>
                      </Box>

                      <Box className={classes.infoRow}>
                        <AttachMoneyIcon fontSize="small" />
                        <span className={classes.infoLabel}>Valor:</span>
                        <span className={classes.infoValue} style={{ fontWeight: 600, color: "#4caf50" }}>
                          {formatCurrency(registro.valor || registro.amount)}
                        </span>
                      </Box>

                      <Box className={classes.infoRow}>
                        <CreditCardIcon fontSize="small" />
                        <span className={classes.infoLabel}>Forma:</span>
                        <span className={classes.infoValue}>
                          {registro.formaPagamento === "cartao" ? "Cartão" : 
                           registro.formaPagamento === "pix" ? "PIX" : 
                           registro.formaPagamento === "boleto" ? "Boleto" : 
                           registro.formaPagamento || "Manual"}
                        </span>
                      </Box>

                      {registro.gateway && (
                        <Box className={classes.infoRow}>
                          <AccountBalanceIcon fontSize="small" />
                          <span className={classes.infoLabel}>Gateway:</span>
                          <span className={classes.infoValue}>
                            {registro.gateway === "asaas" ? "Asaas" : 
                             registro.gateway === "mercadopago" ? "Mercado Pago" : 
                             registro.gateway}
                          </span>
                        </Box>
                      )}

                      {registro.idTransacao && (
                        <Box className={classes.infoRow}>
                          <InfoIcon fontSize="small" />
                          <span className={classes.infoLabel}>ID:</span>
                          <span className={classes.infoValue} style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {registro.idTransacao}
                          </span>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box className={classes.infoRow}>
                  <span className={classes.infoValue} style={{ color: '#999' }}>
                    Nenhum registro de pagamento encontrado
                  </span>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <FaturaModal
        open={faturaModalOpen}
        onClose={() => setFaturaModalOpen(false)}
        fatura={fatura}
        onSaved={(updatedFatura) => {
          setFatura(updatedFatura);
          setFaturaModalOpen(false);
          toast.success("Fatura atualizada com sucesso!");
        }}
      />
    </Box>
  );
};

export default DetalhesFaturas;