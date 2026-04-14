import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Edit, DeleteOutline, AccountTree, Search as SearchIcon } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";

import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

import { listIaWorkflows, deleteIaWorkflow } from "../../services/iaWorkflowService";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
    flexWrap: "wrap",
    gap: 12
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "#fff3e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 28,
      color: "#ff9800"
    }
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: 4
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  addButton: {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 0,
    "&:hover": {
      backgroundColor: "#333",
      transform: "scale(1.05)"
    },
    transition: "all 0.2s ease"
  },
  searchField: {
    minWidth: 200,
    "& .MuiInputBase-root": {
      backgroundColor: "#fff",
      borderRadius: 8,
      border: "1px solid #e0e0e0",
      padding: "4px 12px",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: "#e0e0e0"
      },
      "&.Mui-focused": {
        borderColor: "#e0e0e0"
      },
      "&::before, &::after": {
        display: "none"
      }
    },
    "& .MuiInputBase-input": {
      padding: "6px 0",
      "&::placeholder": {
        color: "#9e9e9e",
        opacity: 1
      }
    }
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px 24px",
    gap: 16,
    minHeight: 0
  },
  listWrapper: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingBottom: 20
  },
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
    gap: 16,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 20px 32px rgba(15,23,42,0.12)"
    }
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff3e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      color: "#ff9800",
      fontSize: 24
    }
  },
  cardInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: "0.85rem",
    color: "#555"
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    "&:hover": {
      backgroundColor: "#bbdefb"
    }
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    "&:hover": {
      backgroundColor: "#ffcdd2"
    }
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "40px 0",
    justifyContent: "center"
  },
  emptyState: {
    borderRadius: 16,
    backgroundColor: "#fff",
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
    "& svg": {
      fontSize: 48,
      marginBottom: 12,
      color: "#d9d9d9"
    }
  }
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_WORKFLOWS":
      return action.payload;
    case "UPDATE_WORKFLOW":
      const workflowIndex = state.findIndex((w) => w.id === action.payload.id);
      if (workflowIndex !== -1) {
        state[workflowIndex] = action.payload;
        return [...state];
      } else {
        return [action.payload, ...state];
      }
    case "DELETE_WORKFLOW":
      return state.filter((w) => w.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const IaWorkflows = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [workflows, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      try {
        const data = await listIaWorkflows();
        console.log("Workflows carregados:", data);
        dispatch({ type: "LOAD_WORKFLOWS", payload: data });
      } catch (err) {
        console.error("Erro ao carregar workflows:", err);
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = () => {
    history.push("/ia-workflows/new");
  };

  const handleEditWorkflow = (workflow) => {
    history.push(`/ia-workflows/${workflow.id}`);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await deleteIaWorkflow(workflowId);
      dispatch({ type: "DELETE_WORKFLOW", payload: workflowId });
      toast.success("Workflow de IA deletado com sucesso!");
    } catch (err) {
      toastError(err);
    }
    setSelectedWorkflow(null);
    setConfirmModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name?.toLowerCase().includes(searchParam) ||
    workflow.description?.toLowerCase().includes(searchParam)
  );

  return (
    <Box className={classes.root}>
      <ConfirmationModal
        title={
          selectedWorkflow &&
          `Deletar workflow "${selectedWorkflow.name}"?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteWorkflow(selectedWorkflow.id)}
      >
        Esta ação não pode ser desfeita. Todas as conexões entre IAs serão perdidas.
      </ConfirmationModal>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <AccountTree />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>
              Workflows de IA
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {workflows.length} workflows cadastrados
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerActions}>
          <TextField
            className={classes.searchField}
            placeholder="Pesquisar..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#9e9e9e", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            className={classes.addButton}
            onClick={handleCreateWorkflow}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.listWrapper}>
          {loading ? (
            <Box className={classes.loadingBox}>
              <CircularProgress size={24} />
              <Typography variant="body2">Carregando workflows...</Typography>
            </Box>
          ) : filteredWorkflows.length === 0 ? (
            <Box className={classes.emptyState}>
              <AccountTree />
              <Typography>
                {searchParam 
                  ? "Nenhum workflow encontrado"
                  : "Crie seu primeiro workflow para conectar diferentes IAs"
                }
              </Typography>
            </Box>
          ) : (
            filteredWorkflows.map((workflow) => (
              <Box 
                key={workflow.id} 
                className={classes.card}
                onClick={() => handleEditWorkflow(workflow)}
              >
                <Box className={classes.iconBadge}>
                  <AccountTree />
                </Box>
                <Box className={classes.cardInfo}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {workflow.name || "Workflow sem nome"}
                  </Typography>
                  <Typography variant="body2" style={{ color: "#666" }}>
                    {workflow.description || "Sem descrição"}
                  </Typography>
                  <Box className={classes.metaRow}>
                    <span>IAs: {workflow.agentCount || workflow.agents?.length || 0}</span>
                    <span>•</span>
                    <span>Criado: {workflow.createdAt ? new Date(workflow.createdAt).toLocaleDateString() : "N/A"}</span>
                  </Box>
                </Box>
                <Box className={classes.cardActions}>
                  <Tooltip title="Editar">
                    <IconButton
                      className={`${classes.actionButton} ${classes.editButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWorkflow(workflow);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      className={`${classes.actionButton} ${classes.deleteButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkflow(workflow);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default IaWorkflows;