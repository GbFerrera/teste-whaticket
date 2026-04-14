import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Box,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import {
  Phone as PhoneIcon,
  PhoneMissed as PhoneMissedIcon,
  PhoneCallback as PhoneCallbackIcon,
  PhoneDisabled as PhoneDisabledIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Call as CallIcon,
  CallMade as CallMadeIcon,
  CallReceived as CallReceivedIcon,
} from "@material-ui/icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  filtersContainer: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    alignItems: "center",
  },
  summaryContainer: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  summaryCard: {
    minWidth: 140,
    flex: 1,
    borderRadius: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#667781",
    fontWeight: 500,
  },
  tableContainer: {
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
  },
  tableHeadCell: {
    fontWeight: 600,
    fontSize: 12,
    color: "#667781",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  contactCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  contactName: {
    fontWeight: 500,
    fontSize: 14,
  },
  contactNumber: {
    fontSize: 12,
    color: "#667781",
  },
  durationCell: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  statusChip: {
    fontWeight: 600,
    fontSize: 11,
    height: 24,
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#667781",
  },
  dateFilter: {
    minWidth: 160,
  },
}));

const statusConfig = {
  answered: { label: "Atendida", color: "#22c55e", bgColor: "#dcfce7", icon: PhoneCallbackIcon },
  missed: { label: "Perdida", color: "#ef4444", bgColor: "#fee2e2", icon: PhoneMissedIcon },
  busy: { label: "Ocupado", color: "#f59e0b", bgColor: "#fef3c7", icon: PhoneDisabledIcon },
  rejected: { label: "Rejeitada", color: "#ef4444", bgColor: "#fee2e2", icon: PhoneDisabledIcon },
  failed: { label: "Falhou", color: "#6b7280", bgColor: "#f3f4f6", icon: PhoneDisabledIcon },
};

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
};

const CallHistory = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [summary, setSummary] = useState({ total: 0, answered: 0, missed: 0, busy: 0 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageNumber: page + 1 };
      if (statusFilter) params.status = statusFilter;
      if (dateStart) params.dateStart = dateStart;
      if (dateEnd) params.dateEnd = dateEnd;
      if (contactSearch) params.contactNumber = contactSearch;

      const { data } = await api.get("/call-records", { params });
      setRecords(data.records);
      setCount(data.count);
    } catch (err) {
      console.error("Erro ao buscar registros de chamadas:", err);
    }
    setLoading(false);
  }, [page, statusFilter, dateStart, dateEnd, contactSearch]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = {};
      if (dateStart) params.dateStart = dateStart;
      if (dateEnd) params.dateEnd = dateEnd;

      const { data } = await api.get("/call-records/summary", { params });
      setSummary(data);
    } catch (err) {
      console.error("Erro ao buscar resumo:", err);
    }
  }, [dateStart, dateEnd]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Socket para atualizações em tempo real
  useEffect(() => {
    const companyId = user?.companyId;
    if (!companyId) return;

    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-call`, (data) => {
      if (data.action === "ended") {
        fetchRecords();
        fetchSummary();
      }
    });

    return () => {
      socket.off(`company-${companyId}-call`);
    };
  }, [user, fetchRecords, fetchSummary]);

  return (
    <div className={classes.root}>
      <Title>Histórico de Chamadas</Title>

      {/* Summary Cards */}
      <div className={classes.summaryContainer}>
        <Card className={classes.summaryCard} style={{ borderLeft: "4px solid #3b82f6" }}>
          <CardContent>
            <Typography className={classes.summaryLabel}>Total</Typography>
            <Typography className={classes.summaryValue} style={{ color: "#3b82f6" }}>
              {summary.total}
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.summaryCard} style={{ borderLeft: "4px solid #22c55e" }}>
          <CardContent>
            <Typography className={classes.summaryLabel}>Atendidas</Typography>
            <Typography className={classes.summaryValue} style={{ color: "#22c55e" }}>
              {summary.answered}
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.summaryCard} style={{ borderLeft: "4px solid #ef4444" }}>
          <CardContent>
            <Typography className={classes.summaryLabel}>Perdidas</Typography>
            <Typography className={classes.summaryValue} style={{ color: "#ef4444" }}>
              {summary.missed}
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.summaryCard} style={{ borderLeft: "4px solid #f59e0b" }}>
          <CardContent>
            <Typography className={classes.summaryLabel}>Ocupado</Typography>
            <Typography className={classes.summaryValue} style={{ color: "#f59e0b" }}>
              {summary.busy}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Paper style={{ padding: 16, borderRadius: 12 }}>
        <div className={classes.filtersContainer}>
          <TextField
            label="Buscar número"
            variant="outlined"
            size="small"
            value={contactSearch}
            onChange={(e) => { setContactSearch(e.target.value); setPage(0); }}
            InputProps={{
              endAdornment: <SearchIcon style={{ color: "#999" }} />,
            }}
          />
          <FormControl variant="outlined" size="small" style={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="answered">Atendida</MenuItem>
              <MenuItem value="missed">Perdida</MenuItem>
              <MenuItem value="busy">Ocupado</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Data início"
            type="date"
            variant="outlined"
            size="small"
            className={classes.dateFilter}
            InputLabelProps={{ shrink: true }}
            value={dateStart}
            onChange={(e) => { setDateStart(e.target.value); setPage(0); }}
          />
          <TextField
            label="Data fim"
            type="date"
            variant="outlined"
            size="small"
            className={classes.dateFilter}
            InputLabelProps={{ shrink: true }}
            value={dateEnd}
            onChange={(e) => { setDateEnd(e.target.value); setPage(0); }}
          />
        </div>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : records.length === 0 ? (
          <div className={classes.emptyState}>
            <PhoneIcon style={{ fontSize: 48, color: "#ccc", marginBottom: 8 }} />
            <Typography variant="h6" style={{ color: "#999" }}>
              Nenhuma chamada registrada
            </Typography>
            <Typography variant="body2" style={{ color: "#bbb" }}>
              As chamadas recebidas aparecerão aqui automaticamente
            </Typography>
          </div>
        ) : (
          <>
            <Table size="small">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell className={classes.tableHeadCell}>Tipo</TableCell>
                  <TableCell className={classes.tableHeadCell}>Contato</TableCell>
                  <TableCell className={classes.tableHeadCell}>Status</TableCell>
                  <TableCell className={classes.tableHeadCell}>Duração</TableCell>
                  <TableCell className={classes.tableHeadCell}>Conexão</TableCell>
                  <TableCell className={classes.tableHeadCell}>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => {
                  const config = statusConfig[record.status] || statusConfig.failed;
                  const StatusIcon = config.icon;

                  return (
                    <TableRow key={record.id} className={classes.tableRow}>
                      <TableCell>
                        <Tooltip title={record.type === "incoming" ? "Recebida" : "Realizada"}>
                          {record.type === "incoming" ? (
                            <CallReceivedIcon style={{ color: "#3b82f6", fontSize: 20 }} />
                          ) : (
                            <CallMadeIcon style={{ color: "#22c55e", fontSize: 20 }} />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className={classes.contactCell}>
                          <Avatar
                            src={record.contact?.profilePicUrl}
                            style={{ width: 32, height: 32 }}
                          >
                            {record.contact?.name?.[0] || "?"}
                          </Avatar>
                          <div>
                            <Typography className={classes.contactName}>
                              {record.contact?.name || record.fromNumber}
                            </Typography>
                            <Typography className={classes.contactNumber}>
                              {record.fromNumber}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<StatusIcon style={{ fontSize: 14, color: config.color }} />}
                          label={config.label}
                          className={classes.statusChip}
                          style={{
                            backgroundColor: config.bgColor,
                            color: config.color,
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <div className={classes.durationCell}>
                          <AccessTimeIcon style={{ fontSize: 14, color: "#999" }} />
                          <Typography variant="body2">
                            {formatDuration(record.duration)}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#667781" }}>
                          {record.whatsapp?.name || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ color: "#667781" }}>
                          {formatDate(record.callStartedAt || record.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={40}
              rowsPerPageOptions={[40]}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </>
        )}
      </TableContainer>
    </div>
  );
};

export default CallHistory;
