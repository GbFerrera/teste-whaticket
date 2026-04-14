import React, { useContext, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  ButtonBase,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import { usePlanPermissions } from "../../context/PlanPermissionsContext";

import ListAltIcon from "@mui/icons-material/ListAlt";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import SettingsPhoneIcon from "@mui/icons-material/SettingsPhone";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import DashboardIcon from "@material-ui/icons/Dashboard";
import BarChartIcon from "@material-ui/icons/BarChart";
import ChatIcon from "@material-ui/icons/Chat";
import ContactsIcon from "@material-ui/icons/Contacts";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import GroupIcon from "@material-ui/icons/Group";
import BuildIcon from "@material-ui/icons/Build";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import SearchIcon from "@material-ui/icons/Search";
const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${theme.palette.background.default}, #f5f7fb)`,
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(8),
  },
  hero: {
    textAlign: "left",
    marginBottom: theme.spacing(4),
    maxWidth: 640,
  },
  heroTitle: {
    fontWeight: 700,
    fontSize: "2.25rem",
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
  },
  heroSubtitle: {
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
  },
  searchWrapper: {
    marginTop: theme.spacing(3),
    maxWidth: 360,
  },
  searchField: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    },
  },
  categoryBox: {
    marginBottom: theme.spacing(6),
  },
  categoryTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  categoryDescription: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  tabsWrapper: {
    marginBottom: theme.spacing(3),
    borderRadius: 16,
    backgroundColor: theme.palette.mode === "dark" ? "#1f1f23" : "#fff",
    boxShadow: "0 12px 25px rgba(15,23,42,0.08)",
  },
  tabs: {
    minHeight: 44,
    padding: theme.spacing(0.25, 0.5),
    borderRadius: 16,
    "& .MuiTab-root": {
      textTransform: "none",
      minWidth: 0,
      padding: theme.spacing(1, 1.5),
      fontWeight: 600,
      fontSize: "0.85rem",
    },
  },
  cardButton: {
    width: "100%",
    borderRadius: 14,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.mode === "dark" ? "#2f2f33" : "#f7f8fb",
    transition: "all 0.25s ease",
    border: "1px solid transparent",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 10px 25px rgba(0,0,0,0.4)"
        : "0 14px 35px rgba(15,23,42,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    minHeight: 140,
    textAlign: "left",
    "&:hover": {
      transform: "translateY(-4px)",
      borderColor: theme.palette.primary.main,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 18px 35px rgba(0,0,0,0.5)"
          : "0 18px 40px rgba(86, 92, 177, 0.25)",
    },
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
    minHeight: 72,
    width: "100%",
  },
  iconWrapper: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(124, 77, 255, 0.25)",
    marginBottom: theme.spacing(1),
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
  },
  cardDescription: {
    color: theme.palette.text.secondary,
    fontSize: "0.82rem",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  divider: {
    margin: theme.spacing(4, 0),
  },
  tabPanel: {
    marginTop: theme.spacing(1),
  },
  searchResultsBox: {
    marginTop: theme.spacing(2),
    borderRadius: 16,
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    boxShadow: "0 16px 30px rgba(15,23,42,0.08)",
  },
  searchResultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
  },
  searchResultsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  searchResultItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      boxShadow: "0 6px 18px rgba(59,130,246,0.18)",
    },
  },
  searchResultInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.1)",
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultTexts: {
    display: "flex",
    flexDirection: "column",
  },
  searchResultTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  searchResultDescription: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  searchResultEmpty: {
    textAlign: "center",
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
  },
}));

const categories = [
  {
    title: "Operações",
    tabLabel: "Operações",
    description: "Fluxos principais para conversar com clientes e acompanhar o dia a dia.",
    items: [
      {
        title: "Lista de contatos",
        description: "Segmente públicos para campanhas específicas.",
        route: "/contact-lists",
        icon: ListAltIcon,
      },
      {
        title: "Campanhas",
        description: "Dispare campanhas Whatsapp com monitoramento.",
        route: "/campanhas",
        icon: CampaignOutlinedIcon,
      },
      {
        title: "Importar contatos",
        description: "Suba planilhas e integre contatos em massa.",
        route: "/contatos/import",
        icon: CloudUploadOutlinedIcon,
      },
      {
        title: "Mensagens Rapidas",
        description: "Crie atalhos de mensagem para o time.",
        route: "/quick-messages",
        icon: SmsOutlinedIcon,
      },
    ],
  },
  {
    title: "Automações",
    tabLabel: "Automações",
    description: "Conecte canais, crie jornadas automáticas e personalize o sistema.",
    items: [
      {
        title: "Campanhas por frase",
        description: "Crie e gerencie frases prontas para campanhas.",
        route: "/phrase-lists",
        icon: SmsOutlinedIcon,
      },
      {
        title: "Construtor de fluxo",
        description: "Monte jornadas automatizadas com blocos visuais.",
        route: "/flowbuilders",
        icon: AccountTreeOutlinedIcon,
      },
      {
        title: "Automações",
        description: "Automatize tarefas repetitivas e gatilhos.",
        route: "/automations",
        icon: FlashOnIcon,
      },
      {
        title: "IA Workflows",
        description: "Crie automações inteligentes com varios Agentes de IA.",
        route: "/ia-workflows",
        icon: PsychologyIcon,
      },
      {
        title: "Agentes IA",
        description: "Configure agentes inteligentes para responder clientes.",
        route: "/agentes",
        icon: SmartToyIcon,
      },
      {
        title: "Ferramentas",
        description: "Gerencie e mantenha as ferramentas integradas do sistema.",
        route: "/ferramentas",
        icon: BuildCircleIcon,
      },
    ],
  },
  {
    title: "Administração",
    tabLabel: "Admin",
    description: "Controle de usuários, empresas, cobranças e relatórios.",
    items: [
      {
        title: "Faturas",
        description: "Consulte boletos, recibos e histórico de pagamentos.",
        route: "/faturas",
        icon: LocalAtmIcon,
      },
      {
        title: "Financeiro",
        description: "Acompanhe faturas, cobranças e assinaturas.",
        route: "/financeiro",
        icon: LocalAtmIcon,
      },
      {
        title: "Lembretes",
        description: "Gerencie compromissos e calendário.",
        route: "/lembretes",
        icon: CalendarMonthIcon,
      },
      {
        title: "Configurações",
        description: "Configure o sistema.",
        route: "/settings",
        icon: BuildCircleIcon,
      },
      {
        title: "Integração",
        description: "Gerencie integrações e conexões externas.",
        route: "/integracao",
        icon: AccountTreeOutlinedIcon,
      },
      {
        title: "Config. Contatos",
        description: "Configure deduplicação, scoring e salvamento automático.",
        route: "/contact-settings",
        icon: SettingsPhoneIcon,
      },
      {
        title: "Analytics Contatos",
        description: "Visualize estatísticas e relatórios de contatos.",
        route: "/contact-analytics",
        icon: AssessmentIcon,
      },
    ],
  },
  {
    title: "Recursos",
    tabLabel: "Recursos",
    description: "Material de apoio e áreas de conteúdo multimídia.",
    items: [
      {
        title: "Serviços",
        description: "Gestão de serviços prestados e pacotes.",
        route: "/servicos",
        icon: BuildCircleIcon,
      },
      {
        title: "Produtos",
        description: "Gerencie seu catálogo de produtos e serviços.",
        route: "/produtos",
        icon: CheckCircleOutlineIcon,
      },
    ],
  },
  {
    title: "Produtividade",
    tabLabel: "Produtivo",
    description: "Ferramentas de organização, avisos e calendários.",
    items: [
      {
        title: "Etiquetas",
        description: "Organize atendimentos com etiquetas temáticas.",
        route: "/etiquetas",
        icon: LabelOutlinedIcon,
      },
      {
        title: "Oportunidades",
        description: "Visualize os leads e oportunidades.",
        route: "/TagsKanban",
        icon: LabelOutlinedIcon,
      },
      {
        title: "Funil",
        description: "Configure seus funis e oportunidades.",
        route: "/funil",
        icon: AccountTreeOutlinedIcon,
      },
      {
        title: "Kanban",
        description: "Visualize e mova tickets entre as fases do funil.",
        route: "/kanban",
        icon: ViewColumnIcon,
      },
      {
        title: "Projetos",
        description: "Gerencie projetos, tarefas e equipes.",
        route: "/projects",
        icon: FolderSpecialIcon,
      },
    ],
  },
];

const routeFeatureMap = {
  "/contact-lists": "campaigns",
  "/campanhas": "campaigns",
  "/contatos/import": "campaigns",
  "/phrase-lists": "campaigns",
  "/flowbuilders": "campaigns",
  "/automations": "campaigns",
  "/ia-workflows": "openAi",
  "/agentes": "openAi",
  "/ferramentas": "openAi",
  "/integracao": "openAi",
  "/kanban": "kanban",
  "/tagskanban": "kanban",
  "/funil": "kanban",
  "/projects": "kanban",
  "/projetos": "kanban",
  "/faturas": "internalChat",
  "/lembretes": "internalChat",
  "/servicos": "internalChat",
  "/produtos": "internalChat",
};

const Sistema = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { loading: planLoading, campaigns, openAi, kanban, internalChat } = usePlanPermissions();
  const isSuperAdminCompany = Boolean(user && user.companyId === 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const featureState = useMemo(
    () => ({
      campaigns,
      openAi,
      kanban,
      internalChat,
    }),
    [campaigns, openAi, kanban, internalChat]
  );

  const canShowRoute = (route) => {
    if (!route) return true;
    const normalizedRoute = route.toLowerCase();
    const requiredFeature = routeFeatureMap[normalizedRoute];
    if (!requiredFeature) return true;
    if (planLoading) return true;
    return Boolean(featureState[requiredFeature]);
  };

  const superAdminCategory = {
    title: "Super Admin",
    description: "Módulos disponíveis apenas para a empresa 1.",
    items: [
      {
        title: "Configurações",
        description: "Configure o sistema.",
        route: "/settings",
        icon: BuildCircleIcon,
      },
      {
        title: "Videos Tutoriais",
        description: "Passo a passo em vídeo para treinar o time.",
        route: "/tutorial-videos",
        icon: PlayCircleOutlineIcon,
      },
      {
        title: "Adicionar Banners",
        description: "Gerencie os banners exibidos no dashboard.",
        route: "/slider-banners",
        icon: PhotoSizeSelectLargeIcon,
      },
    ],
  };

  const baseCategories = useMemo(
    () => (isSuperAdminCompany ? [...categories, superAdminCategory] : categories),
    [isSuperAdminCompany]
  );

  const visibleCategories = useMemo(
    () =>
      baseCategories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => {
            const route = (item.route || "").toLowerCase();
            return canShowRoute(route);
          }),
        }))
        .filter((category) => category.items.length > 0),
    [baseCategories, canShowRoute]
  );

  React.useEffect(() => {
    if (!visibleCategories.length) {
      setActiveCategory("");
      return;
    }

    const exists = visibleCategories.some((category) => category.title === activeCategory);
    if (!exists) {
      setActiveCategory(visibleCategories[0].title);
    }
  }, [visibleCategories, activeCategory]);

  const activeCategoryData = useMemo(
    () => visibleCategories.find((category) => category.title === activeCategory),
    [visibleCategories, activeCategory]
  );

  const [debouncedTerm, setDebouncedTerm] = useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, 200);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    if (!debouncedTerm) return [];

    return visibleCategories.flatMap((category) =>
      category.items
        .filter((item) => {
          const title = item.title?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";
          return title.includes(debouncedTerm) || description.includes(debouncedTerm);
        })
        .map((item) => ({ ...item, category: category.title }))
    );
  }, [visibleCategories, debouncedTerm]);

  const handleNavigate = (route) => {
    history.push(route);
  };

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg">
        <div className={classes.hero}>
          <Typography className={classes.heroTitle}>Central do Sistema</Typography>
          <div className={classes.searchWrapper}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Pesquisar módulos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        {debouncedTerm && searchResults.length > 0 && (
          <div className={classes.searchResultsBox}>
            <div className={classes.searchResultsHeader}>
              <span>Resultados encontrados</span>
              <span>{searchResults.length} item(s)</span>
            </div>
            <div className={classes.searchResultsList}>
              {searchResults.map((result) => {
                const ResultIcon = result.icon;
                return (
                  <div
                    key={`${result.route}-${result.title}`}
                    className={classes.searchResultItem}
                    onClick={() => handleNavigate(result.route)}
                  >
                    <div className={classes.searchResultInfo}>
                      <div className={classes.searchResultIcon}>
                        <ResultIcon fontSize="small" />
                      </div>
                      <div className={classes.searchResultTexts}>
                        <span className={classes.searchResultTitle}>{result.title}</span>
                        <span className={classes.searchResultDescription}>
                          {result.category} • {result.description}
                        </span>
                      </div>
                    </div>
                    <Typography variant="caption" color="primary">
                      Abrir
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {debouncedTerm && searchResults.length === 0 && (
          <div className={classes.searchResultsBox}>
            <Typography className={classes.searchResultEmpty}>
              Nenhum módulo encontrado para “{searchTerm}”.
            </Typography>
          </div>
        )}

        {!debouncedTerm && visibleCategories.length > 0 && (
          <div className={classes.tabPanel}>
            <div className={classes.tabsWrapper}>
              <Tabs
                value={activeCategory}
                onChange={(event, newValue) => setActiveCategory(newValue)}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                className={classes.tabs}
              >
                {visibleCategories.map((category) => (
                  <Tab
                    key={category.title}
                    label={category.tabLabel || category.title}
                    value={category.title}
                  />
                ))}
              </Tabs>
            </div>

            {activeCategoryData && (
              <div className={classes.categoryBox}>
                <Typography className={classes.categoryTitle}>
                  {activeCategoryData.title}
                </Typography>
                <Typography className={classes.categoryDescription}>
                  {activeCategoryData.description}
                </Typography>

                <Grid container spacing={3}>
                  {activeCategoryData.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={item.title}>
                        <ButtonBase
                          className={classes.cardButton}
                          onClick={() => handleNavigate(item.route)}
                          focusRipple
                        >
                          <Avatar className={classes.iconWrapper}>
                            <IconComponent />
                          </Avatar>
                          <div className={classes.cardContent}>
                            <Typography className={classes.cardTitle}>
                              {item.title}
                            </Typography>
                            <Typography className={classes.cardDescription}>
                              {item.description}
                            </Typography>
                          </div>
                        </ButtonBase>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            )}
          </div>
        )}

        {!debouncedTerm && visibleCategories.length === 0 && (
          <Typography className={classes.searchResultEmpty}>
            Nenhum módulo disponível para o seu plano.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Sistema;
