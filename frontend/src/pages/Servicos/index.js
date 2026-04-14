import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import { toast } from "react-toastify";

import ServiceModal from "../../components/ServiceModal";
import { listServicos, deleteServico } from "../../services/servicosService";

const DISCOUNT_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Com desconto", value: "with" },
  { label: "Sem desconto", value: "without" }
];

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.5),
      gap: theme.spacing(2)
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5)
  },
  titleIcon: {
    fontSize: 40,
    color: theme.palette.primary.main
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      "& > *": {
        flex: 1,
        minWidth: "unset"
      }
    }
  },
  searchField: {
    minWidth: 220,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10
  },
  selectField: {
    minWidth: 160
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  },
  content: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    overflow: "hidden"
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    padding: theme.spacing(2.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch"
    }
  },
  list: {
    display: "flex",
    flexDirection: "column"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none"
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start"
    }
  },
  itemInfo: {
    flex: 1,
    minWidth: 0
  },
  itemNameRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap"
  },
  itemName: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  idChip: {
    fontWeight: 600,
    backgroundColor: theme.palette.grey[100]
  },
  itemDetails: {
    marginTop: theme.spacing(0.5),
    fontSize: 13,
    color: theme.palette.text.secondary
  },
  itemMeta: {
    marginTop: theme.spacing(1),
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    fontSize: 13,
    color: theme.palette.text.secondary
  },
  highlightValue: {
    color: theme.palette.text.primary,
    fontWeight: 600
  },
  actionsColumn: {
    display: "flex",
    gap: theme.spacing(1)
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: "center",
    color: theme.palette.text.secondary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1.5)
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`
  }
}));

const ServicosPage = () => {
  const classes = useStyles();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await listServicos();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Não foi possível carregar os serviços");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter(service => {
      const matchesText =
        !term ||
        service.nome?.toLowerCase().includes(term) ||
        service.descricao?.toLowerCase().includes(term) ||
        String(service.id).includes(term);
      const matchesDiscount =
        discountFilter === "" ||
        (discountFilter === "with" && service.possuiDesconto) ||
        (discountFilter === "without" && !service.possuiDesconto);
      return matchesText && matchesDiscount;
    });
  }, [services, search, discountFilter]);

  const handleOpenModal = (service = null) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    fetchServices();
  };

  const handleDelete = service => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServico(serviceToDelete.id);
      toast.success("Serviço removido com sucesso!");
      fetchServices();
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      toast.error("Não foi possível remover o serviço");
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const formatCurrency = value =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(value) || 0);

  const renderList = () => {
    if (loading) {
      return (
        <Box className={classes.loadingBox}>
          <CircularProgress size={20} />
          <Typography color="textSecondary">Carregando serviços...</Typography>
        </Box>
      );
    }

    if (!filteredServices.length) {
      return (
        <Box className={classes.emptyState}>
          <MonetizationOnIcon style={{ fontSize: 56 }} />
          <Typography variant="h6">Nenhum serviço encontrado</Typography>
          <Typography variant="body2" color="textSecondary">
            Ajuste os filtros ou cadastre um novo serviço para começar.
          </Typography>
        </Box>
      );
    }

    return (
      <div className={classes.list}>
        {filteredServices.map(service => (
          <div key={service.id} className={classes.listItem}>
            <div className={classes.itemInfo}>
              <div className={classes.itemNameRow}>
                <Typography className={classes.itemName}>{service.nome || "Sem nome"}</Typography>
                <Chip size="small" label={`ID ${service.id}`} className={classes.idChip} variant="outlined" />
                <Chip
                  size="small"
                  color={service.possuiDesconto ? "secondary" : "default"}
                  label={service.possuiDesconto ? "Com desconto" : "Preço cheio"}
                />
              </div>
              {service.descricao && (
                <Typography className={classes.itemDetails}>
                  {service.descricao.length > 140 ? `${service.descricao.slice(0, 140)}…` : service.descricao}
                </Typography>
              )}
              <div className={classes.itemMeta}>
                <span>
                  Valor original:{" "}
                  <strong className={classes.highlightValue}>{formatCurrency(service.valorOriginal)}</strong>
                </span>
                {service.possuiDesconto && (
                  <span>
                    Com desconto:{" "}
                    <strong className={classes.highlightValue}>{formatCurrency(service.valorComDesconto)}</strong>
                  </span>
                )}
                <span>
                  Atualizado: {service.updatedAt ? new Date(service.updatedAt).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            </div>
            <div className={classes.actionsColumn}>
              <Tooltip title="Editar serviço">
                <IconButton onClick={() => handleOpenModal(service)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir serviço">
                <IconButton onClick={() => handleDelete(service)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <MonetizationOnIcon className={classes.titleIcon} />
          <div>
            <Typography className={classes.title}>Serviços</Typography>
            <Typography className={classes.subtitle}>
              Gerencie o catálogo de serviços e mantenha sua equipe informada.
            </Typography>
          </div>
        </div>
        <div className={classes.actions}>
          <TextField
            className={classes.searchField}
            variant="outlined"
            size="small"
            placeholder="Buscar por nome, descrição ou ID"
            value={search}
            onChange={event => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            label="Filtro"
            variant="outlined"
            size="small"
            className={classes.selectField}
            value={discountFilter}
            onChange={event => setDiscountFilter(event.target.value)}
          >
            {DISCOUNT_FILTERS.map(filter => (
              <MenuItem key={filter.value} value={filter.value}>
                {filter.label}
              </MenuItem>
            ))}
          </TextField>
          <Chip label={`${filteredServices.length} serviço${filteredServices.length === 1 ? "" : "s"}`} variant="outlined" />
          <Button className={classes.addButton} startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenModal()}>
            Novo serviço
          </Button>
        </div>
      </div>

      <Paper className={classes.content}>{renderList()}</Paper>

      <ServiceModal
        open={modalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        onSuccess={handleModalSuccess}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remover serviço</DialogTitle>
        <DialogContent>
          <Typography>Deseja remover o serviço "{serviceToDelete?.nome}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="secondary" variant="contained" onClick={confirmDelete}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServicosPage;
