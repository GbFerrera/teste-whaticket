import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Paper
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import CategoryIcon from "@material-ui/icons/Category";
import api from "../../services/api";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_DESPESAS") {
    const despesas = action.payload;
    const newDespesas = [];
    despesas.forEach((despesa) => {
      const despesaIndex = state.findIndex((d) => d.id === despesa.id);
      if (despesaIndex !== -1) {
        state[despesaIndex] = despesa;
      } else {
        newDespesas.push(despesa);
      }
    });
    return [...state, ...newDespesas];
  }
  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
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
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[2],
  },
  searchContainer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  actionsContainer: {
    display: "flex",
    gap: theme.spacing(1)
  },
}));

const Despesas = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [despesas, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api.get("/despesas", { params: { pageNumber: 1 } })
      .then(({ data }) => {
        dispatch({ type: "LOAD_DESPESAS", payload: data.despesas || [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao carregar despesas");
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pago": return "primary";
      case "pendente": return "default";
      case "atrasado": return "secondary";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pago": return "Pago";
      case "pendente": return "Pendente";
      case "atrasado": return "Atrasado";
      default: return status;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" className={classes.headerTitle}>
          Despesas
        </Typography>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Nova Despesa
          </Button>
        </div>
      </div>

      <Paper className={classes.mainPaper}>
        <div className={classes.searchContainer}>
          <TextField
            size="small"
            placeholder="Buscar despesa..."
            variant="outlined"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {despesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell>{despesa.titulo}</TableCell>
                  <TableCell>
                    {despesa.categoria ? (
                      <Chip
                        size="small"
                        label={despesa.categoria.nome}
                        style={{
                          backgroundColor: despesa.categoria.cor + "20",
                          color: despesa.categoria.cor,
                        }}
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(despesa.valor)}
                  </TableCell>
                  <TableCell>
                    {moment(despesa.dataVencimento).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusText(despesa.status)}
                      color={getStatusColor(despesa.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={classes.actionsContainer}>
                      {despesa.status !== "pago" && (
                        <Tooltip title="Marcar como pago">
                          <IconButton size="small" color="primary">
                            <AttachMoneyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default Despesas;
