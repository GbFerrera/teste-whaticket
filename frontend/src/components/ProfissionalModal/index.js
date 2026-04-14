import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
  Box
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { toast } from "react-toastify";

import {
  createProfissional,
  updateProfissional
} from "../../services/profissionaisService";
import { listServicos } from "../../services/servicosService";

const WEEK_DAYS = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo"
];

const createAgendaTemplate = () => ({
  dia: "",
  inicio: "",
  fim: "",
  almocoInicio: "",
  almocoFim: "",
  duracaoAtendimento: 30
});

const buildInitialAgenda = () => [createAgendaTemplate()];

const ProfissionalModal = ({ open, onClose, profissional, onSuccess }) => {
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [agenda, setAgenda] = useState(buildInitialAgenda);
  const [comissao, setComissao] = useState("");
  const [valorEmAberto, setValorEmAberto] = useState("");
  const [valoresRecebidos, setValoresRecebidos] = useState("");
  const [valoresAReceber, setValoresAReceber] = useState("");
  const [saving, setSaving] = useState(false);
  const [availableServicos, setAvailableServicos] = useState([]);
  const [selectedServicos, setSelectedServicos] = useState([]);
  const [loadingServicos, setLoadingServicos] = useState(false);

  const normalizeAgenda = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return buildInitialAgenda();
    }

    return data.map((item) => {
      if (!item) return createAgendaTemplate();

      let inicio = item.inicio || "";
      let fim = item.fim || "";

      if (!inicio && typeof item.horarios === "string") {
        const [start, end] = item.horarios.split("-");
        inicio = start?.trim() || "";
        fim = end?.trim() || "";
      }

      return {
        dia: item.dia || "",
        inicio,
        fim,
        almocoInicio: item.almocoInicio || "",
        almocoFim: item.almocoFim || "",
        duracaoAtendimento: Number(item.duracaoAtendimento ?? item.duracao ?? 30) || 30
      };
    });
  };

  useEffect(() => {
    if (profissional) {
      setNome(profissional.nome || "");
      setAtivo(profissional.ativo ?? true);
      setAgenda(normalizeAgenda(profissional.agenda));
      setComissao(profissional.comissao || "");
      setValorEmAberto(profissional.valorEmAberto || "");
      setValoresRecebidos(profissional.valoresRecebidos || "");
      setValoresAReceber(profissional.valoresAReceber || "");
      if (!Array.isArray(profissional.servicos)) {
        setSelectedServicos([]);
      }
    } else {
      setNome("");
      setAtivo(true);
      setAgenda(buildInitialAgenda());
      setComissao("");
      setValorEmAberto("");
      setValoresRecebidos("");
      setValoresAReceber("");
      setSelectedServicos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profissional]);

  useEffect(() => {
    if (!open) return;
    const fetchServicos = async () => {
      setLoadingServicos(true);
      try {
        const { data } = await listServicos();
        setAvailableServicos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Não foi possível carregar a lista de serviços");
      } finally {
        setLoadingServicos(false);
      }
    };
    fetchServicos();
  }, [open]);

  useEffect(() => {
    if (!profissional || !Array.isArray(profissional.servicos)) {
      if (!profissional) {
        setSelectedServicos([]);
      }
      return;
    }

    const normalized = profissional.servicos
      .map((item) => {
        if (!item) return null;
        if (typeof item === "object") {
          if (item.id) {
            return availableServicos.find((service) => service.id === item.id) || item;
          }
          return item;
        }

        if (typeof item === "string") {
          return availableServicos.find((service) => service.nome === item) || null;
        }

        return null;
      })
      .filter(Boolean);

    setSelectedServicos(normalized);
  }, [profissional, availableServicos]);

  const handleAgendaChange = (index, field, value) => {
    setAgenda((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addAgendaRow = () => {
    setAgenda((prev) => [...prev, createAgendaTemplate()]);
  };

  const removeAgendaRow = (index) => {
    setAgenda((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Informe o nome do profissional");
      return;
    }

    const payload = {
      nome,
      ativo,
      servicos: selectedServicos.map((service) => ({
        id: service.id,
        nome: service.nome,
        valorOriginal: service.valorOriginal,
        valorComDesconto: service.valorComDesconto,
        possuiDesconto: service.possuiDesconto
      })),
      agenda: agenda
        .filter((item) => item.dia && item.inicio && item.fim)
        .map((item) => ({
          dia: item.dia,
          inicio: item.inicio,
          fim: item.fim,
          almocoInicio: item.almocoInicio || null,
          almocoFim: item.almocoFim || null,
          duracaoAtendimento: Number(item.duracaoAtendimento) || 30
        })),
      comissao: parseFloat(comissao || 0),
      valorEmAberto: parseFloat(valorEmAberto || 0),
      valoresRecebidos: parseFloat(valoresRecebidos || 0),
      valoresAReceber: parseFloat(valoresAReceber || 0)
    };

    setSaving(true);
    try {
      if (profissional) {
        await updateProfissional(profissional.id, payload);
        toast.success("Profissional atualizado com sucesso!");
      } else {
        await createProfissional(payload);
        toast.success("Profissional criado com sucesso!");
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar profissional");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{profissional ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          fullWidth
          margin="normal"
        />

        <FormControlLabel
          control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} color="primary" />}
          label="Ativo"
        />

        <Autocomplete
          multiple
          options={availableServicos}
          value={selectedServicos}
          loading={loadingServicos}
          disableCloseOnSelect
          getOptionLabel={(option) => option?.nome || ""}
          getOptionSelected={(option, value) => option.id === value.id}
          onChange={(_, newValue) => setSelectedServicos(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Serviços oferecidos"
              placeholder="Selecione os serviços"
              variant="outlined"
              margin="normal"
            />
          )}
        />

        <TextField
          label="Comissão (%)"
          type="number"
          value={comissao}
          onChange={(e) => setComissao(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Valor em aberto"
          type="number"
          value={valorEmAberto}
          onChange={(e) => setValorEmAberto(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Valores recebidos"
          type="number"
          value={valoresRecebidos}
          onChange={(e) => setValoresRecebidos(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Valores a receber"
          type="number"
          value={valoresAReceber}
          onChange={(e) => setValoresAReceber(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Box mt={2}>
          <strong>Agenda de atendimento</strong>
          {agenda.map((item, index) => (
            <Box
              key={`agenda-${index}`}
              display="flex"
              flexWrap="wrap"
              gap={12}
              mt={1.5}
              mb={1}
            >
              <TextField
                select
                label="Dia"
                value={item.dia}
                onChange={(e) => handleAgendaChange(index, "dia", e.target.value)}
                style={{ minWidth: 160 }}
                variant="outlined"
                size="small"
              >
                {WEEK_DAYS.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={item.inicio}
                onChange={(e) => handleAgendaChange(index, "inicio", e.target.value)}
                style={{ minWidth: 140 }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={item.fim}
                onChange={(e) => handleAgendaChange(index, "fim", e.target.value)}
                style={{ minWidth: 140 }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Almoço - Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={item.almocoInicio}
                onChange={(e) => handleAgendaChange(index, "almocoInicio", e.target.value)}
                style={{ minWidth: 140 }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Almoço - Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={item.almocoFim}
                onChange={(e) => handleAgendaChange(index, "almocoFim", e.target.value)}
                style={{ minWidth: 140 }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Duração (min)"
                type="number"
                value={item.duracaoAtendimento}
                onChange={(e) => handleAgendaChange(index, "duracaoAtendimento", e.target.value)}
                style={{ width: 140 }}
                variant="outlined"
                size="small"
              />
              <Button
                onClick={() => removeAgendaRow(index)}
                disabled={agenda.length === 1}
                color="secondary"
              >
                Remover
              </Button>
            </Box>
          ))}
          <Button color="primary" onClick={addAgendaRow} style={{ marginTop: 8 }}>
            Adicionar período
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving}>
          {profissional ? "Salvar" : "Cadastrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfissionalModal;
