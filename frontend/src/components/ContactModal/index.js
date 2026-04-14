import React, { useState, useEffect, useRef } from "react";
import { parseISO, format } from "date-fns";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Slide } from "@mui/material";

import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Switch,
  Stack,
  Avatar,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import {
  green,
  orange,
  red,
  blue,
  purple,
  teal,
  indigo,
} from "@mui/material/colors";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DeleteOutline as DeleteOutlineIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  SmartToy as BotIcon,
  WhatsApp as WhatsAppIcon,
  Info as InfoIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { TagsContainer } from "../TagsContainer";

// Transition component for slide up effect
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Curto!")
    .max(250, "Longo!")
    .required("Obrigatótio"),
  number: Yup.string()
    .required("O número é obrigatório")
    .min(8, "Mínimo 8 dígitos!")
    .max(50, "Longo!"),
  email: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .email("Email Inválido"),
  cpfCnpj: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(32, "Muito longo"),
  address: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(255, "Muito longo"),
  info: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  lid: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(64, "Muito longo"),
});

const getRandomGradient = () => {
  const gradients = [
    `linear-gradient(135deg, ${indigo[500]}, ${teal[500]})`,
    `linear-gradient(135deg, ${purple[500]}, ${blue[500]})`,
    `linear-gradient(135deg, ${teal[500]}, ${green[500]})`,
    `linear-gradient(135deg, ${orange[500]}, ${red[500]})`,
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

const isTempNumber = (value) =>
  typeof value === "string" &&
  (value.startsWith("lid-") || value.startsWith("temp-"));

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
  const isMounted = useRef(true);
  const [gradient] = useState(getRandomGradient());

  const initialState = {
    name: "",
    number: "",
    email: "",
    disableBot: false,
    lgpdAcceptedAt: "",
    cpfCnpj: "",
    address: "",
    info: "",
    birthday: "",
    anniversary: "",
    acceptAudioMessage: true,
    active: true,
    channel: "whatsapp",
    lid: "",
  };

  const [contact, setContact] = useState(initialState);
  const [disableBot, setDisableBot] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => ({
          ...prevState,
          ...initialValues,
        }));
      }

      if (!contactId) return;

      try {
        const { data } = await api.get(`/contacts/${contactId}`);
        if (isMounted.current) {
          setContact(data);
          setDisableBot(data.disableBot);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, { ...values, disableBot });
        handleClose();
      } else {
        const { data } = await api.post("/contacts", { ...values, disableBot });
        if (onSave) onSave(data);
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleUploadFiles = async (event) => {
    try {
      if (!contactId) return;
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("typeArch", "contacts");
      formData.append("fileId", String(contactId));

      setUploadingFiles(true);
      const { data } = await api.post(`/contacts/${contactId}/files`, formData);

      setContact((prev) => ({
        ...prev,
        files: data.files,
      }));
      toast.success("Arquivos enviados com sucesso");
      event.target.value = "";
    } catch (err) {
      toastError(err);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDownloadFile = (file) => {
    if (!contact || !contact.companyId) return;
    const baseURL = api.defaults?.baseURL || "";
    const url = `${baseURL}/public/company${contact.companyId}/contacts/${contact.id}/${file.filename}`;
    window.open(url, "_blank");
  };

  const handleDeleteFile = async (file) => {
    try {
      if (!contactId) return;
      const { data } = await api.delete(`/contacts/${contactId}/files`, {
        data: { filename: file.filename },
      });

      setContact((prev) => ({
        ...prev,
        files: data.files,
      }));
      toast.success("Arquivo removido com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      TransitionComponent={Slide}
      transitionDuration={{ enter: 300, exit: 200 }}
      sx={{
        '& .MuiDrawer-paper': {
          width: '600px',
          maxWidth: '90vw',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Header do Drawer */}
      <Box
        sx={{
          backgroundColor: '#3f51b5',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {contactId
                ? i18n.t("contactModal.title.edit")
                : i18n.t("contactModal.title.add")}
            </Typography>
            <Chip
              label={contactId ? "Edição" : "Criação"}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: "bold",
                mt: 0.5,
              }}
            />
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CancelIcon />
        </IconButton>
      </Box>

      {/* Conteúdo do Drawer */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f8fafc',
        }}
      >
        <Formik
          initialValues={contact}
          enableReinitialize
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            handleSaveContact(values);
            actions.setSubmitting(false);
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    color: indigo[700],
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <PaletteIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.name")}
                      name="name"
                      fullWidth
                      autoFocus
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="filled"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.6)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.8)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  {contactId && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Arquivos do contato
                        </Typography>
                        {Array.isArray(contact.files) && contact.files.length > 0 ? (
                          contact.files.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2">
                                {file.originalName || file.filename}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleDownloadFile(file)}
                                >
                                  Baixar
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleDeleteFile(file)}
                                >
                                  Excluir
                                </Button>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Nenhum arquivo enviado.
                          </Typography>
                        )}

                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            component="label"
                            disabled={uploadingFiles}
                            startIcon={<SaveIcon />}
                            style={{
                              color: "white",
                              backgroundColor: "#437db5",
                              boxShadow: "none",
                              borderRadius: "5px",
                              fontSize: "12px",
                            }}
                          >
                            {uploadingFiles ? "Enviando..." : "Enviar arquivos"}
                            <input
                              type="file"
                              multiple
                              hidden
                              onChange={handleUploadFiles}
                            />
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label="CPF/CNPJ"
                      name="cpfCnpj"
                      fullWidth
                      error={touched.cpfCnpj && Boolean(errors.cpfCnpj)}
                      helperText={touched.cpfCnpj && errors.cpfCnpj}
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.6)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.8)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label="Endereço"
                      name="address"
                      fullWidth
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.6)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.8)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Field
                      as={TextField}
                      type="date"
                      label="Aniversário"
                      name="birthday"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Field
                      as={TextField}
                      type="date"
                      label="Data comemorativa"
                      name="anniversary"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label="Observações"
                      name="info"
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.number")}
                      name="number"
                      fullWidth
                      error={touched.number && Boolean(errors.number)}
                      helperText={
                        isTempNumber(values.number)
                          ? "Ainda aguardando o número real deste contato"
                          : touched.number && errors.number
                      }
                      value={isTempNumber(values.number) ? "" : values.number}
                      variant="filled"
                      placeholder="552433540335"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.6)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.8)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label="@lid"
                      name="lid"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <InfoIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      helperText={
                        values.lid
                          ? "Identificador temporário recebido do WhatsApp"
                          : "Nenhum LID vinculado"
                      }
                      variant="filled"
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.2)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.3)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.4)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.email")}
                      name="email"
                      fullWidth
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      variant="filled"
                      placeholder="email@example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiFilledInput-root": {
                          bgcolor: "rgba(233, 236, 239, 0.4)",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(233, 236, 239, 0.6)",
                          },
                          "&.Mui-focused": {
                            bgcolor: "rgba(233, 236, 239, 0.8)",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TagsContainer contact={contact} />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "rgba(233, 236, 239, 0.4)",
                    borderRadius: "8px",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center">
                      <BotIcon
                        sx={{
                          color: disableBot ? red[500] : green[500],
                          mr: 1,
                        }}
                      />
                      <Typography variant="subtitle1">
                        {i18n.t("contactModal.form.chatBotContact")}
                      </Typography>
                      <Tooltip title="Habilitar/desabilitar interações do chatbot para este contato">
                        <InfoIcon
                          sx={{ ml: 1, color: "text.secondary", fontSize: "1rem" }}
                        />
                      </Tooltip>
                    </Box>
                    <Switch
                      size="medium"
                      checked={disableBot}
                      onChange={() => setDisableBot(!disableBot)}
                      color={disableBot ? "error" : "success"}
                      sx={{
                        "& .MuiSwitch-thumb": {
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        },
                        "& .MuiSwitch-track": {
                          bgcolor: disableBot ? red[300] : green[300],
                        },
                      }}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "rgba(233, 236, 239, 0.4)",
                    borderRadius: "8px",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">Áudio permitido</Typography>
                    </Box>
                    <Switch
                      size="medium"
                      checked={values.acceptAudioMessage}
                      onChange={() =>
                        setFieldValue(
                          "acceptAudioMessage",
                          !values.acceptAudioMessage
                        )
                      }
                      color={values.acceptAudioMessage ? "success" : "error"}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "rgba(233, 236, 239, 0.4)",
                    borderRadius: "8px",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">Contato ativo</Typography>
                    </Box>
                    <Switch
                      size="medium"
                      checked={values.active}
                      onChange={() => setFieldValue("active", !values.active)}
                      color={values.active ? "success" : "error"}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "rgba(233, 236, 239, 0.4)",
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <WhatsAppIcon
                      sx={{
                        color: green[500],
                        mr: 1,
                      }}
                    />
                    {i18n.t("contactModal.form.whatsapp")}
                    <Chip
                      label={
                        contact?.whatsapp ? contact?.whatsapp.name : "Not linked"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                      color={contact?.whatsapp ? "success" : "default"}
                    />
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <InfoIcon
                      sx={{
                        color: blue[500],
                        mr: 1,
                      }}
                    />
                    {i18n.t("contactModal.form.termsLGDP")}
                    <Chip
                      label={
                        contact?.lgpdAcceptedAt
                          ? format(
                              new Date(contact?.lgpdAcceptedAt),
                              "dd/MM/yyyy 'às' HH:mm"
                            )
                          : "Não Informado"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                      color={contact?.lgpdAcceptedAt ? "primary" : "default"}
                    />
                  </Typography>
                </Box>

                <FieldArray name="extraInfo">
                  {({ push, remove }) => (
                    <>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{
                          mt: 3,
                          color: indigo[700],
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <AddIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                        {i18n.t("contactModal.form.extraInfo")}
                      </Typography>

                      {values.extraInfo &&
                        values.extraInfo.map((info, index) => (
                          <Stack
                            key={index}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            mt={2}
                          >
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraName")}
                              name={`extraInfo[${index}].name`}
                              fullWidth
                              variant="filled"
                              sx={{
                                "& .MuiFilledInput-root": {
                                  bgcolor: "rgba(233, 236, 239, 0.4)",
                                  borderRadius: "8px",
                                },
                              }}
                            />
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraValue")}
                              name={`extraInfo[${index}].value`}
                              fullWidth
                              variant="filled"
                              sx={{
                                "& .MuiFilledInput-root": {
                                  bgcolor: "rgba(233, 236, 239, 0.4)",
                                  borderRadius: "8px",
                                },
                              }}
                            />
                            <IconButton
                              onClick={() => remove(index)}
                              style={{
                              backgroundColor: "#FF6B6B",
                              borderRadius: "10px",
                              padding: "8px"
                              }}
                            >
                              <DeleteOutlineIcon style={{ color: "#fff" }} />
                            </IconButton>
                          </Stack>
                        ))}

                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => push({ name: "", value: "" })}
                        variant="contained"
                        style={{
                        color: "white",
                        backgroundColor: "#FFA500",
                        boxShadow: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                       }}
                      >
                        {i18n.t("contactModal.buttons.addExtraInfo")}
                      </Button>
                    </>
                  )}
                </FieldArray>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Footer Fixo do Drawer */}
              <Box
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e0e0e0',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Button
                  onClick={handleClose}
                  startIcon={<CancelIcon />}
                  variant="contained"
                  sx={{
                    flex: 1,
                    color: "white",
                    backgroundColor: "#db6565",
                    boxShadow: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    height: "44px",
                    '&:hover': {
                      backgroundColor: "#c55555",
                    },
                  }}
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                  variant="contained"
                  sx={{
                    flex: 1,
                    color: "white",
                    backgroundColor: "#437db5",
                    boxShadow: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    height: "44px",
                    '&:hover': {
                      backgroundColor: "#366d9c",
                    },
                    '&:disabled': {
                      backgroundColor: "#a0a0a0",
                    },
                  }}
                >
                  {contactId
                    ? i18n.t("contactModal.buttons.okEdit")
                    : i18n.t("contactModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={20}
                      sx={{ color: "white", ml: 1 }}
                    />
                  )}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Drawer>
  );
};

export default ContactModal;