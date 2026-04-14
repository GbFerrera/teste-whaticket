import React, { useState, useEffect } from "react";
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
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@material-ui/core";

import api from "../../services/api";
import { createProject, updateProject, getProject } from "../../services/projectService";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 400,
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      minWidth: "unset"
    }
  },
  row: {
    display: "flex",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column"
    }
  },
  fullWidth: {
    flex: 1
  },
  sectionTitle: {
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const STATUS_OPTIONS = [
  { label: "Rascunho", value: "draft" },
  { label: "Ativo", value: "active" },
  { label: "Pausado", value: "paused" },
  { label: "Concluído", value: "completed" },
  { label: "Cancelado", value: "cancelled" }
];

const WARRANTY_OPTIONS = [
  { label: "Sem garantia", value: "" },
  { label: "15 dias", value: "15 dias" },
  { label: "30 dias", value: "30 dias" },
  { label: "60 dias", value: "60 dias" },
  { label: "90 dias", value: "90 dias" },
  { label: "6 meses", value: "6 meses" },
  { label: "1 ano", value: "1 ano" }
];

const ProjectModal = ({ open, onClose, projectId, onSuccess, initialData }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [terms, setTerms] = useState("");
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [clientsRes, usersRes, servicesRes, productsRes] = await Promise.all([
          api.get("/crm/clients", { params: { limit: 100 } }),
          api.get("/users", { params: { limit: 100 } }),
          api.get("/servicos", { params: { limit: 100 } }),
          api.get("/produtos", { params: { limit: 100 } })
        ]);
        setClients(clientsRes.data.clients || clientsRes.data || []);
        setUsers(usersRes.data.users || usersRes.data || []);
        setServices(servicesRes.data.servicos || servicesRes.data || []);
        setProducts(productsRes.data.produtos || productsRes.data || []);
      } catch (err) {
        toastError(err);
      }
    };

    fetchData();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setClientId(initialData?.clientId || "");
      setStatus("draft");
      setStartDate("");
      setEndDate("");
      setWarranty("");
      setTerms("");
      setSelectedUsers([]);
      setSelectedServices([]);
      setSelectedProducts([]);
      return;
    }

    if (!projectId) {
      // Se for novo projeto e tiver clientId no initialData, usa ele
      if (initialData?.clientId) {
        setClientId(initialData.clientId);
      }
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      try {
        const project = await getProject(projectId);
        setName(project.name || "");
        setDescription(project.description || "");
        setClientId(project.clientId || "");
        setStatus(project.status || "draft");
        setStartDate(project.startDate ? project.startDate.split("T")[0] : "");
        setEndDate(project.endDate ? project.endDate.split("T")[0] : "");
        setWarranty(project.warranty || "");
        setTerms(project.terms || "");
        
        // Mapear usuários do projeto
        const projectUsers = (project.users || []).map(pu => pu.user || pu).filter(u => u && u.id);
        setSelectedUsers(projectUsers);
        
        // Mapear serviços do projeto
        const projectServices = (project.services || []).map(ps => ({
          ...(ps.service || ps),
          quantity: ps.quantity || 1
        })).filter(s => s && s.id);
        setSelectedServices(projectServices);
        
        // Mapear produtos do projeto
        const projectProducts = (project.products || []).map(pp => ({
          ...(pp.product || pp),
          quantity: pp.quantity || 1
        })).filter(p => p && p.id);
        setSelectedProducts(projectProducts);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [open, projectId]);

  const handleAddUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user && !selectedUsers.find(u => u.id === userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleAddService = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !selectedServices.find(s => s.id === serviceId)) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleAddProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product && !selectedProducts.find(p => p.id === productId)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    if (!clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description,
        clientId: Number(clientId),
        status,
        startDate: startDate || null,
        endDate: endDate || null,
        warranty,
        terms,
        userIds: selectedUsers.map(u => u.id),
        serviceIds: selectedServices.map(s => ({ serviceId: s.id, quantity: s.quantity || 1 })),
        productIds: selectedProducts.map(p => ({ productId: p.id, quantity: p.quantity || 1 }))
      };

      if (projectId) {
        await updateProject(projectId, payload);
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await createProject(payload);
        toast.success("Projeto criado com sucesso!");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const availableUsers = users.filter(u => u && u.id && !selectedUsers.find(su => su.id === u.id));
  const availableServices = services.filter(s => s && s.id && !selectedServices.find(ss => ss.id === s.id));
  const availableProducts = products.filter(p => p && p.id && !selectedProducts.find(sp => sp.id === p.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {projectId ? "Editar Projeto" : "Novo Projeto"}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              label="Nome do Projeto"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FormControl variant="outlined" fullWidth required>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                label="Cliente"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name} {client.companyName ? `(${client.companyName})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descrição"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Box className={classes.row}>
              <FormControl variant="outlined" className={classes.fullWidth}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" className={classes.fullWidth}>
                <InputLabel>Garantia</InputLabel>
                <Select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  label="Garantia"
                >
                  {WARRANTY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.row}>
              <TextField
                label="Data de Início"
                type="date"
                variant="outlined"
                className={classes.fullWidth}
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <TextField
                label="Data de Término"
                type="date"
                variant="outlined"
                className={classes.fullWidth}
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>

            <Typography className={classes.sectionTitle}>Equipe do Projeto</Typography>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Adicionar Usuário</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddUser(e.target.value)}
                label="Adicionar Usuário"
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedUsers.length > 0 && (
              <Box className={classes.chipContainer}>
                {selectedUsers.map((user) => (
                  <Chip
                    key={user.id}
                    label={user.name || "Usuário"}
                    onDelete={() => handleRemoveUser(user.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Typography className={classes.sectionTitle}>Serviços</Typography>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Adicionar Serviço</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddService(e.target.value)}
                label="Adicionar Serviço"
              >
                {availableServices.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name || service.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedServices.length > 0 && (
              <Box className={classes.chipContainer}>
                {selectedServices.map((service) => (
                  <Chip
                    key={service.id}
                    label={service.name || service.nome || "Serviço"}
                    onDelete={() => handleRemoveService(service.id)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Typography className={classes.sectionTitle}>Produtos</Typography>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Adicionar Produto</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddProduct(e.target.value)}
                label="Adicionar Produto"
              >
                {availableProducts.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name || product.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedProducts.length > 0 && (
              <Box className={classes.chipContainer}>
                {selectedProducts.map((product) => (
                  <Chip
                    key={product.id}
                    label={product.name || product.nome || "Produto"}
                    onDelete={() => handleRemoveProduct(product.id)}
                    color="default"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <TextField
              label="Termos e Condições"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Descreva os termos e condições do projeto..."
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || saving}
        >
          {saving ? <CircularProgress size={20} /> : projectId ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectModal;