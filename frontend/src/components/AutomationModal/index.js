import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  makeStyles
} from "@material-ui/core";
import {
  Close as CloseIcon,
  FlashOn as FlashIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon
} from "@material-ui/icons";
import useWhatsApps from "../../hooks/useWhatsApps";
import {
  createScheduledDispatcher,
  eventTypeOptions,
  getScheduledDispatcher,
  updateScheduledDispatcher
} from "../../services/scheduledDispatcherService";

const useStyles = makeStyles(theme => ({
  dialog: {
    "& .MuiDialog-paper": {
      maxWidth: 720,
      width: "100%",
      borderRadius: 24
    }
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  section: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontWeight: 600
  },
  field: {
    marginBottom: theme.spacing(2)
  },
  templateHint: {
    fontSize: 12,
    color: theme.palette.text.secondary
  },
  chipGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const defaultForm = {
  title: "",
  messageTemplate: "",
  eventType: "birthday",
  whatsappId: "",
  startTime: "09:00",
  sendIntervalSeconds: 60,
  daysBeforeDue: 0,
  daysAfterDue: 0,
  active: true
};

const ScheduledDispatcherModal = ({ open, onClose, dispatcher }) => {
  const classes = useStyles();
  const { whatsApps } = useWhatsApps();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const whatsappOptions = useMemo(
    () =>
      whatsApps.map(connection => ({
        value: connection.id,
        label: connection.name || `Conexão #${connection.id}`,
        channel: connection.channel
      })),
    [whatsApps]
  );

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setLoading(false);
      setSaving(false);
      return;
    }

    if (!dispatcher) {
      setForm(defaultForm);
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await getScheduledDispatcher(dispatcher.id);
        setForm({
          title: data.title || "",
          messageTemplate: data.messageTemplate || "",
          eventType: data.eventType || "birthday",
          whatsappId: data.whatsappId || "",
          startTime: data.startTime || "09:00",
          sendIntervalSeconds: data.sendIntervalSeconds || 60,
          daysBeforeDue: data.daysBeforeDue ?? 0,
          daysAfterDue: data.daysAfterDue ?? 0,
          active: data.active
        });
      } catch (error) {
        toast.error("Não foi possível carregar o disparo");
        onClose(false);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [dispatcher, open, onClose]);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitch = event => {
    const { name, checked } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Informe um título para a regra.");
      return;
    }
    if (!form.messageTemplate.trim()) {
      toast.error("Defina a mensagem a ser enviada.");
      return;
    }
    if (!form.whatsappId) {
      toast.error("Selecione a conexão WhatsApp.");
      return;
    }

    const payload = {
      ...form,
      whatsappId: form.whatsappId || null,
      sendIntervalSeconds: Number(form.sendIntervalSeconds),
      daysBeforeDue:
        form.eventType === "invoice_reminder"
          ? Number(form.daysBeforeDue || 0)
          : null,
      daysAfterDue:
        form.eventType === "invoice_overdue"
          ? Number(form.daysAfterDue || 0)
          : null
    };

    try {
      setSaving(true);
      if (dispatcher) {
        await updateScheduledDispatcher(dispatcher.id, payload);
        toast.success("Disparo atualizado com sucesso.");
      } else {
        await createScheduledDispatcher(payload);
        toast.success("Disparo criado com sucesso.");
      }
      onClose(true);
    } catch (error) {
      toast.error("Não foi possível salvar. Verifique os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const eventMeta = eventTypeOptions.find(item => item.value === form.eventType);
  const showDaysBefore = form.eventType === "invoice_reminder";
  const showDaysAfter = form.eventType === "invoice_overdue";

  return (
    <Dialog open={open} onClose={() => onClose(false)} className={classes.dialog}>
      <DialogTitle disableTypography className={classes.title}>
        <Box display="flex" alignItems="center" gap={8}>
          <FlashIcon />
          <div>
            <Typography variant="h6">
              {dispatcher ? "Editar disparo" : "Novo disparo automático"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configure quando e como a mensagem será enviada.
            </Typography>
          </div>
        </Box>
        <IconButton onClick={() => onClose(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box className={classes.section}>
              <Typography className={classes.sectionHeader}>
                <ScheduleIcon fontSize="small" /> Configurações
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Título"
                    name="title"
                    fullWidth
                    variant="outlined"
                    value={form.title}
                    onChange={handleChange}
                    className={classes.field}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl variant="outlined" fullWidth className={classes.field}>
                    <InputLabel>Evento</InputLabel>
                    <Select
                      name="eventType"
                      value={form.eventType}
                      onChange={handleChange}
                      label="Evento"
                    >
                      {eventTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {eventMeta && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      {eventMeta.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl variant="outlined" fullWidth className={classes.field}>
                  <InputLabel>Conexão WhatsApp</InputLabel>
                  <Select
                    name="whatsappId"
                    value={form.whatsappId}
                    onChange={handleChange}
                    label="Conexão WhatsApp"
                  >
                    {whatsappOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  label="Início (HH:mm)"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.field}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  label="Intervalo (seg)"
                  name="sendIntervalSeconds"
                  value={form.sendIntervalSeconds}
                  onChange={handleChange}
                  variant="outlined"
                  type="number"
                  fullWidth
                  className={classes.field}
                  inputProps={{ min: 10 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {showDaysBefore && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Dias antes do vencimento"
                    name="daysBeforeDue"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={form.daysBeforeDue}
                    onChange={handleChange}
                  />
                </Grid>
              )}
              {showDaysAfter && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Dias após o atraso"
                    name="daysAfterDue"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={form.daysAfterDue}
                    onChange={handleChange}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" height="100%">
                  <Switch
                    checked={form.active}
                    onChange={handleSwitch}
                    name="active"
                    color="primary"
                  />
                  <Typography variant="body2">
                    {form.active ? "Disparo ativo" : "Disparo desativado"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box className={classes.section}>
              <Typography className={classes.sectionHeader}>
                <MessageIcon fontSize="small" /> Mensagem
              </Typography>
              <TextField
                name="messageTemplate"
                value={form.messageTemplate}
                onChange={handleChange}
                multiline
                minRows={4}
                variant="outlined"
                fullWidth
                placeholder="Olá {{firstName}}, estamos passando para lembrar..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Total de caracteres">
                        <Chip label={`${form.messageTemplate.length}`} size="small" />
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
              <Typography className={classes.templateHint}>
                Dica: use variáveis como {"{{firstName}}"}, {"{{contactName}}"},
                {" {{invoiceDueDate}}"} para personalizar a mensagem.
              </Typography>
              <Box className={classes.chipGroup}>
                {[
                  "{{ms}}",
                  "{{firstName}}",
                  "{{contactName}}",
                  "{{invoiceDueDate}}",
                  "{{invoiceValue}}",
                  "{{connection}}"
                ].map(token => (
                  <Chip
                    key={token}
                    label={token}
                    size="small"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        messageTemplate: prev.messageTemplate + ` ${token}`
                      }))
                    }
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions style={{ padding: 16 }}>
        <Button onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || loading}
        >
          {saving ? <CircularProgress size={20} /> : "Salvar disparo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduledDispatcherModal;
