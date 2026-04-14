import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  makeStyles,
  Chip,
  IconButton,
  Tooltip
} from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import SelectAllIcon from "@material-ui/icons/SelectAll";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "& h2": {
      color: "#fff"
    }
  },
  content: {
    minHeight: 400,
    maxHeight: 600,
    overflowY: "auto"
  },
  table: {
    minWidth: 800
  },
  tableHead: {
    backgroundColor: "#f5f5f5",
    "& th": {
      fontWeight: 600,
      fontSize: "0.875rem"
    }
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "#f9f9f9"
    },
    "&.selected": {
      backgroundColor: "#e3f2fd"
    },
    "&.error": {
      backgroundColor: "#ffebee"
    }
  },
  statusChip: {
    fontSize: "0.75rem",
    height: 24
  },
  success: {
    color: "#2e7d32",
    backgroundColor: "#e8f5e8"
  },
  error: {
    color: "#c62828",
    backgroundColor: "#ffebee"
  },
  warning: {
    color: "#f57c00",
    backgroundColor: "#fff3e0"
  },
  info: {
    color: "#1976d2",
    backgroundColor: "#e3f2fd"
  },
  summaryBox: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap"
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    backgroundColor: "#f5f5f5"
  },
  scrollContainer: {
    overflowX: "auto"
  }
}));

const ImportPreviewModal = ({ open, onClose, data, onConfirm, type = "leads" }) => {
  const classes = useStyles();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      // Selecionar todos os itens válidos por padrão
      const validItems = data.filter(item => !item.error);
      setSelectedItems(new Set(validItems.map((_, index) => index)));
      setSelectAll(true);
    }
  }, [data]);

  const handleToggleSelect = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
    
    // Atualizar estado do select all
    const validItems = data.filter(item => !item.error);
    setSelectAll(newSelected.size === validItems.length);
  };

  const handleSelectAll = () => {
    const validItems = data.filter(item => !item.error);
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(validItems.map((_, index) => index)));
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    const selectedData = Array.from(selectedItems).map(index => data[index]);
    onConfirm(selectedData);
  };

  if (!data) return null;

  const validItems = data.filter(item => !item.error);
  const errorItems = data.filter(item => item.error);
  const selectedValidItems = Array.from(selectedItems).filter(index => !data[index].error);

  const renderHeaders = () => {
    if (type === "leads") {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={selectedValidItems.length > 0 && selectedValidItems.length < validItems.length}
              checked={selectAll && validItems.length > 0}
              onChange={handleSelectAll}
              size="small"
            />
          </TableCell>
          <TableCell>Nome</TableCell>
          <TableCell>E-mail</TableCell>
          <TableCell>Telefone</TableCell>
          <TableCell>Empresa</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Responsável</TableCell>
          <TableCell>Status</TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={selectedValidItems.length > 0 && selectedValidItems.length < validItems.length}
              checked={selectAll && validItems.length > 0}
              onChange={handleSelectAll}
              size="small"
            />
          </TableCell>
          <TableCell>Nome</TableCell>
          <TableCell>Tipo</TableCell>
          <TableCell>Documento</TableCell>
          <TableCell>E-mail</TableCell>
          <TableCell>Telefone</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Responsável</TableCell>
          <TableCell>Status</TableCell>
        </>
      );
    }
  };

  const renderRow = (item, index) => {
    const hasError = !!item.error;
    const isSelected = selectedItems.has(index);

    return (
      <TableRow
        key={index}
        className={`${classes.tableRow} ${isSelected ? 'selected' : ''} ${hasError ? 'error' : ''}`}
      >
        <TableCell padding="checkbox">
          {!hasError && (
            <Checkbox
              checked={isSelected}
              onChange={() => handleToggleSelect(index)}
              size="small"
            />
          )}
        </TableCell>
        
        {type === "leads" ? (
          <>
            <TableCell>
              <Typography variant="body2" style={{ fontWeight: 500 }}>
                {item.name || "—"}
              </Typography>
            </TableCell>
            <TableCell>{item.email || "—"}</TableCell>
            <TableCell>{item.phone || "—"}</TableCell>
            <TableCell>{item.companyName || "—"}</TableCell>
            <TableCell>
              <Chip
                label={item.status || "new"}
                size="small"
                className={classes.statusChip}
                style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
              />
            </TableCell>
            <TableCell>
              {item.ownerUserId ? `ID: ${item.ownerUserId}` : "Não atribuído"}
            </TableCell>
            <TableCell>
              {hasError ? (
                <Chip
                  icon={<ErrorIcon style={{ fontSize: 16 }} />}
                  label="Erro"
                  size="small"
                  className={`${classes.statusChip} ${classes.error}`}
                />
              ) : (
                <Chip
                  icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
                  label="Válido"
                  size="small"
                  className={`${classes.statusChip} ${classes.success}`}
                />
              )}
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>
              <Typography variant="body2" style={{ fontWeight: 500 }}>
                {item.name || "—"}
              </Typography>
              {item.companyName && (
                <Typography variant="caption" color="textSecondary">
                  {item.companyName}
                </Typography>
              )}
            </TableCell>
            <TableCell>
              <Chip
                label={item.type === "pj" ? "PJ" : "PF"}
                size="small"
                className={classes.statusChip}
                style={{ backgroundColor: "#f3e5f5", color: "#7b1fa2" }}
              />
            </TableCell>
            <TableCell>{item.document || "—"}</TableCell>
            <TableCell>{item.email || "—"}</TableCell>
            <TableCell>{item.phone || "—"}</TableCell>
            <TableCell>
              <Chip
                label={item.status || "active"}
                size="small"
                className={classes.statusChip}
                style={{ 
                  backgroundColor: item.status === "active" ? "#e8f5e8" : "#fff3e0",
                  color: item.status === "active" ? "#2e7d32" : "#f57c00"
                }}
              />
            </TableCell>
            <TableCell>
              {item.ownerUserId ? `ID: ${item.ownerUserId}` : "Não atribuído"}
            </TableCell>
            <TableCell>
              {hasError ? (
                <Chip
                  icon={<ErrorIcon style={{ fontSize: 16 }} />}
                  label="Erro"
                  size="small"
                  className={`${classes.statusChip} ${classes.error}`}
                />
              ) : (
                <Chip
                  icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
                  label="Válido"
                  size="small"
                  className={`${classes.statusChip} ${classes.success}`}
                />
              )}
            </TableCell>
          </>
        )}
      </TableRow>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Pré-visualização de Importação - {type === "leads" ? "Leads" : "Clientes"}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Selecionar todos válidos">
              <IconButton size="small" onClick={handleSelectAll} style={{ color: "#fff" }}>
                {selectAll ? <CheckBoxOutlineBlankIcon /> : <SelectAllIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent className={classes.content}>
        <Box className={classes.summaryBox}>
          <div className={`${classes.summaryItem} ${classes.info}`}>
            <InfoIcon style={{ fontSize: 20 }} />
            <Typography variant="body2">
              Total: {data.length}
            </Typography>
          </div>
          <div className={`${classes.summaryItem} ${classes.success}`}>
            <CheckCircleIcon style={{ fontSize: 20 }} />
            <Typography variant="body2">
              Válidos: {validItems.length}
            </Typography>
          </div>
          <div className={`${classes.summaryItem} ${classes.warning}`}>
            <Typography variant="body2">
              Selecionados: {selectedValidItems.length}
            </Typography>
          </div>
          {errorItems.length > 0 && (
            <div className={`${classes.summaryItem} ${classes.error}`}>
              <ErrorIcon style={{ fontSize: 20 }} />
              <Typography variant="body2">
                Erros: {errorItems.length}
              </Typography>
            </div>
          )}
        </Box>

        <div className={classes.scrollContainer}>
          <Table className={classes.table} size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                {renderHeaders()}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => renderRow(item, index))}
            </TableBody>
          </Table>
        </div>

        {errorItems.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erros encontrados:
            </Typography>
            {errorItems.map((item, index) => (
              <Box key={index} mb={1} p={1} bgcolor="#ffebee" borderRadius={4}>
                <Typography variant="caption" color="error">
                  <strong>{item.name || "Item sem nome"}:</strong> {item.error}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={selectedValidItems.length === 0}
        >
          Importar {selectedValidItems.length} {selectedValidItems.length === 1 ? 
            (type === "leads" ? "lead" : "cliente") : 
            (type === "leads" ? "leads" : "clientes")
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportPreviewModal;
