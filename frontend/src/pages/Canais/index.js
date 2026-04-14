import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import {
  Edit,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  Search as SearchIcon,
  Link as LinkIcon,
  Message as MessengerIcon,
} from "@material-ui/icons";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from "../../utils/formatSerializedId";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import moment from "moment";
import QrCodeIcon from "@mui/icons-material/QrCode";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AddIcon from "@material-ui/icons/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import RepeatIcon from "@mui/icons-material/Repeat";
import PowerIcon from "@mui/icons-material/Power";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ChannelModal from "../../HubEcosystem/components/ChannelModal";
import notificame_logo from "../../assets/notificame_logo.png";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import FacebookInstagramModal from "../../components/FacebookInstagramModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    ...theme.scrollbarStyles
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
    flexWrap: "wrap",
    gap: 12
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "#e8f5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 28,
      color: "#43a047"
    }
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a"
  },
  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: 4
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  addButton: {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 0,
    "&:hover": {
      backgroundColor: "#333",
      transform: "scale(1.05)"
    },
    transition: "all 0.2s ease"
  },
  ghostButton: {
    borderRadius: 999,
    border: "1px solid #d0d0d0",
    color: "#333",
    padding: "8px 16px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.8rem",
    "&:hover": {
      borderColor: "#1a1a1a",
      color: "#1a1a1a",
      backgroundColor: "transparent"
    }
  },
  searchField: {
    minWidth: 200,
    "& .MuiInputBase-root": {
      backgroundColor: "#fff",
      borderRadius: 8,
      border: "1px solid #e0e0e0",
      padding: "4px 12px",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: "#e0e0e0"
      },
      "&.Mui-focused": {
        borderColor: "#e0e0e0"
      },
      "&::before, &::after": {
        display: "none"
      }
    },
    "& .MuiInputBase-input": {
      padding: "6px 0",
      "&::placeholder": {
        color: "#9e9e9e",
        opacity: 1
      }
    }
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px 24px",
    gap: 16,
    minHeight: 0
  },
  listWrapper: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingBottom: 20
  },
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
    gap: 16,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 20px 32px rgba(15,23,42,0.12)"
    }
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 28
    }
  },
  cardInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: "0.85rem",
    color: "#555"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600
  },
  statusConnected: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32"
  },
  statusDisconnected: {
    backgroundColor: "#ffebee",
    color: "#c62828"
  },
  statusOpening: {
    backgroundColor: "#fff3e0",
    color: "#ef6c00"
  },
  statusQrcode: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0"
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    "&:hover": {
      backgroundColor: "#bbdefb"
    }
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    "&:hover": {
      backgroundColor: "#ffcdd2"
    }
  },
  qrButton: {
    backgroundColor: "#e8f5e9",
    color: "#43a047",
    "&:hover": {
      backgroundColor: "#c8e6c9"
    }
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "40px 0",
    justifyContent: "center"
  },
  emptyState: {
    borderRadius: 16,
    backgroundColor: "#fff",
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
    "& svg": {
      fontSize: 48,
      marginBottom: 12,
      color: "#d9d9d9"
    }
  },
  importCard: {
    backgroundColor: "#fff3e0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366" }} />;
    case "whatsapp_official":
      return <WhatsApp style={{ color: "#128C7E" }} />;
    default:
      return "error";
  }
};

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [modalChannel, setModalChannel] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hubChannelModalOpen, setHubChannelModalOpen] = useState(false);
  const [fbIgModalOpen, setFbIgModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const { handleLogout } = useContext(AuthContext);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    channel: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [planConfig, setPlanConfig] = useState(false);

  const { user, socket } = useContext(AuthContext);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const filteredConnections = whatsApps.filter((conn) =>
    conn.name.toLowerCase().includes(searchParam)
  );

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var before = moment(moment().format()).isBefore(user.company.dueDate);

  // Se a empresa estiver ativa, permite acesso mesmo com fatura vencida
  if (before !== true && !user.company.status) {
    handleLogout();
  }

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    const channel = `importMessages-${user.companyId}`;

    const handler = (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        // O WhatsAppsContext já atualiza automaticamente via socket
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    };

    socket.on(channel, handler);

    return () => {
      socket.off(channel, handler);
    };
  }, [socket, user.companyId, whatsApps]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setModalChannel("whatsapp");
    setWhatsAppModalOpen(true);
  };

  const handleOpenWhatsAppOfficialModal = () => {
    console.log("Abrindo modal WhatsApp Oficial");
    setSelectedWhatsApp(null);
    setModalChannel("whatsapp_official");
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
    setModalChannel(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditConnection = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setModalChannel(whatsApp.channel);
    
    // Abrir modal específico baseado no canal
    if (whatsApp.channel === "facebook" || whatsApp.channel === "instagram") {
      setFbIgModalOpen(true);
    } else {
      setWhatsAppModalOpen(true);
    }
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenConfirmationModal = (action, whatsAppId, channel) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
        channel: channel,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
        channel: channel,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
        channel: "",
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        if (confirmModalInfo.channel === "whatsapp") {
          await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
        } else {
          await api.put(`/whatsapp/${confirmModalInfo.whatsAppId}`, {
            status: "DISCONNECTED",
          });
        }
        toast.success('Conexão desconectada com sucesso!');
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        const endpoint = confirmModalInfo.channel === "whatsapp_official" ? `/whatsapp-official/${confirmModalInfo.whatsAppId}` : `/whatsapp/${confirmModalInfo.whatsAppId}`;
        await api.delete(endpoint);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
    setConfirmModalOpen(false);
  };

  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id, whatsApp.channel);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && whatsApp.channel === "whatsapp" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                startIcon={<QrCodeIcon />}
                size="small"
                variant="contained"
                style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px",
                }}
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && whatsApp.channel === "whatsapp" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<RepeatIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#4ec24e",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>{" "}
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#8A2BE2",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && whatsApp.channel === "whatsapp_official" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                startIcon={<PowerIcon />}
                size="small"
                variant="contained"
                style={{
                  color: "white",
                  backgroundColor: "#128C7E",
                  boxShadow: "none",
                  borderRadius: "5px",
                }}
                onClick={() => handleStartWhatsAppSession(whatsApp.id)}
              >
                Conectar
              </Button>
            )}
          />
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<LogoutIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#db6565",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    handleOpenConfirmationModal(
                      "disconnect",
                      whatsApp.id,
                      whatsApp.channel
                    );
                  }}
                >
                  {i18n.t("connections.buttons.disconnect")}
                </Button>

                {renderImportButton(whatsApp)}
              </>
            )}
          />
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree style={{ color: "#4ec24e" }} />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const restartWhatsapps = async () => {
    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONNECTED":
        return { class: classes.statusConnected, label: "Conectado" };
      case "DISCONNECTED":
        return { class: classes.statusDisconnected, label: "Desconectado" };
      case "OPENING":
        return { class: classes.statusOpening, label: "Conectando..." };
      case "qrcode":
        return { class: classes.statusQrcode, label: "QR Code" };
      case "TIMEOUT":
      case "PAIRING":
        return { class: classes.statusOpening, label: "Timeout" };
      default:
        return { class: classes.statusDisconnected, label: status };
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "facebook":
        return <MessengerIcon style={{ color: "#3b5998", fontSize: 28 }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", fontSize: 28 }} />;
      case "whatsapp_official":
        return <WhatsApp style={{ color: "#128C7E", fontSize: 28 }} />;
      case "whatsapp":
      default:
        return <WhatsApp style={{ color: "#25d366", fontSize: 28 }} />;
    }
  };

  const getChannelBg = (channel) => {
    switch (channel) {
      case "facebook":
        return "#e7f3ff";
      case "instagram":
        return "#fce4ec";
      case "whatsapp_official":
        return "#e6f7f2";
      case "whatsapp":
      default:
        return "#e8f5e9";
    }
  };

  if (user.profile === "user" && user.allowConnections === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <Box className={classes.root}>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        channel={modalChannel}
      />
      <FacebookInstagramModal
        open={fbIgModalOpen}
        onClose={() => {
          setFbIgModalOpen(false);
          setSelectedWhatsApp(null);
        }}
        whatsAppId={!qrModalOpen && fbIgModalOpen && selectedWhatsApp?.id}
      />
      <ChannelModal
        open={hubChannelModalOpen}
        onClose={() => setHubChannelModalOpen(false)}
      />

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <LinkIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>
              Conexões
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {whatsApps.length} conexões configuradas
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerActions}>
          <TextField
            className={classes.searchField}
            placeholder="Pesquisar..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#9e9e9e", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            className={classes.ghostButton}
            startIcon={<RestartAltIcon style={{ fontSize: 18 }} />}
            onClick={restartWhatsapps}
          >
            Reiniciar
          </Button>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Can
                  role={user.profile}
                  perform="connections-page:addConnection"
                  yes={() => (
                    <>
                      <IconButton
                        className={classes.addButton}
                        {...bindTrigger(popupState)}
                      >
                        <AddIcon />
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem
                          disabled={planConfig?.plan?.useWhatsapp ? false : true}
                          onClick={() => {
                            handleOpenWhatsAppModal();
                            popupState.close();
                          }}
                        >
                          <WhatsApp fontSize="small" style={{ marginRight: 10, color: "#25D366" }} />
                          WhatsApp
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleOpenWhatsAppOfficialModal();
                            popupState.close();
                          }}
                        >
                          <WhatsApp fontSize="small" style={{ marginRight: 10, color: "#128C7E" }} />
                          WhatsApp Oficial
                        </MenuItem>
                        <MenuItem onClick={() => { setHubChannelModalOpen(true); popupState.close(); }}>
                          <img src={notificame_logo} alt="NotificaMe Hub" style={{ width: 16, height: 16, marginRight: 10, marginLeft: 2 }} />
                          NotificaMe Hub
                        </MenuItem>
                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="13.0"
                          scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                          callback={responseFacebook}
                          render={(renderProps) => (
                            <MenuItem onClick={renderProps.onClick}>
                              <Facebook fontSize="small" style={{ marginRight: 10, color: "#3b5998" }} />
                              Facebook
                            </MenuItem>
                          )}
                        />
                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="13.0"
                          scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                          callback={responseInstagram}
                          render={(renderProps) => (
                            <MenuItem onClick={renderProps.onClick}>
                              <Instagram fontSize="small" style={{ marginRight: 10, color: "#e1306c" }} />
                              Instagram
                            </MenuItem>
                          )}
                        />
                      </Menu>
                    </>
                  )}
                />
              </React.Fragment>
            )}
          </PopupState>
        </Box>
      </Box>

      <Box className={classes.content}>
        {statusImport?.all && (
          <Box className={classes.importCard}>
            <CircularProgress size={24} />
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {statusImport?.this === -1 ? i18n.t("connections.buttons.preparing") : i18n.t("connections.buttons.importing")}
              </Typography>
              {statusImport?.this !== -1 && (
                <Typography variant="body2" color="textSecondary">
                  {`${i18n.t("connections.typography.processed")} ${statusImport?.this} ${i18n.t("connections.typography.in")} ${statusImport?.all}`}
                </Typography>
              )}
            </Box>
            {statusImport?.this !== -1 && (
              <CircularProgressWithLabel value={(statusImport?.this / statusImport?.all) * 100} />
            )}
          </Box>
        )}

        <Box className={classes.listWrapper}>
          {loading ? (
            <Box className={classes.loadingBox}>
              <CircularProgress size={24} />
              <Typography variant="body2">Carregando conexões...</Typography>
            </Box>
          ) : filteredConnections.length === 0 ? (
            <Box className={classes.emptyState}>
              <LinkIcon />
              <Typography>Nenhuma conexão encontrada</Typography>
            </Box>
          ) : (
            filteredConnections.map((whatsApp) => {
              const statusInfo = getStatusBadge(whatsApp.status);
              return (
                <Box key={whatsApp.id} className={classes.card}>
                  <Box
                    className={classes.channelIcon}
                    style={{ backgroundColor: getChannelBg(whatsApp.channel) }}
                  >
                    {getChannelIcon(whatsApp.channel)}
                  </Box>
                  <Box className={classes.cardInfo}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {whatsApp.name}
                      {whatsApp.channel === "facebook" && (
                        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#3b5998", fontWeight: 500 }}>
                          <Facebook style={{ fontSize: 14, verticalAlign: 'middle' }} /> Facebook
                        </span>
                      )}
                      {whatsApp.channel === "instagram" && (
                        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#e1306c", fontWeight: 500 }}>
                          <Instagram style={{ fontSize: 14, verticalAlign: 'middle' }} /> Instagram
                        </span>
                      )}
                      {whatsApp.isDefault && (
                        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: green[500], fontWeight: 500 }}>
                          (Padrão)
                        </span>
                      )}
                    </Typography>
                    <Box className={classes.metaRow}>
                      {whatsApp.channel === "whatsapp" && (
                        <>
                          <span>
                            {whatsApp.number
                              ? formatSerializedId(whatsApp.number)
                              : "Sem número"}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}</span>
                    </Box>
                    <Box style={{ marginTop: 4 }}>
                      <span className={`${classes.statusBadge} ${statusInfo.class}`}>
                        {renderStatusToolTips(whatsApp)}
                        {statusInfo.label}
                      </span>
                    </Box>
                  </Box>
                  <Box className={classes.cardActions}>
                    {renderActionButtons(whatsApp)}
                    <Can
                      role={user.profile}
                      perform="connections-page:addConnection"
                      yes={() => (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              className={`${classes.actionButton} ${classes.editButton}`}
                              onClick={() => handleEditConnection(whatsApp)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              className={`${classes.actionButton} ${classes.deleteButton}`}
                              onClick={() => handleOpenConfirmationModal("delete", whatsApp.id, whatsApp.channel)}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    />
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Connections;
