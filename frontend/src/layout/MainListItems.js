import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { getBackendUrl } from "../config";

// Ícones modernos
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeIcon from "@mui/icons-material/Home";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CodeIcon from "@mui/icons-material/Code";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import BusinessIcon from "@mui/icons-material/Business";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import WebhookIcon from "@mui/icons-material/Webhook";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import UserModal from "../components/UserModal";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { usePlanPermissions } from "../context/PlanPermissionsContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import { i18n } from "../translate/i18n";

const submenuWidth = 280;

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "44px",
    width: "auto",
    borderRadius: "6px",
    margin: "2px 4px",
    padding: "6px 4px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      "& .MuiTypography-root": {
        color: "#ffffff",
      },
      "& .MuiSvgIcon-root": {
        color: "#ffffff",
      },
    },
    "&.active": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiTypography-root": {
        fontWeight: 600,
        color: "#FFFFFF",
      },
      "& .MuiAvatar-root": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "#FFFFFF",
      },
      "& .MuiSvgIcon-root": {
        color: "#FFFFFF",
      },
    },
  },
  listItemIcon: {
    minWidth: "40px",
    display: "flex",
    justifyContent: "center",
  },
  listItemText: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#ffffff",
    marginLeft: "0px",
    "&.active": {
      fontWeight: 600,
      color: "#FFFFFF",
    },
  },
  iconAvatar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "6px",
    height: 28,
    width: 28,
    backgroundColor: "transparent",
    color: "#ffffff",
    transition: "all 0.2s ease",
    "& .MuiSvgIcon-root": {
      fontSize: "1.1rem",
      color: "#ffffff",
    },
  },
  submenuDrawer: {
    width: submenuWidth,
    flexShrink: 0,
  },
  submenuDrawerPaper: {
    width: submenuWidth,
    backgroundColor: "#424242",
    borderLeft: `1px solid rgba(255, 255, 255, 0.1)`,
    position: "fixed",
    height: "100%",
    left: 240,
    top: 0,
    zIndex: theme.zIndex.drawer,
    overflowY: "auto",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("xs")]: {
      left: 0,
      width: "100%",
      borderLeft: "none",
    },
  },
  submenuDrawerPaperCollapsed: {
    width: submenuWidth,
    backgroundColor: "#424242",
    borderLeft: `1px solid rgba(255, 255, 255, 0.1)`,
    position: "fixed",
    height: "100%",
    left: 56,
    top: 0,
    zIndex: theme.zIndex.drawer,
    overflowY: "auto",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("xs")]: {
      left: 0,
      width: "100%",
      borderLeft: "none",
    },
  },
  submenuHeader: {
    padding: "20px 24px 16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("xs")]: {
      padding: "16px 20px 12px",
    },
  },
  submenuTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "0.5px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
    },
  },
  submenuContent: {
    padding: "8px 4px",
    [theme.breakpoints.down("xs")]: {
      padding: "4px 2px",
    },
  },
  submenuItem: {
    borderRadius: "8px",
    margin: "4px 0",
    padding: "6px 8px",
    transition: "all 0.2s ease",
    minHeight: "44px",
    [theme.breakpoints.down("xs")]: {
      margin: "2px 0",
      padding: "8px 12px",
      minHeight: "48px",
    },
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      "& .MuiTypography-root": {
        color: "#ffffff",
      },
      "& .MuiSvgIcon-root": {
        color: "#ffffff",
      },
    },
    "&.active": {
      backgroundColor: theme.mode === "light" 
        ? "rgba(124, 77, 255, 0.12)" 
        : "rgba(124, 77, 255, 0.25)",
      "& .MuiTypography-root": {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
      "& .MuiSvgIcon-root": {
        color: theme.palette.primary.main,
      },
    },
  },
  submenuItemIcon: {
    minWidth: "28px",
    color: "#ffffff",
    "& .MuiSvgIcon-root": {
      fontSize: "1.1rem",
      color: "#ffffff",
      [theme.breakpoints.down("xs")]: {
        fontSize: "1.25rem",
      },
    },
  },
  submenuItemText: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#ffffff",
    "& .MuiTypography-root": {
      fontSize: "13px",
      color: "#ffffff",
      [theme.breakpoints.down("xs")]: {
        fontSize: "14px",
      },
    },
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: "12px",
    borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
    backgroundColor: "#424242",
    [theme.breakpoints.down("xs")]: {
      padding: "8px",
    },
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      "& $profileMenuIcon": {
        opacity: 1,
        color: "#ffffff",
      },
    },
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: `2px solid #ffffff`,
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    overflow: "hidden",
    minWidth: 0,
  },
  profileName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  profileEmail: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  profileMenuIcon: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "1.25rem",
    flexShrink: 0,
    opacity: 0,
    transition: "opacity 0.2s ease",
  },
  profileDrawer: {
    width: 280,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
  profileDrawerPaper: {
    width: 280,
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    position: "fixed",
    height: "auto",
    left: 72,
    bottom: 0,
    top: "auto",
    zIndex: theme.zIndex.drawer + 2,
    borderRadius: "12px 12px 0 0",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      left: 0,
      borderLeft: "none",
      borderRadius: 0,
    },
  },
  profileDrawerHeader: {
    padding: "20px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("xs")]: {
      padding: "16px",
    },
  },
  profileDrawerTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: "4px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
    },
  },
  profileDrawerSubtitle: {
    fontSize: "13px",
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  profileActions: {
    padding: "8px",
  },
  profileMenuItem: {
    borderRadius: "8px",
    margin: "4px 0",
    padding: "12px 16px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    minHeight: "48px",
    "&:hover": {
      backgroundColor: theme.mode === "light" 
        ? "rgba(124, 77, 255, 0.08)" 
        : "rgba(124, 77, 255, 0.15)",
    },
  },
  profileMenuItemIcon: {
    color: theme.palette.text.secondary,
    fontSize: "1.25rem",
  },
  profileMenuItemText: {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  logoutButton: {
    borderRadius: "8px",
    margin: "4px 0",
    padding: "12px 16px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    minHeight: "48px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
  },
  logoutIcon: {
    color: "#EF4444",
    fontSize: "1.25rem",
  },
  logoutText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#EF4444",
  },
  mobileBackdrop: {
    [theme.breakpoints.down("xs")]: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, onNavigate } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  const handleClick = () => {
    // Fecha o submenu após navegar (principalmente em mobile)
    if (onNavigate) {
      onNavigate();
    }
  };

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <ListItem
        button
        component={renderLink}
        className={`${classes.submenuItem} ${isActive ? "active" : ""}`}
        onClick={handleClick}
      >
        {icon && (
          <ListItemIcon className={classes.submenuItemIcon}>
            {showBadge ? (
              <Badge badgeContent="!" color="error" overlap="circular">
                {icon}
              </Badge>
            ) : (
              icon
            )}
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <Typography className={classes.submenuItemText}>
              {primary}
            </Typography>
          }
        />
      </ListItem>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      return [...state, ...action.payload];
    case "UPDATE_CHATS":
      return state.map((chat) => (chat.id === action.payload.id ? action.payload : chat));
    case "DELETE_CHAT":
      return state.filter((chat) => chat.id !== action.payload);
    case "RESET":
      return [];
    case "CHANGE_CHAT":
      return state.map((chat) => (chat.id === action.payload.chat.id ? action.payload.chat : chat));
    default:
      return state;
  }
};

const backendUrl = getBackendUrl();

const MainListItems = ({ collapsed, drawerClose, onSubmenuOpen, submenuOpen, onToggleSubmenu }) => {
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket, handleLogout, isMobileSession } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const handleMenuClick = (menuName) => {
    if (isMobile && drawerClose) {
      drawerClose();
    }
    
    if (activeSubmenu === menuName) {
      setActiveSubmenu(null);
      if (onSubmenuOpen) onSubmenuOpen(false, false);
    } else {
      setActiveSubmenu(menuName);
      if (onSubmenuOpen) onSubmenuOpen(true, true);
    }
  };

  const handleCloseSubmenu = () => {
    setActiveSubmenu(null);
    if (onSubmenuOpen) onSubmenuOpen(false, false);
  };

  const handleNavigateFromSubmenu = () => {
    // Fecha o submenu após navegação
    if (isMobile) {
      handleCloseSubmenu();
      if (drawerClose) drawerClose();
    }
  };

  const handleProfileClick = () => {
    setProfileDrawerOpen(!profileDrawerOpen);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    setProfileDrawerOpen(false);
  };

  const handleLogoutClick = () => {
    setProfileDrawerOpen(false);
    handleLogout();
  };

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCommunicationActive =
    location.pathname.startsWith("/tickets") ||
    location.pathname.startsWith("/quick-messages") ||
    location.pathname.startsWith("/contacts") ||
    location.pathname.startsWith("/schedules") ||
    location.pathname.startsWith("/tags") ||
    location.pathname.startsWith("/chats");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") ||
    location.pathname.startsWith("/flowbuilders");

  const isAdministrationActive =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/queues") ||
    location.pathname.startsWith("/prompts") ||
    location.pathname.startsWith("/ia-workflows") ||
    location.pathname.startsWith("/queue-integration") ||
    location.pathname.startsWith("/connections") ||
    location.pathname.startsWith("/allConnections") ||
    location.pathname.startsWith("/files") ||
    location.pathname.startsWith("/financeiro") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/companies") ||
    location.pathname.startsWith("/announcements") ||
    location.pathname.startsWith("/messages-api") ||
    location.pathname.startsWith("/translation-manager");

  const isIntegrationActive =
    location.pathname.startsWith("/kanban") ||
    location.pathname.startsWith("/todolist") ||
    location.pathname.startsWith("/helps") ||
    location.pathname.startsWith("/documentacao");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  useEffect(() => {
    if (!submenuOpen && activeSubmenu) {
      setActiveSubmenu(null);
    }
  }, [submenuOpen]);

  useEffect(() => {
    if (collapsed && activeSubmenu) {
      setActiveSubmenu(null);
      if (onSubmenuOpen) onSubmenuOpen(false, false);
    }
  }, [collapsed]);

  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (collapsed && activeSubmenu) {
      setActiveSubmenu(null);
      if (onSubmenuOpen) onSubmenuOpen(false);
    }
  }, [collapsed]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const shouldCloseSubmenu = () => {
      if (!activeSubmenu) return false;

      switch (activeSubmenu) {
        case "management":
          return !isManagementActive;
        case "communication":
          return !isCommunicationActive;
        case "campaigns":
          return !isCampaignRouteActive;
        case "flows":
          return !isFlowbuilderRouteActive;
        case "tools":
          return !isIntegrationActive;
        case "administration":
          return !isAdministrationActive;
        default:
          return false;
      }
    };

    if (shouldCloseSubmenu()) {
      setActiveSubmenu(null);
      if (onSubmenuOpen) onSubmenuOpen(false, false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const renderSubmenu = (menuName) => {
    switch (menuName) {
      case "management":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                {i18n.t("mainDrawer.listItems.management")}
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              <Can
                role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <ListItemLink
                      to="/"
                      primary="Dashboard"
                      icon={<DashboardOutlinedIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                    <ListItemLink
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports")}
                      icon={<ListAltIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  </>
                )}
              />
              <Can
                role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/moments"
                    primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                    icon={<ForumOutlinedIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                )}
              />
            </div>
          </>
        );

      case "communication":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                Comunicação
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              {planExpired && (
                <>
                  <ListItemLink
                    to="/tickets"
                    primary={i18n.t("Inbox")}
                    icon={<WhatsAppIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                  <ListItemLink
                    to="/quick-messages"
                    primary={i18n.t("mainDrawer.listItems.quickMessages")}
                    icon={<FlashOnIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                  <ListItemLink
                    to="/contacts"
                    primary={i18n.t("Contatos")}
                    icon={<ContactPhoneOutlinedIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                  {showSchedules && (
                    <ListItemLink
                      to="/schedules"
                      primary={i18n.t("Agendamentos")}
                      icon={<ScheduleIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                  <ListItemLink
                    to="/tags"
                    primary={i18n.t("Etiquetas")}
                    icon={<LocalOfferOutlinedIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                  {showInternalChat && (
                    <ListItemLink
                      to="/chats"
                      primary={i18n.t("mainDrawer.listItems.chats")}
                      icon={
                        <Badge color="secondary" variant="dot" invisible={invisible}>
                          <ForumOutlinedIcon />
                        </Badge>
                      }
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                </>
              )}
            </div>
          </>
        );

      case "campaigns":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                {i18n.t("mainDrawer.listItems.campaigns")}
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              <ListItemLink
                to="/campaigns"
                primary={i18n.t("campaigns.subMenus.list")}
                icon={<ListAltIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/contact-lists"
                primary={i18n.t("campaigns.subMenus.listContacts")}
                icon={<PeopleOutlineIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/campaigns-config"
                primary={i18n.t("campaigns.subMenus.settings")}
                icon={<SettingsOutlinedIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
            </div>
          </>
        );

      case "flows":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                {i18n.t("Flowbuilder")}
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              <ListItemLink
                to="/phrase-lists"
                primary="Fluxo de Campanha"
                icon={<CampaignOutlinedIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/flowbuilders"
                primary="Fluxo de conversa"
                icon={<AccountTreeIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
            </div>
          </>
        );

      case "tools":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                Ferramentas
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              {showKanban && planExpired && (
                <ListItemLink
                  to="/kanban"
                  primary={i18n.t("Kanban")}
                  icon={<ViewKanbanIcon />}
                  onNavigate={handleNavigateFromSubmenu}
                />
              )}
              <ListItemLink
                to="/todolist"
                primary={i18n.t("Catalogo")}
                icon={<Inventory2OutlinedIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/helps"
                primary={i18n.t("Ferramentas")}
                icon={<BuildOutlinedIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/documentacao"
                primary={i18n.t("Pipelines Kanban")}
                icon={<AccountTreeIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/faturas"
                primary="Faturas"
                icon={<LocalAtmIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/prompts"
                primary={i18n.t("Agentes IA")}
                icon={<AllInclusiveIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/ia-workflows"
                primary="Workflows de IA"
                icon={<AccountTreeIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/projects"
                primary="Projetos"
                icon={<FolderSpecialIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/user-schedules"
                primary="Agendas"
                icon={<EventAvailableIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
              <ListItemLink
                to="/appointments"
                primary="Compromissos"
                icon={<ScheduleIcon />}
                onNavigate={handleNavigateFromSubmenu}
              />
            </div>
          </>
        );

      case "administration":
        return (
          <>
            <div className={classes.submenuHeader}>
              <Typography className={classes.submenuTitle}>
                Administração
              </Typography>
            </div>
            <div className={classes.submenuContent}>
              {user.super && (
                <ListItemLink
                  to="/announcements"
                  primary={i18n.t("mainDrawer.listItems.annoucements")}
                  icon={<AnnouncementIcon />}
                  onNavigate={handleNavigateFromSubmenu}
                />
              )}
              {showExternalApi && planExpired && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/messages-api"
                      primary={i18n.t("Documentação API")}
                      icon={<CodeIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                />
              )}
              {planExpired && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <>
                      <ListItemLink
                        to="/users"
                        primary={i18n.t("Usuarios")}
                        icon={<PeopleOutlineIcon />}
                        onNavigate={handleNavigateFromSubmenu}
                      />
                      <ListItemLink
                        to="/queues"
                        primary={i18n.t("Departamentos")}
                        icon={<AccountTreeOutlinedIcon />}
                        onNavigate={handleNavigateFromSubmenu}
                      />
                    </>
                  )}
                />
              )}
              {showIntegrations && planExpired && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/queue-integration"
                      primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                      icon={<DeviceHubIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                />
              )}
              {planExpired && (
                <Can
                  role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <ListItemLink
                      to="/connections"
                      primary={i18n.t("Canais")}
                      icon={<SyncAltIcon />}
                      showBadge={connectionWarning}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                />
              )}
              {user.super && (
                <ListItemLink
                  to="/allConnections"
                  primary={i18n.t("mainDrawer.listItems.allConnections")}
                  icon={<SyncAltIcon />}
                  onNavigate={handleNavigateFromSubmenu}
                />
              )}
              {planExpired && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/files"
                      primary={i18n.t("mainDrawer.listItems.files")}
                      icon={<AttachFileIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                />
              )}
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/financeiro"
                    primary={i18n.t("mainDrawer.listItems.financeiro")}
                    icon={<LocalAtmIcon />}
                    onNavigate={handleNavigateFromSubmenu}
                  />
                )}
              />
              {planExpired && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/settings"
                      primary={i18n.t("mainDrawer.listItems.settings")}
                      icon={<SettingsOutlinedIcon />}
                      onNavigate={handleNavigateFromSubmenu}
                    />
                  )}
                />
              )}
              {user.super && (
                <ListItemLink
                  to="/empresas"
                  primary={i18n.t("mainDrawer.listItems.companies")}
                  icon={<BusinessIcon />}
                  onNavigate={handleNavigateFromSubmenu}
                />
              )}
              {user.super && (
                <ListItemLink
                  to="/translation-manager"
                  primary="Traduções"
                  icon={<SettingsOutlinedIcon />}
                  onNavigate={handleNavigateFromSubmenu}
                />
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div onClick={drawerClose} style={{ flex: 1, overflowY: "auto", paddingBottom: "80px", paddingTop: "8px" }}>
        {/* Home Button */}
        <Tooltip title={collapsed ? "Dashboard" : ""} placement="right">
          <ListItem
            button
            component={RouterLink}
            to="/"
            className={`${classes.listItem} ${location.pathname === "/" ? "active" : ""}`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <Avatar className={classes.iconAvatar}>
                <HomeIcon />
              </Avatar>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={
                  <Typography className={`${classes.listItemText} ${location.pathname === "/" ? "active" : ""}`}>
                    Dashboard
                  </Typography>
                }
              />
            )}
          </ListItem>
        </Tooltip>

        {planExpired && (
          <Can
            role={
              (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
                ? "admin"
                : user.profile
            }
            perform={"drawer-admin-items:view"}
            yes={() => (
              <Tooltip title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""} placement="right">
                <ListItem
                  button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick("management");
                  }}
                  className={`${classes.listItem} ${activeSubmenu === "management" ? "active" : ""}`}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <Avatar className={classes.iconAvatar}>
                      <TrendingUpIcon />
                    </Avatar>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={
                        <Typography className={`${classes.listItemText} ${activeSubmenu === "management" ? "active" : ""}`}>
                          {i18n.t("mainDrawer.listItems.management")}
                        </Typography>
                      }
                    />
                  )}
                </ListItem>
              </Tooltip>
            )}
          />
        )}
        
        <Tooltip title={collapsed ? "Comunicação" : ""} placement="right">
          <ListItem
            button
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick("communication");
            }}
            className={`${classes.listItem} ${activeSubmenu === "communication" ? "active" : ""}`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <Avatar className={classes.iconAvatar}>
                <ChatBubbleOutlineIcon />
              </Avatar>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={
                  <Typography className={`${classes.listItemText} ${activeSubmenu === "communication" ? "active" : ""}`}>
                    Comunicação
                  </Typography>
                }
              />
            )}
          </ListItem>
        </Tooltip>

        {showCampaigns && planExpired && (
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Tooltip title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""} placement="right">
                <ListItem
                  button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick("campaigns");
                  }}
                  className={`${classes.listItem} ${activeSubmenu === "campaigns" ? "active" : ""}`}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <Avatar className={classes.iconAvatar}>
                      <CampaignOutlinedIcon />
                    </Avatar>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={
                        <Typography className={`${classes.listItemText} ${activeSubmenu === "campaigns" ? "active" : ""}`}>
                          {i18n.t("mainDrawer.listItems.campaigns")}
                        </Typography>
                      }
                    />
                  )}
                </ListItem>
              </Tooltip>
            )}
          />
        )}

        {planExpired && (
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Tooltip title={collapsed ? i18n.t("Flowbuilder") : ""} placement="right">
                <ListItem
                  button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick("flows");
                  }}
                  className={`${classes.listItem} ${activeSubmenu === "flows" ? "active" : ""}`}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <Avatar className={classes.iconAvatar}>
                      <AccountTreeIcon />
                    </Avatar>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={
                        <Typography className={`${classes.listItemText} ${activeSubmenu === "flows" ? "active" : ""}`}>
                          {i18n.t("Flowbuilder")}
                        </Typography>
                      }
                    />
                  )}
                </ListItem>
              </Tooltip>
            )}
          />
        )}

        <Tooltip title={collapsed ? "Ferramentas" : ""} placement="right">
          <ListItem
            button
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick("tools");
            }}
            className={`${classes.listItem} ${activeSubmenu === "tools" ? "active" : ""}`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <Avatar className={classes.iconAvatar}>
                <BuildOutlinedIcon />
              </Avatar>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={
                  <Typography className={`${classes.listItemText} ${activeSubmenu === "tools" ? "active" : ""}`}>
                    Ferramentas
                  </Typography>
                }
              />
            )}
          </ListItem>
        </Tooltip>

        <Can
          role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
          perform="dashboard:view"
          yes={() => (
            <Tooltip title={collapsed ? "Administração" : ""} placement="right">
              <ListItem
                button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuClick("administration");
                }}
                className={`${classes.listItem} ${activeSubmenu === "administration" ? "active" : ""}`}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <Avatar className={classes.iconAvatar}>
                    <SettingsOutlinedIcon />
                  </Avatar>
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={
                      <Typography className={`${classes.listItemText} ${activeSubmenu === "administration" ? "active" : ""}`}>
                        Administração
                      </Typography>
                    }
                  />
                )}
              </ListItem>
            </Tooltip>
          )}
        />

        {!collapsed && (
          <React.Fragment>
            <Divider style={{ margin: "16px 0" }} />
          </React.Fragment>
        )}
      </div>

      {!collapsed ? (
        <div className={classes.bottomSection}>
          <div className={classes.profileContainer} onClick={handleProfileClick}>
            <Avatar
              className={classes.profileAvatar}
              src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : null}
              alt={user.name}
            >
              {!user.profileImage && user.name.charAt(0).toUpperCase()}
            </Avatar>
            <div className={classes.profileInfo}>
              <Typography className={classes.profileName}>{user.name}</Typography>
              <Typography className={classes.profileEmail}>{user.email}</Typography>
            </div>
            <SettingsOutlinedIcon className={classes.profileMenuIcon} />
          </div>
        </div>
      ) : (
        <div className={classes.bottomSection}>
          <Tooltip title="Perfil" placement="right">
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "center", 
                padding: "8px",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onClick={handleProfileClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Avatar
                className={classes.profileAvatar}
                src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : null}
                alt={user.name}
              >
                {!user.profileImage && user.name.charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </Tooltip>
        </div>
      )}

      {activeSubmenu && (
        <Drawer
          className={classes.submenuDrawer}
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
          open={Boolean(activeSubmenu) && submenuOpen}
          onClose={isMobile ? handleCloseSubmenu : undefined}
          classes={{
            paper: classes.submenuDrawerPaperCollapsed,
          }}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              className: classes.mobileBackdrop,
            },
          }}
        >
          <List component="div" disablePadding>
            {renderSubmenu(activeSubmenu)}
          </List>
        </Drawer>
      )}

      <Drawer
        className={classes.profileDrawer}
        anchor="left"
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        classes={{
          paper: classes.profileDrawerPaper,
        }}
        ModalProps={{
          BackdropProps: {
            className: classes.mobileBackdrop,
          },
        }}
      >
        <div className={classes.profileDrawerHeader}>
          <Typography className={classes.profileDrawerTitle}>Minha Conta</Typography>
          <Typography className={classes.profileDrawerSubtitle}>Gerencie suas configurações</Typography>
        </div>

        <div className={classes.profileActions}>
          <div className={classes.profileMenuItem} onClick={handleOpenUserModal}>
            <SettingsOutlinedIcon className={classes.profileMenuItemIcon} />
            <Typography className={classes.profileMenuItemText}>
              {i18n.t("mainDrawer.appBar.user.profile")}
            </Typography>
          </div>

          <div className={classes.logoutButton} onClick={handleLogoutClick}>
            <ExitToAppIcon className={classes.logoutIcon} />
            <Typography className={classes.logoutText}>
            {isMobileSession
              ? i18n.t("mainDrawer.appBar.user.logoutApp", { defaultValue: "Sair do app" })
              : i18n.t("mainDrawer.appBar.user.logout")}
          </Typography>
          </div>
        </div>
      </Drawer>

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
    </>
  );
};

export default MainListItems;