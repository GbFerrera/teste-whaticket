import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  InputAdornment,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PersonIcon from "@material-ui/icons/Person";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import PhoneIcon from "@material-ui/icons/Phone";
import BusinessIcon from "@material-ui/icons/Business";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { toast } from "react-toastify";
import { openApi } from "../../services/api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "16px",
      maxWidth: "480px",
      width: "100%",
      margin: "16px",
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  titleText: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  closeButton: {
    color: "#64748b",
  },
  dialogContent: {
    padding: "24px",
  },
  planInfo: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
    color: "#fff",
    textAlign: "center",
  },
  planName: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "4px",
  },
  planPrice: {
    fontSize: "1.5rem",
    fontWeight: 700,
    "& span": {
      fontSize: "0.9rem",
      fontWeight: 400,
      opacity: 0.9,
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "&:hover fieldset": {
        borderColor: "#22c55e",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#22c55e",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#22c55e",
    },
  },
  phoneInputContainer: {
    "& .PhoneInput": {
      "& .PhoneInputInput": {
        padding: "16.5px 14px",
        fontSize: "1rem",
        border: "1px solid rgba(0, 0, 0, 0.23)",
        borderRadius: "10px",
        width: "100%",
        "&:hover": {
          borderColor: "#22c55e",
        },
        "&:focus": {
          outline: "none",
          borderColor: "#22c55e",
          borderWidth: "2px",
        },
      },
      "& .PhoneInputCountry": {
        marginRight: "8px",
      },
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#fff",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    marginTop: "8px",
    "&:hover": {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    },
    "&:disabled": {
      background: "#e2e8f0",
      color: "#94a3b8",
    },
  },
  successContainer: {
    textAlign: "center",
    padding: "32px 16px",
  },
  successIcon: {
    fontSize: "64px",
    color: "#22c55e",
    marginBottom: "16px",
  },
  successTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  successMessage: {
    color: "#64748b",
    marginBottom: "24px",
  },
  loginButton: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#fff",
    padding: "12px 32px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    },
  },
  termsText: {
    fontSize: "0.75rem",
    color: "#64748b",
    textAlign: "center",
    marginTop: "8px",
    "& a": {
      color: "#22c55e",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  },
}));

const SignupModal = ({ open, onClose, plan }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.phone) newErrors.phone = "Telefone é obrigatório";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (formData.password.length < 6)
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    if (!formData.companyName.trim())
      newErrors.companyName = "Nome da empresa é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await openApi.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        planId: plan?.id,
      });
      toast.success("Conta criada com sucesso! Redirecionando para login...");
      onClose();
      setTimeout(() => {
        history.push("/login");
      }, 1000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Erro ao criar conta. Tente novamente.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      companyName: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className={classes.dialog}>
      <div className={classes.dialogTitle}>
        <Typography className={classes.titleText}>
          Criar Conta
        </Typography>
        <IconButton onClick={handleClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </div>

      <DialogContent className={classes.dialogContent}>
        {plan && (
              <div className={classes.planInfo}>
                <Typography className={classes.planName}>{plan.name}</Typography>
                <Typography className={classes.planPrice}>
                  R$ {plan.price}
                  <span>/mês</span>
                </Typography>
              </div>
            )}

            <form onSubmit={handleSubmit} className={classes.form}>
              <TextField
                name="companyName"
                label="Nome da Empresa"
                variant="outlined"
                fullWidth
                value={formData.companyName}
                onChange={handleChange}
                error={!!errors.companyName}
                helperText={errors.companyName}
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="name"
                label="Seu Nome"
                variant="outlined"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box className={classes.phoneInputContainer}>
                <PhoneInput
                  international
                  defaultCountry="BR"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Telefone"
                />
                {errors.phone && (
                  <Typography
                    variant="caption"
                    color="error"
                    style={{ marginTop: 4, marginLeft: 14 }}
                  >
                    {errors.phone}
                  </Typography>
                )}
              </Box>

              <TextField
                name="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                className={classes.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} style={{ color: "#fff" }} />
                ) : (
                  "Criar Conta Grátis"
                )}
              </Button>

              <Typography className={classes.termsText}>
                Ao criar sua conta, você concorda com nossos{" "}
                <a href="/termos" target="_blank">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacidade" target="_blank">
                  Política de Privacidade
                </a>
              </Typography>
            </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
