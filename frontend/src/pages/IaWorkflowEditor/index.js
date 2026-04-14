import React, { useState, useEffect, useContext, useCallback } from "react";

import { useParams, useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  ArrowBack,
  Save,
  Add,
  Android,
  AccountTree,
  Search as SearchIcon,
  DeleteOutline
} from "@material-ui/icons";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  ConnectionMode,
  Handle
} from "reactflow";
import "reactflow/dist/style.css";

import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { showIaWorkflow, saveIaWorkflow } from "../../services/iaWorkflowService";

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
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 16
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#fff3e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#ff9800"
    }
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
    marginTop: 2
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 260,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        borderColor: "#e0e0e0"
      },
      "&:hover fieldset": {
        borderColor: "#1976d2"
      }
    }
  },
  addButton: {
    width: 44,
    height: 44,
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
      transform: "scale(1.05)"
    }
  },
  content: {
    flex: 1,
    display: "flex",
    padding: "16px 24px",
    gap: 16,
    minHeight: 0
  },
  sidebar: {
    width: 340,
    minWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: "calc(100vh - 140px)",
    overflowY: "auto"
  },
  sectionTitle: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#999",
    fontWeight: 600
  },
  nodeList: {
    borderRadius: 12,
    backgroundColor: "#fafafa",
    padding: 8,
    maxHeight: 260,
    overflowY: "auto"
  },
  nodeListItem: {
    borderRadius: 10,
    marginBottom: 4,
    paddingTop: 6,
    paddingBottom: 6
  },
  canvasWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  },
  canvas: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 40px rgba(15,23,42,0.12)"
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: "10px 22px",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#000"
    }
  },
  ghostButton: {
    borderRadius: 999,
    border: "1px solid #d0d0d0",
    color: "#333",
    padding: "9px 18px",
    textTransform: "none",
    fontWeight: 500,
    "&:hover": {
      borderColor: "#1a1a1a",
      color: "#1a1a1a",
      backgroundColor: "transparent"
    }
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    color: "#777"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: "60vh"
  }
}));

const nodePalette = {
  trigger: {
    label: "Trigger",
    color: "#10b981",
    bgColor: "#ecfdf5"
  },
  orchestrator: {
    label: "AI Agent",
    color: "#6366f1",
    bgColor: "#eef2ff"
  },
  model: {
    label: "Model",
    color: "#8b5cf6",
    bgColor: "#f5f3ff"
  },
  memory: {
    label: "Memory",
    color: "#8b5cf6",
    bgColor: "#f5f3ff"
  },
  agent: {
    label: "Tool",
    color: "#f59e0b",
    bgColor: "#fffbeb"
  }
};

const TriggerNode = ({ data, selected }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 8,
        border: selected ? "2px solid #10b981" : "2px solid #10b981",
        backgroundColor: "#fff",
        minWidth: 180,
        boxShadow: selected
          ? "0 0 0 4px rgba(16,185,129,0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        position: "relative"
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#9ca3af",
          border: "2px solid #fff",
          borderRadius: "50%",
          right: -6
        }}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <div>
        <Typography variant="body2" style={{ fontWeight: 600, color: "#1a1a1a" }}>
          {data.label}
        </Typography>
        <Typography variant="caption" style={{ color: "#10b981", fontSize: 11 }}>
          Trigger
        </Typography>
      </div>
      <div
        style={{
          position: "absolute",
          top: -8,
          left: 8,
          backgroundColor: "#fef3c7",
          borderRadius: 4,
          padding: "2px 6px"
        }}
      >
        <span style={{ fontSize: 10, color: "#d97706" }}>⚡</span>
      </div>
    </div>
  );
};

const AgentNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        border: selected ? "2px solid #6366f1" : "1px solid #e5e7eb",
        backgroundColor: "#fff",
        minWidth: 160,
        boxShadow: selected
          ? "0 0 0 4px rgba(99,102,241,0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        position: "relative"
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#9ca3af",
          border: "2px solid #fff",
          borderRadius: "50%",
          left: -6
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#9ca3af",
          border: "2px solid #fff",
          borderRadius: "50%",
          right: -6
        }}
      />
      
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
          </svg>
        </div>
        <div>
          <Typography variant="body2" style={{ fontWeight: 600, color: "#1a1a1a", fontSize: 13 }}>
            {data.label}
          </Typography>
          <Typography variant="caption" style={{ color: "#6366f1", fontSize: 11 }}>
            Tools Agent
          </Typography>
        </div>
      </div>
      
    </div>
  );
};

const CustomNode = ({ data, selected }) => {
  if (data.nodeStyle === "trigger") {
    return <TriggerNode data={data} selected={selected} />;
  }
  if (data.nodeStyle === "agent" || data.type === "orchestrator") {
    return <AgentNode data={data} selected={selected} />;
  }
  
  // Fallback para nós de agente simples (tools)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        position: "relative"
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#f59e0b",
          transform: "rotate(45deg)",
          border: "none",
          borderRadius: 0,
          top: -4
        }}
      />
      <Typography variant="caption" style={{ color: "#f59e0b", fontSize: 11 }}>
        {data.connectionLabel || "Tool"}
      </Typography>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#fffbeb",
          border: selected ? "2px solid #f59e0b" : "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected ? "0 0 0 4px rgba(245,158,11,0.15)" : "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <Android style={{ fontSize: 24, color: "#f59e0b" }} />
      </div>
      <Typography variant="body2" style={{ fontWeight: 500, color: "#1a1a1a", fontSize: 12, textAlign: "center", maxWidth: 100 }}>
        {data.label}
      </Typography>
      {data.alias && (
        <Chip
          label={data.alias}
          size="small"
          style={{ backgroundColor: "#f59e0b", color: "#fff", fontSize: 10, height: 20 }}
        />
      )}
    </div>
  );
};

const nodeTypes = {
  orchestrator: CustomNode,
  agent: CustomNode
};

const IaWorkflowEditor = () => {
  const classes = useStyles();
  const { id } = useParams(); // aqui o id é o orchestratorPromptId
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchAgent, setSearchAgent] = useState("");
  const [workflow, setWorkflow] = useState({
    name: "",
    description: "",
    orchestratorPromptId: id && id !== "new" ? Number(id) : null,
    agents: []
  });
  const [allPrompts, setAllPrompts] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentAlias, setAgentAlias] = useState("");
  const [agentPromptId, setAgentPromptId] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");

  const loadPrompts = useCallback(async () => {
    try {
      const { data } = await api.get("/prompt");
      setAllPrompts(data.prompts || []);
    } catch (err) {
      toastError(err);
    }
  }, []);

  const buildGraphFromWorkflow = useCallback((wf) => {
    const agentCount = (wf.agents || []).length;
    
    // Calcular altura total baseada no número de agentes
    const agentSpacing = 120;
    const totalAgentHeight = agentCount > 0 ? (agentCount - 1) * agentSpacing : 0;
    
    // Posição central vertical
    const centerY = 200;
    const baseX = 100;

    // Nó Trigger (When chat message received)
    const triggerNode = {
      id: "trigger-node",
      type: "orchestrator",
      position: { x: baseX, y: centerY },
      data: {
        nodeStyle: "trigger",
        label: "When chat message received",
        color: nodePalette.trigger.color
      }
    };

    // Nó AI Agent (Orquestrador) - centralizado verticalmente com os agentes
    const orchestratorNode = {
      id: `orchestrator-${wf.orchestratorPromptId}`,
      type: "orchestrator",
      position: { x: baseX + 350, y: centerY },
      data: {
        nodeStyle: "agent",
        type: "orchestrator",
        label: wf.name || "AI Agent",
        color: nodePalette.orchestrator.color
      }
    };

    // Nós de agentes (Tools) - distribuídos verticalmente
    const agentStartY = centerY - totalAgentHeight / 2;
    const agentNodes = (wf.agents || []).map((agent, index) => {
      const prompt = allPrompts.find((p) => p.id === agent.agentPromptId);
      return {
        id: `agent-${agent.agentPromptId}-${index}`,
        type: "agent",
        position: { x: baseX + 650, y: agentStartY + index * agentSpacing },
        data: {
          type: "agent",
          connectionLabel: agent.alias || "Tool",
          label: prompt ? prompt.name : `Agente #${index + 1}`,
          alias: agent.alias,
          agentPromptId: agent.agentPromptId,
          color: nodePalette.agent.color
        }
      };
    });

    const newNodes = [triggerNode, orchestratorNode, ...agentNodes];
    
    // Edges com estilo n8n
    const newEdges = [
      // Trigger -> AI Agent (Orquestrador)
      {
        id: "e-trigger-orchestrator",
        source: "trigger-node",
        target: `orchestrator-${wf.orchestratorPromptId}`,
        type: "smoothstep",
        animated: false,
        label: "1 item",
        labelStyle: { fontSize: 10, fill: "#10b981", fontWeight: 500 },
        labelBgStyle: { fill: "#ecfdf5", fillOpacity: 1 },
        labelBgPadding: [4, 4],
        labelBgBorderRadius: 4,
        style: {
          stroke: "#10b981",
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981"
        }
      },
      // Orquestrador -> Agentes
      ...agentNodes.map((agentNode, index) => ({
        id: `e-orchestrator-agent-${index}`,
        source: `orchestrator-${wf.orchestratorPromptId}`,
        target: agentNode.id,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: "#f59e0b",
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#f59e0b"
        }
      }))
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [allPrompts, setNodes, setEdges]);

  const loadWorkflow = useCallback(async () => {
    if (!id || id === "new") return;
    setLoading(true);
    try {
      const data = await showIaWorkflow(id);
      if (!data) {
        setLoading(false);
        return;
      }
      setWorkflow(data);
      buildGraphFromWorkflow(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [id, buildGraphFromWorkflow]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  useEffect(() => {
    if (allPrompts.length) {
      loadWorkflow();
    }
  }, [allPrompts, loadWorkflow]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
            style: { stroke: "#9ca3af", strokeWidth: 2 }
          },
          eds
        )
      ),
    [setEdges]
  );

  const openNewAgentModal = () => {
    setEditingAgent(null);
    setAgentAlias("");
    setAgentPromptId("");
    setSearchPrompt("");
    setAgentModalOpen(true);
  };

  const openEditAgentModal = (agent) => {
    setEditingAgent(agent);
    setAgentAlias(agent.alias || "");
    setAgentPromptId(agent.agentPromptId || "");
    setSearchPrompt("");
    setAgentModalOpen(true);
  };

  const closeAgentModal = () => {
    setAgentModalOpen(false);
    setEditingAgent(null);
  };

  const handleSaveAgent = () => {
    if (!agentPromptId) {
      toast.error("Selecione um prompt para o agente");
      return;
    }

    setWorkflow((prev) => {
      let agents = [...(prev.agents || [])];
      if (editingAgent) {
        agents = agents.map((ag) =>
          ag.agentPromptId === editingAgent.agentPromptId && ag.alias === editingAgent.alias
            ? { ...ag, agentPromptId: Number(agentPromptId), alias: agentAlias }
            : ag
        );
      } else {
        agents.push({
          agentPromptId: Number(agentPromptId),
          alias: agentAlias || "Agente"
        });
      }

      const updated = { ...prev, agents };
      buildGraphFromWorkflow(updated);
      return updated;
    });

    setAgentModalOpen(false);
    setEditingAgent(null);
  };

  const handleRemoveAgent = (agent) => {
    setWorkflow((prev) => {
      const agents = (prev.agents || []).filter(
        (ag) => !(ag.agentPromptId === agent.agentPromptId && ag.alias === agent.alias)
      );
      const updated = { ...prev, agents };
      buildGraphFromWorkflow(updated);
      return updated;
    });
  };

  const handleSaveWorkflow = async () => {
    try {
      setSaving(true);
      const payload = {
        name: workflow.name,
        description: workflow.description,
        orchestratorPromptId: workflow.orchestratorPromptId,
        agents: workflow.agents
      };

      if (!payload.orchestratorPromptId) {
        toast.error("ID do prompt orquestrador inválido");
        setSaving(false);
        return;
      }

      await saveIaWorkflow(payload, workflow.orchestratorPromptId);
      toast.success("Workflow salvo com sucesso");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredAgents = (workflow.agents || []).filter((ag) => {
    if (!searchAgent) return true;
    const prompt = allPrompts.find((p) => p.id === ag.agentPromptId);
    const name = prompt?.name || "";
    return (
      name.toLowerCase().includes(searchAgent.toLowerCase()) ||
      ag.alias?.toLowerCase().includes(searchAgent.toLowerCase())
    );
  });

  const filteredPrompts = allPrompts.filter((prompt) => {
    if (prompt.id === workflow.orchestratorPromptId) return false;
    if (!searchPrompt) return true;
    return prompt.name?.toLowerCase().includes(searchPrompt.toLowerCase());
  });

  if (user?.profile === "user") {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <Typography variant="body1">Você não tem permissão para acessar este editor.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => history.push("/ia-workflows")} size="small">
            <ArrowBack />
          </IconButton>
        </Box>

        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <AccountTree />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>Workflow de IA</Typography>
            <Typography className={classes.headerSubtitle}>
              Configure a IA orquestradora e conecte agentes especializados
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <Button
            variant="outlined"
            className={classes.ghostButton}
            startIcon={<Save />}
            onClick={handleSaveWorkflow}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar workflow"}
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.sidebar}>
          <Typography className={classes.sectionTitle}>Orquestrador</Typography>
          
          {/* Seletor de Prompt Orquestrador */}
          <Box className={classes.nodeList} style={{ marginBottom: 12 }}>
            <Typography variant="caption" style={{ color: "#666", marginBottom: 8, display: "block" }}>
              Selecione o prompt que será o cérebro/orquestrador:
            </Typography>
            <List dense style={{ maxHeight: 150, overflowY: "auto" }}>
              {allPrompts.map((prompt) => (
                <ListItem
                  key={prompt.id}
                  button
                  selected={workflow.orchestratorPromptId === prompt.id}
                  onClick={() => {
                    const updated = { ...workflow, orchestratorPromptId: prompt.id };
                    setWorkflow(updated);
                    buildGraphFromWorkflow(updated);
                  }}
                  style={{
                    borderRadius: 8,
                    marginBottom: 4,
                    backgroundColor: workflow.orchestratorPromptId === prompt.id ? "#eef2ff" : "transparent",
                    border: workflow.orchestratorPromptId === prompt.id ? "1px solid #6366f1" : "1px solid transparent"
                  }}
                >
                  <ListItemText 
                    primary={prompt.name} 
                    primaryTypographyProps={{
                      style: { 
                        fontWeight: workflow.orchestratorPromptId === prompt.id ? 600 : 400,
                        color: workflow.orchestratorPromptId === prompt.id ? "#6366f1" : "#1a1a1a"
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <TextField
            label="Nome do workflow"
            variant="outlined"
            fullWidth
            margin="dense"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
          />
          <TextField
            label="Descrição"
            variant="outlined"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
          />

          <Box mt={2}>
            <Typography className={classes.sectionTitle}>Agentes conectados</Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar agente"
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              <IconButton className={classes.addButton} onClick={openNewAgentModal}>
                <Add />
              </IconButton>
            </Box>

            <Box className={classes.nodeList} mt={1}>
              {filteredAgents.length === 0 ? (
                <Box p={1}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhum agente adicionado ainda.
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {filteredAgents.map((agent, index) => {
                    const prompt = allPrompts.find((p) => p.id === agent.agentPromptId);
                    return (
                      <ListItem
                        key={`${agent.agentPromptId}-${index}-${agent.alias}`}
                        className={classes.nodeListItem}
                      >
                        <ListItemText
                          primary={prompt ? prompt.name : `Agente ${index + 1}`}
                          secondary={agent.alias}
                        />
                        <IconButton size="small" onClick={() => openEditAgentModal(agent)}>
                          <Android fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveAgent(agent)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>
        </Box>

        <Box className={classes.canvasWrapper}>
          {loading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
              <Typography variant="body2" color="textSecondary">
                Carregando workflow de IA...
              </Typography>
            </Box>
          ) : (
            <Box className={classes.canvas}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
              >
                <Controls />
                <Background gap={16} color="#f3f4f6" />
              </ReactFlow>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={agentModalOpen} onClose={closeAgentModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAgent ? "Editar agente" : "Adicionar agente"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Apelido do agente"
            fullWidth
            margin="dense"
            variant="outlined"
            value={agentAlias}
            onChange={(e) => setAgentAlias(e.target.value)}
          />
          <Box mt={2}>
            <Typography className={classes.sectionTitle}>Selecionar prompt</Typography>
            <TextField
              placeholder="Buscar prompt"
              variant="outlined"
              fullWidth
              margin="dense"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Box className={classes.nodeList} mt={1}>
              <List dense>
                {filteredPrompts.map((prompt) => (
                  <ListItem
                    key={prompt.id}
                    button
                    selected={Number(agentPromptId) === prompt.id}
                    onClick={() => setAgentPromptId(prompt.id)}
                  >
                    <ListItemText primary={prompt.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAgentModal} color="default">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAgent}
            color="primary"
            variant="contained"
            startIcon={<Save />}
          >
            Salvar agente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IaWorkflowEditor;