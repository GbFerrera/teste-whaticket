import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { Grid, makeStyles, Box, Typography } from "@material-ui/core";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import UserStatusIcon from "../UserModal/statusIcon";
import { isNil } from "lodash";
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModalCustom = ({ modalOpen, onClose, ticketid, ticket }) => {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const isMounted = useRef(true);
  const [msgTransfer, setMsgTransfer] = useState('');

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // **LIMPEZA: Cancelar timeout ao desmontar**
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    
    const loadWhatsapps = async () => {
      try {
        const { data } = await api.get("/whatsapp/");
        setWhatsapps(data);
        // Se o ticket já tem uma conexão, selecionar ela
        if (ticket && ticket.whatsappId) {
          setSelectedWhatsapp(ticket.whatsappId);
        }
      } catch (err) {
        toastError(err);
      }
    };
    loadWhatsapps();
  }, [modalOpen, ticket]);

  // **CARREGAR TODOS OS USUÁRIOS AO ABRIR O MODAL**
  useEffect(() => {
    if (!modalOpen) return;
    
    const loadAllUsers = async () => {
      try {
        setLoading(true);
        console.log("📋 TransferModal: Carregando todos os usuários...");
        const { data } = await api.get("/users/");
        console.log("✅ TransferModal: Usuários carregados:", data.users?.length || 0);
        setOptions(data.users || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ TransferModal: Erro ao carregar usuários:", err);
        setLoading(false);
        toastError(err);
      }
    };
    
    loadAllUsers();
  }, [modalOpen]);


  // **CONTROLE DE REQUISIÇÕES: Evitar múltiplas buscas simultâneas**
  const searchTimeoutRef = useRef(null);
  const isSearchingRef = useRef(false);

  useEffect(() => {
    if (!modalOpen) {
      setLoading(false);
      return;
    }

    // Se busca muito curta, limpar opções mas não limpar fila
    if (searchParam.length < 2) {
      setLoading(false);
      setOptions([]);
      return;
    }

    // **BLOQUEAR MÚLTIPLAS REQUISIÇÕES**
    if (isSearchingRef.current) {
      console.log("⏱️ TransferModal: Ignorando busca - já em andamento");
      return;
    }

    // **CANCELAR TIMEOUT ANTERIOR**
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // **AGUARDAR 500ms ANTES DE BUSCAR** (reduzido de 800ms)
    searchTimeoutRef.current = setTimeout(() => {
      isSearchingRef.current = true;
      setLoading(true);
      
      const fetchUsers = async () => {
        try {
          console.log("🔍 TransferModal: Buscando usuários com:", searchParam);
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          console.log("✅ TransferModal: Usuários encontrados:", data.users?.length || 0);
          setOptions(data.users || []);
          setLoading(false);
        } catch (err) {
          console.error("❌ TransferModal: Erro ao buscar usuários:", err);
          setLoading(false);
          toastError(err);
        } finally {
          isSearchingRef.current = false;
        }
      };

      fetchUsers();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [searchParam, modalOpen]);

  const handleMsgTransferChange = (event) => {
    setMsgTransfer(event.target.value);
  };

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
    setSelectedWhatsapp("");
  };

  const handleSaveTicket = async (e) => {
    // e.preventDefault();
    if (!ticketid) return;
    if (!selectedQueue || selectedQueue === "") return;
    setLoading(true);
    try {
      let data = {};

      // **LÓGICA DE VINCULAÇÃO AUTOMÁTICA: Backend decide se vincula usuário**
      // Se selectedUser for null, backend verifica se o cliente tem responsável na fila
      data.userId = selectedUser ? selectedUser.id : null;
      data.status = ticket.isGroup ? "group" : "pending";
      data.queueId = selectedQueue;
      data.whatsappId = selectedWhatsapp || ticket.whatsappId;
      data.msgTransfer = msgTransfer ? msgTransfer : null;
      data.isTransfered = true;

      console.log("🔄 Transferência:", {
        ticketId: ticketid,
        conexaoAnterior: ticket.whatsappId,
        conexaoNova: data.whatsappId,
        conexaoAlterada: selectedWhatsapp && selectedWhatsapp !== ticket.whatsappId,
        queueId: selectedQueue,
        userId: data.userId,
        selectedUser: selectedUser?.name,
        hasAutoUser: !selectedUser ? "Backend decidirá" : "Usuário manual"
      });

      await api.put(`/tickets/${ticketid}`, data);
      setLoading(false);
      history.push("/atendimentos");
      handleClose();
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };


  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      {/* <form onSubmit={handleSaveTicket}> */}
      <DialogTitle id="form-dialog-title">
        {i18n.t("transferTicketModal.title")}
      </DialogTitle>
      <DialogContent dividers>
        {/* **INFO SOBRE VINCULAÇÃO AUTOMÁTICA** */}
        {!selectedUser && (
          <Box style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>🔄 Vinculação Automática:</strong> Se o ticket tiver um cliente com usuário responsável na fila selecionada, o sistema vinculará automaticamente ao usuário.
            </Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} xl={6}>
            <Autocomplete
              fullWidth
              getOptionLabel={(option) => `${option.name}`}
              onChange={(e, newValue) => {
                setSelectedUser(newValue);
                if (newValue != null && Array.isArray(newValue.queues)) {
                  if (newValue.queues.length === 1) {
                    setSelectedQueue(newValue.queues[0].id);
                  }
                  setQueues(newValue.queues);

                } else {
                  setQueues(allQueues);
                  setSelectedQueue("");
                }
              }}
              options={options}
              filterOptions={filterOptions}
              freeSolo
              autoHighlight
              noOptionsText={i18n.t("transferTicketModal.noOptions")}
              loading={loading}
              renderOption={option => (<span> <UserStatusIcon user={option} /> {option.name}</span>)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={i18n.t("transferTicketModal.fieldLabel")}
                  variant="outlined"
                  autoFocus
                  onChange={(e) => setSearchParam(e.target.value)}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid xs={12} sm={6} xl={6} item >
            <FormControl variant="outlined" fullWidth>
              <InputLabel>
                {i18n.t("transferTicketModal.fieldQueueLabel")}
              </InputLabel>
              <Select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
              >
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={12} xl={12} item >
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Conexão</InputLabel>
              <Select
                value={selectedWhatsapp}
                onChange={(e) => setSelectedWhatsapp(e.target.value)}
                label="Conexão"
              >
                {whatsapps.map((whatsapp) => (
                  <MenuItem key={whatsapp.id} value={whatsapp.id}>
                    {whatsapp.name} {whatsapp.status === "CONNECTED" ? "✓" : "✗"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<CancelIcon />}
          onClick={handleClose}
          style={{
          color: "white",
          backgroundColor: "#db6565",
          boxShadow: "none",
          borderRadius: 0
          }} 
          disabled={loading}
          variant="outlined"
        >
          {i18n.t("transferTicketModal.buttons.cancel")}
        </Button>
        <ButtonWithSpinner
          startIcon={<SwapHorizIcon />}
          variant="contained"
          type="submit"
          style={{
          color: "white",
          backgroundColor: "#437db5",
          boxShadow: "none",
          borderRadius: 0
          }}
          loading={loading}
          disabled={selectedQueue === ""}
          onClick={() => handleSaveTicket(selectedQueue)}

        >
          {i18n.t("transferTicketModal.buttons.ok")}
        </ButtonWithSpinner>
      </DialogActions>
      {/* </form> */}
    </Dialog>
  );
};

export default TransferTicketModalCustom;
