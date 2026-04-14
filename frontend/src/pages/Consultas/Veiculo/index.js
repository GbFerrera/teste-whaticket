import React, { useState, useEffect, useRef } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Tabs, Tab, Box, Typography, Button, Paper, IconButton, Tooltip, CircularProgress, Alert } from "@material-ui/core";
import { Alert as MuiAlert } from "@material-ui/lab";
import { DirectionsCar as CarIcon, Search as SearchIcon, LocalGasStation as GasIcon, Build as BuildIcon, Description as DescriptionIcon, GetApp as DownloadIcon, FileCopy as CopyIcon, PictureAsPdf as PdfIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "react-toastify/dist/ReactToastify.css";
import useApiKeySettings from "../../../hooks/useApiKeySettings";

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
    padding: "0 12px",
    borderBottom: "1px solid #e0e0e0",
  },
  tabLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    minWidth: "auto",
    padding: "6px 8px",
    textTransform: "none",
  },
  content: {
    padding: "0 12px 12px",
  },
  searchSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
  resultSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e0e0e0",
  },
  resultTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  resultActions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  actionButton: {
    padding: theme.spacing(1),
    borderRadius: 8,
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  resultContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  resultItem: {
    padding: theme.spacing(2),
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    border: "1px solid #e9ecef",
  },
  resultLabel: {
    fontSize: "0.875rem",
    color: "#666",
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
  },
  resultValue: {
    fontSize: "1rem",
    color: "#1a1a1a",
    fontWeight: 600,
  },
  historySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    border: "1px solid #e9ecef",
  },
  historyTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: "#1a1a1a",
  },
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: theme.spacing(1),
  },
  historyItem: {
    padding: theme.spacing(1.5),
    backgroundColor: "#fff",
    borderRadius: 6,
    border: "1px solid #e0e0e0",
    textAlign: "center",
  },
  historyMonth: {
    fontSize: "0.8rem",
    color: "#666",
    marginBottom: theme.spacing(0.5),
  },
  historyValue: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#2e7d32",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
  },
  errorAlert: {
    marginBottom: theme.spacing(2),
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

const Veiculo = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fipeData, setFipeData] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const { get } = useApiKeySettings();
  
  // **CONTROLE DE REQUISIÇÕES: Evitar múltiplas requisições simultâneas**
  const searchTimeoutRef = useRef(null);
  const isSearchingRef = useRef(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Carregar a chave da API do banco de dados na inicialização
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        console.log("🔍 Iniciando carregamento da chave da API...");
        const apiKeyData = await get();
        console.log("📊 Dados brutos da API:", apiKeyData);
        
        if (Array.isArray(apiKeyData) && apiKeyData.length > 0) {
          const apiKeyRecord = apiKeyData[0];
          console.log("📋 Registro da API encontrado:", apiKeyRecord);
          
          if (apiKeyRecord.apiKeyConsultas) {
            setApiKey(apiKeyRecord.apiKeyConsultas);
            console.log("✅ Chave apiKeyConsultas carregada do banco:", apiKeyRecord.apiKeyConsultas.substring(0, 10) + "...");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar chave da API:", error);
      }
    };
    
    loadApiKey();
  }, [get]);
  
  // **LIMPEZA: Cancelar timeout ao desmontar**
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  // Token temporário para teste (substitua por um token válido)
  // Exemplo: const tempToken = "eyJpc3MiOiJhcGkuYXBpZnVsbC5jb20uYnIiLCJpYXQiOjE3NzI0MDc2OTgsImV4cCI6MTgwMzk4Njg5OCwic3ViIjoiYW12YmVzdGRpZ2l0YWxAZ21haWwuY29tIn0=.nl7MzEMT3xui337msKnma7RuCFIDBUM73Z8X9ponA3k=";
  // Token válido para teste (gerado agora):
  const tempToken = "TESTE_NOVO_TOKEN";  // Substitua pelo token que funciona no Postman
  
  // Usar token temporário se o do banco não estiver disponível
  const finalApiKey = apiKey || tempToken;

  const handleSearch = async (type) => {
    if (!searchInput.trim()) {
      toast.error("Por favor, informe uma placa para buscar");
      return;
    }

    // **BLOQUEAR MÚLTIPLAS REQUISIÇÕES**
    if (isSearchingRef.current) {
      console.log("⏱️ FIPE: Ignorando busca - já em andamento");
      return;
    }

    // **CANCELAR TIMEOUT ANTERIOR**
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // **AGUARDAR 500ms ANTES DE BUSCAR**
    searchTimeoutRef.current = setTimeout(async () => {
      isSearchingRef.current = true;
      
      try {
        if (type === "fipe") {
          await handleFipeSearch();
        } else {
          // TODO: Implementar outras consultas
          toast.info(`Consulta ${type} em desenvolvimento`);
        }
      } finally {
        isSearchingRef.current = false;
      }
    }, 500);
  };

  const handleFipeSearch = async () => {
    setLoading(true);
    setError(null);
    setFipeData(null);

    try {
      console.log("🔍 Iniciando busca FIPE...");
      console.log("🔑 Usando token:", finalApiKey.substring(0, 20) + "...");
      console.log("� Token completo:", finalApiKey);
      console.log("🔑 Token length:", finalApiKey.length);
      console.log("�� Placa consultada:", searchInput.toUpperCase());

      const requestBody = {
        placa: searchInput.toUpperCase(),
        link: "fipe"
      };

      const response = await fetch(`/api/fipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log("📡 Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);
        throw new Error(`Erro na consulta: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📊 Dados recebidos:", data);
      
      if (data.status === 'sucesso') {
        setFipeData(data);
        toast.success("✅ Consulta FIPE realizada com sucesso!");
      } else {
        throw new Error(data.mensagem || data.message || "Erro na consulta FIPE");
      }
    } catch (error) {
      console.error("❌ Erro na busca FIPE:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!fipeData) return;
    
    const formattedData = formatFipeData(fipeData);
    navigator.clipboard.writeText(formattedData).then(() => {
      toast.success("Dados copiados para a área de transferência!");
    }).catch(() => {
      toast.error("Erro ao copiar dados");
    });
  };

  const downloadPDF = () => {
    if (!fipeData) return;

    const doc = new jsPDF();
    const data = fipeData.dados[0];
    
    // Título
    doc.setFontSize(18);
    doc.text("Consulta FIPE", 20, 20);
    
    // Informações principais
    doc.setFontSize(12);
    let yPosition = 40;
    
    doc.text(`Valor: R$ ${data.valor.toLocaleString('pt-BR')}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Código FIPE: ${data.codigoFipe}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Ano Modelo: ${data.anoModelo}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Ano Fabricação: ${data.anoFabricacao}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Mês Referência: ${data.mesReferencia}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Marca: ${data.marca}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Modelo: ${data.modelo}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Categoria: ${data.categoria}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Combustível: ${data.combustivel}`, 20, yPosition);
    
    // Histórico de valores
    yPosition += 20;
    doc.setFontSize(14);
    doc.text("Histórico de Valores", 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    data.historico.slice(0, 10).forEach(item => {
      doc.text(`${item.mes}: R$ ${item.valor.toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 8;
    });
    
    // Salvar PDF
    doc.save(`consulta_fipe_${searchInput}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF baixado com sucesso!");
  };

  const formatFipeData = (data) => {
    const item = data.dados[0];
    return `CONSULTA FIPE - PLACA: ${searchInput.toUpperCase()}
    
VALOR ATUAL: R$ ${item.valor.toLocaleString('pt-BR')}
CÓDIGO FIPE: ${item.codigoFipe}
ANO MODELO: ${item.anoModelo}
ANO FABRICAÇÃO: ${item.anoFabricacao}
MÊS REFERÊNCIA: ${item.mesReferencia}
MARCA: ${item.marca}
MODELO: ${item.modelo}
CATEGORIA: ${item.categoria}
COMBUSTÍVEL: ${item.combustivel}

HISTÓRICO RECENTE:
${item.historico.slice(0, 6).map(h => `${h.mes}: R$ ${h.valor.toLocaleString('pt-BR')}`).join('\n')}

Fonte: ${data["API Full"]}
Data da consulta: ${new Date().toLocaleString('pt-BR')}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Box className={classes.root} style={{ "--sidebar-color": theme.palette.primary.main || "#3b82f6" }}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Consultas de Veículo</Typography>
            <Typography className={classes.headerSubtitle}>
              Busque informações veiculares pela placa
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
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { height: 3 } }}
        >
          <Tab label="Proprietário" classes={{ label: classes.tabLabel }} />
          <Tab label="Recall" classes={{ label: classes.tabLabel }} />
          <Tab label="Vip car" classes={{ label: classes.tabLabel }} />
          <Tab label="Leilão" classes={{ label: classes.tabLabel }} />
          <Tab label="Fipe" classes={{ label: classes.tabLabel }} />
          <Tab label="Foto Leilão" classes={{ label: classes.tabLabel }} />
          <Tab label="Gravame" classes={{ label: classes.tabLabel }} />
          <Tab label="Roubo e Furto" classes={{ label: classes.tabLabel }} />
          <Tab label="Roubo ou Furto" classes={{ label: classes.tabLabel }} />
          <Tab label="Índice Risco" classes={{ label: classes.tabLabel }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box className={classes.content} style={{ marginTop: 16 }}>
        <TabPanel value={tabValue} index={0}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Proprietário placa
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Busca o proprietário da placa do veículo.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 2,50
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("proprietario_placa")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Proprietário"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Recall
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Busca de dados recall do veículo.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 5,60
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("recall")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Recall"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Vip car
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Bin Estadual | Gravame | Histórico de Roubo e Furto | Precificador
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 41,20
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("vip_car")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar VIP Car"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Leilão
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Informa se o veículo possui registro em base de leilão, conforme dados repassados pelos leiloeiros.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 12,76
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("leilao")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Leilão"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Fipe
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Busca de dados fipe do veículo.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 1,11
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("fipe")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar FIPE"}
            </Button>
          </Box>

          {/* Loading */}
          {loading && (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={40} />
              <Typography variant="body2" style={{ marginLeft: 16 }}>
                Consultando dados FIPE...
              </Typography>
            </Box>
          )}

          {/* Error */}
          {error && (
            <MuiAlert severity="error" className={classes.errorAlert}>
              {error}
            </MuiAlert>
          )}

          {/* Resultados */}
          {fipeData && !loading && (
            <Box className={classes.resultSection}>
              <Box className={classes.resultHeader}>
                <Typography className={classes.resultTitle}>
                  Resultado da Consulta FIPE
                </Typography>
                <Box className={classes.resultActions}>
                  <Tooltip title="Copiar dados">
                    <IconButton 
                      className={classes.actionButton}
                      onClick={copyToClipboard}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Baixar PDF">
                    <IconButton 
                      className={classes.actionButton}
                      onClick={downloadPDF}
                    >
                      <PdfIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box className={classes.resultContent}>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Valor Atual</Typography>
                  <Typography className={classes.resultValue}>
                    {formatCurrency(fipeData.dados[0].valor)}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Código FIPE</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].codigoFipe}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Ano Modelo</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].anoModelo}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Ano Fabricação</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].anoFabricacao}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Mês Referência</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].mesReferencia}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Marca</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].marca}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Modelo</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].modelo}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Categoria</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].categoria}
                  </Typography>
                </Box>
                <Box className={classes.resultItem}>
                  <Typography className={classes.resultLabel}>Combustível</Typography>
                  <Typography className={classes.resultValue}>
                    {fipeData.dados[0].combustivel}
                  </Typography>
                </Box>
              </Box>

              {/* Histórico de Valores */}
              <Box className={classes.historySection}>
                <Typography className={classes.historyTitle}>
                  Histórico de Valores
                </Typography>
                <Box className={classes.historyGrid}>
                  {fipeData.dados[0].historico.map((item, index) => (
                    <Box key={index} className={classes.historyItem}>
                      <Typography className={classes.historyMonth}>
                        {item.mes}
                      </Typography>
                      <Typography className={classes.historyValue}>
                        {formatCurrency(item.valor)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Foto Leilão
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Traz as fotos do carro no leilão pela placa.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 16,00
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("foto_leilao")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Fotos"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Gravame
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Informa a existência de gravame sobre o veículo, como alienação fiduciária ou outras restrições financeiras, apresentando dados do contrato, data de inclusão, instituição financeira credora, documento do agente, situação do gravame e UF de licenciamento.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 4,20
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite o chassi do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("gravame")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Gravame"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Histórico de roubo e furto
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Verifica se o veículo possui registro ativo de roubo ou furto nas bases policiais, apresentando número do boletim de ocorrência, local e data do fato, quando disponível. Caso não haja ocorrência ativa, a consulta retorna como "nada consta".
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 5,60
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("historico_roubo_furto")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Histórico"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={8}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Histórico de roubo ou furto
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Busca de dados de roubo ou furto do veículo.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 12,36
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("historico_roubo_ou_furto")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Roubo/Furto"}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={9}>
          <Box className={classes.searchSection}>
            <Typography variant="h6" gutterBottom>
              Índice de risco veicular
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              A API de Índice de risco fornece informações sobre sobre o histórico do veículo completo.
            </Typography>
            <Typography variant="h5" style={{ color: "#4caf50", marginBottom: 16, textAlign: "center", fontWeight: "bold" }}>
              R$ 9,24
            </Typography>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="Digite a placa do veículo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              maxLength={7}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={() => handleSearch("indice_risco_veicular")}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Consultando..." : "Consultar Índice"}
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Veiculo;
