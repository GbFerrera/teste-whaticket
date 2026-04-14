import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory, Link as RouterLink } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { getBackendUrl } from "../../config";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import {
    IconButton,
    InputAdornment,
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Container,
    CssBaseline,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    AppBar,
    Toolbar,
    CircularProgress,
    Fade,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    Paper,
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
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StoreIcon from '@mui/icons-material/Store';
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import wallfundo from "../../assets/f002.png";
import Link from "@material-ui/core/Link";

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
  { value: "varejo", label: "Varejo", icon: <StoreIcon /> },
  { value: "servicos", label: "Serviços", icon: <BusinessIcon /> },
  { value: "industria", label: "Indústria", icon: <AccountTreeIcon /> },
  { value: "tecnologia", label: "Tecnologia", icon: <StarIcon /> },
  { value: "saude", label: "Saúde", icon: <CheckCircleIcon /> },
  { value: "educacao", label: "Educação", icon: <PersonIcon /> },
  { value: "construcao", label: "Construção", icon: <AccountTreeIcon /> },
  { value: "alimentos", label: "Alimentos", icon: <StoreIcon /> },
  { value: "consultoria", label: "Consultoria", icon: <BusinessIcon /> },
  { value: "outros", label: "Outros", icon: <StoreIcon /> }
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    padding: theme.spacing(3, 0),
    backgroundColor: "transparent",
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

  segmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },

  segmentCard: {
    padding: theme.spacing(2),
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#f0f9ff",
      transform: "translateY(-2px)",
    },
    "&.selected": {
      borderColor: "#3b82f6",
      backgroundColor: "#dbeafe",
    },
  },

  segmentIcon: {
    fontSize: "2rem",
    color: "#3b82f6",
    marginBottom: theme.spacing(1),
  },

  segmentLabel: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#374151",
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

  planButton: {
    width: "100%",
    padding: theme.spacing(2),
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#f0f9ff",
    },
    "&.selected": {
      borderColor: "#3b82f6",
      backgroundColor: "#dbeafe",
    },
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
}));

const SignUpSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto")
    .required("Nome é obrigatório"),
  email: Yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),
  password: Yup.string()
    .min(6, "Senha muito curta")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, "Senha deve conter letras e números")
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

const QuizForm = ({ values, errors, touched, setFieldValue, nextStep, prevStep, step, totalSteps }) => {
  const classes = useStyles();
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
                <Paper
                  className={`${classes.segmentCard} ${values.type === 'pf' ? 'selected' : ''}`}
                  onClick={() => setFieldValue('type', 'pf')}
                  style={{ flex: 1 }}
                >
                  <PersonIcon className={classes.segmentIcon} />
                  <Typography className={classes.segmentLabel}>
                    Pessoa Física
                  </Typography>
                </Paper>
                <Paper
                  className={`${classes.segmentCard} ${values.type === 'pj' ? 'selected' : ''}`}
                  onClick={() => setFieldValue('type', 'pj')}
                  style={{ flex: 1 }}
                >
                  <BusinessIcon className={classes.segmentIcon} />
                  <Typography className={classes.segmentLabel}>
                    Pessoa Jurídica
                  </Typography>
                </Paper>
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

      default:
        return null;
    }
  };

  return (
    <Box>
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
          variant="contained"
          onClick={nextStep}
          color="primary"
          className={classes.submitButton}
        >
          {step === totalSteps - 1 ? "Finalizar" : "Próximo"}
        </Button>
      </Box>
    </Box>
  );
};

const SignUp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const [backgroundImage, setBackgroundImage] = useState(wallfundo);
  const [trialDays, setTrialDays] = useState(7);
  const classes = useStyles({ backgroundImage });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [processingText, setProcessingText] = useState("Realizando cadastro...");
  const { getPlanList } = usePlans();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
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
    planId: params.planId || "", 
    document: "",
    type: "pf",
    segment: ""
  };

  const [plans, setPlans] = useState([]);
  const steps = [
    "Nome",
    "E-mail", 
    "Senha",
    "Telefone",
    "Tipo",
    "Documento",
    "Empresa"
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
          setPlans(publicPlans);

          if (params.planId) {
            const preselected = publicPlans.find(plan => String(plan.id) === String(params.planId));
            if (preselected) {
              setSelectedPlan(preselected);
            }
          } else if (publicPlans.length > 0) {
            // Seleciona o primeiro plano público por padrão
            setSelectedPlan(publicPlans[0]);
          }
        }
      } catch (error) {
        if (isMounted) {
          toastError("Erro ao carregar planos. Tente novamente.");
          console.error("Plan fetch error:", error);
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
  }, [params.planId]);

  const dueDate = moment().add(trialDays, "day").format();
  
  const handleSignUp = async (values) => {
    if (!agreeToTerms) {
      toast.error("Você precisa aceitar os termos para continuar.");
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
      phone: values.phone ? values.phone.replace(/\D/g, '') : '',
      recurrence: "MENSAL",
      dueDate: dueDate,
      status: "t",
      campaignsEnabled: true,
      planId: selectedPlan?.id || plans[0]?.id,
      affiliateCode: affiliateCode || undefined
    };
    
    try {
      await openApi.post("/auth/signup", dataToSend);
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingModalOpen(false);
      setSuccessModalOpen(true);
    } catch (err) {
      setProcessingModalOpen(false);
      toastError(err);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    history.push("/login");
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
              
              <Stepper activeStep={currentStep} alternativeLabel className={classes.stepper}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Formik
                initialValues={initialState}
                validationSchema={SignUpSchema}
                onSubmit={handleSignUp}
              >
                {({ values, errors, touched, setFieldValue }) => (
                  <Form>
                    <QuizForm
                      values={values}
                      errors={errors}
                      touched={touched}
                      setFieldValue={setFieldValue}
                      nextStep={() => nextStep(values)}
                      prevStep={prevStep}
                      step={currentStep}
                      totalSteps={steps.length}
                    />

                    {currentStep === steps.length - 1 && (
                      <>
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
                          label="Eu concordo com os Termos e Condições"
                        />
                        
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          startIcon={<SaveIcon />}
                          className={classes.submitButton}
                          disabled={!agreeToTerms}
                        >
                          Criar conta
                        </Button>
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          component={RouterLink}
                          to="/login"
                          startIcon={<LoginIcon />}
                          style={{ marginTop: 8 }}
                        >
                          Já tenho uma conta
                        </Button>
                      </>
                    )}
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={successModalOpen} onClose={handleCloseSuccessModal} maxWidth="sm" fullWidth>
        <DialogContent>
          <div className={classes.progressContainer}>
            <CheckCircleIcon style={{ fontSize: 64, color: "#10b981" }} />
            <Typography variant="h6" gutterBottom>
              🎉 Conta criada com sucesso!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Seu ambiente está sendo preparado. Você receberá um e-mail com os dados de acesso.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseSuccessModal}
              style={{ marginTop: 16 }}
            >
              Ir para o login
            </Button>
          </div>
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
