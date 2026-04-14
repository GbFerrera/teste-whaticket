import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Tabs, Tab, Box, Typography, Button } from "@material-ui/core";
import { Gavel as GavelIcon, Search as SearchIcon, AccountBalance as BalanceIcon, Description as DescriptionIcon } from "@material-ui/icons";

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

const Juridico = () => {
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
      alert("Por favor, informe um CPF/CNPJ para buscar");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar chamada à API
      console.log(`Buscando informações jurídicas ${type}:`, searchInput);
      // await api.post("/consultas/juridico", { type, value: searchInput });
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
            <Typography className={classes.headerTitle}>Consultas Jurídicas</Typography>
            <Typography className={classes.headerSubtitle}>
              Consulte informações jurídicas por CPF/CNPJ
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
          <Tab label="Ações e processos judiciais" />
          <Tab label="Certidão Nacional de Débitos Trabalhistas" />
          <Tab label="Dossiê Jurídico" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box className={classes.content} style={{ marginTop: 16 }}>
        <TabPanel value={tabValue} index={0}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Ações e processos judiciais
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Consulte ações e processos judiciais de pessoas físicas e jurídicas.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 9,50
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o CPF (apenas CPF)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={14}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("acoes_processos")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Processos"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Certidão Nacional de Débitos Trabalhistas
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Acesse os débitos inadimplidos perante a Justiça do Trabalho em execuções trabalhistas.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 9,50
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o CPF ou CNPJ"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("certidao_trabalhista")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Certidão"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Dossiê Jurídico
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Investigações jurídicas, consulta de bens e negociação de dívidas com dados de múltiplas fontes.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 15,76
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o CPF ou CNPJ"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("dosse_juridico")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Dossiê"}
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Juridico;
