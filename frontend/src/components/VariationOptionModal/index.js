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

const VariationOptionModal = ({ open, onClose, onSubmit, initialData }) => {
  const classes = useStyles();
  const [nome, setNome] = useState(initialData?.nome || "");
  const [ordem, setOrdem] = useState(initialData?.ordem ?? "");

  useEffect(() => {
    setNome(initialData?.nome || "");
    setOrdem(
      initialData?.ordem === 0 || Number.isFinite(initialData?.ordem)
        ? String(initialData?.ordem)
        : ""
    );
  }, [initialData, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nome.trim()) return;
    onSubmit({
      nome: nome.trim(),
      ordem:
        ordem === "" || ordem === null || ordem === undefined ? undefined : Number(ordem)
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initialData ? "Editar variação" : "Nova variação"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nome da variação"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            variant="outlined"
            fullWidth
            className={classes.field}
            required
          />
          <TextField
            label="Ordem (opcional)"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value.replace(/[^0-9-]/g, ""))}
            variant="outlined"
            fullWidth
            className={classes.field}
            inputProps={{ inputMode: "numeric" }}
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

export default VariationOptionModal;
