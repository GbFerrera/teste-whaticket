import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Link,
  useTheme,
  Paper,
  Card,
  CardContent,
  LinearProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { 
  Visibility, 
  VisibilityOff,
  Lock as LockIcon,
  Mail as MailIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon
} from "@material-ui/icons";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import { versionSystem, nomeEmpresa } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { getBackendUrl } from "../../config";
import wallfundo from "../../assets/f002.png";
import useMediaQuery from '@material-ui/core/useMediaQuery';

const handleRedirect = () => {
  window.open(`#`, "_blank");
};

// Componente de Copyright
function Copyright({ appName }) {
  return (
    <Typography variant="body2" style={{ 
      color: "#9ca3af", 
      fontSize: "0.75rem",
      fontWeight: 300 
    }}>
      © {new Date().getFullYear()}
      {" - "}
      <Link 
        color="inherit" 
        href="#" 
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#9ca3af" }}
      >
        CopyRight {appName || "Atend Zappy"}
      </Link>
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  leftPanel: (props) => ({
    flex: 1,
    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${props.backgroundImage || wallfundo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      opacity: 0.5,
    },
  }),
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 6),
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4, 3),
    },
  },
  logo: {
    position: 'absolute',
    top: theme.spacing(4),
    left: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    zIndex: 1,
    '& svg': {
      marginRight: theme.spacing(1),
      fontSize: '1.5rem',
    },
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: theme.spacing(6, 5),
    maxWidth: '500px',
    width: '100%',
    color: 'white',
    textAlign: 'left',
    position: 'relative',
    zIndex: 1,
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  },

  cardIcons: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  cardIcon: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '12px',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      fontSize: '28px',
      color: 'white',
    },
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    opacity: 0.9,
    fontSize: '1.1rem',
    lineHeight: 1.6,
    marginBottom: 0,
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    marginTop: theme.spacing(2),
  },
  welcome: {
    marginBottom: theme.spacing(6),
    textAlign: 'center',
    '& h2': {
      fontWeight: 700,
      fontSize: '2rem',
      marginBottom: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    '& p': {
      color: theme.palette.text.secondary,
      fontSize: '1rem',
      margin: 0,
    },
  },
  textField: {
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D0D5DD',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-outlined': {
      color: '#667085',
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
  },

  button: {
    padding: theme.spacing(1.5),
    borderRadius: '12px',
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    marginTop: theme.spacing(2),
    background: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      background: theme.palette.primary.dark || theme.palette.primary.main,
      boxShadow: '0 4px 12px rgba(35, 33, 39, 0.3)',
    },
  },
  forgotPassword: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  footer: {
    marginTop: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
}));

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const Login = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName, mode } = colorMode;
  const [backgroundImage, setBackgroundImage] = useState(wallfundo);
  const classes = useStyles({ backgroundImage });
  
  const [user, setUser] = useState({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { getPublicSetting } = useSettings();
  const { handleLogin, handleVerify2FA, handleSetLoginOrigin } = useContext(AuthContext);
  const [allowUserCreation, setAllowUserCreation] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Dados do painel esquerdo
  const leftPanelContent = {
    title: "Melhore o Desempenho do Seu Negócio",
    subtitle: "Soluções completas para atendimento ao cliente",
    features: [
      "Acompanhe o progresso em tempo real",
      "Obtenha insights valiosos",
      "Colabore com sua equipe"
    ]
  };

  // Função para lidar com a visibilidade da senha
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChangeInput = (name, value) => {
    setUser({ ...user, [name]: value });
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(user);
    if (result && result.requiresTwoFactor) {
      setTwoFactorMode(true);
      setTwoFactorEmail(result.email);
    } else if (result && result.success !== false) {
      // Limpar cache após login bem-sucedido
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      // Forçar reload da página para garantir que tudo seja recarregado
      window.location.reload(true);
    }
  };

  const handleSubmit2FA = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      await handleVerify2FA({ email: twoFactorEmail, token: twoFactorCode });
      // Limpar cache após verificação 2FA bem-sucedida
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      // Forçar reload da página para garantir que tudo seja recarregado
      window.location.reload(true);
    } catch (err) {
      setTwoFactorCode("");
    }
    setTwoFactorLoading(false);
  };

  const handleBack2FA = () => {
    setTwoFactorMode(false);
    setTwoFactorEmail("");
    setTwoFactorCode("");
  };

  // Efeito para verificar configurações e carregar dados salvos
  useEffect(() => {
    handleSetLoginOrigin("default");

    getPublicSetting("userCreation")
      .then((data) => {
        console.log("userCreation setting value:", data);
        setAllowUserCreation(data === "enabled");
      })
      .catch((error) => {
        console.log("Error reading userCreation setting", error);
        // Fallback: tentar buscar como allowSignup para compatibilidade
        getPublicSetting("allowSignup")
          .then((fallbackData) => {
            console.log("allowSignup fallback value:", fallbackData);
            setAllowUserCreation(fallbackData === "enabled");
          })
          .catch((fallbackError) => {
            console.log("Error reading allowSignup fallback", fallbackError);
          });
      });

    // Busca imagem de fundo personalizada
    getPublicSetting("termsImage")
      .then((data) => {
        if (data) {
          const backendUrl = getBackendUrl();
          setBackgroundImage(`${backendUrl}/public/${data}`);
        }
      })
      .catch((error) => {
        console.log("Error reading termsImage setting", error);
      });
  }, [getPublicSetting, handleSetLoginOrigin]);

  // Funções auxiliares
  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "#ef4444";
    if (strength <= 4) return "#f59e0b";
    return "#10b981";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Senha fraca";
    if (strength > 2 && strength <= 4) return "Senha média";
    return "Senha forte";
  };

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{appName || "Premium SaaS Platform"}</title>
        <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
      </Helmet>
      
      <CssBaseline />

      {/* Painel Esquerdo - somente desktop */}
      {!isMobile && (
        <div 
          className={classes.leftPanel}
          style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${backgroundImage})` 
          }}
        >
          <div className={classes.card}>
            <div className={classes.cardIcons}>
              <div className={classes.cardIcon}>
                <WhatsAppIcon />
              </div>
              <div className={classes.cardIcon}>
                <FacebookIcon />
              </div>
              <div className={classes.cardIcon}>
                <InstagramIcon />
              </div>
            </div>
            <Typography variant="h3" className={classes.title}>
              {leftPanelContent.title}
            </Typography>
            <Typography variant="body1" className={classes.subtitle}>
              {leftPanelContent.subtitle}
            </Typography>
          </div>
        </div>
      )}

      {/* Painel Direito */}
      <div className={classes.rightPanel}>
        <div className={classes.welcome}>
          <Typography variant="h4" className={classes.formTitle}>
            {twoFactorMode ? "Verificação em Duas Etapas" : "Olá, Seja Bem-vindo! 👋"}
          </Typography>
          <Typography variant="body1" className={classes.formSubtitle}>
            {twoFactorMode 
              ? "Digite o código de 6 dígitos do seu aplicativo autenticador" 
              : "Digite seu e-mail e senha para acessar"}
          </Typography>
        </div>
        
        {twoFactorMode ? (
          <form className={classes.form} onSubmit={handleSubmit2FA}>
            <Box textAlign="center" mb={2}>
              <LockIcon style={{ fontSize: 48, color: theme.palette.primary.main, marginBottom: 8 }} />
            </Box>
            <TextField
              variant="outlined"
              fullWidth
              id="twoFactorCode"
              label="Código 2FA"
              name="twoFactorCode"
              autoComplete="one-time-code"
              value={twoFactorCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setTwoFactorCode(val);
              }}
              className={classes.textField}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              autoFocus
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={classes.button}
              size="large"
              disabled={twoFactorCode.length !== 6 || twoFactorLoading}
            >
              {twoFactorLoading ? "Verificando..." : "Verificar"}
            </Button>

            <Box mt={2} textAlign="center">
              <Link
                component="button"
                type="button"
                onClick={handleBack2FA}
                style={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Voltar ao login
              </Link>
            </Box>
          </form>
        ) : (
          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              value={user.email}
              onChange={(e) => handleChangeInput('email', e.target.value)}
              className={classes.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              required
            />
            
            <TextField
              variant="outlined"
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={user.password}
              onChange={(e) => handleChangeInput('password', e.target.value)}
              className={classes.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="alternar visibilidade da senha"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />

            {/* Indicador de força da senha */}
            {user.password && (
              <Box width="100%" mb={2}>
                <LinearProgress 
                  variant="determinate" 
                  value={(passwordStrength / 5) * 100} 
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getPasswordStrengthColor(passwordStrength),
                    },
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  {getPasswordStrengthText(passwordStrength)}
                </Typography>
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Link
                component={RouterLink}
                to="/forgetpsw"
                className={classes.forgotPassword}
              >
                Esqueceu a senha?
              </Link>
            </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.button}
                size="large"
              >
                Acessar
              </Button>

              <Box mt={3} textAlign="center">
                {allowUserCreation && (
                  <Typography variant="body2" style={{ color: '#667085' }}>
                    Ainda não tem uma conta?{" "}
                    <Link
                      component={RouterLink}
                      to="/cadastro"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none'
                      }}
                    >
                      Cadastre-se
                    </Link>
                  </Typography>
                )}
              </Box>
          </form>
        )}

        <div className={classes.footer}>
          <Copyright appName={appName} />
        </div>
      </div>
    </div>
  );
};

export default Login;