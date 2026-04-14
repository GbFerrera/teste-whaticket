import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { listCompanyPaymentSettings } from "../../services/companyPaymentSettings";
import { toast } from "react-toastify";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];
    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });
    return [...state, ...newUsers];
  }
  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }
  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  filterSelect: {
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": { borderRadius: 8 },
  },
  content: {
    padding: "0 24px 16px",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
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
      padding: "14px 16px",
    },
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  actionLink: {
    color: "#6366f1",
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
    padding: "4px 10px",
    borderRadius: 6,
    minWidth: "auto",
    "&:hover": {
      backgroundColor: "rgba(99,102,241,0.08)",
    },
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [noGatewayModalOpen, setNoGatewayModalOpen] = useState(false);
  const [confirmPayModalOpen, setConfirmPayModalOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedInvoiceForBilling, setSelectedInvoiceForBilling] = useState(null);
  const [sendingBilling, setSendingBilling] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  const isCompanyIdOne = user?.companyId === 1;

  const handleOpenContactModal = async (invoices) => {
    try {
      const paymentSettings = await listCompanyPaymentSettings();
      const hasGateway = Array.isArray(paymentSettings) && paymentSettings.length > 0 && paymentSettings.some(p => p.active);
      if (!hasGateway) {
        setNoGatewayModalOpen(true);
        return;
      }
    } catch (err) {
      toastError(err);
      return;
    }
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleAdminManualPay = async () => {
    if (!selectedInvoiceForPay) return;
    try {
      await api.post(`/invoices/${selectedInvoiceForPay.id}/admin-pay`);
      toast.success("Fatura marcada como paga! Vencimento da empresa estendido em 30 dias.");
      dispatch({ type: "UPDATE_USERS", payload: { ...selectedInvoiceForPay, status: "paid" } });
    } catch (err) {
      toastError(err);
    }
    setConfirmPayModalOpen(false);
    setSelectedInvoiceForPay(null);
  };

  const handleSendBilling = async () => {
    if (!selectedInvoiceForBilling) return;
    setSendingBilling(true);
    try {
      const { data } = await api.post(`/invoices/${selectedInvoiceForBilling.id}/send-billing`);
      const msgs = [];
      if (data.results?.email) msgs.push("E-mail");
      if (data.results?.whatsapp) msgs.push("WhatsApp");
      if (msgs.length > 0) {
        toast.success(`Cobrança enviada via ${msgs.join(" e ")}!`);
      } else {
        toast.warn("Nenhum canal de envio disponível. Verifique se a empresa possui e-mail/telefone e se o WhatsApp está conectado.");
      }
    } catch (err) {
      toastError(err);
    }
    setSendingBilling(false);
    setBillingModalOpen(false);
    setSelectedInvoiceForBilling(null);
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, isCompanyIdOne]);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const rowStatus = (record) => {
    const hoje = moment().format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    const diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    const dias = moment.duration(diff).asDays();
    if (record.status === "paid") {
      return { text: "Pago", color: "paid", overdueDays: 0 };
    }
    if (dias < 0) {
      return { text: "Vencido", color: "overdue", overdueDays: Math.abs(Math.floor(dias)) };
    }
    return { text: "Em Aberto", color: "unpaid", overdueDays: 0 };
  };

  const getFilteredInvoices = () => {
    let list = invoices;
    if (isCompanyIdOne) {
      list = invoices.filter(inv => inv.companyId !== 1);
    } else {
      list = invoices.filter(inv => inv.companyId === user?.companyId);
    }

    if (searchParam) {
      const term = searchParam.toLowerCase();
      list = list.filter(inv =>
        (inv.detail || "").toLowerCase().includes(term) ||
        (inv.company?.name || "").toLowerCase().includes(term) ||
        String(inv.companyId).includes(term)
      );
    }

    if (statusFilter === "paid") return list.filter(inv => inv.status === "paid");
    if (statusFilter === "unpaid") return list.filter(inv => inv.status !== "paid");
    if (statusFilter === "overdue") {
      return list.filter(inv => {
        const diff = moment(inv.dueDate).diff(moment(), "days");
        return inv.status !== "paid" && diff < 0;
      });
    }
    return list;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
  const paginatedInvoices = filteredInvoices.slice(tablePage * rowsPerPage, (tablePage + 1) * rowsPerPage);

  const getStatusChip = (status) => {
    switch (status.color) {
      case "paid":
        return <Chip label={status.text} size="small" className={classes.statusChip} style={{ backgroundColor: "#dcfce7", color: "#166534" }} />;
      case "overdue":
        return <Chip label={`${status.text}${status.overdueDays > 0 ? ` (${status.overdueDays}d)` : ""}`} size="small" className={classes.statusChip} style={{ backgroundColor: "#fef2f2", color: "#dc2626" }} />;
      default:
        return <Chip label={status.text} size="small" className={classes.statusChip} style={{ backgroundColor: "#fff7ed", color: "#c2410c" }} />;
    }
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      />

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Financeiro</Typography>
            <Typography className={classes.headerSubtitle}>
              {filteredInvoices.length} fatura(s)
              {isCompanyIdOne ? " das empresas clientes" : ""}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setTablePage(0); }}
              label="Status"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="paid">Pagas</MenuItem>
              <MenuItem value="unpaid">Em Aberto</MenuItem>
              <MenuItem value="overdue">Vencidas</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Buscar fatura..."
            variant="outlined"
            size="small"
            value={searchParam}
            onChange={(e) => { setSearchParam(e.target.value.toLowerCase()); setTablePage(0); }}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Detalhes</TableCell>
                {isCompanyIdOne && <TableCell>Empresa</TableCell>}
                <TableCell align="center">Usuários</TableCell>
                <TableCell align="center">Conexões</TableCell>
                <TableCell align="center">Filas</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="center">Vencimento</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {paginatedInvoices.map((invoice) => {
                const status = rowStatus(invoice);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell style={{ fontWeight: 500 }}>{invoice.detail}</TableCell>
                    {isCompanyIdOne && (
                      <TableCell>
                        {invoice.company?.name || "Empresa"}{" "}
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                          (ID: {invoice.companyId})
                        </span>
                      </TableCell>
                    )}
                    <TableCell align="center">{invoice.users}</TableCell>
                    <TableCell align="center">{invoice.connections}</TableCell>
                    <TableCell align="center">{invoice.queues}</TableCell>
                    <TableCell align="right" style={{ fontWeight: 600 }}>
                      {invoice.value?.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell align="center">
                      {moment(invoice.dueDate).isValid() ? moment(invoice.dueDate).format("DD/MM/YYYY") : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(status)}
                    </TableCell>
                    <TableCell align="center">
                      {status.text !== "Pago" ? (
                        <Box display="flex" justifyContent="center" style={{ gap: 6 }}>
                          {!isCompanyIdOne && (
                            <Button
                              size="small"
                              className={classes.actionLink}
                              onClick={() => handleOpenContactModal(invoice)}
                            >
                              Pagar
                            </Button>
                          )}
                          {isCompanyIdOne && (
                            <>
                              <Button
                                size="small"
                                className={classes.actionLink}
                                style={{ color: "#22c55e" }}
                                onClick={() => {
                                  setSelectedInvoiceForPay(invoice);
                                  setConfirmPayModalOpen(true);
                                }}
                              >
                                Dar Baixa
                              </Button>
                              <Button
                                size="small"
                                className={classes.actionLink}
                                style={{ color: "#f59e0b" }}
                                onClick={() => {
                                  setSelectedInvoiceForBilling(invoice);
                                  setBillingModalOpen(true);
                                }}
                              >
                                Cobrar
                              </Button>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Chip
                          label="Pago"
                          size="small"
                          style={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton columns={isCompanyIdOne ? 10 : 9} />}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && !loading && (
            <Box className={classes.emptyState}>
              <Typography variant="h6" color="textSecondary">
                Nenhuma fatura encontrada
              </Typography>
            </Box>
          )}

          <Box className={classes.paginationBar}>
            <Typography variant="body2" color="textSecondary">
              Exibindo {tablePage * rowsPerPage + 1} a {Math.min((tablePage + 1) * rowsPerPage, filteredInvoices.length)} de {filteredInvoices.length} resultado(s)
            </Typography>
            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
              <Button
                size="small"
                disabled={tablePage === 0}
                onClick={() => setTablePage(prev => prev - 1)}
                style={{ textTransform: "none", fontWeight: 600 }}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="small"
                  onClick={() => setTablePage(i)}
                  style={{
                    minWidth: 32,
                    fontWeight: 600,
                    backgroundColor: tablePage === i ? sidebarColor : "transparent",
                    color: tablePage === i ? "#fff" : "#64748b",
                    borderRadius: 6,
                  }}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                size="small"
                disabled={tablePage >= totalPages - 1}
                onClick={() => setTablePage(prev => prev + 1)}
                style={{ textTransform: "none", fontWeight: 600 }}
              >
                Próximo
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal - Dar Baixa Manual */}
      <Dialog
        open={confirmPayModalOpen}
        onClose={() => { setConfirmPayModalOpen(false); setSelectedInvoiceForPay(null); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ backgroundColor: "#22c55e", color: "white", textAlign: "center" }}>
          Confirmar Baixa Manual
        </DialogTitle>
        <DialogContent style={{ padding: 24, textAlign: "center" }}>
          <Typography variant="h6" style={{ marginBottom: 16, color: "#333" }}>
            Deseja marcar esta fatura como paga?
          </Typography>
          {selectedInvoiceForPay && (
            <Box style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 16, textAlign: "left" }}>
              <Typography variant="body1"><strong>Empresa:</strong> {selectedInvoiceForPay.company?.name || "Empresa"} (ID: {selectedInvoiceForPay.companyId})</Typography>
              <Typography variant="body1"><strong>Detalhes:</strong> {selectedInvoiceForPay.detail}</Typography>
              <Typography variant="body1"><strong>Valor:</strong> {selectedInvoiceForPay.value?.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}</Typography>
              <Typography variant="body1"><strong>Vencimento:</strong> {moment(selectedInvoiceForPay.dueDate).format("DD/MM/YYYY")}</Typography>
            </Box>
          )}
          <Typography variant="body2" style={{ color: "#666" }}>
            A fatura será marcada como paga e o vencimento da empresa será estendido em 30 dias.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px", justifyContent: "center", gap: 16 }}>
          <Button onClick={() => { setConfirmPayModalOpen(false); setSelectedInvoiceForPay(null); }} variant="outlined" style={{ padding: "8px 24px" }}>
            Cancelar
          </Button>
          <Button onClick={handleAdminManualPay} variant="contained" style={{ backgroundColor: "#22c55e", color: "white", padding: "8px 24px" }}>
            Confirmar Baixa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal - Enviar Cobrança */}
      <Dialog
        open={billingModalOpen}
        onClose={() => { setBillingModalOpen(false); setSelectedInvoiceForBilling(null); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ backgroundColor: "#f59e0b", color: "white", textAlign: "center" }}>
          Enviar Cobrança
        </DialogTitle>
        <DialogContent style={{ padding: 24, textAlign: "center" }}>
          <Typography variant="h6" style={{ marginBottom: 16, color: "#333" }}>
            Enviar notificação de cobrança?
          </Typography>
          {selectedInvoiceForBilling && (
            <Box style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 16, textAlign: "left" }}>
              <Typography variant="body1"><strong>Empresa:</strong> {selectedInvoiceForBilling.company?.name || "Empresa"} (ID: {selectedInvoiceForBilling.companyId})</Typography>
              <Typography variant="body1"><strong>Detalhes:</strong> {selectedInvoiceForBilling.detail}</Typography>
              <Typography variant="body1"><strong>Valor:</strong> {selectedInvoiceForBilling.value?.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}</Typography>
              <Typography variant="body1"><strong>Vencimento:</strong> {moment(selectedInvoiceForBilling.dueDate).format("DD/MM/YYYY")}</Typography>
            </Box>
          )}
          <Typography variant="body2" style={{ color: "#666" }}>
            A cobrança será enviada via <strong>E-mail</strong> e <strong>WhatsApp</strong> para a empresa.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px", justifyContent: "center", gap: 16 }}>
          <Button onClick={() => { setBillingModalOpen(false); setSelectedInvoiceForBilling(null); }} variant="outlined" style={{ padding: "8px 24px" }} disabled={sendingBilling}>
            Cancelar
          </Button>
          <Button onClick={handleSendBilling} variant="contained" disabled={sendingBilling} style={{ backgroundColor: "#f59e0b", color: "white", padding: "8px 24px" }}>
            {sendingBilling ? <CircularProgress size={20} style={{ color: "white" }} /> : "Enviar Cobrança"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal - Gateway não configurado */}
      <Dialog
        open={noGatewayModalOpen}
        onClose={() => setNoGatewayModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ backgroundColor: "#f44336", color: "white", textAlign: "center" }}>
          Atenção
        </DialogTitle>
        <DialogContent style={{ padding: 24, textAlign: "center" }}>
          <Typography variant="h6" style={{ marginBottom: 16, color: "#333" }}>
            Entre em contato com o administrador
          </Typography>
          <Typography variant="body1" style={{ color: "#666" }}>
            Para realizar o pagamento, por favor, fale com o administrador do sistema.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px", justifyContent: "center" }}>
          <Button onClick={() => setNoGatewayModalOpen(false)} variant="contained" style={{ backgroundColor: "#f44336", color: "white", padding: "8px 24px" }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
