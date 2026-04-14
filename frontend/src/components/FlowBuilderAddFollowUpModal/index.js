import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
    minWidth: "500px",
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: "100%",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  chipInput: {
    marginTop: theme.spacing(1),
  },
  previewBox: {
    backgroundColor: "#f3f4f6",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

const ACTION_TYPES = [
  { value: "sendMessageFlow", label: "Enviar mensagem" },
  { value: "addTag", label: "Adicionar tag(s)" },
  { value: "addTagKanban", label: "Adicionar tag kanban" },
  { value: "transferQueue", label: "Transferir para fila" },
  { value: "closeTicket", label: "Fechar ticket" },
  { value: "transferFlow", label: "Transferir para outro fluxo" },
  { value: "sendMessageFlowWithMenu", label: "Enviar mensagem com menu" },
];

const FlowBuilderAddFollowUpModal = ({ open, onClose, onSave, initialData }) => {
  const classes = useStyles();
  const [delayMinutes, setDelayMinutes] = useState(initialData?.delayMinutes || 15);
  const [actionType, setActionType] = useState(initialData?.action?.type || "sendMessageFlow");
  const [messageText, setMessageText] = useState(initialData?.action?.payload?.text || "");
  const [tags, setTags] = useState(initialData?.action?.payload?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [kanbanTags, setKanbanTags] = useState(initialData?.action?.payload?.kanbanTags || []);
  const [selectedKanbanTag, setSelectedKanbanTag] = useState(initialData?.action?.payload?.kanbanTagId || "");
  const [queueId, setQueueId] = useState(initialData?.action?.payload?.queueId || "");
  const [flowId, setFlowId] = useState(initialData?.action?.payload?.flowId || "");
  const [flows, setFlows] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [kanbanTagList, setKanbanTagList] = useState([]);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar flows
        const { data: flowsData } = await api.get("/flowbuilder");
        setFlows(flowsData.flows || []);

        // Buscar tags normais (kanban: 0)
        const { data: normalTagsData } = await api.get("/tags/list", { params: { kanban: 0 } });
        setAllTags(normalTagsData || []);

        // Buscar tags kanban (kanban: 1)
        const { data: kanbanTagsData } = await api.get("/tags/list", { params: { kanban: 1 } });
        setKanbanTagList(kanbanTagsData || []);

        // Buscar filas
        const { data: queuesData } = await api.get("/queue");
        setQueues(queuesData || []);
      } catch (err) {
        toastError(err);
      }
    };
    fetchData();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSave = () => {
    const payload = {};
    switch (actionType) {
      case "sendMessageFlow":
      case "sendMessageFlowWithMenu":
        if (!messageText.trim()) {
          toast.error("Digite o texto da mensagem");
          return;
        }
        payload.text = messageText.trim();
        break;
      case "addTag":
        if (tags.length === 0) {
          toast.error("Adicione pelo menos uma tag");
          return;
        }
        payload.tags = tags;
        break;
      case "addTagKanban":
        if (!selectedKanbanTag) {
          toast.error("Selecione uma tag kanban");
          return;
        }
        payload.kanbanTagId = selectedKanbanTag;
        break;
      case "transferQueue":
        if (!queueId) {
          toast.error("Selecione uma fila");
          return;
        }
        payload.queueId = queueId;
        break;
      case "closeTicket":
        // sem payload adicional
        break;
      case "transferFlow":
        if (!flowId) {
          toast.error("Selecione um fluxo");
          return;
        }
        payload.flowId = flowId;
        break;
      default:
        break;
    }

    onSave({
      delayMinutes,
      action: {
        type: actionType,
        payload,
      },
    });
    onClose();
  };

  const renderActionFields = () => {
    switch (actionType) {
      case "sendMessageFlow":
      case "sendMessageFlowWithMenu":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Texto da mensagem"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            variant="outlined"
            className={classes.formControl}
          />
        );
      case "addTag":
        return (
          <Box className={classes.formControl}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tags disponíveis</InputLabel>
              <Select
                multiple
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                label="Tags disponíveis"
                renderValue={(selected) => (
                  <div className={classes.chipContainer}>
                    {selected.map((value) => {
                      const tag = allTags.find(t => t.id === value);
                      return (
                        <Chip
                          key={value}
                          label={tag?.name || value}
                          style={{ backgroundColor: tag?.color || '#999', color: 'white' }}
                          size="small"
                        />
                      );
                    })}
                  </div>
                )}
              >
                {allTags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    <Box display="flex" alignItems="center">
                      <Box
                        width={12}
                        height={12}
                        borderRadius="50%"
                        backgroundColor={tag.color || '#999'}
                        marginRight={1}
                      />
                      {tag.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case "addTagKanban":
        return (
          <FormControl fullWidth variant="outlined" className={classes.formControl}>
            <InputLabel>Tag Kanban</InputLabel>
            <Select value={selectedKanbanTag} onChange={(e) => setSelectedKanbanTag(e.target.value)} label="Tag Kanban">
              <MenuItem value="">Selecione...</MenuItem>
              {kanbanTagList.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  <Box display="flex" alignItems="center">
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      backgroundColor={tag.color || '#06b6d4'}
                      marginRight={1}
                    />
                    {tag.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "transferQueue":
        return (
          <FormControl fullWidth variant="outlined" className={classes.formControl}>
            <InputLabel>Fila de destino</InputLabel>
            <Select value={queueId} onChange={(e) => setQueueId(e.target.value)} label="Fila de destino">
              <MenuItem value="">Selecione...</MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  <Box display="flex" alignItems="center">
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      backgroundColor={queue.color || '#999'}
                      marginRight={1}
                    />
                    {queue.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "transferFlow":
        return (
          <FormControl fullWidth variant="outlined" className={classes.formControl}>
            <InputLabel>Fluxo de destino</InputLabel>
            <Select value={flowId} onChange={(e) => setFlowId(e.target.value)} label="Fluxo de destino">
              <MenuItem value="">Selecione...</MenuItem>
              {flows.map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "closeTicket":
        return (
          <Typography variant="body2" color="textSecondary" className={classes.formControl}>
            Esta ação irá fechar o ticket automaticamente após o delay.
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Editar Follow-up" : "Configurar Follow-up"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          fullWidth
          label="Delay (minutos)"
          type="number"
          value={delayMinutes}
          onChange={(e) => setDelayMinutes(Number(e.target.value))}
          variant="outlined"
          className={classes.formControl}
        />

        <FormControl fullWidth variant="outlined" className={classes.formControl}>
          <InputLabel>Tipo de ação</InputLabel>
          <Select value={actionType} onChange={(e) => setActionType(e.target.value)} label="Tipo de ação">
            {ACTION_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderActionFields()}

        <Box className={classes.previewBox}>
          <Typography variant="subtitle2">Preview</Typography>
          <Typography variant="body2">
            Após <strong>{delayMinutes} min</strong>, será executado: <strong>{ACTION_TYPES.find(t => t.value === actionType)?.label}</strong>
            {actionType === "sendMessageFlow" && messageText && (
              <><br />Mensagem: "{messageText}"</>
            )}
            {actionType === "addTag" && tags.length > 0 && (
              <><br />Tags: {tags.join(", ")}</>
            )}
            {actionType === "transferFlow" && flowId && (
              <><br />Fluxo: {flows.find(f => f.id === flowId)?.name}</>
            )}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {initialData ? "Salvar edição" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAddFollowUpModal;
