import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Tabs,
  Tab,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import MessageVariablesPicker from "../MessageVariablesPicker";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#111827",
    marginBottom: theme.spacing(1.5),
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  tabs: {
    marginBottom: theme.spacing(1.5),
  },
  codeField: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
}));

const defaultData = {
  variableName: "",
  valueType: "custom",
  editorMode: "text",
  customValue: "",
};

const valueTypeOptions = [
  { value: "custom", label: "Custom (valor personalizado)" },
  { value: "empty", label: "Empty (limpa valor)" },
  { value: "append", label: "Append value(s)" },
  { value: "environment", label: "Environment name" },
  { value: "device", label: "Device type" },
  { value: "transcript", label: "Transcript" },
  { value: "resultId", label: "Result ID" },
  { value: "now", label: "Now" },
];

const valueTypeDescription = {
  custom: "Defina manualmente o que será salvo (texto ou código).",
  empty: "Zera o conteúdo da variável.",
  append: "Adiciona o valor informado ao conteúdo atual.",
  environment: "Armazena o nome do ambiente (ex: produção).",
  device: "Armazena o tipo de dispositivo do usuário.",
  transcript: "Armazena a transcrição atual do atendimento.",
  resultId: "Armazena o ID do resultado da sessão.",
  now: "Salva a data/hora atual.",
};

const FlowBuilderAddVariableModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close,
}) => {
  const classes = useStyles();
  const [activeModal, setActiveModal] = useState(false);
  const [labels, setLabels] = useState({ title: "", btn: "" });
  const [formData, setFormData] = useState(defaultData);
  const [availableVariables, setAvailableVariables] = useState([]);

  const mergedData = useMemo(() => {
    if (!data?.data?.variableConfig) return defaultData;
    return {
      ...defaultData,
      ...data.data.variableConfig,
    };
  }, [data]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar variável", btn: "Salvar" });
      setFormData(mergedData);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Adicionar variável", btn: "Adicionar" });
      setFormData(defaultData);
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, mergedData]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("variables");
      if (!stored) {
        setAvailableVariables([]);
        return;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const sanitized = parsed
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
        setAvailableVariables([...new Set(sanitized)]);
      } else {
        setAvailableVariables([]);
      }
    } catch (error) {
      setAvailableVariables([]);
    }
  }, [open]);

  const persistVariableName = (name) => {
    if (!name) return;
    try {
      const stored = localStorage.getItem("variables");
      const vars = stored ? JSON.parse(stored) : [];
      const sanitized = Array.isArray(vars) ? vars : [];
      if (!sanitized.includes(name)) {
        localStorage.setItem("variables", JSON.stringify([...sanitized, name]));
      }
    } catch (error) {
      localStorage.setItem("variables", JSON.stringify([name]));
    }
  };

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInsertVariable = (variable) => {
    if (
      formData.valueType !== "custom" ||
      formData.editorMode !== "text" ||
      !variable
    ) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customValue: `${prev.customValue || ""}${variable}`,
    }));
  };

  const handleSave = () => {
    const variableName = formData.variableName.trim();
    if (!variableName) return;
    const payload = {
      variableConfig: {
        ...formData,
        variableName,
      },
    };

    if (open === "edit" && typeof onUpdate === "function") {
      onUpdate({
        ...data,
        data: {
          ...data.data,
          ...payload,
        },
      });
    } else if (open === "create" && typeof onSave === "function") {
      onSave(payload);
    }

    persistVariableName(variableName);
    handleClose();
  };

  const disabled = !formData.variableName.trim();

  return (
    <Dialog open={activeModal} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{labels.title}</DialogTitle>
      <DialogContent dividers>
        <Paper className={classes.section} elevation={0}>
          <Typography className={classes.sectionTitle}>
            Variável do fluxo
          </Typography>
          <Autocomplete
            freeSolo
            options={availableVariables}
            value={formData.variableName}
            onInputChange={(event, value) => handleFieldChange("variableName", value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome da variável"
                placeholder="ex: emailCliente"
                variant="outlined"
                margin="dense"
              />
            )}
          />
          <Typography className={classes.helperText}>
            Busque ou crie uma nova variável. O nome deve ser único dentro do fluxo.
          </Typography>
        </Paper>

        <Paper className={classes.section} elevation={0}>
          <Typography className={classes.sectionTitle}>
            Valor a ser salvo
          </Typography>
          <TextField
            select
            label="Tipo do valor"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.valueType}
            onChange={(event) => handleFieldChange("valueType", event.target.value)}
          >
            {valueTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography className={classes.helperText}>
            {valueTypeDescription[formData.valueType]}
          </Typography>

          {formData.valueType === "custom" && (
            <>
              <Tabs
                value={formData.editorMode}
                onChange={(event, value) => handleFieldChange("editorMode", value)}
                indicatorColor="primary"
                textColor="primary"
                className={classes.tabs}
              >
                <Tab label="Texto" value="text" />
                <Tab label="Código" value="code" />
              </Tabs>
              <TextField
                label={formData.editorMode === "text" ? "Conteúdo" : "Código"}
                multiline
                rows={formData.editorMode === "text" ? 5 : 8}
                variant="outlined"
                margin="dense"
                value={formData.customValue}
                onChange={(event) => handleFieldChange("customValue", event.target.value)}
                fullWidth
                placeholder={
                  formData.editorMode === "text"
                    ? "Olá {{nome}}, tudo certo?"
                    : "// Escreva um código para gerar o valor"
                }
                InputProps={{
                  className: formData.editorMode === "code" ? classes.codeField : undefined,
                }}
              />
              {formData.editorMode === "text" && (
                <MessageVariablesPicker onClick={handleInsertVariable} />
              )}
            </>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={disabled}
        >
          {labels.btn}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAddVariableModal;
