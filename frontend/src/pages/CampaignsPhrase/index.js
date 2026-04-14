import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles,
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

const CampaignsPhrase = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [searchParam, setSearchParam] = useState("");

  const [campaignflows, setCampaignFlows] = useState([]);
  const [modalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Campanha deletada");
      getCampaigns();
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setConfirmModalOpen(false);
  };

  const getCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get("/flowcampaign");
      setCampaignFlows(res.data.flow || []);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const onSaveModal = () => {
    getCampaigns();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenModal = () => {
    setCampaignFlowSelected(undefined);
    setModalOpenPhrase(true);
  };

  const handleEditCampaign = (flowId) => {
    setCampaignFlowSelected(flowId);
    setModalOpenPhrase(true);
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const filteredCampaigns = campaignflows.filter((flow) =>
    flow.name?.toLowerCase().includes(searchParam)
  );

  const paginatedItems = filteredCampaigns.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filteredCampaigns.length / rowsPerPage);

  const getStatusChip = (status) => {
    if (status) {
      return (
        <Chip
          label="Ativo"
          size="small"
          style={{ backgroundColor: "#e8f5e9", color: "#4caf50", fontWeight: 600 }}
        />
      );
    }
    return (
      <Chip
        label="Desativado"
        size="small"
        style={{ backgroundColor: "#f5f5f5", color: "#9e9e9e", fontWeight: 600 }}
      />
    );
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingCampaign.name}?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModalPhrase
        open={modalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignflowSelected}
        onSave={onSaveModal}
      />

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>
              Campanhas por Frase
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {campaignflows.length} {campaignflows.length === 1 ? "campanha cadastrada" : "campanhas cadastradas"}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder={i18n.t("campaigns.searchPlaceholder")}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={handleOpenModal}
          >
            Nova Campanha
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={4} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhuma campanha encontrada</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((flow) => (
                  <TableRow
                    key={flow.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditCampaign(flow.id)}
                  >
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {flow.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{flow.id}</TableCell>
                    <TableCell align="center">
                      {getStatusChip(flow.status)}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCampaign(flow.id);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmModalOpen(true);
                                  setDeletingCampaign(flow);
                                }}
                                style={{ color: "#ef4444" }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredCampaigns.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredCampaigns.length)} de{" "}
                {filteredCampaigns.length} resultado(s)
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageIdx = i;
                  if (totalPages > 5) {
                    const start = Math.max(0, Math.min(tablePage - 2, totalPages - 5));
                    pageIdx = start + i;
                  }
                  return (
                    <Button
                      key={pageIdx}
                      size="small"
                      variant={pageIdx === tablePage ? "contained" : "text"}
                      color={pageIdx === tablePage ? "primary" : "default"}
                      onClick={() => setTablePage(pageIdx)}
                      style={{
                        minWidth: 32,
                        borderRadius: 6,
                        fontWeight: pageIdx === tablePage ? 700 : 400,
                      }}
                    >
                      {pageIdx + 1}
                    </Button>
                  );
                })}
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

export default CampaignsPhrase;