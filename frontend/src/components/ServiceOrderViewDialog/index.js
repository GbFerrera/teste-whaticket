import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { toast } from "react-toastify";
import { showServiceOrder } from "../../services/serviceOrdersService";
import { STATUS_OPTIONS, statusColors } from "../../constants/serviceOrders";

const useStyles = makeStyles(theme => ({
  titleRoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  section: {
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: "#f8fafc"
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1)
  },
  infoGrid: {
    '& > div': {
      marginBottom: theme.spacing(1)
    }
  },
  itemsWrapper: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    backgroundColor: "#fff"
  },
  dialogContent: {
    backgroundColor: "#f1f5f9"
  }
}));

const currency = value =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const ServiceOrderViewDialog = ({ open, orderId, onClose }) => {
  const classes = useStyles();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !orderId) {
      setOrder(null);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const data = await showServiceOrder(orderId);
        setOrder(data);
      } catch (error) {
        toast.error("Não foi possível carregar os detalhes desta ordem");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, orderId, onClose]);

  const statusLabel = useMemo(() => {
    if (!order) return "";
    return STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status;
  }, [order]);

  const closeDialog = () => {
    setOrder(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeDialog} maxWidth="md" fullWidth>
      <DialogTitle disableTypography>
        <div className={classes.titleRoot}>
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            Detalhes da Ordem
          </Typography>
          <IconButton size="small" onClick={closeDialog}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        {loading || !order ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>Status</Typography>
                <Chip
                  size="small"
                  label={statusLabel}
                  style={{
                    backgroundColor: statusColors[order.status]?.bg || "#e2e8f0",
                    color: statusColors[order.status]?.color || "#1f2937",
                    fontWeight: 600
                  }}
                />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  Atualizado em: {order.updatedAt ? new Date(order.updatedAt).toLocaleString("pt-BR") : "—"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>Cliente</Typography>
                <div className={classes.infoGrid}>
                  <Typography>
                    <strong>Nome:</strong> {order.customer?.name || "—"}
                  </Typography>
                  <Typography>
                    <strong>Contato:</strong> {order.customer?.number || order.customer?.email || "—"}
                  </Typography>
                  <Typography>
                    <strong>Pagamento:</strong> {order.pagamentoTipo || "—"}
                  </Typography>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} md={6}>
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>Entrega & Garantia</Typography>
                <Typography>
                  <strong>Previsão:</strong> {order.entregaPrevista ? new Date(order.entregaPrevista).toLocaleDateString("pt-BR") : "—"}
                </Typography>
                <Typography>
                  <strong>Garantia:</strong> {order.garantiaFlag ? `${order.garantiaPrazoDias || 0} dias` : "Sem garantia"}
                </Typography>
                {order.observacoesCliente && (
                  <Typography style={{ marginTop: 8 }}>
                    <strong>Observações do cliente:</strong> {order.observacoesCliente}
                  </Typography>
                )}
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>Observações internas</Typography>
                <Typography variant="body2" color="textSecondary">
                  {order.observacoesInternas || "Nenhuma observação"}
                </Typography>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div className={classes.itemsWrapper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Qtd.</TableCell>
                      <TableCell align="right">Unitário</TableCell>
                      <TableCell align="right">Desconto</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.itemType === "service" ? "Serviço" : "Produto"}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{currency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{currency(item.discount)}</TableCell>
                        <TableCell align="right">{currency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    {!order.items?.length && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Nenhum item registrado nesta ordem.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Divider />
                <Box display="flex" justifyContent="flex-end" p={2} flexWrap="wrap" gap={16}>
                  <Typography>
                    <strong>Subtotal:</strong> {currency(order.subtotal)}
                  </Typography>
                  <Typography>
                    <strong>Descontos:</strong> {currency(order.descontos)}
                  </Typography>
                  <Typography>
                    <strong>Total:</strong> {currency(order.total)}
                  </Typography>
                </Box>
              </div>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceOrderViewDialog;
