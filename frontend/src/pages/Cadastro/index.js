import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory, Link as RouterLink } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { getBackendUrl } from "../../config";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";
import { Formik, Form, Field } from "formik";
import {
    IconButton,
    InputAdornment,
    TextField,
    Button,
    Box,
    Typography,
    CssBaseline,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Fade,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    MenuItem,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import SaveIcon from '@mui/icons-material/Save';
import LoginIcon from '@mui/icons-material/Login';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { makeStyles } from "@material-ui/core/styles";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import wallfundo from "../../assets/f002.png";
import api from "../../services/api";

// Função para validar CPF
const isValidCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Função para validar CNPJ
const isValidCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Segmentos disponíveis
const segments = [
  { value: "varejo", label: "Varejo", icon: "🛍️" },
  { value: "servicos", label: "Serviços", icon: "🔧" },
  { value: "tecnologia", label: "Tecnologia", icon: "💻" },
  { value: "saude", label: "Saúde", icon: "🏥" },
  { value: "educacao", label: "Educação", icon: "📚" },
  { value: "alimentos", label: "Alimentos", icon: "🍔" },
  { value: "moda", label: "Moda", icon: "👗" },
  { value: "automotivo", label: "Automotivo", icon: "🚗" },
  { value: "imobiliario", label: "Imobiliário", icon: "🏠" },
  { value: "entretenimento", label: "Entretenimento", icon: "🎮" },
  { value: "financeiro", label: "Financeiro", icon: "💰" },
  { value: "outros", label: "Outros", icon: "📦" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  
  leftPanel: (props) => ({
    flex: 1,
    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${props.backgroundImage || wallfundo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      opacity: 0.6,
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  }),

  leftPanelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: theme.spacing(5),
    maxWidth: 520,
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },

  leftPanelTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    lineHeight: 1.2,
  },

  leftPanelSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    marginBottom: theme.spacing(3),
  },

  leftPanelList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  leftPanelListItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    fontSize: "1rem",
    "& svg": {
      marginRight: theme.spacing(1),
      fontSize: "1.2rem",
    },
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },

  signupCard: {
    maxWidth: 500,
    width: "100%",
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
  },

  stepper: {
    padding: theme.spacing(2, 0),
    backgroundColor: "transparent",
    marginBottom: theme.spacing(2),
  },

  stepContent: {
    padding: theme.spacing(3),
  },

  inputField: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f1f5f9",
    },
    "&:focus-within": {
      borderColor: "#3b82f6",
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
    },
  },

  submitButton: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    marginTop: theme.spacing(2),
    boxShadow: `0 4px 12px ${theme.palette.primary.main}66`,
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark || theme.palette.primary.main,
      boxShadow: `0 6px 16px ${theme.palette.primary.main}80`,
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      backgroundColor: "#9ca3af",
      boxShadow: "none",
      transform: "none",
    },
  },

  backButton: {
    marginRight: theme.spacing(1),
  },

  phoneInputContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f1f5f9",
    },
    "&:focus-within": {
      borderColor: "#3b82f6",
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },

  phoneInput: {
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    color: "#1f2937",
    fontSize: "0.95rem",
  },

  termsCheckbox: {
    marginTop: theme.spacing(2),
    "& .MuiFormControlLabel-label": {
      fontSize: "0.85rem",
      color: "#6b7280",
      fontWeight: 500,
    },
  },

  progressContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    textAlign: "center",
  },

  progressText: {
    marginTop: theme.spacing(2),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },

  planCard: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },

  segmentCard: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },

  carouselContainer: {
    position: "relative",
    overflow: "hidden",
    padding: theme.spacing(2, 0),
  },

  carouselWrapper: {
    display: "flex",
    transition: "transform 0.3s ease",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    cursor: "grab",
    userSelect: "none",
    "&:active": {
      cursor: "grabbing",
    },
    "&::-webkit-scrollbar": {
      height: 6,
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#3b82f6",
      borderRadius: 3,
    },
  },

  carouselItem: {
    flex: "0 0 auto",
    scrollSnapAlign: "start",
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0,
    },
  },

  planCarouselItem: {
    width: "280px",
  },

  segmentCarouselItem: {
    width: "140px",
  },

  carouselNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "1px solid #e5e7eb",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },

  carouselNavLeft: {
    left: -20,
  },

  carouselNavRight: {
    right: -20,
  },
}));

const SignUpSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto")
    .required("Nome é obrigatório"),
  email: Yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),
  password: Yup.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .matches(/[a-z]/, "Senha deve conter ao menos 1 letra minúscula")
    .matches(/[A-Z]/, "Senha deve conter ao menos 1 letra maiúscula")
    .matches(/[0-9]/, "Senha deve conter ao menos 1 número")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Senha deve conter ao menos 1 caractere especial")
    .required("Senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
  phone: Yup.string()
    .min(10, "Telefone muito curto")
    .required("Telefone é obrigatório"),
  companyName: Yup.string()
    .min(2, "Nome da empresa muito curto")
    .required("Nome da empresa é obrigatório"),
  type: Yup.string()
    .oneOf(["pf", "pj"], "Tipo inválido")
    .required("Tipo é obrigatório"),
  document: Yup.string()
    .when("type", {
      is: "pf",
      then: Yup.string()
        .test("cpf", "CPF inválido", (value) => !value || isValidCPF(value))
        .required("CPF é obrigatório"),
      otherwise: Yup.string()
        .test("cnpj", "CNPJ inválido", (value) => !value || isValidCNPJ(value))
        .required("CNPJ é obrigatório")
    }),
  segment: Yup.string(),
  planId: Yup.number()
    .required("Plano é obrigatório")
});

const QuizForm = ({ values, errors, touched, setFieldValue, setFieldTouched, nextStep, prevStep, step, totalSteps, handleSubmit, isSubmitting, plans, trialDays, loading }) => {
  const classes = useStyles();
  const [showPassword, setShowPassword] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { showAlert } = useSystemAlert();

  // Campos obrigatórios por etapa
  const stepFields = {
    0: ["name"],
    1: ["email"],
    2: ["password", "confirmPassword"],
    3: ["phone"],
    4: ["type"],
    5: ["document"],
    6: ["companyName"],
    7: ["planId"],
  };

  // Carousel scroll functions
  const scrollCarousel = (direction, carouselClass) => {
    const carousel = document.querySelector(carouselClass);
    if (!carousel) return;
    
    const scrollAmount = 300; // pixels to scroll
    if (direction === 'left') {
      carousel.scrollLeft -= scrollAmount;
    } else {
      carousel.scrollLeft += scrollAmount;
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validação por etapa antes de avançar
  const validateCurrentStep = async () => {
    const fields = stepFields[step] || [];
    
    // Marcar campos como touched para exibir erros
    fields.forEach(field => {
      if (setFieldTouched) setFieldTouched(field, true, true);
    });

    // Aguardar um tick para Formik processar
    await new Promise(r => setTimeout(r, 50));

    // Verificar campos vazios
    for (const field of fields) {
      const val = values[field];
      if (val === undefined || val === null || val === "") {
        const labels = {
          name: "nome",
          email: "e-mail",
          password: "senha",
          confirmPassword: "confirmação de senha",
          phone: "telefone",
          type: "tipo (PF/PJ)",
          document: "documento (CPF/CNPJ)",
          companyName: "nome da empresa",
          planId: "plano",
        };
        showAlert({
          type: "warning",
          title: "Campo obrigatório",
          message: `Preencha o campo "${labels[field] || field}" antes de continuar.`,
        });
        return false;
      }
    }

    // Validar com Yup apenas os campos da etapa atual
    try {
      const fieldSubset = {};
      fields.forEach(f => { fieldSubset[f] = values[f]; });
      await SignUpSchema.validateAt(fields[0], values);
      // Validar todos os campos da etapa
      for (const f of fields) {
        await SignUpSchema.validateAt(f, values);
      }
    } catch (yupErr) {
      showAlert({
        type: "error",
        title: "Dados inválidos",
        message: yupErr.message,
      });
      return false;
    }

    // Verificação especial: etapa do e-mail — checar se já existe
    if (step === 1) {
      try {
        setCheckingEmail(true);
        const { data } = await openApi.get(`/auth/check-email?email=${encodeURIComponent(values.email)}`);
        if (data && data.exists) {
          showAlert({
            type: "warning",
            title: "E-mail já cadastrado",
            message: "Já existe uma conta com este e-mail. Tente fazer login ou use outro e-mail.",
          });
          setCheckingEmail(false);
          return false;
        }
      } catch (err) {
        // Se o endpoint não existir (404), apenas avisar mas deixar prosseguir
        if (err?.response?.status !== 404) {
          showAlert({
            type: "info",
            title: "Aviso",
            message: "Não foi possível verificar o e-mail. Se já possuir conta, o cadastro poderá falhar.",
          });
        }
      } finally {
        setCheckingEmail(false);
      }
    }

    // Verificação especial: etapa da senha — confirmar senhas iguais
    if (step === 2) {
      if (values.password !== values.confirmPassword) {
        showAlert({
          type: "error",
          title: "Senhas diferentes",
          message: "A senha e a confirmação não coincidem. Verifique e tente novamente.",
        });
        return false;
      }
    }

    return true;
  };

  const handleNextStep = async (e) => {
    if (e) e.preventDefault();
    
    if (step === totalSteps - 1) {
      return;
    }
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    nextStep(values);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                👋 Vamos começar! Qual seu nome?
              </Typography>
              <Field
                as={TextField}
                name="name"
                variant="outlined"
                fullWidth
                placeholder="Seu nome completo"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📧 Qual seu melhor e-mail?
              </Typography>
              <Field
                as={TextField}
                name="email"
                variant="outlined"
                fullWidth
                placeholder="seu@email.com"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🔐 Crie uma senha segura
              </Typography>
              <Field
                as={TextField}
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                placeholder="Mínimo 6 caracteres"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
              {/* Indicadores de força da senha */}
              <Box mt={1} px={1}>
                <Typography variant="caption" style={{ color: "#6b7280", fontWeight: 500 }}>
                  A senha deve conter:
                </Typography>
                <Box display="flex" flexDirection="column" mt={0.5} gap={0.25}>
                  <Typography variant="caption" style={{ color: values.password?.length >= 6 ? "#10b981" : "#ef4444" }}>
                    {values.password?.length >= 6 ? "✓" : "✗"} Mínimo 6 caracteres
                  </Typography>
                  <Typography variant="caption" style={{ color: /[A-Z]/.test(values.password || "") ? "#10b981" : "#ef4444" }}>
                    {/[A-Z]/.test(values.password || "") ? "✓" : "✗"} Ao menos 1 letra maiúscula
                  </Typography>
                  <Typography variant="caption" style={{ color: /[a-z]/.test(values.password || "") ? "#10b981" : "#ef4444" }}>
                    {/[a-z]/.test(values.password || "") ? "✓" : "✗"} Ao menos 1 letra minúscula
                  </Typography>
                  <Typography variant="caption" style={{ color: /[0-9]/.test(values.password || "") ? "#10b981" : "#ef4444" }}>
                    {/[0-9]/.test(values.password || "") ? "✓" : "✗"} Ao menos 1 número
                  </Typography>
                  <Typography variant="caption" style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(values.password || "") ? "#10b981" : "#ef4444" }}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(values.password || "") ? "✓" : "✗"} Ao menos 1 caractere especial
                  </Typography>
                </Box>
              </Box>
              <Field
                as={TextField}
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                placeholder="Confirme sua senha"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
                style={{ marginTop: 16 }}
              />
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📱 Seu telefone para contato
              </Typography>
              <div className={classes.phoneInputContainer}>
                <Field name="phone">
                  {({ field }) => (
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="BR"
                      onChange={(value) => setFieldValue('phone', value)}
                      className={classes.phoneInput}
                      placeholder="(00) 00000-0000"
                      inputStyle={{
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        width: "100%",
                        color: "#1f2937",
                        fontSize: "0.95rem",
                      }}
                    />
                  )}
                </Field>
              </div>
              {touched.phone && errors.phone && (
                <Typography color="error" variant="caption" style={{ marginTop: 8 }}>
                  {errors.phone}
                </Typography>
              )}
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🏢 Você é pessoa física ou jurídica?
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Box
                  className={classes.inputField}
                  style={{ 
                    flex: 1, 
                    padding: 16, 
                    textAlign: "center",
                    cursor: "pointer",
                    border: values.type === 'pf' ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    backgroundColor: values.type === 'pf' ? "#dbeafe" : "#f8fafc"
                  }}
                  onClick={() => setFieldValue('type', 'pf')}
                >
                  <PersonIcon style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }} />
                  <Typography style={{ fontWeight: 500 }}>
                    Pessoa Física
                  </Typography>
                </Box>
                <Box
                  className={classes.inputField}
                  style={{ 
                    flex: 1, 
                    padding: 16, 
                    textAlign: "center",
                    cursor: "pointer",
                    border: values.type === 'pj' ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    backgroundColor: values.type === 'pj' ? "#dbeafe" : "#f8fafc"
                  }}
                  onClick={() => setFieldValue('type', 'pj')}
                >
                  <BusinessIcon style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }} />
                  <Typography style={{ fontWeight: 500 }}>
                    Pessoa Jurídica
                  </Typography>
                </Box>
              </Box>
              {touched.type && errors.type && (
                <Typography color="error" variant="caption" style={{ marginTop: 8 }}>
                  {errors.type}
                </Typography>
              )}
            </Box>
          </Fade>
        );

      case 5:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📋 {values.type === 'pf' ? 'Seu CPF' : 'Seu CNPJ'}
              </Typography>
              <Field
                as={TextField}
                name="document"
                variant="outlined"
                fullWidth
                placeholder={values.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                error={touched.document && Boolean(errors.document)}
                helperText={touched.document && errors.document}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 6:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🏭 Nome da sua empresa
              </Typography>
              <Field
                as={TextField}
                name="companyName"
                variant="outlined"
                fullWidth
                placeholder="Nome da empresa"
                error={touched.companyName && Boolean(errors.companyName)}
                helperText={touched.companyName && errors.companyName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 7:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                💳 Escolha seu plano
              </Typography>
              <Field
                as={TextField}
                name="planId"
                variant="outlined"
                fullWidth
                select
                error={touched.planId && Boolean(errors.planId)}
                helperText={touched.planId && errors.planId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CardMembershipIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="#1f2937">
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          {plan.users || 3} usuários • Conexões ilimitadas
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="#3b82f6" fontWeight={700}>
                        R${plan.value || plan.amount || plan.price || '0'}
                        <Typography component="span" variant="caption" color="#6b7280">
                          /{plan.recurrence === 'MENSAL' ? 'mês' : 'ano'}
                        </Typography>
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Field>
              
              <Box mt={2} p={2} bgcolor="#f0f9ff" borderRadius={8} border="1px solid #3b82f6">
                <Typography variant="body2" color="#1e40af" style={{ lineHeight: 1.4 }}>
                  <CheckCircleIcon style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }} />
                  <strong>Aviso importante:</strong> Você não será cobrado agora. A cobrança apenas começará após os {trialDays} dias de teste gratuito.
                </Typography>
              </Box>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Form>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="#6b7280">
            Etapa {step + 1} de {totalSteps}
          </Typography>
          <Typography variant="body2" color="#3b82f6" fontWeight={600}>
            {Math.round(((step + 1) / totalSteps) * 100)}%
          </Typography>
        </Box>
        <Box
          height={8}
          bgcolor="#e5e7eb"
          borderRadius={4}
          overflow="hidden"
        >
          <Box
            height="100%"
            bgcolor="#3b82f6"
            borderRadius={4}
            transition="width 0.3s ease"
            width={`${((step + 1) / totalSteps) * 100}%`}
          />
        </Box>
      </Box>
      
      {renderStepContent()}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          disabled={step === 0}
          onClick={prevStep}
          className={classes.backButton}
        >
          Voltar
        </Button>
        <Button
          type={step === totalSteps - 1 ? "submit" : "button"}
          variant="contained"
          onClick={step < totalSteps - 1 ? handleNextStep : undefined}
          color="primary"
          className={classes.submitButton}
          disabled={isSubmitting || checkingEmail}
        >
          {checkingEmail ? "Verificando..." : step === totalSteps - 1 ? (isSubmitting ? "Cadastrando..." : "Finalizar") : "Próximo"}
        </Button>
      </Box>
    </Form>
  );
};

const SignUp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const { showAlert } = useSystemAlert();
  const [backgroundImage, setBackgroundImage] = useState(wallfundo);
  const [trialDays, setTrialDays] = useState(7);
  const classes = useStyles({ backgroundImage });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [processingText, setProcessingText] = useState("Realizando cadastro...");
  const { getPlanList } = usePlans();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  
  const params = qs.parse(window.location.search);
  const companyId = params.companyId ?? null;
  const affiliateCode = params.aff || null;
  const initialState = { 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    phone: "", 
    companyId, 
    companyName: "", 
    planId: 1, 
    document: "",
    type: "pf",
    segment: ""
  };

  const [plans, setPlans] = useState([]);
  const steps = [
    "Nome",
    "Email",
    "Senha",
    "Telefone",
    "Tipo",
    "Documento",
    "Empresa",
    "Plano"
  ];

  // Registrar clique no link de afiliado
  useEffect(() => {
    if (affiliateCode) {
      const backendUrl = getBackendUrl();
      fetch(`${backendUrl}/affiliate/check-affiliate/${affiliateCode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.valid) {
            console.log("Affiliate link valid:", data.affiliateCode);
          }
        })
        .catch((err) => console.log("Erro ao verificar afiliado:", err));
    }
  }, [affiliateCode]);

  // Busca imagem de fundo do backend
  useEffect(() => {
    const backendUrl = getBackendUrl();
    
    fetch(`${backendUrl}/public-settings/termsImage?token=wtV`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBackgroundImage(`${backendUrl}/public/${data}`);
        }
      })
      .catch((err) => console.log("Erro ao buscar termsImage:", err));

    fetch(`${backendUrl}/public-settings/trialDays?token=wtV`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setTrialDays(parseInt(data) || 7);
        }
      })
      .catch((err) => console.log("Erro ao buscar trialDays:", err));
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const planList = await getPlanList();
        
        if (isMounted) {
          const publicPlans = planList.filter(plan => plan.isPublic === true);
          console.log("Planos encontrados:", publicPlans);
          setPlans(publicPlans);

          if (params.planId) {
            const preselected = publicPlans.find(plan => String(plan.id) === String(params.planId));
            if (preselected) {
              setSelectedPlan(preselected);
            }
          } else if (publicPlans.length > 0) {
            setSelectedPlan(publicPlans[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        // Fallback: criar planos padrão
        if (isMounted) {
          const defaultPlans = [
            {
              id: 1,
              name: "Plano Básico",
              value: 97,
              recurrence: "MENSAL",
              users: 3,
              isPublic: true
            },
            {
              id: 2,
              name: "Plano Profissional",
              value: 197,
              recurrence: "MENSAL",
              users: 5,
              isPublic: true
            },
            {
              id: 3,
              name: "Plano Enterprise",
              value: 397,
              recurrence: "MENSAL",
              users: 10,
              isPublic: true
            }
          ];
          console.log("Usando planos fallback:", defaultPlans);
          setPlans(defaultPlans);
          setSelectedPlan(defaultPlans[0]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [params.planId, getPlanList]);

  const dueDate = moment().add(trialDays, "day").format();

  // Add drag scroll functionality to carousels
  useEffect(() => {
    const addDragScroll = (selector) => {
      const carousel = document.querySelector(selector);
      if (!carousel) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;
      
      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });
      
      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });
      
      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });
      
      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });
    };

    // Initialize drag scroll after component mounts
    setTimeout(() => {
      addDragScroll('.carouselWrapper');
    }, 100);
  }, []);

  const handleSignUp = async (values) => {
    console.log("handleSignUp called with values:", values);
    console.log("agreeToTerms:", agreeToTerms);
    
    // Ensure planId is set
    const finalPlanId = values.planId || selectedPlan?.id || plans[0]?.id || 1;
    console.log("finalPlanId:", finalPlanId);
    
    if (!agreeToTerms) {
      showAlert({
        type: "warning",
        title: "Termos obrigatórios",
        message: "Você precisa aceitar os Termos e Condições para continuar.",
      });
      return;
    }

    setProcessingModalOpen(true);
    setProcessingText("Validando dados...");
    
    const stages = [
      "Criando conta...",
      "Configurando ambiente...",
      "Finalizando cadastro..."
    ];
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setProcessingText(stages[i]);
    }
    
    const dataToSend = {
      ...values,
      planId: finalPlanId,
      phone: values.phone ? values.phone.replace(/\D/g, '') : '',
      recurrence: "MENSAL",
      dueDate: dueDate,
      status: "t",
      campaignsEnabled: true,
      affiliateCode: affiliateCode || undefined
    };
    
    try {
        // 1. Criar conta
        await openApi.post("/auth/signup", dataToSend);
        
        // 2. Mostrar sucesso
        setProcessingText("Concluindo...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingModalOpen(false);
        
        // 3. Mostrar popup de sucesso com botão para login
        toast.success(
          <div>
            <Typography variant="body1" style={{ fontWeight: 600 }}>
              🎉 Cadastro realizado com sucesso!
            </Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Sua conta foi criada. Faça login para acessar o sistema.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginTop: 12 }}
              onClick={() => history.push("/login")}
            >
              Fazer Login
            </Button>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          }
        );
        
      } catch (err) {
        setProcessingModalOpen(false);
        toastError(err);
      }
  };

  const nextStep = (values) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const leftPanelContent = {
    title: "Construa o atendimento perfeito",
    subtitle: "Automatize fluxos, conecte canais e entregue experiências únicas aos seus clientes.",
    features: [
      "Jornadas inteligentes com IA",
      "Campanhas e disparos multicanal",
      "Insights em tempo real para o seu time"
    ]
  };

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        {!isMobile && (
          <div 
            className={classes.leftPanel}
            style={{ 
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${backgroundImage})` 
            }}
          >
            <div className={classes.leftPanelCard}>
              <Typography className={classes.leftPanelTitle}>
                {leftPanelContent.title}
              </Typography>
              <Typography className={classes.leftPanelSubtitle}>
                {leftPanelContent.subtitle}
              </Typography>
              <ul className={classes.leftPanelList}>
                {leftPanelContent.features.map((feature) => (
                  <li key={feature} className={classes.leftPanelListItem}>
                    <CheckCircleIcon style={{ color: "#10b981" }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className={classes.rightPanel}>
          <Card className={classes.signupCard}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 700, color: "#1f2937" }}>
                Criar sua conta
              </Typography>
              
              <Formik
                initialValues={initialState}
                validationSchema={SignUpSchema}
                onSubmit={handleSignUp}
              >
                {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit, isSubmitting }) => (
                  <Form>
                    <QuizForm
                      values={values}
                      errors={errors}
                      touched={touched}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      nextStep={() => nextStep(values)}
                      prevStep={prevStep}
                      step={currentStep}
                      totalSteps={steps.length}
                      handleSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      plans={plans}
                      trialDays={trialDays}
                      loading={loading}
                    />

                    {currentStep === steps.length - 1 && (
                      <FormControlLabel
                        className={classes.termsCheckbox}
                        control={
                          <Checkbox
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            name="agreeToTerms"
                            color="primary"
                          />
                        }
                        label={
                          <span>
                            Eu concordo com os{" "}
                            <span
                              onClick={() => setTermsModalOpen(true)}
                              style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
                            >
                              Termos e Condições
                            </span>
                          </span>
                        }
                      />
                    )}
                  </Form>
                )}
              </Formik>
              
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                style={{ marginTop: 16 }}
              >
                Já tenho uma conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      <Dialog open={termsModalOpen} onClose={() => setTermsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Termos e Condições de Uso</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom><strong>1. ACEITAÇÃO DOS TERMOS</strong></Typography>
          <Typography paragraph>
            1.1. Estes Termos de Uso ("Termos") regem o uso do sistema web. Ao acessar ou utilizar o Sistema, o usuário concorda em cumprir estes Termos. Caso não concorde, deve cessar o uso do Sistema imediatamente.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>2. LICENÇA DE USO</strong></Typography>
          <Typography paragraph>
            2.1. O Licenciante concede ao Usuário uma licença limitada, não exclusiva, intransferível e revogável para uso do Sistema de acordo com estes Termos.
          </Typography>
          <Typography paragraph>
            2.2. O Usuário não poderá modificar, distribuir, vender, alugar, sublicenciar ou realizar engenharia reversa sobre o Sistema, salvo quando expressamente permitido por lei.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>3. DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL</strong></Typography>
          <Typography paragraph>
            3.1. O Sistema, incluindo código-fonte, design, logotipos e demais conteúdos, é protegido por leis de direitos autorais e outras leis de propriedade intelectual.
          </Typography>
          <Typography paragraph>
            3.2. Nenhuma parte do Sistema poderá ser copiada, reproduzida ou utilizada sem a autorização expressa do Licenciante.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>4. RESPONSABILIDADES DO USUÁRIO</strong></Typography>
          <Typography paragraph>
            4.1. O Usuário se compromete a utilizar o Sistema de forma lícita e em conformidade com estes Termos.
          </Typography>
          <Typography paragraph>
            4.2. O Usuário é responsável por manter a segurança de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>5. LIMITAÇÃO DE RESPONSABILIDADE</strong></Typography>
          <Typography paragraph>
            5.1. O Sistema é fornecido "como está", sem garantias de qualquer tipo.
          </Typography>
          <Typography paragraph>
            5.2. O Licenciante não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou impossibilidade de uso do Sistema.
          </Typography>

          <Box mt={3}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              onClick={() => setTermsModalOpen(false)}
            >
              Fechar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal de Processamento */}
      <Dialog open={processingModalOpen} maxWidth="sm" fullWidth>
        <DialogContent>
          <div className={classes.progressContainer}>
            <CircularProgress size={48} />
            <Typography variant="h6" className={classes.progressText}>
              {processingText}
            </Typography>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignUp;
