import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ProfissionalModal from "../../components/ProfissionalModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  listProfissionais,
  deleteProfissional
} from "../../services/profissionaisService";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  searchWrapper: {
    marginBottom: theme.spacing(2),
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    alignItems: "center"
  },
  cardsGrid: {
    marginTop: theme.spacing(1)
  },
  professionalCard: {
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1)
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "1.1rem"
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  moneyRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(1)
  },
  agendaList: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.85rem"
  }
}));

const ProfissionaisPage = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState(null);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProfessionals(professionals);
    } else {
      const term = search.toLowerCase();
      setFilteredProfessionals(
        professionals.filter((prof) =>
          prof.nome?.toLowerCase().includes(term)
        )
      );
    }
  }, [search, professionals]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const { data } = await listProfissionais();
      setProfessionals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast.error("Não foi possível carregar os profissionais");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (professional = null) => {
    setSelectedProfessional(professional);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProfessional(null);
    setModalOpen(false);
  };

  const handleDelete = (professional) => {
    setProfessionalToDelete(professional);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!professionalToDelete) return;
    try {
      await deleteProfissional(professionalToDelete.id);
      toast.success("Profissional removido com sucesso!");
      fetchProfessionals();
    } catch (error) {
      console.error("Erro ao remover profissional:", error);
      toast.error("Não foi possível remover o profissional");
    } finally {
      setDeleteDialogOpen(false);
      setProfessionalToDelete(null);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(value));
  };

  const formatServices = (servicos) => {
    if (!Array.isArray(servicos) || servicos.length === 0) return "Sem serviços vinculados";
    return servicos
      .map((service) => (typeof service === "string" ? service : service?.nome))
      .filter(Boolean)
      .join(", ");
  };

  const formatAgendaDias = (agenda) => {
    if (!Array.isArray(agenda) || agenda.length === 0) return "Agenda não configurada";
    const dias = agenda
      .map((item) => item?.dia)
      .filter(Boolean);
    return dias.length > 0 ? dias.join(", ") : "Agenda não configurada";
  };

  const isAdmin = user?.profile === "admin";
  if (!isAdmin) {
    return (
      <MainContainer>
        <Box className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            Acesso negado
          </Typography>
          <Typography variant="body1">
            Apenas administradores podem acessar esta página.
          </Typography>
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Profissionais</Title>
        <MainHeaderButtonsWrapper>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal()}
          >
            Novo Profissional
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.searchWrapper}>
          <TextField
            label="Buscar profissional"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Chip
            label={`${filteredProfessionals.length} profissional${filteredProfessionals.length === 1 ? "" : "is"}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {loading ? (
          <Box className={classes.emptyState}>
            <Typography>Carregando profissionais...</Typography>
          </Box>
        ) : filteredProfessionals.length === 0 ? (
          <Box className={classes.emptyState}>
            <PeopleIcon style={{ fontSize: 48, marginBottom: 16 }} />
            <Typography variant="h6">Nenhum profissional cadastrado</Typography>
            <Typography variant="body2">
              Clique em "Novo Profissional" para adicionar o primeiro membro da equipe.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className={classes.cardsGrid}>
            {filteredProfessionals.map((professional) => (
              <Grid item xs={12} sm={6} md={4} key={professional.id}>
                <Card className={classes.professionalCard}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Typography className={classes.cardTitle}>
                        {professional.nome}
                      </Typography>
                      <Chip
                        label={professional.ativo ? "Ativo" : "Inativo"}
                        color={professional.ativo ? "primary" : "default"}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="textSecondary">
                      Serviços: {formatServices(professional.servicos)}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" className={classes.agendaList}>
                      Dias atendidos: {formatAgendaDias(professional.agenda)}
                    </Typography>

                    <Box className={classes.moneyRow}>
                      <Typography variant="body2">
                        Comissão: <strong>{professional.comissao || 0}%</strong>
                      </Typography>
                      <Typography variant="body2">
                        Valor aberto: <strong>{formatCurrency(professional.valorEmAberto)}</strong>
                      </Typography>
                    </Box>
                    <Box className={classes.moneyRow}>
                      <Typography variant="body2">
                        Recebido: <strong>{formatCurrency(professional.valoresRecebidos)}</strong>
                      </Typography>
                      <Typography variant="body2">
                        A receber: <strong>{formatCurrency(professional.valoresAReceber)}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleOpenModal(professional)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(professional)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <ProfissionalModal
        open={modalOpen}
        onClose={handleCloseModal}
        profissional={selectedProfessional}
        onSuccess={fetchProfessionals}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remover Profissional</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja remover o profissional "{professionalToDelete?.nome}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="secondary" variant="contained" onClick={confirmDelete}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default ProfissionaisPage;
