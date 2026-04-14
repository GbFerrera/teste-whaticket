import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Stack
} from "@mui/material";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { Schedule, Help, Timer, AttachFile } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },
  btnWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const GLOBAL_VARIABLES = [
  { token: "{{firstName}}", label: "Primeiro nome do contato" },
  { token: "{{name}}", label: "Nome completo do contato" },
  { token: "{{userName}}", label: "Nome do usuário/atendente" },
  { token: "{{ms}}", label: "Saudação dinâmica (Bom dia/Boa tarde)" },
  { token: "{{protocol}}", label: "Número de protocolo do ticket" },
  { token: "{{date}}", label: "Data atual (dd-mm-yyyy)" },
  { token: "{{hour}}", label: "Hora atual (hh:mm:ss)" },
  { token: "{{ticket_id}}", label: "ID do ticket" },
  { token: "{{queue}}", label: "Nome da fila do ticket" },
  { token: "{{connection}}", label: "Nome da conexão WhatsApp" }
];

const WaitQuestionSchema = Yup.object().shape({
  waitTime: Yup.number()
    .min(1, "Tempo mínimo é 1 minuto")
    .max(1440, "Tempo máximo é 1440 minutos (24 horas)")
    .required("Tempo de espera é obrigatório"),
  question: Yup.string()
    .min(2, "Muito curta!")
    .required("Pergunta é obrigatória"),
  optionX: Yup.object().shape({
    trigger: Yup.string().required("Trigger X é obrigatório"),
    label: Yup.string().required("Label X é obrigatório"),
    action: Yup.string().required("Ação X é obrigatória")
  }),
  optionY: Yup.object().shape({
    trigger: Yup.string().required("Trigger Y é obrigatório"),
    label: Yup.string().required("Label Y é obrigatório"),
    action: Yup.string().required("Ação Y é obrigatória")
  })
});

const FlowBuilderWaitQuestionModal = ({ 
  open, 
  onClose, 
  onSave, 
  initialValue = {},
  onUpdate
}) => {
  const nodeData = initialValue?.data || {};
  const classes = useStyles();
  const isMounted = useRef(true);

  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (open === 'edit' && nodeData?.mediaUrl) {
      setMediaPreview({
        url: nodeData.mediaUrl,
        type: nodeData.mediaType,
        name: nodeData.mediaName
      });
    } else if (open === 'create') {
      setMediaPreview(null);
    }
  }, [open, initialValue]);

  const handleMediaUpload = async (file, mediaType) => {
    setMediaUploading(true);
    try {
      let endpoint = "";
      switch (mediaType) {
        case "image":
          endpoint = "/flowbuilder/upload/img";
          break;
        case "video":
          endpoint = "/flowbuilder/upload/video";
          break;
        case "audio":
          endpoint = "/flowbuilder/upload/audio";
          break;
        case "file":
          endpoint = "/flowbuilder/upload/file";
          break;
        default:
          throw new Error("Tipo de mídia inválido");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (isMounted.current) {
        setMediaPreview({
          url: response.data.imageUrl || response.data.audioUrl || response.data.videoUrl || response.data.fileUrl,
          type: mediaType,
          name: file.name
        });
      }
    } catch (err) {
      toastError(err);
    } finally {
      setMediaUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaPreview(null);
  };

  const handleSave = (values) => {
    const updatedValues = {
      ...values,
      optionX: { ...values.optionX, action: 'continue' },
      optionY: { ...values.optionY, action: 'continue' },
      mediaUrl: mediaPreview?.url || null,
      mediaType: mediaPreview?.type || "none",
      mediaName: mediaPreview?.name || null
    };
    if (open === 'edit' && onUpdate) {
      onUpdate({
        ...initialValue,
        data: {
          ...(initialValue?.data || {}),
          ...updatedValues
        }
      });
    } else if (onSave) {
      onSave(updatedValues);
    }
    handleClose();
    toast.success(i18n.t("waitQuestionModal.toasts.success"));
  };

  const handleClose = () => {
    setMediaPreview(null);
    if (onClose) {
      onClose();
    }
  };

  const insertVariable = (variable) => {
    const questionField = document.querySelector('textarea[name="question"]');
    if (questionField) {
      const start = questionField.selectionStart;
      const end = questionField.selectionEnd;
      const text = questionField.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      questionField.value = newText;
      questionField.selectionStart = questionField.selectionEnd = start + variable.length;
      questionField.focus();
    }
  };

  const initialValues = {
    waitTime: nodeData?.waitTime || 30,
    waitUnit: nodeData?.waitUnit || "minutes",
    question: nodeData?.question || "",
    optionX: {
      trigger: nodeData?.optionX?.trigger || "1",
      matchType: nodeData?.optionX?.matchType || "exact",
      label: nodeData?.optionX?.label || "SIM",
      action: nodeData?.optionX?.action || "continue"
    },
    optionY: {
      trigger: nodeData?.optionY?.trigger || "2",
      matchType: nodeData?.optionY?.matchType || "exact",
      label: nodeData?.optionY?.label || "NÃO",
      action: nodeData?.optionY?.action || "continue"
    },
    transferQueueId: nodeData?.transferQueueId || null,
    closeTicket: nodeData?.closeTicket || false,
    timeoutEnabled: nodeData?.timeoutEnabled || false,
    timeoutTime: nodeData?.timeoutTime || 60,
    timeoutUnit: nodeData?.timeoutUnit || "minutes",
    timeoutAction: nodeData?.timeoutAction || "continue"
  };

  return (
    <Dialog open={!!open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Schedule color="primary" />
          <Help color="secondary" />
          <Typography variant="h6">
            {open === 'edit' ? 'Editar Espera Condicional' : 'Configurar Espera Condicional'}
          </Typography>
        </Box>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={WaitQuestionSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSave(values);
            actions.setSubmitting(false);
          }, 500);
        }}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Tempo de Espera */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    ⏰ Tempo de Espera
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Field
                      as={TextField}
                      label="Tempo"
                      name="waitTime"
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      error={touched.waitTime && Boolean(errors.waitTime)}
                      helperText={touched.waitTime && errors.waitTime}
                    />
                    <FormControl size="small" style={{ minWidth: 120 }}>
                      <InputLabel>Unidade</InputLabel>
                      <Field
                        as={Select}
                        name="waitUnit"
                        label="Unidade"
                      >
                        <MenuItem value="minutes">Minutos</MenuItem>
                        <MenuItem value="hours">Horas</MenuItem>
                      </Field>
                    </FormControl>
                  </Stack>
                </Box>

                {/* Pergunta */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    ❓ Pergunta
                  </Typography>
                  <Field
                    as={TextField}
                    label="Pergunta"
                    name="question"
                    multiline
                    rows={3}
                    variant="outlined"
                    fullWidth
                    error={touched.question && Boolean(errors.question)}
                    helperText={touched.question && errors.question}
                  />
                  <Box mt={1}>
                    <Typography variant="caption" color="textSecondary">
                      Variáveis disponíveis:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {GLOBAL_VARIABLES.map((variable) => (
                        <Button
                          key={variable.token}
                          size="small"
                          variant="outlined"
                          onClick={() => insertVariable(variable.token)}
                          style={{ fontSize: "11px", padding: "2px 6px" }}
                        >
                          {variable.token}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Mídia */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    📎 Mídia (Opcional)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" style={{ minWidth: 150 }}>
                      <InputLabel>Tipo</InputLabel>
                      <Field
                        as={Select}
                        name="mediaType"
                        label="Tipo"
                        value={mediaPreview?.type || "none"}
                        onChange={(e) => {
                          if (e.target.value === "none") {
                            handleRemoveMedia();
                          }
                        }}
                      >
                        <MenuItem value="none">Nenhuma</MenuItem>
                        <MenuItem value="image">Imagem</MenuItem>
                        <MenuItem value="video">Vídeo</MenuItem>
                        <MenuItem value="audio">Áudio</MenuItem>
                        <MenuItem value="file">Arquivo</MenuItem>
                      </Field>
                    </FormControl>
                    
                    {mediaPreview?.type !== "none" && (
                      <>
                        <input
                          type="file"
                          accept={
                            mediaPreview?.type === "image" ? "image/*" :
                            mediaPreview?.type === "video" ? "video/*" :
                            mediaPreview?.type === "audio" ? "audio/*" :
                            "*/*"
                          }
                          style={{ display: "none" }}
                          id="media-upload"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleMediaUpload(e.target.files[0], mediaPreview.type);
                            }
                          }}
                        />
                        <label htmlFor="media-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            disabled={mediaUploading}
                            startIcon={<AttachFile />}
                          >
                            {mediaUploading ? "Enviando..." : "Selecionar Arquivo"}
                          </Button>
                        </label>
                        
                        {mediaPreview && (
                          <>
                            <Typography variant="caption" noWrap>
                              {mediaPreview.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={handleRemoveMedia}
                              color="secondary"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Opções */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    🔀 Opções de Resposta
                  </Typography>
                  
                  {/* Opção X */}
                  <Box mb={3} p={2} bgcolor="grey.50" borderRadius={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Opção X
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Field
                          as={TextField}
                          label="Trigger"
                          name="optionX.trigger"
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                        <FormControl size="small" style={{ minWidth: 120 }}>
                          <InputLabel>Tipo</InputLabel>
                          <Field
                            as={Select}
                            name="optionX.matchType"
                            label="Tipo"
                          >
                            <MenuItem value="exact">Exato</MenuItem>
                            <MenuItem value="contains">Contém</MenuItem>
                          </Field>
                        </FormControl>
                      </Stack>
                      <Field
                        as={TextField}
                        label="Label"
                        name="optionX.label"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                      <FormControl size="small" fullWidth>
                        <InputLabel>Ação</InputLabel>
                        <Field
                          as={Select}
                          name="optionX.action"
                          label="Ação"
                        >
                          <MenuItem value="continue">Continuar</MenuItem>
                        </Field>
                      </FormControl>
                    </Stack>
                  </Box>

                  {/* Opção Y */}
                  <Box p={2} bgcolor="grey.50" borderRadius={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Opção Y
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Field
                          as={TextField}
                          label="Trigger"
                          name="optionY.trigger"
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                        <FormControl size="small" style={{ minWidth: 120 }}>
                          <InputLabel>Tipo</InputLabel>
                          <Field
                            as={Select}
                            name="optionY.matchType"
                            label="Tipo"
                          >
                            <MenuItem value="exact">Exato</MenuItem>
                            <MenuItem value="contains">Contém</MenuItem>
                          </Field>
                        </FormControl>
                      </Stack>
                      <Field
                        as={TextField}
                        label="Label"
                        name="optionY.label"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                      <FormControl size="small" fullWidth>
                        <InputLabel>Ação</InputLabel>
                        <Field
                          as={Select}
                          name="optionY.action"
                          label="Ação"
                        >
                          <MenuItem value="continue">Continuar</MenuItem>
                        </Field>
                      </FormControl>
                    </Stack>
                  </Box>
                </Box>

                <Divider />

                {/* Timeout */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    ⏱️ Timeout (Sem Resposta)
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!values.timeoutEnabled}
                        onChange={(e) => setFieldValue("timeoutEnabled", e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Habilitar timeout"
                  />
                  
                  {values.timeoutEnabled && (
                    <Box mt={2} p={2} bgcolor="warning.light" borderRadius={2}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <Field
                            as={TextField}
                            label="Tempo"
                            name="timeoutTime"
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                          />
                          <FormControl size="small" style={{ minWidth: 120 }}>
                            <InputLabel>Unidade</InputLabel>
                            <Field
                              as={Select}
                              name="timeoutUnit"
                              label="Unidade"
                            >
                              <MenuItem value="minutes">Minutos</MenuItem>
                              <MenuItem value="hours">Horas</MenuItem>
                            </Field>
                          </FormControl>
                        </Stack>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Ação</InputLabel>
                          <Field
                            as={Select}
                            name="timeoutAction"
                            label="Ação"
                          >
                            <MenuItem value="continue">Continuar</MenuItem>
                          </Field>
                        </FormControl>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={isSubmitting}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
                variant="contained"
                className={classes.btnWrapper}
                startIcon={<SaveIcon />}
              >
                Salvar
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default FlowBuilderWaitQuestionModal;
