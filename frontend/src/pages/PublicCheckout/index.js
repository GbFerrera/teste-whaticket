import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography
} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopyOutlined";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/core/styles";

import { openApi } from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(4, 2)
  },
  card: {
    width: "100%",
    maxWidth: 960,
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "0 45px 100px -50px rgba(15, 23, 42, 0.8)"
  },
  hero: {
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.55), rgba(15,23,42,0.9) 55%)",
    color: "#f8fafc",
    padding: theme.spacing(5, 6, 4, 6),
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  heroTitle: {
    fontSize: "2.1rem",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: theme.spacing(1.5)
  },
  heroSubtitle: {
    color: "rgba(248,250,252,0.7)",
    fontSize: "1rem"
  },
  badge: {
    background: "rgba(15,23,42,0.35)",
    color: "#cbd5f5",
    borderRadius: 999,
    padding: theme.spacing(0.5, 2),
    fontSize: "0.85rem",
    marginBottom: theme.spacing(2.5),
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  content: {
    padding: theme.spacing(4, 5, 5, 5)
  },
  sectionTitle: {
    fontSize: "0.85rem",
    letterSpacing: "0.18em",
    fontWeight: 600,
    color: "#94a3b8"
  },
  amount: {
    fontSize: "3.4rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    lineHeight: 1.1
  },
  gradientBox: {
    padding: theme.spacing(3),
    borderRadius: 22,
    background: "linear-gradient(145deg, #e2e8f0, #ffffff)",
    border: "1px solid rgba(15,23,42,0.05)"
  },
  clientBox: {
    padding: theme.spacing(3),
    borderRadius: 22,
    background: "#0f172a",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.08)",
    minHeight: "100%"
  },
  clientLabel: {
    color: "rgba(248,250,252,0.6)",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  clientValue: {
    color: "#f8fafc",
    fontWeight: 600,
    fontSize: "1.05rem"
  },
  actionArea: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2)
  },
  payButton: {
    flex: 1,
    padding: theme.spacing(1.8, 0),
    borderRadius: 14,
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    color: "#041226",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #06b6d4, #0284c7)"
    }
  },
  copyButton: {
    borderRadius: 14,
    border: "1px solid rgba(4,18,38,0.2)"
  },
  chip: {
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  emptyState: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#f8fafc",
    gap: theme.spacing(2)
  },
  helperText: {
    color: "#94a3b8"
  }
}));

const statusStyles = {
  PENDENTE: { label: "Pendente", color: "#b45309", background: "rgba(245,158,11,0.18)" },
  PAGO: { label: "Pago", color: "#15803d", background: "rgba(34,197,94,0.18)" },
  CANCELADO: { label: "Cancelado", color: "#b91c1c", background: "rgba(248,113,113,0.18)" },
  EXPIRADO: { label: "Expirado", color: "#6b21a8", background: "rgba(192,132,252,0.18)" }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0);

const formatDate = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
};

const getStatusChip = (status) => {
  const normalized = status ? status.toUpperCase() : "DEFAULT";
  const style = statusStyles[normalized] || {
    label: status || "Desconhecido",
    color: "#0f172a",
    background: "rgba(15,23,42,0.12)"
  };

  return (
    <Chip
      size="small"
      label={style.label}
      style={{
        color: style.color,
        backgroundColor: style.background,
        fontWeight: 700,
        letterSpacing: "0.08em"
      }}
    />
  );
};

const PublicCheckout = () => {
  const classes = useStyles();
  const { token } = useParams();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await openApi.request({
        url: `/public/checkout/${token}`,
        method: "GET",
        withCredentials: false
      });
      setCheckoutData(data);
    } catch (err) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Checkout indisponível no momento. Tente novamente mais tarde.");
      }
      setCheckoutData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCheckout();
  }, [fetchCheckout]);

  const handleCopyLink = useCallback(async () => {
    if (!checkoutData?.paymentLink) return;

    try {
      await navigator.clipboard.writeText(checkoutData.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = checkoutData.paymentLink;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [checkoutData]);

  const clientDetails = useMemo(() => {
    if (!checkoutData?.client) return [];

    const {
      name,
      email,
      phone,
      document,
      zipCode,
      address,
      number,
      complement,
      neighborhood,
      city,
      state
    } = checkoutData.client;

    return [
      { label: "Nome", value: name },
      { label: "E-mail", value: email },
      { label: "Telefone", value: phone },
      { label: "Documento", value: document },
      {
        label: "Endereço",
        value: [address, number, complement].filter(Boolean).join(", ") || "-"
      },
      {
        label: "Cidade",
        value: [neighborhood, city, state].filter(Boolean).join(" • ") || "-"
      },
      { label: "CEP", value: zipCode }
    ].filter((entry) => entry.value);
  }, [checkoutData]);

  if (loading) {
    return (
      <Box className={classes.root}>
        <div className={classes.emptyState}>
          <CircularProgress style={{ color: "#e2e8f0" }} />
          <Typography className={classes.helperText}>
            Preparando checkout seguro...
          </Typography>
        </div>
      </Box>
    );
  }

  if (error || !checkoutData) {
    return (
      <Box className={classes.root}>
        <div className={classes.emptyState}>
          <Typography variant="h4" style={{ fontWeight: 700 }}>
            Ops!
          </Typography>
          <Typography variant="body1" className={classes.helperText}>
            {error || "Checkout não encontrado."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchCheckout}
            startIcon={<RefreshIcon />}
          >
            Tentar novamente
          </Button>
        </div>
      </Box>
    );
  }

  const { descricao, valor, dataVencimento, status, paymentProvider, paymentLink } = checkoutData;

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg">
        <Paper className={classes.card}>
          <Box className={classes.hero}>
            <div className={classes.badge}>
              Checkout Seguro • {paymentProvider || "Pagamento"}
            </div>
            <Typography className={classes.heroTitle}>
              {descricao || "Pagamento pendente"}
            </Typography>
            <Typography className={classes.heroSubtitle}>
              Revise seus dados e finalize o pagamento com segurança.
            </Typography>
          </Box>

          <Box className={classes.content}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box className={classes.gradientBox}>
                  <Typography className={classes.sectionTitle}>Resumo</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    {getStatusChip(status)}
                    <Typography variant="body2" color="textSecondary">
                      Vencimento: <strong>{formatDate(dataVencimento)}</strong>
                    </Typography>
                  </Box>

                  <Typography className={classes.amount} component="p" mt={3}>
                    {formatCurrency(valor)}
                  </Typography>

                  <Divider style={{ margin: "24px 0" }} />

                  <Typography variant="body1" color="textSecondary">
                    O pagamento será processado diretamente pelo provedor{" "}
                    <strong>{paymentProvider}</strong>. Após a confirmação, você receberá o
                    comprovante no e-mail cadastrado.
                  </Typography>

                  <Box className={classes.actionArea}>
                    <Button
                      className={classes.payButton}
                      disabled={!paymentLink}
                      onClick={() => window.open(paymentLink, "_blank")}
                    >
                      Acessar checkout
                    </Button>

                    {paymentLink && (
                      <Tooltip title={copied ? "Link copiado!" : "Copiar link"}>
                        <IconButton
                          className={classes.copyButton}
                          onClick={handleCopyLink}
                          color={copied ? "primary" : "default"}
                        >
                          <FileCopyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.clientBox}>
                  <Typography className={classes.sectionTitle} gutterBottom>
                    Seus dados
                  </Typography>
                  <Divider style={{ borderColor: "rgba(148,163,184,0.2)", marginBottom: 16 }} />

                  {clientDetails.length ? (
                    clientDetails.map((detail) => (
                      <Box key={detail.label} mb={2}>
                        <Typography className={classes.clientLabel}>{detail.label}</Typography>
                        <Typography className={classes.clientValue}>{detail.value}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography style={{ color: "rgba(248,250,252,0.7)" }}>
                      Nenhuma informação de cliente disponível.
                    </Typography>
                  )}

                  <Divider style={{ borderColor: "rgba(148,163,184,0.2)", margin: "24px 0 16px" }} />
                  <Typography variant="body2" style={{ color: "rgba(248,250,252,0.6)" }}>
                    Em caso de dúvidas sobre o pagamento, entre em contato com a empresa emissora
                    informando o número da fatura e o documento acima.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicCheckout;
