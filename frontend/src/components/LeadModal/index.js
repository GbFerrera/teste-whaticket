import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  makeStyles,
  CircularProgress
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    fontWeight: 600
  },
  formField: {
    marginBottom: theme.spacing(2)
  },
  dialogActions: {
    justifyContent: "space-between",
    padding: theme.spacing(2, 3)
  }
}));

const STATUS_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Qualificado" },
  { value: "unqualified", label: "Não qualificado" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" }
];

const TEMPERATURE_OPTIONS = ["frio", "morno", "quente"];

// Função para extrair parâmetros UTM da URL
const getUTMParameters = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmTerm = params.get('utm_term');
  const utmContent = params.get('utm_content');
  
  if (utmSource || utmMedium || utmCampaign) {
    const utmParams = [];
    if (utmSource) utmParams.push(`source: ${utmSource}`);
    if (utmMedium) utmParams.push(`medium: ${utmMedium}`);
    if (utmCampaign) utmParams.push(`campaign: ${utmCampaign}`);
    if (utmTerm) utmParams.push(`term: ${utmTerm}`);
    if (utmContent) utmParams.push(`content: ${utmContent}`);
    
    return {
      source: `UTM: ${utmParams.join(' | ')}`,
      campaign: utmCampaign || ''
    };
  }
  
  return { source: '', campaign: '' };
};

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  document: "",
  companyName: "",
  position: "",
  source: "",
  campaign: "",
  status: "new",
  score: 0,
  temperature: "",
  ownerUserId: "",
  notes: ""
};

const LeadModal = ({ open, onClose, leadId, onSuccess }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  
  const isProfessional = user?.userType?.toLowerCase() === "professional";

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/");
        setUsers(data.users || []);
      } catch (err) {
        toastError(err);
      }
    };

    fetchUsers();

    if (leadId) {
      loadLead();
    } else {
      // Para novos leads, preencher automaticamente com UTMs da URL
      const utmData = getUTMParameters();
      console.log('🔍 UTMs detectadas:', utmData);
      console.log('🌐 URL atual:', window.location.search);
      
      setForm({
        ...defaultForm,
        source: utmData.source || defaultForm.source,
        campaign: utmData.campaign || defaultForm.campaign
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, open]);

  const loadLead = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/crm/leads/${leadId}`);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthDate: data.birthDate ? data.birthDate.substring(0, 10) : "",
        document: data.document || "",
        companyName: data.companyName || "",
        position: data.position || "",
        source: data.source || "",
        campaign: data.campaign || "",
        status: data.status || "new",
        score: data.score || 0,
        temperature: data.temperature || "",
        ownerUserId: data.ownerUserId || "",
        notes: data.notes || ""
      });
    } catch (err) {
      toastError(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.name.trim()) {
        toast.error("O nome é obrigatório.");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...form,
        score: Number(form.score) || 0,
        ownerUserId: form.ownerUserId ? Number(form.ownerUserId) : undefined,
        temperature: form.temperature || null,
        birthDate: form.birthDate || undefined
      };

      if (leadId) {
        await api.put(`/crm/leads/${leadId}`, payload);
        toast.success("Lead atualizado com sucesso!");
      } else {
        await api.post("/crm/leads", payload);
        toast.success("Lead criado com sucesso!");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className={classes.dialogTitle}>
        {leadId ? "Editar Lead" : "Novo Lead"}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress size={24} />
          </Grid>
        ) : (
          <form onSubmit={handleSubmit} id="lead-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de nascimento"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento"
                  name="document"
                  value={form.document}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Empresa"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cargo"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fonte"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Campanha"
                  name="campaign"
                  value={form.campaign}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Temperatura"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                >
                  <MenuItem value="">Nenhuma</MenuItem>
                  {TEMPERATURE_OPTIONS.map((temp) => (
                    <MenuItem key={temp} value={temp}>
                      {temp}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Score"
                  name="score"
                  value={form.score}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  type="number"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              {!isProfessional && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Responsável"
                    name="ownerUserId"
                    value={form.ownerUserId}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    className={classes.formField}
                  >
                    <MenuItem value="">
                      Sem responsável
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          form="lead-form"
          disabled={submitting || loading}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadModal;
