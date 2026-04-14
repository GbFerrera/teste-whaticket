import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Paper,
} from "@material-ui/core";
import {
  Lock as LockIcon,
  CheckCircle,
  Warning,
} from "@material-ui/icons";
import { green, red, grey, deepPurple } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 12,
    marginBottom: theme.spacing(3),
  },
  statusEnabled: {
    backgroundColor: green[50],
    border: `1px solid ${green[200]}`,
  },
  statusDisabled: {
    backgroundColor: grey[50],
    border: `1px solid ${grey[200]}`,
  },
  qrCodeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    border: `2px solid ${grey[200]}`,
  },
  secretKey: {
    fontFamily: "monospace",
    fontSize: "0.85rem",
    backgroundColor: grey[100],
    padding: theme.spacing(1, 2),
    borderRadius: 6,
    wordBreak: "break-all",
    textAlign: "center",
    marginBottom: theme.spacing(2),
    userSelect: "all",
  },
  codeInput: {
    "& input": {
      textAlign: "center",
      fontSize: "1.5rem",
      letterSpacing: "0.5rem",
    },
  },
  actionButton: {
    borderRadius: 8,
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    textTransform: "none",
  },
  enableButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    "&:hover": {
      background: "linear-gradient(135deg, #5a6fd1 0%, #6a3d9a 100%)",
    },
  },
  disableButton: {
    backgroundColor: red[500],
    color: "white",
    "&:hover": {
      backgroundColor: red[700],
    },
  },
  cancelButton: {
    color: grey[600],
    border: `1px solid ${grey[300]}`,
  },
  stepTitle: {
    fontWeight: 600,
    color: deepPurple[700],
    marginBottom: theme.spacing(1),
  },
  stepDescription: {
    color: grey[600],
    marginBottom: theme.spacing(2),
    fontSize: "0.875rem",
  },
  instructions: {
    backgroundColor: grey[50],
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const TwoFactorSetup = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState("idle"); // idle, setup, confirm, disabling
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/2fa/setup");
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("setup");
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await api.post("/users/2fa/confirm", { token: code });
      toast.success("2FA ativado com sucesso!");
      setIs2FAEnabled(true);
      setStep("idle");
      setCode("");
      setQrCode("");
      setSecret("");
    } catch (err) {
      toastError(err);
      setCode("");
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await api.post("/users/2fa/disable", { token: code });
      toast.success("2FA desativado com sucesso!");
      setIs2FAEnabled(false);
      setStep("idle");
      setCode("");
    } catch (err) {
      toastError(err);
      setCode("");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setStep("idle");
    setCode("");
    setQrCode("");
    setSecret("");
  };

  return (
    <div className={classes.container}>
      <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <LockIcon style={{ color: deepPurple[500] }} />
        Autenticação em Dois Fatores (2FA)
      </Typography>

      {/* Status Card */}
      <Paper
        elevation={0}
        className={`${classes.statusCard} ${is2FAEnabled ? classes.statusEnabled : classes.statusDisabled}`}
      >
        {is2FAEnabled ? (
          <CheckCircle style={{ color: green[500], fontSize: 32 }} />
        ) : (
          <Warning style={{ color: grey[400], fontSize: 32 }} />
        )}
        <div>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {is2FAEnabled ? "2FA Ativado" : "2FA Desativado"}
          </Typography>
          <Typography variant="body2" style={{ color: grey[600] }}>
            {is2FAEnabled
              ? "Sua conta está protegida com autenticação em dois fatores."
              : "Ative para adicionar uma camada extra de segurança à sua conta."}
          </Typography>
        </div>
      </Paper>

      {/* Idle State */}
      {step === "idle" && (
        <Box>
          {!is2FAEnabled ? (
            <Button
              className={`${classes.actionButton} ${classes.enableButton}`}
              onClick={handleSetup}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
            >
              {loading ? "Carregando..." : "Ativar 2FA"}
            </Button>
          ) : (
            <Button
              className={`${classes.actionButton} ${classes.disableButton}`}
              onClick={() => setStep("disabling")}
              startIcon={<LockIcon />}
            >
              Desativar 2FA
            </Button>
          )}
        </Box>
      )}

      {/* Setup Step - Show QR Code */}
      {step === "setup" && (
        <Box>
          <div className={classes.instructions}>
            <Typography className={classes.stepTitle}>
              Passo 1: Escaneie o QR Code
            </Typography>
            <Typography className={classes.stepDescription}>
              Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) e escaneie o QR Code abaixo.
            </Typography>
          </div>

          <div className={classes.qrCodeContainer}>
            {qrCode && (
              <img src={qrCode} alt="QR Code 2FA" className={classes.qrCodeImage} />
            )}
            <Typography variant="caption" style={{ color: grey[500], marginBottom: 8 }}>
              Ou insira a chave manualmente:
            </Typography>
            <div className={classes.secretKey}>{secret}</div>
          </div>

          <div className={classes.instructions}>
            <Typography className={classes.stepTitle}>
              Passo 2: Digite o código de verificação
            </Typography>
            <Typography className={classes.stepDescription}>
              Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </Typography>
          </div>

          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <TextField
              variant="outlined"
              label="Código de 6 dígitos"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              className={classes.codeInput}
              inputProps={{ maxLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              style={{ maxWidth: 280 }}
            />
          </Box>

          <Box display="flex" style={{ gap: 12 }}>
            <Button
              className={`${classes.actionButton} ${classes.enableButton}`}
              onClick={handleConfirm}
              disabled={code.length !== 6 || loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
            >
              {loading ? "Verificando..." : "Confirmar e Ativar"}
            </Button>
            <Button
              className={`${classes.actionButton} ${classes.cancelButton}`}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {/* Disabling Step */}
      {step === "disabling" && (
        <Box>
          <div className={classes.instructions}>
            <Typography className={classes.stepTitle}>
              Desativar 2FA
            </Typography>
            <Typography className={classes.stepDescription}>
              Para desativar, insira o código de 6 dígitos do seu aplicativo autenticador.
            </Typography>
          </div>

          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <TextField
              variant="outlined"
              label="Código de 6 dígitos"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              className={classes.codeInput}
              inputProps={{ maxLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              style={{ maxWidth: 280 }}
              autoFocus
            />
          </Box>

          <Box display="flex" style={{ gap: 12 }}>
            <Button
              className={`${classes.actionButton} ${classes.disableButton}`}
              onClick={handleDisable}
              disabled={code.length !== 6 || loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? "Desativando..." : "Confirmar Desativação"}
            </Button>
            <Button
              className={`${classes.actionButton} ${classes.cancelButton}`}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default TwoFactorSetup;
