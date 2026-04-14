import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { i18n } from "../../translate/i18n";
import { PlanManagerForm } from "../../components/PlansManager";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import TableRowSkeleton from "../../components/TableRowSkeleton";

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
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
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
  actionBtn: {
    minWidth: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
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

const defaultRecord = {
  name: "",
  users: 0,
  connections: 0,
  queues: 0,
  amount: 0,
  useWhatsapp: true,
  useFacebook: true,
  useInstagram: true,
  useCampaigns: true,
  useSchedules: true,
  useInternalChat: true,
  useExternalApi: true,
  useKanban: true,
  useOpenAi: true,
  useIntegrations: true,
  recurrence: "MENSAL",
  isPublic: true,
};

const PlanosPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { list, save, update, remove } = usePlans();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [record, setRecord] = useState(defaultRecord);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    if (!user.super) {
      toast.error("Sem permissão para acessar esta página.");
      setTimeout(() => history.push("/"), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const planList = await list();
      setRecords(planList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de planos");
    }
    setLoading(false);
  };

  const filteredRecords = records.filter((plan) =>
    plan.name?.toLowerCase().includes(searchParam.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const handleOpenNew = () => {
    setRecord({ ...defaultRecord });
    setModalOpen(true);
  };

  const handleSelect = (data) => {
    setRecord({
      id: data.id,
      name: data.name || "",
      users: data.users || 0,
      connections: data.connections || 0,
      queues: data.queues || 0,
      amount: data.amount?.toLocaleString("pt-br", { minimumFractionDigits: 2 }) || 0,
      useWhatsapp: data.useWhatsapp !== false,
      useFacebook: data.useFacebook !== false,
      useInstagram: data.useInstagram !== false,
      useCampaigns: data.useCampaigns !== false,
      useSchedules: data.useSchedules !== false,
      useInternalChat: data.useInternalChat !== false,
      useExternalApi: data.useExternalApi !== false,
      useKanban: data.useKanban !== false,
      useOpenAi: data.useOpenAi !== false,
      useIntegrations: data.useIntegrations !== false,
      recurrence: data.recurrence || "MENSAL",
      isPublic: data.isPublic,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRecord({ ...defaultRecord });
  };

  const handleSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      toast.success("Operação realizada com sucesso!");
      handleCloseModal();
      await loadPlans();
    } catch (e) {
      toast.error("Não foi possível realizar a operação. Verifique se já existe um plano com o mesmo nome.");
    }
    setModalLoading(false);
  };

  const handleOpenDeleteDialog = (row) => {
    setDeletingRecord(row);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setLoading(true);
    try {
      await remove(deletingRecord.id);
      toast.success("Plano excluído com sucesso!");
      await loadPlans();
    } catch (e) {
      toast.error("Não foi possível excluir o plano");
    }
    setDeletingRecord(null);
    setShowConfirmDialog(false);
    setLoading(false);
  };

  const renderRecurrence = (value) => {
    const map = {
      MENSAL: "Mensal",
      TRIMESTRAL: "Trimestral",
      SEMESTRAL: "Semestral",
      ANUAL: "Anual",
    };
    return map[value] || value || "—";
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <ConfirmationModal
        title={deletingRecord && `Excluir plano ${deletingRecord.name}?`}
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
      >
        Deseja realmente excluir esse plano?
      </ConfirmationModal>

      {/* Modal de Edição / Criação */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle style={{ backgroundColor: "#3f51b5", color: "#fff" }}>
          {record.id ? "Editar Plano" : "Novo Plano"}
        </DialogTitle>
        <DialogContent dividers style={{ padding: 24 }}>
          <PlanManagerForm
            initialValue={record}
            onSubmit={handleSubmit}
            onDelete={handleOpenDeleteDialog}
            onCancel={handleCloseModal}
            loading={modalLoading}
          />
        </DialogContent>
      </Dialog>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Planos</Typography>
            <Typography className={classes.headerSubtitle}>
              {filteredRecords.length} plano(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar plano..."
            variant="outlined"
            size="small"
            className={classes.searchField}
            value={searchParam}
            onChange={(e) => {
              setSearchParam(e.target.value);
              setTablePage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenNew}
            className={classes.addButton}
          >
            Novo Plano
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Usuários</TableCell>
                <TableCell align="center">Conexões</TableCell>
                <TableCell align="center">Filas</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="center">Recorrência</TableCell>
                <TableCell align="center">Público</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={9} />
              ) : paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum plano encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((row) => (
                  <TableRow
                    key={row.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelect(row)}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography
                        style={{ fontWeight: 600, color: "#1976d2", cursor: "pointer" }}
                      >
                        {row.name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{row.users || 0}</TableCell>
                    <TableCell align="center">{row.connections || 0}</TableCell>
                    <TableCell align="center">{row.queues || 0}</TableCell>
                    <TableCell align="right">
                      R$ {row.amount ? row.amount.toLocaleString("pt-br", { minimumFractionDigits: 2 }) : "0,00"}
                    </TableCell>
                    <TableCell align="center">{renderRecurrence(row.recurrence)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={row.isPublic ? "Sim" : "Não"}
                        className={classes.statusChip}
                        style={{
                          backgroundColor: row.isPublic ? "#dcfce7" : "#fee2e2",
                          color: row.isPublic ? "#166534" : "#991b1b",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(row);
                          }}
                          style={{ color: "#1976d2" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(row);
                          }}
                          style={{ color: "#ef4444" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredRecords.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredRecords.length)} de{" "}
                {filteredRecords.length} resultado(s)
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <Button
                  size="small"
                  disabled={tablePage === 0}
                  onClick={() => setTablePage(tablePage - 1)}
                  className={classes.actionBtn}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant={i === tablePage ? "contained" : "text"}
                    color={i === tablePage ? "primary" : "default"}
                    onClick={() => setTablePage(i)}
                    style={{
                      minWidth: 32,
                      borderRadius: 6,
                      fontWeight: i === tablePage ? 700 : 400,
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="small"
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage(tablePage + 1)}
                  className={classes.actionBtn}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlanosPage;
