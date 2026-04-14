import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";
import EditIcon from "@material-ui/icons/Edit";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import ReceiptIcon from "@material-ui/icons/Receipt";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { toast } from "react-toastify";
import { listServiceOrders, deleteServiceOrder } from "../../services/serviceOrdersService";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ServiceOrderModal from "../../components/ServiceOrderModal";
import ServiceOrderViewDialog from "../../components/ServiceOrderViewDialog";
import ServiceOrderStatusDialog from "../../components/ServiceOrderStatusDialog";
import FaturaModal from "../../components/FaturaModal";
import { STATUS_OPTIONS, statusColors } from "../../constants/serviceOrders";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  searchField: {
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" }
    }
  },
  selectField: {
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 8
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600
  },
  content: {
    padding: "0 24px 16px"
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
  },
  tableHead: {
    backgroundColor: "var(--sidebar-color, #1e293b)",
    "& th": {
      color: "#cbd5e1",
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "none",
      padding: "14px 16px"
    }
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9"
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc"
    }
  },
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999"
  },
  loadMore: {
    marginTop: theme.spacing(2),
    alignSelf: "center"
  }
}));

const currency = value =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value) || 0
  );

const ServiceOrdersPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#1e293b";
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [viewingOrderId, setViewingOrderId] = useState(null);
  const [statusDialogOrder, setStatusDialogOrder] = useState(null);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [faturaInitialData, setFaturaInitialData] = useState(null);

  const fetchOrders = useCallback(
    async (page = 1, append = false) => {
      setLoading(true);
      try {
        const params = {
          searchParam: search || undefined,
          status: statusFilter || undefined,
          pageNumber: page,
          limit: 15
        };
        const data = await listServiceOrders(params);
        setOrders(prev => (append ? [...prev, ...data.serviceOrders] : data.serviceOrders));
        setHasMore(data.hasMore);
        setPageNumber(page);
      } catch (error) {
        toast.error("Não foi possível carregar as ordens de serviço");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchOrders(1, false);
    }, 300);
    return () => clearTimeout(delay);
  }, [fetchOrders]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchOrders(pageNumber + 1, true);
    }
  };

  const upsertOrderInList = useCallback(orderToPersist => {
    setOrders(prev => {
      const index = prev.findIndex(entry => entry.id === orderToPersist.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = orderToPersist;
        return next;
      }
      return [orderToPersist, ...prev];
    });
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingOrderId(null);
  };

  const handleOrderSavedFromModal = savedOrder => {
    const wasEditing = Boolean(editingOrderId);
    upsertOrderInList(savedOrder);
    setModalOpen(false);
    setEditingOrderId(null);
    toast.success(wasEditing ? "Ordem de serviço atualizada" : "Ordem de serviço criada");
  };

  const handleStatusSaved = updatedOrder => {
    upsertOrderInList(updatedOrder);
    setStatusDialogOrder(null);
    toast.success("Status atualizado com sucesso");
  };

  const handleOpenInvoiceModal = order => {
    if (!order?.customer?.id) {
      toast.warn("A ordem precisa ter um cliente associado para gerar fatura");
      return;
    }

    setFaturaInitialData({
      clientId: order.customer.id,
      client: order.customer,
      descricao: `Ordem de Serviço #${order.id}`,
      valor: Number(order.total) || 0,
      tipoReferencia: "ordem_servico",
      referenciaId: order.id,
      serviceOrder: order
    });
    setFaturaModalOpen(true);
  };

  const handleInvoiceSaved = () => {
    setFaturaModalOpen(false);
    setFaturaInitialData(null);
    toast.success("Fatura gerada com sucesso");
  };

  const handleNewOrder = () => {
    setEditingOrderId(null);
    setModalOpen(true);
  };

  const handleEditOrder = orderId => {
    setEditingOrderId(orderId);
    setModalOpen(true);
  };

  const handleDeleteOrder = async orderId => {
    const confirmed = window.confirm("Deseja realmente excluir esta ordem de serviço?");
    if (!confirmed) return;

    try {
      await deleteServiceOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success("Ordem de serviço excluída com sucesso");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Não foi possível excluir a ordem de serviço");
    }
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Typography className={classes.headerTitle}>Ordens de Serviço</Typography>
          <Typography className={classes.headerSubtitle}>
            {orders.length} {orders.length === 1 ? "ordem cadastrada" : "ordens cadastradas"}
          </Typography>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar por cliente"
            variant="outlined"
            size="small"
            value={search}
            onChange={event => setSearch(event.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            className={classes.selectField}
            label="Status"
          >
            {STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={handleNewOrder}
          >
            Nova OS
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Telefone/E-mail</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Atualização</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading && orders.length === 0 && <TableRowSkeleton columns={7} />}
              {!loading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhuma ordem encontrada.</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Clique em “Nova OS” para criar a primeira ordem de serviço.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {orders.map(order => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer?.name || "—"}</TableCell>
                  <TableCell>
                    {order.customer?.phone || order.customer?.email || "—"}
                  </TableCell>
                  <TableCell align="right">{currency(order.total)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status
                      }
                      style={{
                        backgroundColor: statusColors[order.status]?.bg || "#e2e8f0",
                        color: statusColors[order.status]?.color || "#1f2937",
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Box className={classes.actionsCell}>
                      <Tooltip title="Visualizar">
                        <IconButton size="small" onClick={() => setViewingOrderId(order.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditOrder(order.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Alterar status">
                        <IconButton size="small" onClick={() => setStatusDialogOrder(order)}>
                          <AutorenewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gerar fatura">
                        <IconButton size="small" onClick={() => handleOpenInvoiceModal(order)}>
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDeleteOrder(order.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasMore && (
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              className={classes.loadMore}
              disabled={loading}
            >
              {loading ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </Box>
      </Box>

      {modalOpen && (
        <ServiceOrderModal
          open={modalOpen}
          onClose={handleModalClose}
          onSaved={handleOrderSavedFromModal}
          orderId={editingOrderId}
        />
      )}
      {viewingOrderId && (
        <ServiceOrderViewDialog
          open={Boolean(viewingOrderId)}
          orderId={viewingOrderId}
          onClose={() => setViewingOrderId(null)}
        />
      )}
      {statusDialogOrder && (
        <ServiceOrderStatusDialog
          open={Boolean(statusDialogOrder)}
          order={statusDialogOrder}
          onClose={() => setStatusDialogOrder(null)}
          onSaved={handleStatusSaved}
        />
      )}
      {faturaModalOpen && (
        <FaturaModal
          open={faturaModalOpen}
          onClose={() => {
            setFaturaModalOpen(false);
            setFaturaInitialData(null);
          }}
          initialData={faturaInitialData}
          onSaved={handleInvoiceSaved}
        />
      )}
    </Box>
  );
};
export default ServiceOrdersPage;
