import React, { useEffect, useState, useContext, useRef } from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import useSettings from "../../hooks/useSettings";
import { toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";

import {
  IconButton,
  InputAdornment,
  Typography,
  Button,
  Box,
} from "@material-ui/core";

import { Colorize, AttachFile, Delete, Visibility, VisibilityOff, Edit } from "@material-ui/icons";
import ColorPicker from "../ColorPicker";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

import defaultLogoLight from "../../assets/logo.png";
import defaultLogoDark from "../../assets/logo-black.png";
import defaultLogoFavicon from "../../assets/favicon.ico";
import ColorBoxModal from "../ColorBoxModal/index.js";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  tab: {
    borderRadius: 4,
    width: "100%",
    "& .MuiTab-wrapper": {
      color: "#128c7e"
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    }
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
  uploadInput: {
    display: "none",
  },
  appLogoLightPreviewDiv: {
    backgroundColor: "white",
    padding: "10px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "#424242",
    textAlign: "center",
  },
  appLogoDarkPreviewDiv: {
    backgroundColor: "#424242",
    padding: "10px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "white",
    textAlign: "center",
  },
  appLogoFaviconPreviewDiv: {
    padding: "10px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "black",
    textAlign: "center",
  },
  appLogoLightPreviewImg: {
    width: "100%",
    maxHeight: 72,
    content: "url(" + theme.calculatedLogoLight() + ")"
  },
  appLogoDarkPreviewImg: {
    width: "100%",
    maxHeight: 72,
    content: "url(" + theme.calculatedLogoDark() + ")"
  },
  appLogoFaviconPreviewImg: {
    width: "100%",
    maxHeight: 72,
    content: "url(" + ((theme.appLogoFavicon) ? theme.appLogoFavicon : "") + ")"
  },
  dashboardImagePreviewDiv: {
    backgroundColor: "white",
    padding: "10px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "#424242",
    textAlign: "center",
  },
  dashboardImagePreviewImg: {
    width: "100%",
    maxHeight: 72,
  }
}));

export default function Whitelabel(props) {
  const { settings } = props;
  const classes = useStyles();
  const [settingsLoaded, setSettingsLoaded] = useState({});

  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});

  const { colorMode } = useContext(ColorModeContext);
  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] = useState(false);
  const [primaryColorDarkModalOpen, setPrimaryColorDarkModalOpen] = useState(false);

  const logoLightInput = useRef(null);
  const logoDarkInput = useRef(null);
  const logoFaviconInput = useRef(null);
  const appNameInput = useRef(null);
  const termsImageInput = useRef(null);
  const loadingImageInput = useRef(null);
  const [appName, setAppName] = useState(settingsLoaded.appName || "");
  const [termsText, setTermsText] = useState(settingsLoaded.termsText || "");
  const [trialDays, setTrialDays] = useState(settingsLoaded.trialDays || "7");
  const [welcomeEmailText, setWelcomeEmailText] = useState(settingsLoaded.welcomeEmailText || "");
  const [welcomeWhatsappText, setWelcomeWhatsappText] = useState(settingsLoaded.welcomeWhatsappText || "");
  const [smtpHost, setSmtpHost] = useState(settingsLoaded.smtpHost || "");
  const [smtpPort, setSmtpPort] = useState(settingsLoaded.smtpPort || "587");
  const [smtpUser, setSmtpUser] = useState(settingsLoaded.smtpUser || "");
  const [smtpPass, setSmtpPass] = useState(settingsLoaded.smtpPass || "");
  const [smtpFrom, setSmtpFrom] = useState(settingsLoaded.smtpFrom || "");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  
  // API Keys para IA
  const [openaiApiKey, setOpenaiApiKey] = useState(settingsLoaded.openaiApiKey || "");
  const [geminiApiKey, setGeminiApiKey] = useState(settingsLoaded.geminiApiKey || "");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  // Configurações de Integrações
  const [verifyToken, setVerifyToken] = useState(settingsLoaded.verifyToken || "");
  const [facebookAppId, setFacebookAppId] = useState(settingsLoaded.facebookAppId || "");
  const [facebookAppSecret, setFacebookAppSecret] = useState(settingsLoaded.facebookAppSecret || "");
  const [googleClientId, setGoogleClientId] = useState(settingsLoaded.googleClientId || "");
  const [googleClientSecret, setGoogleClientSecret] = useState(settingsLoaded.googleClientSecret || "");
  const [googleRedirectUri, setGoogleRedirectUri] = useState(settingsLoaded.googleRedirectUri || "");
  const [showFacebookSecret, setShowFacebookSecret] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);

  const { update } = useSettings();

  function updateSettingsLoaded(key, value) {
    console.log("|=========== updateSettingsLoaded ==========|")
    console.log(key, value)
    console.log("|===========================================|")
    if (key === 'primaryColorLight' || key === 'primaryColorDark' || key === 'appName') {
      localStorage.setItem(key, value);
    };
    const newSettings = { ...settingsLoaded };
    newSettings[key] = value;
    setSettingsLoaded(newSettings);
  }

  useEffect(() => {
    getCurrentUserInfo().then(
      (u) => {
        setCurrentUser(u);
      }
    );

    if (Array.isArray(settings) && settings.length) {
      const primaryColorLight = settings.find((s) => s.key === "primaryColorLight")?.value;
      const primaryColorDark = settings.find((s) => s.key === "primaryColorDark")?.value;
      const appLogoLight = settings.find((s) => s.key === "appLogoLight")?.value;
      const appLogoDark = settings.find((s) => s.key === "appLogoDark")?.value;
      const appLogoFavicon = settings.find((s) => s.key === "appLogoFavicon")?.value;
      const appLogoLoading = settings.find((s) => s.key === "appLogoLoading")?.value;
      const appName = settings.find((s) => s.key === "appName")?.value;
      const termsImage = settings.find((s) => s.key === "termsImage")?.value;
      const termsText = settings.find((s) => s.key === "termsText")?.value;
      const trialDays = settings.find((s) => s.key === "trialDays")?.value;
      const welcomeEmailText = settings.find((s) => s.key === "welcomeEmailText")?.value;
      const welcomeWhatsappText = settings.find((s) => s.key === "welcomeWhatsappText")?.value;
      const smtpHost = settings.find((s) => s.key === "smtpHost")?.value;
      const smtpPort = settings.find((s) => s.key === "smtpPort")?.value;
      const smtpUser = settings.find((s) => s.key === "smtpUser")?.value;
      const smtpPass = settings.find((s) => s.key === "smtpPass")?.value;
      const smtpFrom = settings.find((s) => s.key === "smtpFrom")?.value;
      const openaiApiKey = settings.find((s) => s.key === "openaiApiKey")?.value;
      const geminiApiKey = settings.find((s) => s.key === "geminiApiKey")?.value;
      const verifyToken = settings.find((s) => s.key === "verifyToken")?.value;
      const facebookAppId = settings.find((s) => s.key === "facebookAppId")?.value;
      const facebookAppSecret = settings.find((s) => s.key === "facebookAppSecret")?.value;
      const googleClientId = settings.find((s) => s.key === "googleClientId")?.value;
      const googleClientSecret = settings.find((s) => s.key === "googleClientSecret")?.value;
      const googleRedirectUri = settings.find((s) => s.key === "googleRedirectUri")?.value;

      setAppName(appName || "");
      setTermsText(termsText || "");
      setTrialDays(trialDays || "7");
      setWelcomeEmailText(welcomeEmailText || "");
      setWelcomeWhatsappText(welcomeWhatsappText || "");
      setSmtpHost(smtpHost || "");
      setSmtpPort(smtpPort || "587");
      setSmtpUser(smtpUser || "");
      setSmtpPass(smtpPass || "");
      setSmtpFrom(smtpFrom || "");
      setOpenaiApiKey(openaiApiKey || "");
      setGeminiApiKey(geminiApiKey || "");
      setVerifyToken(verifyToken || "");
      setFacebookAppId(facebookAppId || "");
      setFacebookAppSecret(facebookAppSecret || "");
      setGoogleClientId(googleClientId || "");
      setGoogleClientSecret(googleClientSecret || "");
      setGoogleRedirectUri(googleRedirectUri || "");
      setSettingsLoaded({ ...settingsLoaded, primaryColorLight, primaryColorDark, appLogoLight, appLogoDark, appLogoFavicon, appLogoLoading, appName, termsImage, termsText, trialDays, welcomeEmailText, welcomeWhatsappText, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, openaiApiKey, geminiApiKey, verifyToken, facebookAppId, facebookAppSecret, googleClientId, googleClientSecret, googleRedirectUri });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleSaveSetting(key, value) {
    await update({
      key,
      value,
    });
    updateSettingsLoaded(key, value);
    toast.success("Operação atualizada com sucesso.");
  }

  const uploadLogo = async (e, mode) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("typeArch", "logo");
    formData.append("mode", mode);
    formData.append("file", file);

    await api.post("/settings-whitelabel/logo", formData, {
      onUploadProgress: (event) => {
        let progress = Math.round(
          (event.loaded * 100) / event.total
        );
        console.log(
          `A imagem está ${progress}% carregada... `
        );
      },
    }).then((response) => {
      updateSettingsLoaded(`appLogo${mode}`, response.data);
      if (mode === "Loading") {
        toast.success("Imagem de loading atualizada com sucesso!");
      } else {
        colorMode[`setAppLogo${mode}`](getBackendUrl() + "/public/" + response.data);
      }
    }).catch((err) => {
      console.error(
        `Houve um problema ao realizar o upload da imagem.`
      );
      console.log(err);
      toast.error("Erro ao fazer upload da imagem.");
    });
  };

  const uploadTermsImage = async (e) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("typeArch", "terms");
    formData.append("mode", "Image");
    formData.append("file", file);

    await api.post("/settings-whitelabel/logo", formData, {
      onUploadProgress: (event) => {
        let progress = Math.round(
          (event.loaded * 100) / event.total
        );
        console.log(
          `Progresso do upload da imagem de termos: ${progress}%`
        );
      },
    }).then((response) => {
      updateSettingsLoaded("termsImage", response.data);
      toast.success("Imagem de termos atualizada com sucesso.");
    }).catch((err) => {
      console.error(
        `Houve um problema ao realizar o upload da imagem.`
      );
      console.log(err);
      toast.error("Erro ao fazer upload da imagem.");
    });
  };


  return (
    <>
      <Grid spacing={3} container>
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="primary-color-light-field"
                    label="Cor do Sistema"
                    variant="standard"
                    value={settingsLoaded.primaryColorLight || ""}
                    onClick={() => setPrimaryColorLightModalOpen(true)}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                      startAdornment: (
                        <InputAdornment position="start">
                          <div
                            style={{ backgroundColor: settingsLoaded.primaryColorLight }}
                            className={classes.colorAdorment}
                          ></div>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton
                          size="small"
                          color="default"
                          onClick={() => setPrimaryColorLightModalOpen(true)}
                        >
                          <Colorize />
                        </IconButton>
                      ),
                    }}
                  />
                </FormControl>
                <ColorBoxModal
                  open={primaryColorLightModalOpen}
                  handleClose={() => setPrimaryColorLightModalOpen(false)}
                  onChange={(color) => {
                    handleSaveSetting("primaryColorLight", `#${color.hex}`);
                    colorMode.setPrimaryColorLight(`#${color.hex}`);
                  }}
                  currentColor={settingsLoaded.primaryColorLight}
                />
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="appname-field"
                    label="Nome do sistema"
                    variant="standard"
                    name="appName"
                    value={appName}
                    inputRef={appNameInput}
                    onChange={(e) => {
                      setAppName(e.target.value);
                    }}
                    onBlur={async (_) => {
                      await handleSaveSetting("appName", appName);
                      colorMode.setAppName(appName || "KMENU");
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="logo-light-upload-field"
                    label="Logotipo claro"
                    variant="standard"
                    value={settingsLoaded.appLogoLight || ""}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                      endAdornment: (
                        <>
                          {settingsLoaded.appLogoLight &&
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                handleSaveSetting("appLogoLight", "");
                                colorMode.setAppLogoLight(defaultLogoLight);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                          <input
                            type="file"
                            id="upload-logo-light-button"
                            ref={logoLightInput}
                            className={classes.uploadInput}
                            onChange={(e) => uploadLogo(e, "Light")}
                          />
                          <label htmlFor="upload-logo-light-button">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                logoLightInput.current.click();
                              }}
                            >
                              <AttachFile />
                            </IconButton>
                          </label>
                        </>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="logo-favicon-upload-field"
                    label="Favicon"
                    variant="standard"
                    value={settingsLoaded.appLogoFavicon || ""}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                      endAdornment: (
                        <>
                          {settingsLoaded.appLogoFavicon &&
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                handleSaveSetting("appLogoFavicon", "");
                                colorMode.setAppLogoFavicon(defaultLogoFavicon);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                          <input
                            type="file"
                            id="upload-logo-favicon-button"
                            ref={logoFaviconInput}
                            className={classes.uploadInput}
                            onChange={(e) => uploadLogo(e, "Favicon")}
                          />
                          <label htmlFor="upload-logo-favicon-button">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                logoFaviconInput.current.click();
                              }}
                            >
                              <AttachFile />
                            </IconButton>
                          </label>
                        </>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <div className={classes.appLogoLightPreviewDiv}>
                  <img className={classes.appLogoLightPreviewImg} alt="light-logo-preview" />
                </div>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <div className={classes.appLogoFaviconPreviewDiv}>
                  <img className={classes.appLogoFaviconPreviewImg} alt="favicon-preview" />
                </div>
              </Grid>

              {/* Animação de Loading Customizada */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Animação de Carregamento
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Personalize a animação de loading do sistema. Formatos aceitos: GIF, PNG, JPG, WEBP (máx 5MB).
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="loading-image-upload-field"
                    label="Imagem de Loading"
                    variant="standard"
                    value={settingsLoaded.appLogoLoading || ""}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                      endAdornment: (
                        <>
                          {settingsLoaded.appLogoLoading &&
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                handleSaveSetting("appLogoLoading", "");
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                          <input
                            type="file"
                            id="upload-loading-image-button"
                            ref={loadingImageInput}
                            className={classes.uploadInput}
                            onChange={(e) => uploadLogo(e, "Loading")}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                          />
                          <label htmlFor="upload-loading-image-button">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                loadingImageInput.current.click();
                              }}
                            >
                              <AttachFile />
                            </IconButton>
                          </label>
                        </>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                {settingsLoaded.appLogoLoading && (
                  <div style={{ padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, textAlign: "center", backgroundColor: "#f5f5f5" }}>
                    <img 
                      src={`${getBackendUrl()}/public/${settingsLoaded.appLogoLoading}`}
                      alt="loading-preview"
                      style={{ width: "100%", maxHeight: 72, objectFit: "contain" }}
                    />
                  </div>
                )}
              </Grid>

              {/* Imagem de Fundo - Login e Cadastro */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Imagem de Fundo (Login e Cadastro)
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Esta imagem será exibida como fundo nas telas de login e cadastro do sistema.
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="terms-image-upload-field"
                    label="Imagem de Fundo"
                    variant="standard"
                    value={settingsLoaded.termsImage || ""}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                      },
                      endAdornment: (
                        <>
                          {settingsLoaded.termsImage &&
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                handleSaveSetting("termsImage", "");
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                          <input
                            type="file"
                            id="upload-terms-image-button"
                            ref={termsImageInput}
                            className={classes.uploadInput}
                            onChange={uploadTermsImage}
                            accept="image/*"
                          />
                          <label htmlFor="upload-terms-image-button">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => {
                                termsImageInput.current.click();
                              }}
                            >
                              <AttachFile />
                            </IconButton>
                          </label>
                        </>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>

              {/* Preview da Imagem de Termos */}
              <Grid xs={12} sm={6} md={4} item>
                {settingsLoaded.termsImage && (
                  <div className={classes.appLogoLightPreviewDiv}>
                    <img 
                      src={getBackendUrl() + "/public/" + settingsLoaded.termsImage} 
                      alt="terms-image-preview" 
                      style={{ width: "100%", maxHeight: 150, objectFit: "contain" }}
                    />
                  </div>
                )}
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
              </Grid>

              {/* Texto de Termos */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Termos de Uso
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Este texto será exibido no modal de termos durante o cadastro de novos usuários.
                </Typography>
              </Grid>
              <Grid xs={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="terms-text-field"
                    label="Texto de Termos de Uso"
                    variant="outlined"
                    multiline
                    rows={6}
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    onBlur={() => {
                      if (termsText !== settingsLoaded.termsText) {
                        handleSaveSetting("termsText", termsText);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="Digite aqui os termos de uso do sistema..."
                  />
                </FormControl>
              </Grid>

              {/* Configurações de Teste */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Período de Teste
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Defina quantos dias de teste as novas empresas terão ao se cadastrar.
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="trial-days-field"
                    label="Dias de Teste"
                    variant="standard"
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    onBlur={() => {
                      if (trialDays !== settingsLoaded.trialDays) {
                        handleSaveSetting("trialDays", trialDays);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      inputProps: { min: 1, max: 365 }
                    }}
                  />
                </FormControl>
              </Grid>

              {/* Mensagens de Boas-vindas */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Mensagens de Boas-vindas
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure as mensagens enviadas quando uma nova empresa se cadastra. 
                  Variáveis disponíveis: {"{nome}"}, {"{email}"}, {"{empresa}"}, {"{telefone}"}, {"{plano}"}, {"{senha}"}, {"{diasTeste}"}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="welcome-email-text-field"
                    label="Texto do E-mail de Boas-vindas"
                    variant="outlined"
                    multiline
                    rows={6}
                    value={welcomeEmailText}
                    onChange={(e) => setWelcomeEmailText(e.target.value)}
                    onBlur={() => {
                      if (welcomeEmailText !== settingsLoaded.welcomeEmailText) {
                        handleSaveSetting("welcomeEmailText", welcomeEmailText);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="Olá {nome}, seja bem-vindo ao {empresa}! Seu acesso foi criado com sucesso..."
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="welcome-whatsapp-text-field"
                    label="Texto do WhatsApp de Boas-vindas"
                    variant="outlined"
                    multiline
                    rows={6}
                    value={welcomeWhatsappText}
                    onChange={(e) => setWelcomeWhatsappText(e.target.value)}
                    onBlur={() => {
                      if (welcomeWhatsappText !== settingsLoaded.welcomeWhatsappText) {
                        handleSaveSetting("welcomeWhatsappText", welcomeWhatsappText);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="Olá {nome}! 🎉 Bem-vindo ao {empresa}! Seu acesso foi criado..."
                  />
                </FormControl>
              </Grid>

              {/* Configurações SMTP */}
              <Grid xs={12} item style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Configurações de E-mail (SMTP)
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure o servidor SMTP para envio de e-mails de recuperação de senha e boas-vindas.
                  Essas informações são fornecidas pelo seu provedor de e-mail (Gmail, Outlook, etc).
                </Typography>
              </Grid>

              {/* Host SMTP */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Host do Servidor
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Ex: smtp.gmail.com, smtp.office365.com
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="smtp-host-field"
                    label="Servidor SMTP"
                    variant="standard"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    onBlur={() => {
                      if (smtpHost !== settingsLoaded.smtpHost) {
                        handleSaveSetting("smtpHost", smtpHost);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="smtp.gmail.com"
                  />
                </FormControl>
              </Grid>

              {/* Porta SMTP */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Porta do Servidor
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Geralmente 587 (TLS) ou 465 (SSL)
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="smtp-port-field"
                    label="Porta"
                    variant="standard"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    onBlur={() => {
                      if (smtpPort !== settingsLoaded.smtpPort) {
                        handleSaveSetting("smtpPort", smtpPort);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="587"
                  />
                </FormControl>
              </Grid>

              {/* E-mail Remetente */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  E-mail Remetente
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  E-mail que aparecerá como remetente
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="smtp-from-field"
                    label="E-mail From"
                    variant="standard"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    onBlur={() => {
                      if (smtpFrom !== settingsLoaded.smtpFrom) {
                        handleSaveSetting("smtpFrom", smtpFrom);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="noreply@suaempresa.com"
                  />
                </FormControl>
              </Grid>

              {/* Usuário SMTP */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Usuário de Autenticação
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Geralmente seu e-mail completo
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="smtp-user-field"
                    label="Usuário"
                    variant="standard"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    onBlur={() => {
                      if (smtpUser !== settingsLoaded.smtpUser) {
                        handleSaveSetting("smtpUser", smtpUser);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="seuemail@gmail.com"
                  />
                </FormControl>
              </Grid>

              {/* Senha SMTP */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Senha de Aplicativo
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Use senha de app (Gmail: Senhas de app)
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="smtp-pass-field"
                    label="Senha"
                    variant="standard"
                    type={showSmtpPass ? "text" : "password"}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    onBlur={() => {
                      if (smtpPass !== settingsLoaded.smtpPass) {
                        handleSaveSetting("smtpPass", smtpPass);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowSmtpPass(!showSmtpPass)}
                            edge="end"
                          >
                            {showSmtpPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="••••••••••••••••"
                  />
                </FormControl>
              </Grid>

              {/* Configurações de API Keys para IA */}
              <Grid xs={12} item style={{ marginTop: 32 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Configurações de IA (API Keys)
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure as chaves de API para usar os recursos de Inteligência Artificial (OpenAI e Google Gemini).
                  As chaves são usadas para processamento de linguagem natural e geração de respostas.
                </Typography>
              </Grid>

              {/* API Key OpenAI */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  API Key OpenAI
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Chave da API da OpenAI (GPT-4, GPT-3.5, etc)
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="openai-api-key-field"
                    label="OpenAI API Key"
                    variant="standard"
                    type={showOpenaiKey ? "text" : "password"}
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    onBlur={() => {
                      if (openaiApiKey !== settingsLoaded.openaiApiKey) {
                        handleSaveSetting("openaiApiKey", openaiApiKey);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                            edge="end"
                          >
                            {showOpenaiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="sk-..."
                  />
                </FormControl>
              </Grid>

              {/* API Key Gemini */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  API Key Google Gemini
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Chave da API do Google Gemini (Gemini Pro, etc)
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="gemini-api-key-field"
                    label="Gemini API Key"
                    variant="standard"
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    onBlur={() => {
                      if (geminiApiKey !== settingsLoaded.geminiApiKey) {
                        handleSaveSetting("geminiApiKey", geminiApiKey);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            edge="end"
                          >
                            {showGeminiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="AIza..."
                  />
                </FormControl>
              </Grid>

              {/* Configurações de Integrações */}
              <Grid xs={12} item style={{ marginTop: 32 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Configurações de Integrações
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure as chaves e URLs de integração com serviços externos (Facebook, Google, etc).
                  Estas configurações substituem as variáveis de ambiente do .env.
                </Typography>
              </Grid>

              {/* Integração Facebook */}
              <Grid xs={12} item style={{ marginTop: 24, marginBottom: 16 }}>
                <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: "#1877f2" }}>
                  📘 Facebook / Meta
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure as credenciais do Facebook Developers para integração com Messenger e Instagram.
                </Typography>
              </Grid>

              {/* Verify Token Facebook */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Verify Token
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Token para validar webhook do Facebook
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="verify-token-field"
                    label="Verify Token"
                    variant="standard"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    onBlur={() => {
                      if (verifyToken !== settingsLoaded.verifyToken) {
                        handleSaveSetting("verifyToken", verifyToken);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="whaticket"
                  />
                </FormControl>
              </Grid>

              {/* Facebook App ID */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  App ID
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  ID do aplicativo no Facebook Developers
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="facebook-app-id-field"
                    label="Facebook App ID"
                    variant="standard"
                    value={facebookAppId}
                    onChange={(e) => setFacebookAppId(e.target.value)}
                    onBlur={() => {
                      if (facebookAppId !== settingsLoaded.facebookAppId) {
                        handleSaveSetting("facebookAppId", facebookAppId);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="776874187723945"
                  />
                </FormControl>
              </Grid>

              {/* Facebook App Secret */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  App Secret
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Chave secreta do aplicativo Facebook
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="facebook-app-secret-field"
                    label="Facebook App Secret"
                    variant="standard"
                    type={showFacebookSecret ? "text" : "password"}
                    value={facebookAppSecret}
                    onChange={(e) => setFacebookAppSecret(e.target.value)}
                    onBlur={() => {
                      if (facebookAppSecret !== settingsLoaded.facebookAppSecret) {
                        handleSaveSetting("facebookAppSecret", facebookAppSecret);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowFacebookSecret(!showFacebookSecret)}
                            edge="end"
                          >
                            {showFacebookSecret ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="••••••••••••••••"
                  />
                </FormControl>
              </Grid>

              {/* Integração Google */}
              <Grid xs={12} item style={{ marginTop: 32, marginBottom: 16 }}>
                <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: "#4285f4" }}>
                  🔍 Google
                </Typography>
                <Typography variant="body2" style={{ color: "#666", marginBottom: 16 }}>
                  Configure as credenciais do Google para integração com Google Calendar e outras APIs.
                </Typography>
              </Grid>

              {/* Google Client ID */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Client ID
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  ID do cliente Google OAuth 2.0
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="google-client-id-field"
                    label="Google Client ID"
                    variant="standard"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    onBlur={() => {
                      if (googleClientId !== settingsLoaded.googleClientId) {
                        handleSaveSetting("googleClientId", googleClientId);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="604305494657-..."
                  />
                </FormControl>
              </Grid>

              {/* Google Client Secret */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Client Secret
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  Chave secreta do cliente Google OAuth
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="google-client-secret-field"
                    label="Google Client Secret"
                    variant="standard"
                    type={showGoogleSecret ? "text" : "password"}
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    onBlur={() => {
                      if (googleClientSecret !== settingsLoaded.googleClientSecret) {
                        handleSaveSetting("googleClientSecret", googleClientSecret);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                            edge="end"
                          >
                            {showGoogleSecret ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="••••••••••••••••"
                  />
                </FormControl>
              </Grid>

              {/* Google Redirect URI */}
              <Grid xs={12} sm={6} md={4} item>
                <Typography variant="caption" style={{ color: "#333", fontWeight: 500 }}>
                  Redirect URI
                </Typography>
                <Typography variant="caption" display="block" style={{ color: "#888", marginBottom: 4 }}>
                  URL de redirecionamento OAuth
                </Typography>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="google-redirect-uri-field"
                    label="Google Redirect URI"
                    variant="standard"
                    value={googleRedirectUri}
                    onChange={(e) => setGoogleRedirectUri(e.target.value)}
                    onBlur={() => {
                      if (googleRedirectUri !== settingsLoaded.googleRedirectUri) {
                        handleSaveSetting("googleRedirectUri", googleRedirectUri);
                      }
                    }}
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                      },
                    }}
                    placeholder="https://api.seudominio.com.br/google-calendar/oauth/callback"
                  />
                </FormControl>
              </Grid>
            </>
          )}
        />
      </Grid>
    </>
  );
}