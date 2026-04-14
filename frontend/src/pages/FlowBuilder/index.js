import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  CircularProgress,
} from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";
import AndroidIcon from "@material-ui/icons/Android";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import FlowBuilderModal from "../../components/FlowBuilderModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#1976d2",
    },
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
    gap: "12px",
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
    },
  },
  importButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    color: "#4caf50",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#c8e6c9",
    },
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#333",
      transform: "scale(1.05)",
    },
  },
  content: {
    flex: 1,
    padding: "24px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    padding: "8px",
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    padding: "16px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    boxShadow: "none",
    transition: "all 0.2s ease",
    border: "1px solid #333",
    position: "relative",
    minHeight: "180px",
    "&:hover": {
      border: "1px solid #555",
    },
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px auto",
    "& svg": {
      fontSize: 20,
      color: "#495057",
    },
  },
  itemInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    cursor: "pointer",
    textAlign: "center",
    justifyContent: "flex-start",
  },
  itemName: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#333",
    marginBottom: 6,
    lineHeight: 1.2,
    textAlign: "center",
  },
  itemDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    fontSize: "0.75rem",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  statusChip: {
    fontWeight: 400,
    fontSize: "0.65rem",
    height: 16,
    padding: "0 6px",
    borderRadius: 8,
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginTop: "auto",
    paddingTop: 8,
    borderTop: "1px solid #dee2e6",
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    opacity: 0.7,
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 1,
    },
    "& svg": {
      fontSize: 12,
    },
  },
  viewButton: {
    backgroundColor: "transparent",
    color: "#666",
    "&:hover": {
      backgroundColor: "#e9ecef",
    },
  },
  editButton: {
    backgroundColor: "transparent",
    color: "#666",
    "&:hover": {
      backgroundColor: "#e9ecef",
    },
  },
  duplicateButton: {
    backgroundColor: "transparent",
    color: "#666",
    "&:hover": {
      backgroundColor: "#e9ecef",
    },
  },
  exportButton: {
    backgroundColor: "transparent",
    color: "#666",
    "&:hover": {
      backgroundColor: "#e9ecef",
    },
  },
  deleteButton: {
    backgroundColor: "transparent",
    color: "#666",
    "&:hover": {
      backgroundColor: "#e9ecef",
    },
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
    "& svg": {
      fontSize: 64,
      marginBottom: 16,
      opacity: 0.5,
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
  },
  uploadBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px dashed #ccc",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    cursor: "pointer",
    "&:hover": {
      borderColor: "#1976d2",
    },
  },
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [flows, setFlows] = useState([]);
  const [reloadData, setReloadData] = useState(false);

  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedFlowName, setSelectedFlowName] = useState(null);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);
  const [deletingFlow, setDeletingFlow] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/flowbuilder");
        setFlows(data.flows || []);
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    };
    fetchFlows();
  }, [reloadData]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenFlowModal = () => {
    setSelectedFlow(null);
    setSelectedFlowName(null);
    setFlowModalOpen(true);
  };

  const handleCloseFlowModal = () => {
    setSelectedFlow(null);
    setSelectedFlowName(null);
    setFlowModalOpen(false);
  };

  const handleEditFlow = (flow) => {
    setSelectedFlow(flow.id);
    setSelectedFlowName(flow.name);
    setFlowModalOpen(true);
  };

  const handleDeleteFlow = async (flowId) => {
    try {
      await api.delete(`/flowbuilder/${flowId}`);
      toast.success("Fluxo excluído com sucesso");
      setReloadData((old) => !old);
    } catch (err) {
      toastError(err);
    }
    setDeletingFlow(null);
    setConfirmOpen(false);
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      await api.post(`/flowbuilder/duplicate`, { flowId });
      toast.success("Fluxo duplicado com sucesso");
      setReloadData((old) => !old);
    } catch (err) {
      toastError(err);
    }
    setDeletingFlow(null);
    setConfirmDuplicateOpen(false);
  };

  const handleExportFlow = async (flowId) => {
    try {
      toast.info("Preparando exportação do fluxo...");
      const response = await api.get(`/flowbuilder/export/${flowId}`, {
        responseType: "blob",
      });

      if (response.data.size === 0) {
        toast.error("Erro: O arquivo exportado está vazio");
        return;
      }

      const flowToExport = flows.find((f) => f.id === flowId);
      const flowName = flowToExport ? flowToExport.name : "fluxo";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${flowName.replace(/\s+/g, "_").toLowerCase()}_export.json`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Fluxo exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar fluxo");
    }
  };

  const handleImportFlow = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }

    if (!importFile.name.toLowerCase().endsWith(".json")) {
      toast.error("O arquivo deve ser do tipo JSON");
      return;
    }

    try {
      setImportLoading(true);
      toast.info("Importando fluxo, por favor aguarde...");

      const formData = new FormData();
      formData.append("file", importFile);

      const response = await api.post("/flowbuilder/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Fluxo "${response.data.name}" importado com sucesso!`);
      setImportModalOpen(false);
      setImportFile(null);
      setReloadData((old) => !old);
    } catch (error) {
      toast.error("Erro ao importar fluxo");
    } finally {
      setImportLoading(false);
    }
  };

  const filteredFlows = flows.filter((flow) =>
    flow.name?.toLowerCase().includes(searchParam)
  );

  const getStatusChip = (active) => {
    if (active) {
      return (
        <Chip
          label="Ativo"
          size="small"
          className={classes.statusChip}
          style={{ 
            backgroundColor: "#d4edda",
            color: "#155724"
          }}
        />
      );
    }
    return (
      <Chip
        label="Desativado"
        size="small"
        className={classes.statusChip}
        style={{ 
          backgroundColor: "#f8f9fa",
          color: "#6c757d"
        }}
      />
    );
  };

  return (
    <Box className={classes.root}>
      {/* Modais */}
      <FlowBuilderModal
        open={flowModalOpen}
        onClose={handleCloseFlowModal}
        flowId={selectedFlow}
        nameWebhook={selectedFlowName}
        onSave={() => setReloadData((old) => !old)}
      />
      <ConfirmationModal
        title={deletingFlow ? `Excluir fluxo ${deletingFlow.name}?` : ""}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => handleDeleteFlow(deletingFlow.id)}
      >
        Tem certeza que deseja deletar este fluxo? Todas as integrações relacionadas serão perdidas.
      </ConfirmationModal>
      <ConfirmationModal
        title={deletingFlow ? `Duplicar fluxo ${deletingFlow.name}?` : ""}
        open={confirmDuplicateOpen}
        onClose={() => setConfirmDuplicateOpen(false)}
        onConfirm={() => handleDuplicateFlow(deletingFlow.id)}
      >
        Tem certeza que deseja duplicar este fluxo?
      </ConfirmationModal>

      {/* Modal de Importação */}
      <Dialog open={importModalOpen} onClose={() => setImportModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Importar Fluxo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Selecione um arquivo JSON exportado do FlowBuilder para importar.
          </Typography>
          <Box className={classes.uploadBox}>
            <input
              type="file"
              id="flow-import"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => setImportFile(e.target.files[0])}
            />
            <label htmlFor="flow-import" style={{ cursor: "pointer", textAlign: "center" }}>
              <PublishIcon style={{ fontSize: 40, color: "#1976d2" }} />
              <Typography style={{ color: "#1976d2", marginTop: 8 }}>
                {importFile ? `${importFile.name}` : "Escolha um arquivo JSON"}
              </Typography>
              <Typography variant="body2" style={{ color: "#666", marginTop: 4 }}>
                {importFile ? "Arquivo selecionado" : "Clique para selecionar"}
              </Typography>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleImportFlow}
            disabled={!importFile || importLoading}
            variant="contained"
            color="primary"
          >
            {importLoading ? <CircularProgress size={24} /> : "Importar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <AccountTreeIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>Flow Builder</Typography>
            <Typography className={classes.headerSubtitle}>
              {flows.length} {flows.length === 1 ? "fluxo cadastrado" : "fluxos cadastrados"}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <button className={classes.importButton} onClick={() => setImportModalOpen(true)}>
            <PublishIcon style={{ fontSize: 18 }} />
            Importar Fluxo
          </button>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            variant="outlined"
            size="small"
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <button className={classes.addButton} onClick={handleOpenFlowModal}>
            <AddIcon style={{ fontSize: 24 }} />
          </button>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        {filteredFlows.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <AccountTreeIcon />
            <Typography>Nenhum fluxo encontrado</Typography>
          </Box>
        ) : (
          <Box className={classes.gridContainer}>
            {filteredFlows.map((flow) => (
              <Box key={flow.id} className={classes.listItem}>
                {/* Icon */}
                <Box className={classes.itemIcon}>
                  <AndroidIcon />
                </Box>

                {/* Info */}
                <Box
                  className={classes.itemInfo}
                  onClick={() => history.push(`/flowbuilder/${flow.id}`)}
                >
                  <Typography className={classes.itemName}>{flow.name}</Typography>
                  <Box className={classes.itemDetails}>
                    <span>ID: {flow.id}</span>
                    {getStatusChip(flow.active)}
                  </Box>
                </Box>

                {/* Actions */}
                <Box className={classes.itemActions}>
                  <IconButton
                    size="small"
                    className={`${classes.actionButton} ${classes.viewButton}`}
                    onClick={() => history.push(`/flowbuilder/${flow.id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    className={`${classes.actionButton} ${classes.editButton}`}
                    onClick={() => handleEditFlow(flow)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    className={`${classes.actionButton} ${classes.duplicateButton}`}
                    onClick={() => {
                      setDeletingFlow(flow);
                      setConfirmDuplicateOpen(true);
                    }}
                  >
                    <FileCopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    className={`${classes.actionButton} ${classes.exportButton}`}
                    onClick={() => handleExportFlow(flow.id)}
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    className={`${classes.actionButton} ${classes.deleteButton}`}
                    onClick={() => {
                      setDeletingFlow(flow);
                      setConfirmOpen(true);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={32} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FlowBuilder;