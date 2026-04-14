import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Tabs, Tab, Box, Typography, Paper, Button } from "@material-ui/core";
import { Search as SearchIcon, Description as DescriptionIcon, Business as BusinessIcon, Phone as PhoneIcon, Email as EmailIcon, CardGiftcard as CardIcon, People as PeopleIcon, Smartphone as SmartphoneIcon, AccountBalance as AccountBalanceIcon } from "@material-ui/icons";
import { i18n } from "../../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  tabsBar: {
    padding: "0 24px",
    borderBottom: "1px solid #e0e0e0",
  },
  content: {
    padding: "0 24px 16px",
  },
  searchSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  searchInput: {
    width: "100%",
    padding: theme.spacing(2),
    fontSize: "1.1rem",
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
  },
  searchButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const Dados = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchInput("");
  };

  const handleSearch = async (type) => {
    if (!searchInput.trim()) {
      alert("Por favor, informe uma placa ou documento para buscar");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar chamada à API
      console.log(`Buscando ${type}:`, searchInput);
      // await api.post("/consultas/dados", { type, value: searchInput });
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao realizar busca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": theme.palette.primary.main || "#3b82f6" }}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Consulta de Dados</Typography>
            <Typography className={classes.headerSubtitle}>
              Busque informações por placa, CPF ou CNPJ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box className={classes.tabsBar}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Consulta Placa" />
          <Tab label="Consulta CNPJ" />
          <Tab label="Consulta CPF" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box className={classes.content} style={{ marginTop: 16 }}>
        <TabPanel value={tabValue} index={0}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Buscar dados pela placa
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Digite a placa do veículo para obter informações completas incluindo dados gerais, endereços, telefones, e-mails, benefício INSS, parentes, celulares e empresas relacionadas.
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo (ex: ABC1234)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("placa")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Buscando..." : "Buscar Placa"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Consultar CNPJ
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Pesquise pelo CNPJ e receba os dados completos da empresa, incluindo informações cadastrais, situação fiscal, endereço e dados de contato.
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o CNPJ (ex: 00.000.000/0001-00)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={18}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("cnpj")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar CNPJ"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Consultar CPF
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              A busca mais completa de CPF, retornando dados de mais de 400 bases unificadas. Tenha acesso a dados cadastrais, contatos, endereços, documentos, contas bancárias, dívidas, imóveis, veículos, empregos, benefícios, informações políticas e empresas.
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o CPF (ex: 000.000.000-00)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={14}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("cpf")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar CPF"}
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Dados;
