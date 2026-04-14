import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AddIcon from "@material-ui/icons/Add";
import CircularProgress from "@material-ui/core/CircularProgress";
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';


import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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

const selectFieldStyles = {
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "#909090"
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "thin"
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0000FF",
    borderWidth: "thin"
  }
};

const GLOBAL_VARIABLES = [
  { token: "{{firstName}}", label: "Primeiro nome do contato" },
  { token: "{{name}}", label: "Nome completo do contato" },
  { token: "{{userName}}", label: "Nome do usuário/atendente" },
  { token: "{{ms}}", label: "Saudação dinâmica (Bom dia/Boa tarde)" },
  { token: "{{protocol}}", label: "Número de protocolo do ticket" },
  { token: "{{date}}", label: "Data atual (dd-mm-yyyy)" },
  { token: "{{hour}}", label: "Hora atual (hh:mm:ss)" },
  { token: "{{ticket_id}}", label: "ID do ticket" },
  { token: "{{queue}}", label: "Nome da fila do ticket" },
  { token: "{{connection}}", label: "Nome da conexão WhatsApp" }
];

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite um nome!"),
  text: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite uma mensagem!")
});

const FlowBuilderConditionModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [conditions, setConditions] = useState([
    { key: "", condition: 1, value: "" }
  ]);

  const [dynamicVariables, setDynamicVariables] = useState([]);

  const normalizeVariableKey = (value = "") => {
    if (!value) return "";
    return value
      .replace(/^\s*{{\s*/, "")
      .replace(/\s*}}\s*$/, "")
      .trim();
  };

  const formatVariableLabel = (variable = "") => {
    const normalized = normalizeVariableKey(variable);
    return normalized ? `{{${normalized}}}` : "";
  };

  const [labels, setLabels] = useState({
    title: "Adicionar condição ao fluxo",
    btn: "Adicionar"
  });

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar condição",
        btn: "Salvar"
      });
      if (data?.data?.conditions && Array.isArray(data.data.conditions)) {
        setConditions(data.data.conditions);
      } else if (data?.data?.key) {
        setConditions([{
          key: formatVariableLabel(data.data.key),
          condition: data.data.condition ?? 1,
          value: data.data.value
        }]);
      } else {
        setConditions([{ key: "", condition: 1, value: "" }]);
      }
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar condição ao fluxo",
        btn: "Adicionar"
      });
      setConditions([{ key: "", condition: 1, value: "" }]);
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, data]);

  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem("variables");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDynamicVariables(parsed);
        } else {
          setDynamicVariables([]);
        }
      } else {
        setDynamicVariables([]);
      }
    } catch (error) {
      console.error("ConditionModal: erro ao carregar variáveis", error);
      setDynamicVariables([]);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleVariableClick = token => {
    if (!token) return;
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { key: "", condition: 1, value: "" }]);
  };

  const handleRemoveCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions.length > 0 ? newConditions : [{ key: "", condition: 1, value: "" }]);
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = async () => {
    const validConditions = conditions.filter(c => c.key.trim() && c.value.trim());
    
    if (validConditions.length === 0) {
      toast.error("Adicione pelo menos uma condição válida");
      return;
    }

    const payload = {
      conditions: validConditions.map(c => ({
        key: normalizeVariableKey(c.key),
        condition: c.condition,
        value: c.value
      }))
    };

    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: payload
      });
      return;
    } else if (open === "create") {
      handleClose();
      onSave(payload);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">{labels.title}</DialogTitle>
        <Stack>
          <Stack
            dividers
            style={{ height: "auto", gap: "8px", padding: "16px" }}
          >
            {conditions.map((condition, index) => (
              <Box key={index} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2">
                    Condição {index + 1}
                  </Typography>
                  {conditions.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCondition(index)}
                      color="secondary"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <TextField
                  label={"Campo da condição (ex: question_123)"}
                  rows={2}
                  name="text"
                  variant="outlined"
                  value={condition.key}
                  onChange={e => handleConditionChange(index, "key", e.target.value)}
                  helperText="Informe a chave/variável que armazena a resposta do contato"
                  className={classes.textField}
                  style={{ width: "95%", marginBottom: "8px" }}
                />
                <FormControl sx={{ width: "95%" }} size="medium">
                  <InputLabel sx={selectFieldStyles} id={`condition-rule-label-${index}`}>
                    Regra de validação
                  </InputLabel>
                  <Select
                    labelId={`condition-rule-label-${index}`}
                    id={`condition-rule-select-${index}`}
                    value={condition.condition}
                    label="Regra de validação"
                    onChange={e => handleConditionChange(index, "condition", e.target.value)}
                    variant="outlined"
                    color="primary"
                    sx={selectFieldStyles}
                  >
                    <MenuItem value={1}>
                      {"=="} — Palavra exata (mesma escrita)
                    </MenuItem>
                    <MenuItem value={6}>
                      Contém — Palavra/frase pode estar em qualquer parte da resposta
                    </MenuItem>
                    <MenuItem value={2}>
                      {">="} — Maior ou igual (aceita valores
                      acima ou iguais)
                    </MenuItem>
                    <MenuItem value={3}>
                      {"<="} — Menor ou igual (aceita valores
                      abaixo ou iguais)
                    </MenuItem>
                    <MenuItem value={4}>
                      {" < "} — Menor que (valor deve ser menor
                      que o informado)
                    </MenuItem>
                    <MenuItem value={5}>
                      {" > "} — Maior que (valor deve ser maior
                      que o informado)
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label={"Valor da condição a ser analisada"}
                  rows={2}
                  name="text"
                  variant="outlined"
                  value={condition.value}
                  onChange={e => handleConditionChange(index, "value", e.target.value)}
                  className={classes.textField}
                  style={{ width: "95%", marginTop: "8px" }}
                />
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddCondition}
              variant="outlined"
              color="primary"
              style={{ width: "95%" }}
            >
              Adicionar outra condição
            </Button>
            <Box
              sx={{
                width: "100%",
                p: 2,
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                backgroundColor: "#f8fafc"
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Variáveis disponíveis
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Formatos aceitos: <strong>{"{{variavel}}"}</strong> ou apenas <strong>question_nome</strong>.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Variáveis globais
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {GLOBAL_VARIABLES.map(variable => (
                  <Typography key={variable.token} variant="body2">
                    <strong>{variable.token}</strong> — {variable.label}
                  </Typography>
                ))}
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Variáveis do fluxo (Perguntas / API)
              </Typography>
              {dynamicVariables.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {dynamicVariables.map(variable => (
                    <Typography key={variable} variant="body2">
                      <strong>{formatVariableLabel(variable)}</strong> — Resposta salva para "{variable}"
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Ainda não há variáveis personalizadas salvas. Elas aparecem aqui após salvar uma pergunta ou ação de API com chave de resposta.
                </Typography>
              )}
            </Box>
          </Stack>
          <DialogActions>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleClose}
	      style={{
              color: "white",
              backgroundColor: "#db6565",
              boxShadow: "none",
              borderRadius: 0,
              fontSize: "12px",
              }}
              variant="outlined">
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              startIcon={<SaveIcon />}
              type="submit"
	      style={{
              color: "white",
              backgroundColor: "#db6565",
              boxShadow: "none",
              borderRadius: 0,
              fontSize: "12px",
              }}
              variant="contained"
              className={classes.btnWrapper}
              onClick={() => handleSaveContact()}
            >
              {`${labels.btn}`}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderConditionModal;
