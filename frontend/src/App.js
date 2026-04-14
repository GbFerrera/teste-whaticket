import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import defaultLogoLight from "./assets/logo.png";
import defaultLogoDark from "./assets/logo-black.png";
import defaultLogoFavicon from "./assets/favicon.ico";
import useSettings from "./hooks/useSettings";
import { SystemAlertProvider } from "./components/SystemAlert";
import { i18n } from "./translate/i18n";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();
  const appColorLocalStorage = localStorage.getItem("primaryColorLight") || localStorage.getItem("primaryColorDark") || "#065183";
  const appNameLocalStorage = localStorage.getItem("appName") || "Fae Developer";
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");
  const [primaryColorLight, setPrimaryColorLight] = useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] = useState(appColorLocalStorage);
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appLogoLoading, setAppLogoLoading] = useState("");
  const [appName, setAppName] = useState(appNameLocalStorage);
  const [sidebarIconColor, setSidebarIconColor] = useState(localStorage.getItem("sidebarIconColor") || "#ffffff");
  const [sidebarTextColor, setSidebarTextColor] = useState(localStorage.getItem("sidebarTextColor") || "#f1f5f9");
  const [sidebarActiveBg, setSidebarActiveBg] = useState(localStorage.getItem("sidebarActiveBg") || "rgba(59,130,246,0.15)");
  const [sidebarActiveColor, setSidebarActiveColor] = useState(localStorage.getItem("sidebarActiveColor") || "#000000");
  const [sidebarHoverBg, setSidebarHoverBg] = useState(localStorage.getItem("sidebarHoverBg") || "rgba(59,130,246,0.1)");
  const { getPublicSetting } = useSettings();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode); // Persistindo o tema no localStorage
          return newMode;
        });
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppLogoLoading,
      setAppName,
      setSidebarIconColor,
      setSidebarTextColor,
      setSidebarActiveBg,
      setSidebarActiveColor,
      setSidebarHoverBg,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appLogoLoading,
      appName,
      sidebarIconColor,
      sidebarTextColor,
      sidebarActiveBg,
      sidebarActiveColor,
      sidebarHoverBg,
      mode,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appLogoLoading, appName, sidebarIconColor, sidebarTextColor, sidebarActiveBg, sidebarActiveColor, sidebarHoverBg, mode]
  );

  const theme = useMemo(
  () =>
    createTheme(
      {
        typography: {
          fontFamily: [
            '"Inter"',
            '"Roboto"',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
          ].join(','),
          
          // Configurações para diferentes elementos
          h1: {
            fontSize: '2.125rem',
            fontWeight: 600,
            letterSpacing: '-0.01562em'
          },
          h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.00833em'
          },
          h3: {
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: '0em'
          },
          h4: {
            fontSize: '1.125rem',
            fontWeight: 500,
            letterSpacing: '0.00735em'
          },
          h5: {
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0em'
          },
          h6: {
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.0075em'
          },
          body1: {
            fontSize: '1rem',
            fontWeight: 400,
            letterSpacing: '0.00938em',
            lineHeight: 1.5
          },
          body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            letterSpacing: '0.01071em',
            lineHeight: 1.43
          },
          button: {
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.02857em',
            textTransform: 'none' // Remove o uppercase padrão dos botões
          },
          caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            letterSpacing: '0.03333em'
          },
          overline: {
            fontSize: '0.625rem',
            fontWeight: 400,
            letterSpacing: '0.08333em',
            textTransform: 'uppercase'
          }
        },
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
          },
        },
        scrollbarStylesSoft: {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: mode === "light" ? "#F3F3F3" : "#333333",
          },
        },
        palette: {
          type: mode,
          primary: { main: mode === "light" ? primaryColorLight : primaryColorDark },
          textPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
          borderPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
          dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
          light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
          fontColor: mode === "light" ? primaryColorLight : primaryColorDark,
          tabHeaderBackground: mode === "light" ? "#EEE" : "#666",
          optionsBackground: mode === "light" ? "#fafafa" : "#333",
          fancyBackground: mode === "light" ? "#fafafa" : "#333",
          total: mode === "light" ? "#fff" : "#222",
          messageIcons: mode === "light" ? "grey" : "#F3F3F3",
          inputBackground: mode === "light" ? "#FFFFFF" : "#333",
          barraSuperior: mode === "light" ? primaryColorLight : "#666",
        },
        mode,
        appLogoLight,
        appLogoDark,
        appLogoFavicon,
        appLogoLoading,
        appName,
        sidebarIconColor,
        sidebarTextColor,
        sidebarActiveBg,
        sidebarActiveColor,
        sidebarHoverBg,
        calculatedLogoDark: () => {
          if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
            return appLogoLight;
          }
          return appLogoDark;
        },
        calculatedLogoLight: () => {
          if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
            return appLogoDark;
          }
          return appLogoLight;
        },
      },
      locale
    ),
  [appLogoLight, appLogoDark, appLogoFavicon, appLogoLoading, appName, sidebarIconColor, sidebarTextColor, sidebarActiveBg, sidebarActiveColor, sidebarHoverBg, locale, mode, primaryColorDark, primaryColorLight]
);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    console.log("|=========== handleSaveSetting ==========|")
    console.log("APP START")
    console.log("|========================================|")
   
    
    getPublicSetting("primaryColorLight")
      .then((color) => {
        setPrimaryColorLight(color || "#0000FF");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("primaryColorDark")
      .then((color) => {
        setPrimaryColorDark(color || "#39ACE7");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoLight")
      .then((file) => {
        setAppLogoLight(file ? getBackendUrl() + "/public/" + file : defaultLogoLight);
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoDark")
      .then((file) => {
        setAppLogoDark(file ? getBackendUrl() + "/public/" + file : defaultLogoDark);
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoFavicon")
      .then((file) => {
        setAppLogoFavicon(file ? getBackendUrl() + "/public/" + file : defaultLogoFavicon);
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoLoading")
      .then((file) => {
        setAppLogoLoading(file ? getBackendUrl() + "/public/" + file : "");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appName")
      .then((name) => {
        setAppName(name || "Atend Zappy");
      })
      .catch((error) => {
        console.log("!==== Erro ao carregar temas: ====!", error);
        setAppName("Atend Zappy");
      });
    const sidebarKeys = [
      { key: "sidebarIconColor", setter: setSidebarIconColor, fallback: "#ffffff" },
      { key: "sidebarTextColor", setter: setSidebarTextColor, fallback: "#f1f5f9" },
      { key: "sidebarActiveBg", setter: setSidebarActiveBg, fallback: "rgba(59,130,246,0.15)" },
      { key: "sidebarActiveColor", setter: setSidebarActiveColor, fallback: "#000000" },
      { key: "sidebarHoverBg", setter: setSidebarHoverBg, fallback: "rgba(59,130,246,0.1)" },
    ];
    sidebarKeys.forEach(({ key, setter, fallback }) => {
      getPublicSetting(key)
        .then((val) => {
          if (val) {
            setter(val);
            localStorage.setItem(key, val);
          }
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primaryColor", mode === "light" ? primaryColorLight : primaryColorDark);
  }, [primaryColorLight, primaryColorDark, mode]);

  // Atualiza o título da página com o nome do sistema
  useEffect(() => {
    if (appName) {
      document.title = appName;
    }
  }, [appName]);

  useEffect(() => {
    async function fetchVersionData() {
      try {
        const response = await api.get("/version");
        const { data } = response;
        window.localStorage.setItem("frontendVersion", data.version);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    }
    fetchVersionData();
  }, []);

  // Load translations from database and merge with static translations
  useEffect(() => {
    async function loadTranslations() {
      try {
        const { data } = await api.get("/translations");
        const { translations } = data;
        if (translations) {
          Object.keys(translations).forEach((langCode) => {
            const flatKeys = translations[langCode];
            // Convert flat keys (e.g. "signup.title") to nested object
            const nested = {};
            Object.keys(flatKeys).forEach((key) => {
              const parts = key.split(".");
              let current = nested;
              for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
              }
              current[parts[parts.length - 1]] = flatKeys[key];
            });
            i18n.addResourceBundle(langCode, "translations", nested, true, true);
          });
        }
      } catch (error) {
        console.log("Error loading translations from DB", error);
      }
    }
    loadTranslations();
  }, []);

  return (
    <>
      <Favicon url={appLogoFavicon && appLogoFavicon !== defaultLogoFavicon ? appLogoFavicon : defaultLogoFavicon} />
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <SystemAlertProvider>
              <ActiveMenuProvider>
                <Routes />
              </ActiveMenuProvider>
            </SystemAlertProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
};

export default App;
