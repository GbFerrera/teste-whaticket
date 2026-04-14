import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  MenuItem,
} from "@material-ui/core";
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
    fontSize: "0.9rem",
    marginBottom: theme.spacing(1.5),
    color: "#111827",
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
}));

const defaultData = {
  connection: {
    connectionName: "",
    fromEmail: "",
    host: "",
    port: "587",
    username: "",
    password: "",
    useTLS: true,
  },
  message: {
    to: "",
    replyTo: "",
    cc: "",
    bcc: "",
    subject: "",
    customContent: false,
    contentMode: "html",
    content: "",
    attachmentsVariable: "",
  },
};

const FlowBuilderAddSmtpModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const [activeModal, setActiveModal] = useState(false);
  const [labels, setLabels] = useState({ title: "", btn: "" });
  const [formData, setFormData] = useState(defaultData);
  const [focusedField, setFocusedField] = useState("message.content");

  const mergedData = useMemo(() => {
    if (!data?.data) return defaultData;
    
    console.log("SMTP Modal - Data recebida:", data);
    console.log("SMTP Modal - data.data:", data.data);
    console.log("SMTP Modal - smtpConfig:", data.data?.smtpConfig);
    console.log("SMTP Modal - emailConfig:", data.data?.emailConfig);
    
    // Tentar diferentes caminhos onde os dados podem estar
    const smtpConfig = data.data?.smtpConfig || data.smtpConfig || {};
    const emailConfig = data.data?.emailConfig || data.emailConfig || {};
    
    console.log("SMTP Modal - smtpConfig final:", smtpConfig);
    console.log("SMTP Modal - emailConfig final:", emailConfig);
    
    return {
      connection: { ...defaultData.connection, ...smtpConfig },
      message: { ...defaultData.message, ...emailConfig },
    };
  }, [data]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar envio SMTP", btn: "Salvar" });
      setFormData(mergedData);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Adicionar envio SMTP", btn: "Adicionar" });
      setFormData(defaultData);
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, mergedData]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleChange = (section, field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleInsertVariable = (variable) => {
    if (!focusedField) return;
    const [section, field] = focusedField.split(".");
    if (!section || !field) return;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: `${prev[section][field] || ""}${variable}`,
      },
    }));
  };

  const handleSave = () => {
    const payload = {
      smtpConfig: formData.connection,
      emailConfig: formData.message,
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
    handleClose();
  };

  const textFieldProps = (section, field, extra = {}) => ({
    fullWidth: true,
    variant: "outlined",
    margin: "dense",
    value: formData[section][field],
    onChange: handleChange(section, field),
    onFocus: () => setFocusedField(`${section}.${field}`),
    ...extra,
  });

  return (
    <Dialog open={activeModal} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{labels.title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                Conexão SMTP
              </Typography>
              <TextField
                label="Nome da conexão"
                placeholder="Financeiro - Gmail"
                {...textFieldProps("connection", "connectionName")}
              />
              <TextField
                label="Remetente (from)"
                placeholder="contato@empresa.com"
                {...textFieldProps("connection", "fromEmail")}
              />
              <TextField
                label="Host SMTP"
                placeholder="smtp.gmail.com"
                {...textFieldProps("connection", "host")}
              />
              <TextField
                label="Porta"
                placeholder="587"
                {...textFieldProps("connection", "port")}
              />
              <TextField
                label="Usuário"
                placeholder="contato@empresa.com"
                {...textFieldProps("connection", "username")}
              />
              <TextField
                label="Senha"
                type="password"
                {...textFieldProps("connection", "password")}
              />
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={formData.connection.useTLS}
                    onChange={handleChange("connection", "useTLS")}
                  />
                }
                label="Usar TLS/SSL"
              />
              <Typography className={classes.helperText}>
                Os dados acima serão armazenados apenas neste fluxo.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                Destinatários
              </Typography>
              <TextField
                label="Para (To)"
                placeholder="email@cliente.com, {{email}}"
                {...textFieldProps("message", "to")}
              />
              <TextField
                label="Resposta para (Reply-To)"
                placeholder="suporte@empresa.com"
                {...textFieldProps("message", "replyTo")}
              />
              <TextField
                label="Cc"
                placeholder="diretoria@empresa.com"
                {...textFieldProps("message", "cc")}
              />
              <TextField
                label="Bcc"
                placeholder="auditoria@empresa.com"
                {...textFieldProps("message", "bcc")}
              />
              <Typography className={classes.helperText}>
                Separe múltiplos e-mails com vírgula. Você pode usar variáveis do
                fluxo (ex: {"{{email}}"}).
              </Typography>
            </Paper>

            <Paper className={classes.section} elevation={0}>
              <Typography className={classes.sectionTitle}>
                Conteúdo
              </Typography>
              <TextField
                label="Assunto"
                placeholder="Seu pedido {{pedido}} foi aprovado"
                {...textFieldProps("message", "subject")}
              />
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={formData.message.customContent}
                    onChange={handleChange("message", "customContent")}
                  />
                }
                label="Conteúdo personalizado"
              />
              <TextField
                label="Modo do conteúdo"
                select
                {...textFieldProps("message", "contentMode")}
              >
                <MenuItem value="text">Texto (text/plain)</MenuItem>
                <MenuItem value="html">HTML (text/html)</MenuItem>
              </TextField>
              <TextField
                label="Corpo do e-mail"
                multiline
                rows={6}
                placeholder="<h1>Olá {{name}}</h1><p><strong>Seu pedido {{pedido}} foi aprovado!</strong></p><br><p>Acesse: <a href='https://sistema.com'>Painel</a></p>"
                {...textFieldProps("message", "content")}
              />
              <Typography className={classes.helperText}>
                {formData.message.contentMode === "html" 
                  ? "Use tags HTML: &lt;b&gt;negrito&lt;/b&gt;, &lt;br&gt; quebra linha, &lt;h1&gt;título&lt;/h&gt;, etc."
                  : "Modo texto: sem formatação HTML."
                }
              </Typography>
              <TextField
                label="Variável com anexos"
                placeholder="{{anexos}}"
                {...textFieldProps("message", "attachmentsVariable")}
              />
            </Paper>
          </Grid>
        </Grid>

        <Divider style={{ margin: "16px 0" }} />

        <MessageVariablesPicker onClick={handleInsertVariable} />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Typography className={classes.helperText}>
          Todas as informações são salvas dentro deste fluxo.
        </Typography>
        <div>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            style={{ marginRight: 8 }}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            {labels.btn}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAddSmtpModal;
