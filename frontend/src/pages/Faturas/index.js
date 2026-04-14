import React, { useState, useEffect, useReducer, useCallback, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ReceiptIcon from "@material-ui/icons/Receipt";
import LaunchIcon from "@material-ui/icons/Launch";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import LinkIcon from "@material-ui/icons/Link";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import DeleteIcon from "@material-ui/icons/Delete";

import ConfirmationModal from "../../components/ConfirmationModal";
import FaturaModal from "../../components/FaturaModal";
import PagamentoModal from "../../components/PagamentoModal";
import { listFinanceiroFaturas, deleteFinanceiroFatura } from "../../services/financeiroFaturas";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import moment from "moment";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_FATURAS": {
      const incoming = action.payload || [];
      const updated = [...state];

      incoming.forEach(fatura => {
        const index = updated.findIndex(item => item.id === fatura.id);
        if (index !== -1) {
          updated[index] = fatura;
        } else {
          updated.push(fatura);
        }
      });

      return updated;
    }
    case "RESET":
      return [];
    case "DELETE_FATURA":
      return state.filter(fatura => fatura.id !== action.payload);
    default:
      return state;
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
    backgroundColor: theme.palette.primary.main,
    "& th": {
      color: theme.palette.primary.contrastText || "#fff",
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

const Faturas = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [faturas, dispatch] = useReducer(reducer, []);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [fatura, setFatura] = useState({});
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [selectedFaturaId, setSelectedFaturaId] = useState(null);

  const isCompanyIdOne = user.companyId === 1;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      fetchFaturas();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchParam, pageNumber, statusFilter]);

  const fetchFaturas = async () => {
    try {
      console.log("🔍 [FATURAS] Buscando faturas com params:", {
        searchParam,
        pageNumber,
        status: statusFilter === "all" ? "" : statusFilter,
        companyId: user.companyId
      });
      
      const params = {
        searchParam,
        pageNumber,
        status: statusFilter === "all" ? "" : statusFilter,
        companyId: user.companyId
      };
      
      const response = await listFinanceiroFaturas(params);
      console.log("📋 [FATURAS] Resposta completa da API:", response);
      console.log("📋 [FATURAS] Chaves da resposta:", Object.keys(response));
      
      // Tentar diferentes estruturas de dados
      let faturasData = [];
      if (response.faturas) {
        faturasData = response.faturas;
      } else if (response.records) {
        faturasData = response.records;
      } else if (response.data) {
        faturasData = response.data;
      } else if (response.faturamentos) {
        faturasData = response.faturamentos;
      } else if (Array.isArray(response)) {
        faturasData = response;
      } else {
        console.warn("⚠️ [FATURAS] Estrutura de dados não reconhecida:", response);
      }
      
      console.log("📄 [FATURAS] Dados das faturas processados:", faturasData);
      
      dispatch({ type: "LOAD_FATURAS", payload: faturasData });
      setHasMore(response.hasMore || false);
      setPageNumber(response.currentPage || pageNumber);
      
    } catch (err) {
      console.error("❌ [FATURAS] Erro ao buscar faturas:", err);
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFaturaModal = () => {
    setFatura({});
    setFaturaModalOpen(true);
  };

  const handleEditFatura = (fatura) => {
    setFatura(fatura);
    setFaturaModalOpen(true);
  };

  const handleDeleteFatura = (fatura) => {
    setDeletingInvoice(fatura);
    setConfirmModalOpen(true);
  };

  const handleConfirmDeleteFatura = async () => {
    if (!deletingInvoice) return;
    try {
      await deleteFinanceiroFatura(deletingInvoice.id);
      dispatch({ type: "DELETE_FATURA", payload: deletingInvoice.id });
      toast.success("Fatura excluída com sucesso!");
      setConfirmModalOpen(false);
      setDeletingInvoice(null);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenPagamentoModal = (fatura) => {
    setSelectedFatura(fatura);
    setPagamentoModalOpen(true);
  };

  const handleCopyFaturaLink = (fatura) => {
    const link = `${window.location.origin}/faturas/${fatura.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link da fatura copiado!");
  };

  const handleOpenFaturaDetails = (fatura) => {
    history.push(`/faturas/${fatura.id}`);
  };

  const rowStatus = (fatura) => {
    switch (fatura.status) {
      case "aberta":
        return { text: "Aberta", color: "#f59e0b", backgroundColor: "#fef3c7" };
      case "paga":
        return { text: "Paga", color: "#10b981", backgroundColor: "#d1fae5" };
      case "vencida":
        return { text: "Vencida", color: "#ef4444", backgroundColor: "#fee2e2" };
      case "cancelada":
        return { text: "Cancelada", color: "#6b7280", backgroundColor: "#f3f4f6" };
      default:
        return { text: "Desconhecido", color: "#6b7280", backgroundColor: "#f3f4f6" };
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status.text}
        size="small"
        style={{ 
          backgroundColor: status.backgroundColor, 
          color: status.color, 
          fontWeight: 600, 
          fontSize: "0.75rem" 
        }}
      />
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography variant="h4" className={classes.headerTitle}>
              Faturas
            </Typography>
            <Typography variant="body2" className={classes.headerSubtitle}>
              Gerencie e gerencie faturas de clientes
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenFaturaModal}
          >
            Nova Fatura
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="center">Valor</TableCell>
                <TableCell align="center">Vencimento</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {faturas.map((fatura) => {
                const status = rowStatus(fatura);
                return (
                  <TableRow key={fatura.id}>
                    <TableCell>{fatura.id}</TableCell>
                    <TableCell style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      FAT 000{fatura.id}
                    </TableCell>
                    <TableCell>
                      {fatura.client?.name || "Cliente não informado"}
                      {fatura.client?.companyName && (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                          ({fatura.client.companyName})
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 600 }}>
                      {formatCurrency(fatura.valor)}
                    </TableCell>
                    <TableCell align="center">
                      {moment(fatura.dataVencimento).isValid() ? moment(fatura.dataVencimento).format("DD/MM/YYYY") : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(status)}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 6 }}>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            className={classes.actionLink}
                            onClick={() => handleOpenFaturaDetails(fatura)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            className={classes.actionLink}
                            onClick={() => handleEditFatura(fatura)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar link">
                          <IconButton
                            size="small"
                            className={classes.actionLink}
                            onClick={() => handleCopyFaturaLink(fatura)}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {fatura.status === "aberta" && (
                          <Tooltip title="Registrar pagamento">
                            <IconButton
                              size="small"
                              className={classes.actionLink}
                              onClick={() => handleOpenPagamentoModal(fatura)}
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            style={{ color: "#ef4444" }}
                            onClick={() => handleDeleteFatura(fatura)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        {!loading && faturas.length === 0 && (
          <Box className={classes.emptyState}>
            <ReceiptIcon style={{ fontSize: 48, marginBottom: 16 }} />
            <Typography variant="h6" color="textSecondary">
              Nenhuma fatura encontrada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Crie sua primeira fatura para começar
            </Typography>
          </Box>
        )}

        {loading && (
          <Box className={classes.emptyState}>
            <CircularProgress />
          </Box>
        )}

        {!loading && hasMore && (
          <Box className={classes.paginationBar}>
            <Button
              onClick={() => fetchFaturas()}
              color="primary"
              disabled={loading}
            >
              Carregar mais
            </Button>
          </Box>
        )}
      </Box>

      <FaturaModal
        open={faturaModalOpen}
        onClose={() => setFaturaModalOpen(false)}
        fatura={fatura}
        onSaved={(fatura) => {
          dispatch({ type: "LOAD_FATURAS", payload: [fatura] });
          setFaturaModalOpen(false);
        }}
      />

      <PagamentoModal
        open={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        fatura={selectedFatura}
        onSaved={() => {
          dispatch({ type: "UPDATE_FATURA", payload: selectedFatura });
          setPagamentoModalOpen(false);
        }}
      />

      <ConfirmationModal
        title="Excluir Fatura"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDeleteFatura}
      >
        Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </div>
  );
};

export default Faturas;
