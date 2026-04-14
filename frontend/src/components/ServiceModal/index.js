import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch
} from "@material-ui/core";
import { toast } from "react-toastify";

import {
  createServico,
  updateServico
} from "../../services/servicosService";

const ServiceModal = ({ open, onClose, service, onSuccess }) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorOriginal, setValorOriginal] = useState("");
  const [possuiDesconto, setPossuiDesconto] = useState(false);
  const [valorComDesconto, setValorComDesconto] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setNome(service.nome || "");
      setDescricao(service.descricao || "");
      setValorOriginal(service.valorOriginal || "");
      setPossuiDesconto(Boolean(service.possuiDesconto));
      setValorComDesconto(service.valorComDesconto || "");
    } else {
      setNome("");
      setDescricao("");
      setValorOriginal("");
      setPossuiDesconto(false);
      setValorComDesconto("");
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Informe o nome do serviço");
      return;
    }

    if (!valorOriginal) {
      toast.error("Informe o valor original");
      return;
    }

    if (possuiDesconto && !valorComDesconto) {
      toast.error("Informe o valor com desconto");
      return;
    }

    const payload = {
      nome,
      descricao,
      valorOriginal: parseFloat(valorOriginal),
      possuiDesconto,
      valorComDesconto: possuiDesconto ? parseFloat(valorComDesconto) : null
    };

    setSaving(true);
    try {
      if (service) {
        await updateServico(service.id, payload);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await createServico(payload);
        toast.success("Serviço criado com sucesso!");
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar serviço");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{service ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />
        <TextField
          label="Valor original"
          type="number"
          value={valorOriginal}
          onChange={(e) => setValorOriginal(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={possuiDesconto}
              onChange={(e) => setPossuiDesconto(e.target.checked)}
              color="primary"
            />
          }
          label="Possui desconto"
        />
        {possuiDesconto && (
          <TextField
            label="Valor com desconto"
            type="number"
            value={valorComDesconto}
            onChange={(e) => setValorComDesconto(e.target.value)}
            fullWidth
            margin="normal"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving}>
          {service ? "Salvar" : "Cadastrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceModal;
