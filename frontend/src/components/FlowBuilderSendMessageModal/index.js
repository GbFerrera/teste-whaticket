import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { Stack } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import MessageVariablesPicker from "../MessageVariablesPicker";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  textField: {
    marginBottom: 0,
  },
  formControl: {
    marginBottom: 0,
  },
  switchContainer: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(2),
    flexWrap: "wrap"
  },
  btnWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const FlowBuilderSendMessageModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const [apiToken, setApiToken] = useState("");
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [queueId, setQueueId] = useState("");
  const [sendSignature, setSendSignature] = useState(false);
  const [closeTicket, setCloseTicket] = useState(false);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = data && data.id;

  useEffect(() => {
    const fetchQueues = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        setQueues(data || []);
      } catch (err) {
        console.error("Erro ao buscar filas:", err);
        toast.error("Erro ao buscar filas");
        setQueues([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueues();
  }, [open]);

  useEffect(() => {
    if (isEditing && data) {
      console.log("SendMessageModal: Carregando dados para edição", data);
      console.log("SendMessageModal: data.data", data.data);

      // O nó pode armazenar os dados em diferentes profundidades (data, data.data, etc.)
      const nodeData = data?.data || data;
      const payload = nodeData?.data || nodeData;
      console.log("SendMessageModal: payload final", payload);

      setApiToken(payload?.apiToken || "");
      setMessage(payload?.message || "");
      setPhoneNumber(payload?.phoneNumber || "");
      setQueueId(payload?.queueId || "");
      setSendSignature(payload?.sendSignature || false);
      setCloseTicket(payload?.closeTicket || false);
    }
  }, [data, isEditing]);

  const handleClose = () => {
    setApiToken("");
    setMessage("");
    setPhoneNumber("");
    setQueueId("");
    setSendSignature(false);
    setCloseTicket(false);
    setQueues([]);
    setLoading(false);
    close();
  };

  const handleInsertVariable = (variable) => {
    setMessage(prev => prev + variable);
  };

  const handleSave = () => {
    if (!apiToken.trim()) {
      toast.error("Digite o token da API");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Digite a mensagem");
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast.error("Digite o número de telefone");
      return;
    }

    const sendData = {
      apiToken: apiToken.trim(),
      message: message.trim(),
      phoneNumber: phoneNumber.trim(),
      queueId: queueId || "",
      sendSignature,
      closeTicket
    };

    if (isEditing) {
      onUpdate({ data: sendData });
    } else {
      onSave({ data: sendData });
    }
    
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SendIcon color="primary" />
          <span>
            {isEditing ? "Editar Mensagem WhatsApp" : "Enviar Mensagem WhatsApp"}
          </span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <div className={classes.root}>
          <TextField
            label="Token da API"
            variant="outlined"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Digite o token de autenticação"
            className={classes.textField}
            fullWidth
            helperText="Token da API para envio de mensagens"
          />

          <TextField
            label="Número de Telefone"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="558599999999"
            className={classes.textField}
            fullWidth
            helperText="Apenas números, com DDD e código do país"
          />

          <FormControl className={classes.formControl} variant="outlined" fullWidth>
            <InputLabel id="queue-select-label">Fila (Opcional)</InputLabel>
            <Select
              labelId="queue-select-label"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              label="Fila (Opcional)"
              fullWidth
              disabled={loading}
            >
              <MenuItem value="">
                <em>Sem fila</em>
              </MenuItem>
              {queues && queues.length > 0 ? (
                queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Nenhuma fila encontrada
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Mensagem"
            variant="outlined"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            className={classes.textField}
            fullWidth
            helperText="Suporta variáveis: {{name}}, {{firstName}}, {{ms}} e variáveis de perguntas/API (ex: {{cpf}}, {{email}})"
          />

          <MessageVariablesPicker onClick={handleInsertVariable} />

          <div className={classes.switchContainer}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendSignature}
                  onChange={(e) => setSendSignature(e.target.checked)}
                  color="primary"
                />
              }
              label="Assinar mensagem"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={closeTicket}
                  onChange={(e) => setCloseTicket(e.target.checked)}
                  color="primary"
                />
              }
              label="Encerrar ticket após envio"
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
          variant="outlined"
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {isEditing ? "Atualizar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderSendMessageModal;
