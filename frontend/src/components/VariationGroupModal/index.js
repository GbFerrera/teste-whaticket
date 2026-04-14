import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  makeStyles
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  field: {
    marginTop: 8,
    marginBottom: 8
  }
}));

const VariationGroupModal = ({ open, onClose, onSubmit, initialData }) => {
  const classes = useStyles();
  const [nome, setNome] = useState(initialData?.nome || "");

  useEffect(() => {
    setNome(initialData?.nome || "");
  }, [initialData, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nome.trim()) return;
    onSubmit({ nome: nome.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initialData ? "Editar grupo de variação" : "Novo grupo de variação"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nome do grupo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            variant="outlined"
            fullWidth
            className={classes.field}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button color="primary" variant="contained" type="submit">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VariationGroupModal;
