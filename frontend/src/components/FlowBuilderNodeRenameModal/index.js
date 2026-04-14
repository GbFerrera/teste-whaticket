import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";

const FlowBuilderNodeRenameModal = ({
  open,
  node,
  defaultTitle = "Bloco",
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(defaultTitle);

  useEffect(() => {
    if (open) {
      setValue(node?.data?.title || defaultTitle);
    }
  }, [open, node, defaultTitle]);

  const handleSave = () => {
    if (typeof onSave === "function") {
      onSave(value.trim());
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(open)} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Renomear bloco</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do bloco"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          fullWidth
          autoFocus
          margin="dense"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderNodeRenameModal;
