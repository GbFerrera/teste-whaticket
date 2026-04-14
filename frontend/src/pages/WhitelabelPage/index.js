import React, { useEffect, useState, useContext, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  FormControl,
  TextField,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import {
  Colorize,
  AttachFile,
  Delete,
  Visibility,
  VisibilityOff,
  Palette as PaletteIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  Extension as ExtensionIcon,
} from "@material-ui/icons";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage";
import ColorBoxModal from "../../components/ColorBoxModal";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";
import { toast } from "react-toastify";

import defaultLogoLight from "../../assets/logo.png";
import defaultLogoDark from "../../assets/logo-black.png";
import defaultLogoFavicon from "../../assets/favicon.ico";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    width: "100%",
    margin: 0,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  tabsContainer: {
    background: "#ffffff",
    borderRadius: 12,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: theme.palette.primary.main,
      height: 3,
      borderRadius: 2,
    },
  },
  tab: {
    textTransform: "none",
    fontWeight: 500,
    fontSize: "14px",
    minHeight: 48,
    color: "#6b7280",
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
  tabIcon: {
    marginRight: 6,
    fontSize: 18,
    verticalAlign: "middle",
  },
  content: {
    background: "#ffffff",
    borderRadius: 12,
    padding: theme.spacing(3),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: 8,
    color: "#1a1a2e",
  },
  sectionDesc: {
    color: "#666",
    marginBottom: 16,
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
    content: "url(" + theme.calculatedLogoLight() + ")",
  },
  appLogoFaviconPreviewImg: {
    width: "100%",
    maxHeight: 72,
    content: "url(" + (theme.appLogoFavicon ? theme.appLogoFavicon : "") + ")",
  },
  fieldLabel: {
    color: "#333",
    fontWeight: 500,
  },
  fieldHint: {
    color: "#888",
    marginBottom: 4,
  },
  integrationTitle: {
    fontWeight: 600,
    marginBottom: 8,
  },
}));

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const WhitelabelPage = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { getAll, update } = useSettings();
  const { colorMode } = useContext(ColorModeContext);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState({});

  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] = useState(false);

  const logoLightInput = useRef(null);
  const logoFaviconInput = useRef(null);
  const loadingImageInput = useRef(null);
  const termsImageInput = useRef(null);

  const [appName, setAppName] = useState("");
  const [termsText, setTermsText] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [welcomeEmailText, setWelcomeEmailText] = useState("");
  const [welcomeWhatsappText, setWelcomeWhatsappText] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [facebookAppId, setFacebookAppId] = useState("");
  const [facebookAppSecret, setFacebookAppSecret] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [googleRedirectUri, setGoogleRedirectUri] = useState("");
  const [showFacebookSecret, setShowFacebookSecret] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);

  // Cores do Sidebar
  const [sidebarIconColor, setSidebarIconColor] = useState("#ffffff");
  const [sidebarTextColor, setSidebarTextColor] = useState("#f1f5f9");
  const [sidebarActiveBg, setSidebarActiveBg] = useState("rgba(59,130,246,0.15)");
  const [sidebarActiveColor, setSidebarActiveColor] = useState("#000000");
  const [sidebarHoverBg, setSidebarHoverBg] = useState("rgba(59,130,246,0.1)");
  const [sidebarIconColorModalOpen, setSidebarIconColorModalOpen] = useState(false);
  const [sidebarTextColorModalOpen, setSidebarTextColorModalOpen] = useState(false);
  const [sidebarActiveBgModalOpen, setSidebarActiveBgModalOpen] = useState(false);
  const [sidebarActiveColorModalOpen, setSidebarActiveColorModalOpen] = useState(false);
  const [sidebarHoverBgModalOpen, setSidebarHoverBgModalOpen] = useState(false);

  // Mensagens de Cobranças
  const [invoiceMsgAviso, setInvoiceMsgAviso] = useState("");
  const [invoiceMsgDia, setInvoiceMsgDia] = useState("");
  const [invoiceMsgAtrasada, setInvoiceMsgAtrasada] = useState("");

  const isSuperAdmin = user.super === true || (Number(user.companyId) === 1 && Number(user.id) === 1);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getAll();
        if (Array.isArray(data) && data.length) {
          const get = (key) => data.find((s) => s.key === key)?.value || "";
          setAppName(get("appName"));
          setTermsText(get("termsText"));
          setTrialDays(get("trialDays") || "7");
          setWelcomeEmailText(get("welcomeEmailText"));
          setWelcomeWhatsappText(get("welcomeWhatsappText"));
          setSmtpHost(get("smtpHost"));
          setSmtpPort(get("smtpPort") || "587");
          setSmtpUser(get("smtpUser"));
          setSmtpPass(get("smtpPass"));
          setSmtpFrom(get("smtpFrom"));
          setOpenaiApiKey(get("openaiApiKey"));
          setGeminiApiKey(get("geminiApiKey"));
          setVerifyToken(get("verifyToken"));
          setFacebookAppId(get("facebookAppId"));
          setFacebookAppSecret(get("facebookAppSecret"));
          setGoogleClientId(get("googleClientId"));
          setGoogleClientSecret(get("googleClientSecret"));
          setGoogleRedirectUri(get("googleRedirectUri"));
          setSidebarIconColor(get("sidebarIconColor") || "#ffffff");
          setSidebarTextColor(get("sidebarTextColor") || "#f1f5f9");
          setSidebarActiveBg(get("sidebarActiveBg") || "rgba(59,130,246,0.15)");
          setSidebarActiveColor(get("sidebarActiveColor") || "#000000");
          setSidebarHoverBg(get("sidebarHoverBg") || "rgba(59,130,246,0.1)");
          setInvoiceMsgAviso(get("invoiceMsgAviso"));
          setInvoiceMsgDia(get("invoiceMsgDia"));
          setInvoiceMsgAtrasada(get("invoiceMsgAtrasada"));

          const loaded = {};
          data.forEach((s) => { loaded[s.key] = s.value; });
          setSettingsLoaded(loaded);
        }
      } catch (err) {
        toast.error("Erro ao carregar configurações.");
      }
      setLoading(false);
    }
    if (isSuperAdmin) {
      loadSettings();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSuperAdmin) {
    return <ForbiddenPage />;
  }

  function updateSettingsLoaded(key, value) {
    if (key === "primaryColorLight" || key === "primaryColorDark" || key === "appName") {
      localStorage.setItem(key, value);
    }
    setSettingsLoaded((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSetting(key, value) {
    await update({ key, value });
    updateSettingsLoaded(key, value);
    toast.success("Operação atualizada com sucesso.");
  }

  async function handleSaveSidebarColor(key, value, setter) {
    await update({ key, value });
    updateSettingsLoaded(key, value);
    setter(value);
    localStorage.setItem(key, value);
    const setterName = "set" + key.charAt(0).toUpperCase() + key.slice(1);
    if (colorMode[setterName]) colorMode[setterName](value);
    toast.success("Cor atualizada com sucesso.");
  }

  const uploadLogo = async (e, mode) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("typeArch", "logo");
    formData.append("mode", mode);
    formData.append("file", file);
    try {
      const response = await api.post("/settings-whitelabel/logo", formData);
      updateSettingsLoaded(`appLogo${mode}`, response.data);
      if (mode === "Loading") {
        colorMode.setAppLogoLoading(getBackendUrl() + "/public/" + response.data);
        toast.success("Imagem de loading atualizada com sucesso!");
      } else {
        colorMode[`setAppLogo${mode}`](getBackendUrl() + "/public/" + response.data);
      }
    } catch (err) {
      toast.error("Erro ao fazer upload da imagem.");
    }
  };

  const uploadTermsImage = async (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("typeArch", "terms");
    formData.append("mode", "Image");
    formData.append("file", file);
    try {
      const response = await api.post("/settings-whitelabel/logo", formData);
      updateSettingsLoaded("termsImage", response.data);
      toast.success("Imagem de termos atualizada com sucesso.");
    } catch (err) {
      toast.error("Erro ao fazer upload da imagem.");
    }
  };

  if (loading) {
    return (
      <div className={classes.root}>
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  // ===================== TAB: APARÊNCIA =====================
  const renderAparencia = () => (
    <Grid spacing={3} container>
      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="primary-color-light-field"
            label="Cor do Sistema"
            variant="standard"
            value={settingsLoaded.primaryColorLight || ""}
            onClick={() => setPrimaryColorLightModalOpen(true)}
            InputProps={{
              style: { backgroundColor: "#ffffff", borderRadius: "0px" },
              startAdornment: (
                <InputAdornment position="start">
                  <div
                    style={{ backgroundColor: settingsLoaded.primaryColorLight }}
                    className={classes.colorAdorment}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" color="default" onClick={() => setPrimaryColorLightModalOpen(true)}>
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

      <Grid xs={12} sm={6} md={4} item />

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="appname-field"
            label="Nome do sistema"
            variant="standard"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            onBlur={async () => {
              await handleSaveSetting("appName", appName);
              colorMode.setAppName(appName || "KMENU");
            }}
            InputProps={{ style: { backgroundColor: "#ffffff", borderRadius: "0px" } }}
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
              style: { backgroundColor: "#ffffff", borderRadius: "0px" },
              endAdornment: (
                <>
                  {settingsLoaded.appLogoLight && (
                    <IconButton size="small" color="default" onClick={() => { handleSaveSetting("appLogoLight", ""); colorMode.setAppLogoLight(defaultLogoLight); }}>
                      <Delete />
                    </IconButton>
                  )}
                  <input type="file" id="upload-logo-light-button" ref={logoLightInput} className={classes.uploadInput} onChange={(e) => uploadLogo(e, "Light")} />
                  <label htmlFor="upload-logo-light-button">
                    <IconButton size="small" color="default" onClick={() => logoLightInput.current.click()}>
                      <AttachFile />
                    </IconButton>
                  </label>
                </>
              ),
            }}
          />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item />

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="logo-favicon-upload-field"
            label="Favicon"
            variant="standard"
            value={settingsLoaded.appLogoFavicon || ""}
            InputProps={{
              style: { backgroundColor: "#ffffff", borderRadius: "0px" },
              endAdornment: (
                <>
                  {settingsLoaded.appLogoFavicon && (
                    <IconButton size="small" color="default" onClick={() => { handleSaveSetting("appLogoFavicon", ""); colorMode.setAppLogoFavicon(defaultLogoFavicon); }}>
                      <Delete />
                    </IconButton>
                  )}
                  <input type="file" id="upload-logo-favicon-button" ref={logoFaviconInput} className={classes.uploadInput} onChange={(e) => uploadLogo(e, "Favicon")} />
                  <label htmlFor="upload-logo-favicon-button">
                    <IconButton size="small" color="default" onClick={() => logoFaviconInput.current.click()}>
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
      <Grid xs={12} sm={6} md={4} item />
      <Grid xs={12} sm={6} md={4} item>
        <div className={classes.appLogoFaviconPreviewDiv}>
          <img className={classes.appLogoFaviconPreviewImg} alt="favicon-preview" />
        </div>
      </Grid>

      {/* Ícone do Sidebar */}
      <Grid xs={12} item style={{ marginTop: 24 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Ícone do Menu Lateral
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Esta imagem será exibida como ícone no menu lateral quando ele estiver recolhido. Formatos aceitos: GIF, PNG, JPG, WEBP (máx 5MB).
        </Typography>
      </Grid>
      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="loading-image-upload-field"
            label="Ícone do Sidebar"
            variant="standard"
            value={settingsLoaded.appLogoLoading || ""}
            InputProps={{
              style: { backgroundColor: "#ffffff", borderRadius: "0px" },
              endAdornment: (
                <>
                  {settingsLoaded.appLogoLoading && (
                    <IconButton size="small" color="default" onClick={() => { handleSaveSetting("appLogoLoading", ""); colorMode.setAppLogoLoading(""); }}>
                      <Delete />
                    </IconButton>
                  )}
                  <input type="file" id="upload-loading-image-button" ref={loadingImageInput} className={classes.uploadInput} onChange={(e) => uploadLogo(e, "Loading")} accept="image/jpeg,image/png,image/gif,image/webp" />
                  <label htmlFor="upload-loading-image-button">
                    <IconButton size="small" color="default" onClick={() => loadingImageInput.current.click()}>
                      <AttachFile />
                    </IconButton>
                  </label>
                </>
              ),
            }}
          />
        </FormControl>
      </Grid>
      <Grid xs={12} sm={6} md={4} item />
      <Grid xs={12} sm={6} md={4} item>
        {settingsLoaded.appLogoLoading && (
          <div style={{ padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, textAlign: "center", backgroundColor: "#f5f5f5" }}>
            <img src={`${getBackendUrl()}/public/${settingsLoaded.appLogoLoading}`} alt="loading-preview" style={{ width: "100%", maxHeight: 72, objectFit: "contain" }} />
          </div>
        )}
      </Grid>

      {/* Cores do Menu Lateral */}
      <Grid xs={12} item style={{ marginTop: 24 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Cores do Menu Lateral
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Personalize as cores dos ícones, textos e estados (ativo/hover) do menu lateral.
        </Typography>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="sidebar-icon-color-field"
            label="Cor dos Ícones"
            variant="standard"
            value={sidebarIconColor}
            onClick={() => setSidebarIconColorModalOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div style={{ backgroundColor: sidebarIconColor, width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" onClick={() => setSidebarIconColorModalOpen(true)}>
                  <Colorize />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        <ColorBoxModal
          open={sidebarIconColorModalOpen}
          handleClose={() => setSidebarIconColorModalOpen(false)}
          onChange={(color) => handleSaveSidebarColor("sidebarIconColor", `#${color.hex}`, setSidebarIconColor)}
          currentColor={sidebarIconColor}
        />
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="sidebar-text-color-field"
            label="Cor dos Textos"
            variant="standard"
            value={sidebarTextColor}
            onClick={() => setSidebarTextColorModalOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div style={{ backgroundColor: sidebarTextColor, width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" onClick={() => setSidebarTextColorModalOpen(true)}>
                  <Colorize />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        <ColorBoxModal
          open={sidebarTextColorModalOpen}
          handleClose={() => setSidebarTextColorModalOpen(false)}
          onChange={(color) => handleSaveSidebarColor("sidebarTextColor", `#${color.hex}`, setSidebarTextColor)}
          currentColor={sidebarTextColor}
        />
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="sidebar-active-color-field"
            label="Cor do Ícone Ativo / Hover"
            variant="standard"
            value={sidebarActiveColor}
            onClick={() => setSidebarActiveColorModalOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div style={{ backgroundColor: sidebarActiveColor, width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" onClick={() => setSidebarActiveColorModalOpen(true)}>
                  <Colorize />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        <ColorBoxModal
          open={sidebarActiveColorModalOpen}
          handleClose={() => setSidebarActiveColorModalOpen(false)}
          onChange={(color) => handleSaveSidebarColor("sidebarActiveColor", `#${color.hex}`, setSidebarActiveColor)}
          currentColor={sidebarActiveColor}
        />
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="sidebar-active-bg-field"
            label="Fundo do Item Ativo"
            variant="standard"
            value={sidebarActiveBg}
            onClick={() => setSidebarActiveBgModalOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div style={{ backgroundColor: sidebarActiveBg, width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" onClick={() => setSidebarActiveBgModalOpen(true)}>
                  <Colorize />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        <ColorBoxModal
          open={sidebarActiveBgModalOpen}
          handleClose={() => setSidebarActiveBgModalOpen(false)}
          onChange={(color) => handleSaveSidebarColor("sidebarActiveBg", `#${color.hex}`, setSidebarActiveBg)}
          currentColor={sidebarActiveBg}
        />
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="sidebar-hover-bg-field"
            label="Fundo do Item Hover"
            variant="standard"
            value={sidebarHoverBg}
            onClick={() => setSidebarHoverBgModalOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div style={{ backgroundColor: sidebarHoverBg, width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton size="small" onClick={() => setSidebarHoverBgModalOpen(true)}>
                  <Colorize />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        <ColorBoxModal
          open={sidebarHoverBgModalOpen}
          handleClose={() => setSidebarHoverBgModalOpen(false)}
          onChange={(color) => handleSaveSidebarColor("sidebarHoverBg", `#${color.hex}`, setSidebarHoverBg)}
          currentColor={sidebarHoverBg}
        />
      </Grid>
    </Grid>
  );

  // ===================== TAB: LOGIN / CADASTRO =====================
  const renderLoginCadastro = () => (
    <Grid spacing={3} container>
      {/* Imagem de Fundo */}
      <Grid xs={12} item>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Imagem de Fundo (Login e Cadastro)
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
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
              style: { backgroundColor: "#ffffff", borderRadius: "0px" },
              endAdornment: (
                <>
                  {settingsLoaded.termsImage && (
                    <IconButton size="small" color="default" onClick={() => handleSaveSetting("termsImage", "")}>
                      <Delete />
                    </IconButton>
                  )}
                  <input type="file" id="upload-terms-image-button" ref={termsImageInput} className={classes.uploadInput} onChange={uploadTermsImage} accept="image/*" />
                  <label htmlFor="upload-terms-image-button">
                    <IconButton size="small" color="default" onClick={() => termsImageInput.current.click()}>
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
        {settingsLoaded.termsImage && (
          <div className={classes.appLogoLightPreviewDiv}>
            <img src={getBackendUrl() + "/public/" + settingsLoaded.termsImage} alt="terms-image-preview" style={{ width: "100%", maxHeight: 150, objectFit: "contain" }} />
          </div>
        )}
      </Grid>
      <Grid xs={12} sm={6} md={4} item />

      {/* Termos de Uso */}
      <Grid xs={12} item style={{ marginTop: 24 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Termos de Uso
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
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
            onBlur={() => { if (termsText !== settingsLoaded.termsText) handleSaveSetting("termsText", termsText); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
            placeholder="Digite aqui os termos de uso do sistema..."
          />
        </FormControl>
      </Grid>

      {/* Período de Teste */}
      <Grid xs={12} item style={{ marginTop: 24 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Período de Teste
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
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
            onBlur={() => { if (trialDays !== settingsLoaded.trialDays) handleSaveSetting("trialDays", trialDays); }}
            InputProps={{ style: { backgroundColor: "#ffffff" }, inputProps: { min: 1, max: 365 } }}
          />
        </FormControl>
      </Grid>

      {/* Mensagens de Boas-vindas */}
      <Grid xs={12} item style={{ marginTop: 24 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Mensagens de Boas-vindas
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
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
            onBlur={() => { if (welcomeEmailText !== settingsLoaded.welcomeEmailText) handleSaveSetting("welcomeEmailText", welcomeEmailText); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
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
            onBlur={() => { if (welcomeWhatsappText !== settingsLoaded.welcomeWhatsappText) handleSaveSetting("welcomeWhatsappText", welcomeWhatsappText); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
            placeholder="Olá {nome}! 🎉 Bem-vindo ao {empresa}! Seu acesso foi criado..."
          />
        </FormControl>
      </Grid>
    </Grid>
  );

  // ===================== TAB: E-MAIL SMTP =====================
  const renderSmtp = () => (
    <Grid spacing={3} container>
      <Grid xs={12} item>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Configurações de E-mail (SMTP)
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure o servidor SMTP para envio de e-mails de recuperação de senha e boas-vindas.
          Essas informações são fornecidas pelo seu provedor de e-mail (Gmail, Outlook, etc).
        </Typography>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Host do Servidor</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Ex: smtp.gmail.com, smtp.office365.com</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="smtp-host-field" label="Servidor SMTP" variant="standard" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} onBlur={() => { if (smtpHost !== settingsLoaded.smtpHost) handleSaveSetting("smtpHost", smtpHost); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="smtp.gmail.com" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Porta do Servidor</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Geralmente 587 (TLS) ou 465 (SSL)</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="smtp-port-field" label="Porta" variant="standard" type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} onBlur={() => { if (smtpPort !== settingsLoaded.smtpPort) handleSaveSetting("smtpPort", smtpPort); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="587" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>E-mail Remetente</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>E-mail que aparecerá como remetente</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="smtp-from-field" label="E-mail From" variant="standard" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} onBlur={() => { if (smtpFrom !== settingsLoaded.smtpFrom) handleSaveSetting("smtpFrom", smtpFrom); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="noreply@suaempresa.com" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Usuário de Autenticação</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Geralmente seu e-mail completo</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="smtp-user-field" label="Usuário" variant="standard" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} onBlur={() => { if (smtpUser !== settingsLoaded.smtpUser) handleSaveSetting("smtpUser", smtpUser); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="seuemail@gmail.com" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Senha de Aplicativo</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Use senha de app (Gmail: Senhas de app)</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="smtp-pass-field"
            label="Senha"
            variant="standard"
            type={showSmtpPass ? "text" : "password"}
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            onBlur={() => { if (smtpPass !== settingsLoaded.smtpPass) handleSaveSetting("smtpPass", smtpPass); }}
            InputProps={{
              style: { backgroundColor: "#ffffff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowSmtpPass(!showSmtpPass)} edge="end">
                    {showSmtpPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••••••••••"
          />
        </FormControl>
      </Grid>
    </Grid>
  );

  // ===================== TAB: CHAVES DE IA =====================
  const renderIA = () => (
    <Grid spacing={3} container>
      <Grid xs={12} item>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Configurações de IA (API Keys)
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure as chaves de API para usar os recursos de Inteligência Artificial (OpenAI e Google Gemini).
          As chaves são usadas para processamento de linguagem natural e geração de respostas.
        </Typography>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>API Key OpenAI</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Chave da API da OpenAI (GPT-4, GPT-3.5, etc)</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="openai-api-key-field"
            label="OpenAI API Key"
            variant="standard"
            type={showOpenaiKey ? "text" : "password"}
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            onBlur={() => { if (openaiApiKey !== settingsLoaded.openaiApiKey) handleSaveSetting("openaiApiKey", openaiApiKey); }}
            InputProps={{
              style: { backgroundColor: "#ffffff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowOpenaiKey(!showOpenaiKey)} edge="end">
                    {showOpenaiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="sk-..."
          />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>API Key Google Gemini</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Chave da API do Google Gemini (Gemini Pro, etc)</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="gemini-api-key-field"
            label="Gemini API Key"
            variant="standard"
            type={showGeminiKey ? "text" : "password"}
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            onBlur={() => { if (geminiApiKey !== settingsLoaded.geminiApiKey) handleSaveSetting("geminiApiKey", geminiApiKey); }}
            InputProps={{
              style: { backgroundColor: "#ffffff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowGeminiKey(!showGeminiKey)} edge="end">
                    {showGeminiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="AIza..."
          />
        </FormControl>
      </Grid>
    </Grid>
  );

  // ===================== TAB: INTEGRAÇÕES =====================
  const renderIntegracoes = () => (
    <Grid spacing={3} container>
      <Grid xs={12} item>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Configurações de Integrações
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure as chaves e URLs de integração com serviços externos (Facebook, Google, etc).
          Estas configurações substituem as variáveis de ambiente do .env.
        </Typography>
      </Grid>

      {/* Facebook */}
      <Grid xs={12} item style={{ marginTop: 16 }}>
        <Typography variant="h6" className={classes.integrationTitle} style={{ color: "#1877f2" }}>
          Facebook / Meta
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure as credenciais do Facebook Developers para integração com Messenger e Instagram.
        </Typography>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Verify Token</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Token para validar webhook do Facebook</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="verify-token-field" label="Verify Token" variant="standard" value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} onBlur={() => { if (verifyToken !== settingsLoaded.verifyToken) handleSaveSetting("verifyToken", verifyToken); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="whaticket" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>App ID</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>ID do aplicativo no Facebook Developers</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="facebook-app-id-field" label="Facebook App ID" variant="standard" value={facebookAppId} onChange={(e) => setFacebookAppId(e.target.value)} onBlur={() => { if (facebookAppId !== settingsLoaded.facebookAppId) handleSaveSetting("facebookAppId", facebookAppId); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="776874187723945" />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>App Secret</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Chave secreta do aplicativo Facebook</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="facebook-app-secret-field"
            label="Facebook App Secret"
            variant="standard"
            type={showFacebookSecret ? "text" : "password"}
            value={facebookAppSecret}
            onChange={(e) => setFacebookAppSecret(e.target.value)}
            onBlur={() => { if (facebookAppSecret !== settingsLoaded.facebookAppSecret) handleSaveSetting("facebookAppSecret", facebookAppSecret); }}
            InputProps={{
              style: { backgroundColor: "#ffffff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowFacebookSecret(!showFacebookSecret)} edge="end">
                    {showFacebookSecret ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••••••••••"
          />
        </FormControl>
      </Grid>

      {/* Google */}
      <Grid xs={12} item style={{ marginTop: 32 }}>
        <Typography variant="h6" className={classes.integrationTitle} style={{ color: "#4285f4" }}>
          Google
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure as credenciais do Google para integração com Google Calendar e outras APIs.
        </Typography>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Client ID</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>ID do cliente Google OAuth 2.0</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="google-client-id-field" label="Google Client ID" variant="standard" value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} onBlur={() => { if (googleClientId !== settingsLoaded.googleClientId) handleSaveSetting("googleClientId", googleClientId); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="604305494657-..." />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Client Secret</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>Chave secreta do cliente Google OAuth</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="google-client-secret-field"
            label="Google Client Secret"
            variant="standard"
            type={showGoogleSecret ? "text" : "password"}
            value={googleClientSecret}
            onChange={(e) => setGoogleClientSecret(e.target.value)}
            onBlur={() => { if (googleClientSecret !== settingsLoaded.googleClientSecret) handleSaveSetting("googleClientSecret", googleClientSecret); }}
            InputProps={{
              style: { backgroundColor: "#ffffff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowGoogleSecret(!showGoogleSecret)} edge="end">
                    {showGoogleSecret ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••••••••••"
          />
        </FormControl>
      </Grid>

      <Grid xs={12} sm={6} md={4} item>
        <Typography variant="caption" className={classes.fieldLabel}>Redirect URI</Typography>
        <Typography variant="caption" display="block" className={classes.fieldHint}>URL de redirecionamento OAuth</Typography>
        <FormControl className={classes.selectContainer}>
          <TextField id="google-redirect-uri-field" label="Google Redirect URI" variant="standard" value={googleRedirectUri} onChange={(e) => setGoogleRedirectUri(e.target.value)} onBlur={() => { if (googleRedirectUri !== settingsLoaded.googleRedirectUri) handleSaveSetting("googleRedirectUri", googleRedirectUri); }} InputProps={{ style: { backgroundColor: "#ffffff" } }} placeholder="https://api.seudominio.com.br/google-calendar/oauth/callback" />
        </FormControl>
      </Grid>
    </Grid>
  );

  // ===================== TAB: COBRANÇAS =====================
  const renderCobrancas = () => (
    <Grid spacing={3} container>
      <Grid xs={12} item>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Mensagens de Cobrança
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Configure os textos das mensagens enviadas via WhatsApp para as empresas sobre suas faturas.
          Você pode usar as seguintes variáveis nos textos:
        </Typography>
        <Box style={{ backgroundColor: "#f5f5f5", borderRadius: 8, padding: 12, marginTop: 8 }}>
          <Typography variant="body2" style={{ fontFamily: "monospace", fontSize: 12 }}>
            {"{empresa}"} — Nome da empresa{"\n"}
            {"{plano}"} — Nome do plano{"\n"}
            {"{valor}"} — Valor da fatura{"\n"}
            {"{vencimento}"} — Data de vencimento{"\n"}
            {"{link}"} — Link de pagamento
          </Typography>
        </Box>
      </Grid>

      {/* Mensagem de Aviso (antes do vencimento) */}
      <Grid xs={12} item style={{ marginTop: 16 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Mensagem de Aviso
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Enviada alguns dias antes do vencimento da fatura como lembrete.
        </Typography>
      </Grid>
      <Grid xs={12} sm={10} md={8} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="invoice-msg-aviso-field"
            label="Mensagem de Aviso"
            variant="outlined"
            multiline
            rows={5}
            value={invoiceMsgAviso}
            onChange={(e) => setInvoiceMsgAviso(e.target.value)}
            onBlur={() => { if (invoiceMsgAviso !== settingsLoaded.invoiceMsgAviso) handleSaveSetting("invoiceMsgAviso", invoiceMsgAviso); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
            placeholder={"Olá! 👋\n\nSua fatura do plano *{plano}* no valor de *R$ {valor}* vence em *{vencimento}*.\n\nPara evitar a suspensão do serviço, realize o pagamento pelo link:\n{link}\n\nQualquer dúvida, estamos à disposição!"}
          />
        </FormControl>
      </Grid>

      {/* Mensagem do Dia da Fatura */}
      <Grid xs={12} item style={{ marginTop: 16 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Mensagem do Dia do Vencimento
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Enviada no dia do vencimento da fatura.
        </Typography>
      </Grid>
      <Grid xs={12} sm={10} md={8} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="invoice-msg-dia-field"
            label="Mensagem do Dia do Vencimento"
            variant="outlined"
            multiline
            rows={5}
            value={invoiceMsgDia}
            onChange={(e) => setInvoiceMsgDia(e.target.value)}
            onBlur={() => { if (invoiceMsgDia !== settingsLoaded.invoiceMsgDia) handleSaveSetting("invoiceMsgDia", invoiceMsgDia); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
            placeholder={"Olá! ⚠️\n\nSua fatura do plano *{plano}* no valor de *R$ {valor}* vence *hoje* ({vencimento}).\n\nRealize o pagamento para manter seu acesso:\n{link}\n\nEm caso de dúvidas, entre em contato conosco!"}
          />
        </FormControl>
      </Grid>

      {/* Mensagem de Fatura Atrasada */}
      <Grid xs={12} item style={{ marginTop: 16 }}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Mensagem de Fatura Atrasada
        </Typography>
        <Typography variant="body2" className={classes.sectionDesc}>
          Enviada quando a fatura está vencida e ainda não foi paga.
        </Typography>
      </Grid>
      <Grid xs={12} sm={10} md={8} item>
        <FormControl className={classes.selectContainer}>
          <TextField
            id="invoice-msg-atrasada-field"
            label="Mensagem de Fatura Atrasada"
            variant="outlined"
            multiline
            rows={5}
            value={invoiceMsgAtrasada}
            onChange={(e) => setInvoiceMsgAtrasada(e.target.value)}
            onBlur={() => { if (invoiceMsgAtrasada !== settingsLoaded.invoiceMsgAtrasada) handleSaveSetting("invoiceMsgAtrasada", invoiceMsgAtrasada); }}
            InputProps={{ style: { backgroundColor: "#ffffff" } }}
            placeholder={"Olá! 🚨\n\nSua fatura do plano *{plano}* no valor de *R$ {valor}* venceu em *{vencimento}* e ainda está em aberto.\n\nPara evitar o bloqueio do sistema, regularize o pagamento:\n{link}\n\nCaso já tenha efetuado o pagamento, desconsidere esta mensagem."}
          />
        </FormControl>
      </Grid>
    </Grid>
  );

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <Typography className={classes.pageTitle}>Whitelabel</Typography>
        <Typography className={classes.pageSubtitle}>
          Personalize a aparência, logos, cores, SMTP, chaves de API e integrações do sistema
        </Typography>
      </div>

      <div className={classes.tabsContainer}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          className={classes.tabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Aparência" className={classes.tab} />
          <Tab label="Login / Cadastro" className={classes.tab} />
          <Tab label="E-mail (SMTP)" className={classes.tab} />
          <Tab label="Chaves de IA" className={classes.tab} />
          <Tab label="Integrações" className={classes.tab} />
          <Tab label="Cobranças" className={classes.tab} />
        </Tabs>
      </div>

      <div className={classes.content}>
        <TabPanel value={tab} index={0}>{renderAparencia()}</TabPanel>
        <TabPanel value={tab} index={1}>{renderLoginCadastro()}</TabPanel>
        <TabPanel value={tab} index={2}>{renderSmtp()}</TabPanel>
        <TabPanel value={tab} index={3}>{renderIA()}</TabPanel>
        <TabPanel value={tab} index={4}>{renderIntegracoes()}</TabPanel>
        <TabPanel value={tab} index={5}>{renderCobrancas()}</TabPanel>
      </div>
    </div>
  );
};

export default WhitelabelPage;
