import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { STATUS_OPTIONS } from "../../constants/serviceOrders";
import { updateServiceOrder } from "../../services/serviceOrdersService";

const useStyles = makeStyles(() => ({
  select: {
    minWidth: 200
  }
}));

const ServiceOrderStatusDialog = ({ open, order, onClose, onSaved }) => {
  const classes = useStyles();
  const [status, setStatus] = useState(order?.status || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const payload = { status };
      const data = await updateServiceOrder(order.id, payload);
      if (onSaved) {
        onSaved(data);
      }
    } catch (error) {
      toast.error("Não foi possível atualizar o status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Alterar status da OS #{order?.id}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Escolha o novo status para esta ordem de serviço.
          </Typography>
          <FormControl className={classes.select}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={event => setStatus(event.target.value)}>
              {STATUS_OPTIONS.filter(option => option.value).map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving || !status}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceOrderStatusDialog;
