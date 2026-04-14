import React, { useEffect, useState, useContext } from "react";
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
  CircularProgress,
  Chip
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
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
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "blocked", label: "Bloqueado" }
];

const TYPE_OPTIONS = [
  { value: "pf", label: "Pessoa Física" },
  { value: "pj", label: "Pessoa Jurídica" }
];

const defaultForm = {
  type: "pf",
  name: "",
  companyName: "",
  document: "",
  birthDate: "",
  email: "",
  phone: "",
  zipCode: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  status: "active",
  clientSince: "",
  ownerUserIds: [],
  notes: ""
};

const ClientModal = ({ open, onClose, clientId, onSuccess }) => {
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

    if (clientId) {
      loadClient();
    } else {
      setForm(defaultForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, open]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/crm/clients/${clientId}`);
      setForm({
        type: data.type || "pf",
        name: data.name || "",
        companyName: data.companyName || "",
        document: data.document || "",
        birthDate: data.birthDate ? data.birthDate.substring(0, 10) : "",
        email: data.email || "",
        phone: data.phone || "",
        zipCode: data.zipCode || "",
        address: data.address || "",
        number: data.number || "",
        complement: data.complement || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
        status: data.status || "active",
        clientSince: data.clientSince ? data.clientSince.substring(0, 10) : "",
        ownerUserIds: data.ownerUserIds || (data.ownerUserId ? [data.ownerUserId] : []),
        notes: data.notes || ""
      });
    } catch (err) {
      toastError(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (!form.name.trim()) {
        toast.error("O nome é obrigatório.");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...form,
        ownerUserIds: form.ownerUserIds && form.ownerUserIds.length > 0 ? form.ownerUserIds : undefined,
        birthDate: form.birthDate || undefined,
        clientSince: form.clientSince || undefined
      };

      if (clientId) {
        await api.put(`/crm/clients/${clientId}`, payload);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await api.post("/crm/clients", payload);
        toast.success("Cliente criado com sucesso!");
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
        {clientId ? "Editar Cliente" : "Novo Cliente"}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress size={24} />
          </Grid>
        ) : (
          <form onSubmit={handleSubmit} id="client-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Tipo"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                >
                  {TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
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
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  type="email"
                  fullWidth
                  className={classes.formField}
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
                  label="Cliente desde"
                  name="clientSince"
                  value={form.clientSince}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  type="date"
                  InputLabelProps={{ shrink: true }}
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
                  label="CEP"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Número"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Endereço"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Complemento"
                  name="complement"
                  value={form.complement}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bairro"
                  name="neighborhood"
                  value={form.neighborhood}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Cidade"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="UF"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  className={classes.formField}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              {!isProfessional && (
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    value={users.filter(u => form.ownerUserIds.includes(u.id))}
                    onChange={(event, newValue) => {
                      setForm(prev => ({
                        ...prev,
                        ownerUserIds: newValue.map(user => user.id)
                      }));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option.id}
                          label={option.name}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Responsáveis"
                        placeholder="Selecione os responsáveis"
                        className={classes.formField}
                      />
                    )}
                  />
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
          form="client-form"
          disabled={submitting || loading}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientModal;
