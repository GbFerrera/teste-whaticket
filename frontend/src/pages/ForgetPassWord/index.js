import React, { useState, useContext } from "react";
import qs from "query-string";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import moment from "moment";
import { toast } from 'react-toastify'; 
import toastError from '../../errors/toastError';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from "react-helmet";
import wallfundo from "../../assets/f002.png";
import logo from "../../assets/logo.png";
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import Lock from "@material-ui/icons/Lock";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import ColorModeContext from "../../layout/themeContext";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2a2a2a",
  },

  resetCard: {
    position: "relative",
    zIndex: 2,
    maxWidth: "380px",
    width: "100%",
    margin: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  cardContent: {
    padding: "20px 24px",
    [theme.breakpoints.down('sm')]: {
      padding: "18px 20px",
    },
  },

  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
  },

  logoImg: {
    maxWidth: "280px",
    height: "auto",
    maxHeight: "100px",
    content:
      "url(" +
      (theme.mode === "light"
        ? theme.calculatedLogoLight()
        : theme.calculatedLogoDark()) +
      ")",
  },

  form: {
    width: "100%",
  },

  inputField: {
    marginBottom: "8px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f9fafb",
      border: "1px solid #e5e7eb",
      transition: "all 0.2s ease-in-out",
      fontSize: "0.9rem",
      fontWeight: 500,
      "&:hover": {
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
      },
      "&.Mui-focused": {
        borderColor: "#3b82f6",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#6b7280",
      fontSize: "0.9rem",
      fontWeight: 500,
      "&.Mui-focused": {
        color: "#3b82f6",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px",
      color: "#1f2937",
      fontSize: "0.9rem",
      "&::placeholder": {
        color: "#9ca3af",
        opacity: 1,
      },
    },
  },

  submitButton: {
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none",
    marginBottom: "8px",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#2563eb",
      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.5)",
      transform: "translateY(-1px)",
    },
    "&:disabled": {
      backgroundColor: "#9ca3af",
      boxShadow: "none",
      transform: "none",
    },
  },

  divider: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    "&::before, &::after": {
      content: '""',
      flex: 1,
      height: "1px",
      background: "#e5e7eb",
    },
  },

  dividerText: {
    padding: "0 12px",
    color: "#9ca3af",
    fontSize: "0.8rem",
    fontWeight: 500,
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    [theme.breakpoints.down('sm')]: {
      flexDirection: "column",
      gap: "4px",
    },
  },

  loginButton: {
    flex: 1,
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#6366f1",
    fontSize: "0.9rem",
    fontWeight: 600,
    textTransform: "none",
    border: "2px solid #6366f1",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#6366f1",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    },
  },

  signupButton: {
    flex: 1,
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#10b981",
    fontSize: "0.9rem",
    fontWeight: 600,
    textTransform: "none",
    border: "2px solid #10b981",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#10b981",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    },
  },

  sslInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "0.7rem",
    fontWeight: 500,
    marginBottom: "8px",
  },

  lockIcon: {
    fontSize: "0.9rem",
    marginRight: "4px",
  },

  footer: {
    textAlign: "center",
    marginTop: "4px",
  },

  visibilityIcon: {
    color: "#9ca3af",
    "&:hover": {
      color: "#6b7280",
    },
  },

  titleText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "8px",
  },

  subtitleText: {
    fontSize: "0.85rem",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "16px",
    lineHeight: 1.4,
  },
}));

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const ForgetPassword = () => {
  const classes = useStyles();
  const history = useHistory();
  let companyId = null;
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showResetPasswordButton, setShowResetPasswordButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(!showAdditionalFields);
    if (showAdditionalFields) {
      setShowResetPasswordButton(false);
    } else {
      setShowResetPasswordButton(true);
    }
  };

  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = { email: "" };
  const [user] = useState(initialState);
  const dueDate = moment().add(3, "day").format();

  const handleSendEmail = async (values) => {
    const email = values.email;
    try {
      const response = await api.post(
        `${process.env.REACT_APP_BACKEND_URL}/forgetpassword/${email}`
      );
      console.log("API Response:", response.data);

      if (response.data.status === 404) {
        toast.error("Email não encontrado");
      } else {
        toast.success(i18n.t("Email enviado com sucesso!"));
      }
    } catch (err) {
      console.log("API Error:", err);
      toastError(err);
    }
  };

  const handleResetPassword = async (values) => {
    const email = values.email;
    const token = values.token;
    const newPassword = values.newPassword;
    const confirmPassword = values.confirmPassword;

    if (newPassword === confirmPassword) {
      try {
        await api.post(
          `${process.env.REACT_APP_BACKEND_URL}/resetpasswords/${email}/${token}/${newPassword}`
        );
        setError("");
        toast.success(i18n.t("Senha redefinida com sucesso."));
        history.push("/login");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const isResetPasswordButtonClicked = showResetPasswordButton;
  const UserSchema = Yup.object().shape({
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    newPassword: isResetPasswordButtonClicked
      ? Yup.string()
          .required("Campo obrigatório")
          .matches(
            passwordRegex,
            "Sua senha precisa ter no mínimo 8 caracteres, sendo uma letra maiúscula, uma minúscula e um número."
          )
      : Yup.string(),
    confirmPassword: Yup.string().when("newPassword", {
      is: (newPassword) => isResetPasswordButtonClicked && newPassword,
      then: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "As senhas não correspondem")
        .required("Campo obrigatório"),
      otherwise: Yup.string(),
    }),
  });

  return (
    <div className={classes.root}>
      <Helmet>
        <title>Redefinir Senha</title>
      </Helmet>

      <CssBaseline />
      
      <Card className={classes.resetCard}>
        <CardContent className={classes.cardContent}>
          {/* Logo */}
          <div className={classes.logoContainer}>
            <img src={logo} alt="logo" className={classes.logoImg} />
          </div>

          {/* Title */}
          <Typography className={classes.titleText}>
            {showAdditionalFields ? "Redefinir senha" : "Recuperar senha"}
          </Typography>
          <Typography className={classes.subtitleText}>
            {showAdditionalFields 
              ? "Digite o código recebido e sua nova senha"
              : "Digite seu email para receber o código de recuperação"
            }
          </Typography>

          {/* Form */}
          <Formik
            initialValues={{
              email: "",
              token: "",
              newPassword: "",
              confirmPassword: "",
            }}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                if (showResetPasswordButton) {
                  handleResetPassword(values);
                } else {
                  handleSendEmail(values);
                }
                actions.setSubmitting(false);
                toggleAdditionalFields();
              }, 400);
            }}
          >
            {({ touched, errors, isSubmitting }) => (
              <Form className={classes.form}>
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="email"
                      name="email"
                      placeholder="Digite seu e-mail"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      autoComplete="email"
                      required
                      className={classes.inputField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {showAdditionalFields && (
                    <>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          variant="outlined"
                          fullWidth
                          id="token"
                          name="token"
                          placeholder="Código de verificação"
                          error={touched.token && Boolean(errors.token)}
                          helperText={touched.token && errors.token}
                          autoComplete="off"
                          required
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VpnKeyIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          variant="outlined"
                          fullWidth
                          type={showPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          placeholder="Nova senha"
                          error={
                            touched.newPassword &&
                            Boolean(errors.newPassword)
                          }
                          helperText={
                            touched.newPassword && errors.newPassword
                          }
                          autoComplete="off"
                          required
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  className={classes.visibilityIcon}
                                  onClick={togglePasswordVisibility}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityIcon />
                                  ) : (
                                    <VisibilityOffIcon />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          variant="outlined"
                          fullWidth
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirme a senha"
                          error={
                            touched.confirmPassword &&
                            Boolean(errors.confirmPassword)
                          }
                          helperText={
                            touched.confirmPassword &&
                            errors.confirmPassword
                          }
                          autoComplete="off"
                          required
                          className={classes.inputField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  className={classes.visibilityIcon}
                                  onClick={toggleConfirmPasswordVisibility}
                                  edge="end"
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityIcon />
                                  ) : (
                                    <VisibilityOffIcon />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    {showResetPasswordButton ? (
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className={classes.submitButton}
                        startIcon={<VpnKeyIcon />}
                      >
                        Redefinir Senha
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className={classes.submitButton}
                        startIcon={<EmailIcon />}
                      >
                        Enviar Código
                      </Button>
                    )}

                    {/* Divider */}
                    <div className={classes.divider}>
                      <span className={classes.dividerText}>ou</span>
                    </div>

                    {/* Action Buttons */}
                    <div className={classes.actionButtons}>
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/login"
                        className={classes.loginButton}
                        startIcon={<LoginIcon />}
                      >
                        Fazer Login
                      </Button>
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/signup"
                        className={classes.signupButton}
                        startIcon={<PersonAddIcon />}
                      >
                        Cadastrar
                      </Button>
                    </div>

                    {/* SSL Info */}
                    <div className={classes.sslInfo}>
                      <Lock className={classes.lockIcon} />
                      <span>Conexão segura SSL/TLS</span>
                    </div>
                  </Grid>
                </Grid>

                {error && (
                  <Typography variant="body2" color="error" style={{ fontSize: "0.8rem", marginTop: "8px" }}>
                    {error}
                  </Typography>
                )}
              </Form>
            )}
          </Formik>

          {/* Footer removido a pedido: sem direitos autorais nesta tela */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgetPassword;