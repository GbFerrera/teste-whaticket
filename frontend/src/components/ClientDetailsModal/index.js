import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  makeStyles,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField // **NOVO: Importar TextField**
} from "@material-ui/core";
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  BusinessCenter as BusinessCenterIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon
} from "@material-ui/icons";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 800,
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  clientHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  clientInfo: {
    flex: 1
  },
  statusChip: {
    marginLeft: theme.spacing(1)
  },
  tabContent: {
    marginTop: theme.spacing(2)
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  listItem: {
    marginBottom: theme.spacing(1)
  },
  tableContainer: {
    marginTop: theme.spacing(2)
  }
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ClientDetailsModal = ({ open, onClose, client, onConvertToClient }) => {
  const classes = useStyles();
  const history = useHistory();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [faturas, setFaturas] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);

  useEffect(() => {
    if (!open || !client) return;

    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Buscar dados completos do cliente
        const { data: clientFullData } = await api.get(`/crm/clients/${client.id}`);
        setClientData(clientFullData);

        // Buscar faturas do cliente
        const { data: faturasData } = await api.get('/faturas', {
          params: { clientId: client.id, limit: 10 }
        });
        setFaturas(faturasData.faturas || faturasData || []);

        // Buscar projetos do cliente
        const { data: projetosData } = await api.get('/projetos', {
          params: { clientId: client.id, limit: 10 }
        });
        setProjetos(projetosData.projetos || projetosData || []);

        // Buscar ordens de serviço do cliente
        const { data: osData } = await api.get('/service-orders', {
          params: { clientId: client.id, limit: 10 }
        });
        setOrdensServico(osData.serviceOrders || osData || []);
      } catch (err) {
        console.error("Erro ao buscar dados do cliente:", err);
        toast.error("Erro ao carregar dados do cliente");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [open, client]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleConvertToClient = async () => {
    if (onConvertToClient) {
      onConvertToClient();
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div className={classes.clientHeader}>
          <PersonIcon />
          <div className={classes.clientInfo}>
            <Typography variant="h6">
              {client.name} {client.companyName && `(${client.companyName})`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {client.email} • {client.phone}
            </Typography>
          </div>
          <Chip 
            label="Cliente" 
            color="primary" 
            size="small"
            className={classes.statusChip}
          />
        </div>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Tabs do cliente">
              <Tab label="Dados Gerais" />
              <Tab label={`Faturas (${faturas.length})`} />
              <Tab label={`Projetos (${projetos.length})`} />
              <Tab label={`Ordens de Serviço (${ordensServico.length})`} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Informações Pessoais</Typography>
                      <List>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Nome" 
                            secondary={client.name || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Email" 
                            secondary={client.email || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Telefone" 
                            secondary={client.phone || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="CPF/CNPJ" 
                            secondary={client.document || 'N/A'} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Informações Comerciais</Typography>
                      <List>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Empresa" 
                            secondary={client.companyName || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Responsável" 
                            secondary={client.responsibleName || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Data de Cadastro" 
                            secondary={formatDate(client.createdAt)} 
                          />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                          <ListItemText 
                            primary="Status" 
                            secondary={client.status || 'Ativo'} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Faturas do Cliente</Typography>
              {faturas.length > 0 ? (
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Data Emissão</TableCell>
                        <TableCell>Vencimento</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faturas.map((fatura) => (
                        <TableRow key={fatura.id}>
                          <TableCell>{fatura.number || fatura.id}</TableCell>
                          <TableCell>{formatDate(fatura.createdAt)}</TableCell>
                          <TableCell>{formatDate(fatura.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(fatura.total)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={fatura.status || 'Pendente'} 
                              color={fatura.status === 'paid' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className={classes.emptyState}>
                  <ReceiptIcon style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography>Nenhuma fatura encontrada</Typography>
                </div>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Projetos do Cliente</Typography>
              {projetos.length > 0 ? (
                <Grid container spacing={2}>
                  {projetos.map((projeto) => (
                    <Grid item xs={12} md={6} key={projeto.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{projeto.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {projeto.description}
                          </Typography>
                          <Box mt={2}>
                            <Chip 
                              label={projeto.status || 'Rascunho'} 
                              size="small"
                              style={{ marginRight: 8 }}
                            />
                            <Typography variant="caption">
                              Início: {formatDate(projeto.startDate)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <div className={classes.emptyState}>
                  <BusinessCenterIcon style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography>Nenhum projeto encontrado</Typography>
                </div>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Ordens de Serviço do Cliente</Typography>
              {ordensServico.length > 0 ? (
                <Grid container spacing={2}>
                  {ordensServico.map((os) => (
                    <Grid item xs={12} md={6} key={os.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">OS #{os.number || os.id}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {os.description}
                          </Typography>
                          <Box mt={2}>
                            <Chip 
                              label={os.status || 'Aberta'} 
                              size="small"
                              style={{ marginRight: 8 }}
                            />
                            <Typography variant="caption">
                              {formatDate(os.createdAt)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <div className={classes.emptyState}>
                  <AssignmentIcon style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography>Nenhuma ordem de serviço encontrada</Typography>
                </div>
              )}
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
        {clientData && (
          <Button 
            onClick={() => history.push(`/clientes/${client.id}`)}
            color="primary"
            variant="outlined"
          >
            Ver Cliente Completo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const ConvertToClientModal = ({ open, onClose, onConfirm }) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const handleConfirm = () => {
		setLoading(true);
		onConfirm(email);
		setLoading(false);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Converter em Cliente</DialogTitle>
			<DialogContent>
				<Typography gutterBottom>
					Deseja converter este contato em um cliente? Isso permitirá criar faturas, projetos e ordens de serviço vinculados a ele.
				</Typography>
				
				<TextField
					fullWidth
					variant="outlined"
					margin="normal"
					label="Email do Cliente"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="cliente@exemplo.com (opcional)"
					helperText="Adicione um email para melhor identificação do cliente"
					required={false}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary" disabled={loading}>
					Cancelar
				</Button>
				<Button 
					onClick={handleConfirm} 
					color="primary" 
					variant="contained"
					disabled={loading}
				>
					{loading ? <CircularProgress size={20} /> : 'Converter para Cliente'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export { ClientDetailsModal, ConvertToClientModal };
