import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import clsx from "clsx";
import {
  makeStyles,
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from "@material-ui/core";
import QueueIcon from "@material-ui/icons/Queue";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  Group,
  MoveToInbox as MoveToInboxIcon,
  CheckBox as CheckBoxIcon,
  MessageSharp as MessageSharpIcon,
  AccessTime as ClockIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TextRotateUp,
  TextRotationDown,
} from "@material-ui/icons";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import ToggleButton from "@material-ui/lab/ToggleButton";

import { FilterAltOff, FilterAlt, PlaylistAddCheckOutlined } from "@mui/icons-material";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

import api from "../../services/api";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    overflowX: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    minWidth: "auto",
    width: "auto",
    borderRadius: 0,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: theme.spacing(1),
  },

  tab: {
    minWidth: "auto",
    width: "auto",
    padding: theme.spacing(0.5, 1),
    borderRadius: 0,
    transition: "0.3s",
    borderColor: "#aaa",
    borderWidth: "1px",
    borderStyle: "solid",
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),

    [theme.breakpoints.down("lg")]: {
      fontSize: "0.9rem",
      padding: theme.spacing(0.4, 0.8),
      marginRight: theme.spacing(0.4),
      marginLeft: theme.spacing(0.4),
    },

    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
      padding: theme.spacing(0.3, 0.6),
      marginRight: theme.spacing(0.3),
      marginLeft: theme.spacing(0.3),
    },

    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
  },

  tabPanelItem: {
    minWidth: "33%",
    fontSize: 11,
    marginLeft: 0,
  },

  tabIndicator: {
    height: 6,
    bottom: 0,
    borderRadius: 0,
  },

  tabsBadge: {
    top: "105%",
    right: "55%",
    transform: "translate(45%, 0)",
    whiteSpace: "nowrap",
    borderRadius: "6px",
    padding: "2px 6px",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontSize: "10px",
    fontWeight: 600,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    height: 44,
    background: theme.palette.background.paper,
    display: "flex",
    borderRadius: "8px",
    padding: "6px 12px",
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.text.secondary,
    },
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
    },
  },

  searchIcon: {
    color: theme.palette.text.secondary,
    fontSize: "20px",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 0,
    fontSize: "14px",
    color: theme.palette.text.primary,
    "&::placeholder": {
      color: theme.palette.text.secondary,
    },
  },

  badge: {
    right: "-10px",
  },

  customBadge: {
    right: "-10px",
    backgroundColor: "#f44336",
    color: "#fff",
  },

  show: {
    display: "block",
  },

  hide: {
    display: "none !important",
  },

  closeAllFab: {
    backgroundColor: "red",
    marginBottom: "4px",
    "&:hover": {
      backgroundColor: "darkred",
    },
  },

  speedDial: {
    position: "absolute",
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    "& .MuiFab-root": {
      width: "40px",
      height: "40px",
      marginTop: "4px",
    },
    "& .MuiFab-label": {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },

  dialog: {
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
  },

  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    textAlign: "center",
    padding: theme.spacing(2.5),
    fontSize: "1.1rem",
    fontWeight: 600,
  },

  dialogContent: {
    padding: theme.spacing(3),
    textAlign: "center",
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
  },

  dialogActions: {
    justifyContent: "center",
    padding: theme.spacing(2.5),
    gap: theme.spacing(1.5),
  },

  // Novos estilos para os botões - CLEAN E MODERNOS
  actionButton: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: "8px",
    transition: "all 0.2s ease",
    color: theme.palette.text.secondary,
    backgroundColor: "transparent",
    border: "none",
    padding: 6,
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.08)"
        : "rgba(124, 77, 255, 0.15)",
      color: theme.palette.primary.main,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },

  actionButtonActive: {
    backgroundColor: theme.mode === "light"
      ? "rgba(124, 77, 255, 0.12)"
      : "rgba(124, 77, 255, 0.25)",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.18)"
        : "rgba(124, 77, 255, 0.35)",
    },
  },

  tabButton: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: "8px",
    transition: "all 0.2s ease",
    color: theme.palette.text.secondary,
    backgroundColor: "transparent",
    border: `1.5px solid ${theme.palette.divider}`,
    padding: 6,
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.08)"
        : "rgba(124, 77, 255, 0.15)",
      color: theme.palette.primary.main,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },

  tabButtonActive: {
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
    backgroundColor: theme.mode === "light"
      ? "rgba(124, 77, 255, 0.12)"
      : "rgba(124, 77, 255, 0.25)",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.18)"
        : "rgba(124, 77, 255, 0.35)",
    },
  },

  filterButton: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: "8px",
    transition: "all 0.2s ease",
    color: theme.palette.text.secondary,
    backgroundColor: "transparent",
    padding: 6,
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.08)"
        : "rgba(124, 77, 255, 0.15)",
      color: theme.palette.primary.main,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },

  filterButtonActive: {
    backgroundColor: theme.mode === "light"
      ? "rgba(76, 175, 80, 0.12)"
      : "rgba(76, 175, 80, 0.25)",
    color: "#4CAF50",
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(76, 175, 80, 0.18)"
        : "rgba(76, 175, 80, 0.35)",
    },
  },

  confirmButton: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    padding: "8px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "none",
    boxShadow: "none",
    minWidth: "100px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
      transform: "translateY(-1px)",
    },
  },

  cancelButton: {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    padding: "8px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "none",
    border: `1.5px solid ${theme.palette.divider}`,
    minWidth: "100px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(0, 0, 0, 0.04)"
        : "rgba(255, 255, 255, 0.08)",
      borderColor: theme.palette.text.secondary,
    },
  },
  actionsGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  searchInputHidden: {
    display: "none",
  },
  searchInputVisible: {
    display: "flex",
  },
  queuePopover: {
    "& .MuiPopover-paper": {
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      minWidth: 200,
      maxHeight: 300,
      overflow: "auto",
    },
  },
  queueList: {
    padding: theme.spacing(1),
  },
  queueListItem: {
    borderRadius: 8,
    marginBottom: 2,
    padding: "4px 8px",
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.08)"
        : "rgba(124, 77, 255, 0.15)",
    },
  },
  queueCheckbox: {
    padding: 4,
    "& .MuiSvgIcon-root": {
      fontSize: 18,
    },
  },
  queueColor: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    marginRight: 8,
  },
  queueName: {
    fontSize: 12,
    fontWeight: 500,
  },
  queueSelectWrapper: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontSize: "12px",
      backgroundColor: "transparent",
      border: `1.5px solid ${theme.palette.divider}`,
      transition: "all 0.2s ease",
      minHeight: 32,
      height: 32,
      "&:hover": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}15`,
      },
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "4px 10px",
      color: theme.palette.text.primary,
      fontSize: "11px",
    },
    "& .MuiChip-root": {
      height: "20px",
      fontSize: "10px",
      fontWeight: 500,
      borderRadius: "4px",
      backgroundColor: theme.mode === "light"
        ? "rgba(124, 77, 255, 0.12)"
        : "rgba(124, 77, 255, 0.25)",
      color: theme.palette.primary.main,
      "& .MuiChip-deleteIcon": {
        color: theme.palette.primary.main,
        fontSize: "14px",
        "&:hover": {
          color: theme.palette.primary.dark,
        },
      },
    },
    "& .MuiSelect-icon": {
      color: theme.palette.text.secondary,
      transition: "all 0.2s ease",
      fontSize: 18,
    },
    "& .MuiOutlinedInput-root:hover .MuiSelect-icon": {
      color: theme.palette.primary.main,
    },
  },
}));


const TicketsManagerTabs = () => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [sortTickets, setSortTickets] = useState(false);

  const searchInputRef = useRef();
  const [searchOnMessages, setSearchOnMessages] = useState(false);

  const { user } = useContext(AuthContext);
  const { profile } = user;
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
  const { tabOpen, setTabOpen } = useContext(TicketsContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [filter, setFilter] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isHoveredAll, setIsHoveredAll] = useState(false);
  const [isHoveredNew, setIsHoveredNew] = useState(false);
  const [isHoveredResolve, setIsHoveredResolve] = useState(false);
  const [isHoveredOpen, setIsHoveredOpen] = useState(false);
  const [isHoveredClosed, setIsHoveredClosed] = useState(false);
  const [isHoveredSort, setIsHoveredSort] = useState(false);

  const [isFilterActive, setIsFilterActive] = useState(false);
  
  // Garante que as filas do usuário sejam selecionadas automaticamente quando carregadas
  useEffect(() => {
    if (user?.queues?.length > 0 && selectedQueueIds.length === 0) {
      const queueIds = user.queues.map((q) => q.id);
      setSelectedQueueIds(queueIds);
    }
  }, [user?.queues]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [queueAnchorEl, setQueueAnchorEl] = useState(null);
  const isQueuePopoverOpen = Boolean(queueAnchorEl);

  useEffect(() => {
    setSelectedQueuesMessage(selectedQueueIds);
  }, [selectedQueueIds]);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN" || user.allUserChat.toUpperCase() === "ENABLED") {
      setShowAllTickets(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
    setForceSearch(!forceSearch);
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
      setTab("open");
      return;
    } else if (tab !== "search") {
      handleFilter();
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleBack = () => {
    history.push("/tickets");
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        selectedQueueIds,
      });
      handleSnackbarClose();
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleSelectTicket = (ticket) => {
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (tags.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSelectedTags(tags);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (users.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedUsers(users);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (whatsapp.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedWhatsapp(whatsapp);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    clearTimeout(searchTimeout);

    if (statusFilter.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSelectedStatus(statusFilter);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleFilter = () => {
    if (filter) {
      setFilter(false);
      setTab("open");
    } else setFilter(true);
    setTab("search");
  };

  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const handleVisibility = () => {
    setHidden((prevHidden) => !prevHidden);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosed = () => {
    setOpen(false);
  };

  const tooltipTitleStyle = {
    fontSize: "10px",
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      {isSearchVisible && (
        <div className={classes.serachInputWrapper}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.searchInput}
            inputRef={searchInputRef}
            placeholder={i18n.t("tickets.search.placeholder")}
            type="search"
            onChange={handleSearch}
            autoFocus
          />
          <Tooltip placement="top" title="Marque para pesquisar também nos conteúdos das mensagens (mais lento)">
            <div>
              <Switch
                size="small"
                checked={searchOnMessages}
                onChange={(e) => { setSearchOnMessages(e.target.checked) }}
              />
            </div>
          </Tooltip>
          <Tooltip placement="top" title={isFilterActive ? "Desativar filtros" : "Ativar filtros"}>
            <IconButton
              className={clsx(classes.filterButton, isFilterActive && classes.filterButtonActive)}
              onClick={() => {
                setIsFilterActive((prevState) => !prevState);
                handleFilter();
              }}
            >
              {isFilterActive ? <FilterAlt /> : <FilterAltOff />}
            </IconButton>
          </Tooltip>
          <Tooltip placement="top" title="Fechar busca">
            <IconButton
              className={classes.filterButton}
              onClick={() => {
                setIsSearchVisible(false);
                setSearchParam("");
                setTab("open");
              }}
            >
              <CancelIcon style={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {filter === true && (
        <>
          <TagsFilter onFiltered={handleSelectedTags} />
          <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
          <StatusFilter onFiltered={handleSelectedStatus} />
          {profile === "admin" && (
            <>
              <UsersFilter onFiltered={handleSelectedUsers} />
            </>
          )}
        </>
      )}

      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <div className={classes.actionsGroup}>
              {/* Show All Tickets Button */}
              <Can
                role={user.allUserChat === 'enabled' && user.profile === 'user' ? 'admin' : user.profile}
                perform="tickets-manager:showall"
                yes={() => (
                  <Badge
                    color="primary"
                    invisible={!isHoveredAll}
                    badgeContent={"Todos"}
                    classes={{ badge: classes.tabsBadge }}
                  >
                      <ToggleButton
                        onMouseEnter={() => setIsHoveredAll(true)}
                        onMouseLeave={() => setIsHoveredAll(false)}
                        className={clsx(classes.actionButton, showAllTickets && classes.actionButtonActive)}
                        value="uncheck"
                        selected={showAllTickets}
                        onChange={() =>
                          setShowAllTickets((prevState) => !prevState)
                        }
                      >
                        {showAllTickets ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </ToggleButton>
                  </Badge>
                )}
              />

              {/* Close All Dialog */}
              <Dialog
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                classes={{ paper: classes.dialog }}
                maxWidth="xs"
                fullWidth
              >
                <DialogTitle className={classes.dialogTitle}>
                  {i18n.t("tickets.inbox.closedAllTickets")}
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                  <Typography>
                    {i18n.t("Esse processo irá fechar todos os Tickets em Aberto, deseja continuar ?")}
                  </Typography>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                  <Button
                    startIcon={<CheckIcon />}
                    className={classes.confirmButton}
                    onClick={CloseAllTicket}
                  >
                    {i18n.t("tickets.inbox.yes")}
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    className={classes.cancelButton}
                    onClick={handleSnackbarClose}
                  >
                    {i18n.t("tickets.inbox.no")}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* New Ticket Button */}
              <Badge
                color="primary"
                invisible={!isHoveredNew}
                badgeContent={i18n.t("tickets.inbox.newTicket")}
                classes={{ badge: classes.tabsBadge }}
              >
                  <IconButton
                    onMouseEnter={() => setIsHoveredNew(true)}
                    onMouseLeave={() => setIsHoveredNew(false)}
                    className={classes.actionButton}
                    onClick={() => {
                      setNewTicketModalOpen(true);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
              </Badge>

              {/* Close All Button - Admin Only */}
              {user.profile === "admin" && (
                <Badge
                  color="primary"
                  invisible={!isHoveredResolve}
                  badgeContent={i18n.t("tickets.inbox.closedAll")}
                  classes={{ badge: classes.tabsBadge }}
                >
                    <IconButton
                      onMouseEnter={() => setIsHoveredResolve(true)}
                      onMouseLeave={() => setIsHoveredResolve(false)}
                      className={classes.actionButton}
                      onClick={handleSnackbarOpen}
                    >
                      <PlaylistAddCheckOutlined />
                    </IconButton>
                </Badge>
              )}

              {/* Open Tickets Tab Button */}
              <Badge
                invisible={
                  !(
                    tab === "open" &&
                    !isHoveredAll &&
                    !isHoveredNew &&
                    !isHoveredResolve &&
                    !isHoveredClosed &&
                    !isHoveredSort
                  ) && !isHoveredOpen
                }
                badgeContent={i18n.t("tickets.inbox.open")}
                classes={{ badge: classes.tabsBadge }}
              >
                  <IconButton
                    onMouseEnter={() => {
                      setIsHoveredOpen(true);
                      setHoveredButton("open");
                    }}
                    onMouseLeave={() => {
                      setIsHoveredOpen(false);
                      setHoveredButton(null);
                    }}
                    className={clsx(classes.tabButton, tab === "open" && classes.tabButtonActive)}
                    onClick={() => handleChangeTab(null, "open")}
                  >
                    <MoveToInboxIcon />
                  </IconButton>
              </Badge>

              {/* Closed Tickets Tab Button */}
              <Badge
                color="primary"
                invisible={
                  !(
                    tab === "closed" &&
                    !isHoveredAll &&
                    !isHoveredNew &&
                    !isHoveredResolve &&
                    !isHoveredOpen &&
                    !isHoveredSort
                  ) && !isHoveredClosed
                }
                badgeContent={i18n.t("tickets.inbox.resolverd")}
                classes={{ badge: classes.tabsBadge }}
              >
                  <IconButton
                    onMouseEnter={() => {
                      setIsHoveredClosed(true);
                      setHoveredButton("closed");
                    }}
                    onMouseLeave={() => {
                      setIsHoveredClosed(false);
                      setHoveredButton(null);
                    }}
                    className={clsx(classes.tabButton, tab === "closed" && classes.tabButtonActive)}
                    onClick={() => handleChangeTab(null, "closed")}
                  >
                    <CheckBoxIcon />
                  </IconButton>
              </Badge>

              {/* Sort Button */}
              {tab !== "closed" && tab !== "search" && (
                <Badge
                  invisible={
                    !isHoveredSort ||
                    isHoveredAll ||
                    isHoveredNew ||
                    isHoveredResolve ||
                    isHoveredOpen ||
                    isHoveredClosed
                  }
                  badgeContent={!sortTickets ? "Crescente" : "Decrescente"}
                  classes={{ badge: classes.tabsBadge }}
                >
                    <ToggleButton
                      onMouseEnter={() => setIsHoveredSort(true)}
                      onMouseLeave={() => setIsHoveredSort(false)}
                      className={clsx(classes.actionButton, sortTickets && classes.actionButtonActive)}
                      value="uncheck"
                      selected={sortTickets}
                      onChange={() =>
                        setSortTickets((prevState) => !prevState)
                      }
                    >
                      {!sortTickets ? (
                        <TextRotateUp />
                      ) : (
                        <TextRotationDown />
                      )}
                    </ToggleButton>
                </Badge>
              )}

              {/* Search Button */}
              <Tooltip placement="top" title="Buscar">
                <IconButton
                  className={clsx(classes.tabButton, isSearchVisible && classes.tabButtonActive)}
                  onClick={() => setIsSearchVisible((prev) => !prev)}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>

              {/* Queue Button */}
              <Tooltip placement="top" title="Filas">
                <IconButton
                  className={clsx(classes.tabButton, isQueuePopoverOpen && classes.tabButtonActive)}
                  onClick={(e) => setQueueAnchorEl(e.currentTarget)}
                >
                  <Badge
                    badgeContent={selectedQueueIds.length}
                    color="primary"
                    invisible={selectedQueueIds.length === user?.queues?.length}
                    max={99}
                  >
                    <QueueIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Queue Popover */}
              <Popover
                open={isQueuePopoverOpen}
                anchorEl={queueAnchorEl}
                onClose={() => setQueueAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                className={classes.queuePopover}
              >
                <List className={classes.queueList}>
                  {user?.queues?.map((queue) => (
                    <ListItem
                      key={queue.id}
                      button
                      dense
                      className={classes.queueListItem}
                      onClick={() => {
                        const isSelected = selectedQueueIds.includes(queue.id);
                        if (isSelected) {
                          setSelectedQueueIds(selectedQueueIds.filter((id) => id !== queue.id));
                        } else {
                          setSelectedQueueIds([...selectedQueueIds, queue.id]);
                        }
                      }}
                    >
                      <ListItemIcon style={{ minWidth: 32 }}>
                        <Checkbox
                          edge="start"
                          checked={selectedQueueIds.includes(queue.id)}
                          className={classes.queueCheckbox}
                          style={{ color: queue.color }}
                        />
                      </ListItemIcon>
                      <span
                        className={classes.queueColor}
                        style={{ backgroundColor: queue.color }}
                      />
                      <ListItemText
                        primary={queue.name}
                        primaryTypographyProps={{ className: classes.queueName }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>
            </div>
          </Grid>
        </Grid>
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={openCount}
                    color="primary"
                  >
                    <MessageSharpIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.assignedHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"open"}
            name="open"
            classes={{ root: classes.tabPanelItem }}
          />

          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={pendingCount}
                    color="primary"
                  >
                    <ClockIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.pendingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"pending"}
            name="pending"
            classes={{ root: classes.tabPanelItem }}
          />

          {user.allowGroup && (
            <Tab
              label={
                <Grid container alignItems="center" justifyContent="center">
                  <Grid item>
                    <Badge
                      overlap="rectangular"
                      classes={{ badge: classes.customBadge }}
                      badgeContent={groupingCount}
                      color="primary"
                    >
                      <Group
                        style={{
                          fontSize: 18,
                        }}
                      />
                    </Badge>
                  </Grid>
                  <Grid item>
                    <Typography
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {i18n.t("ticketsList.groupingHeader")}
                    </Typography>
                  </Grid>
                </Grid>
              }
              value={"group"}
              name="group"
              classes={{ root: classes.tabPanelItem }}
            />
          )}
        </Tabs>

        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            setTabOpen={setTabOpen}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            showAll={user.profile === "admin" || user.allUserChat === 'enabled' ? showAllTickets : false}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            setTabOpen={setTabOpen}
          />
          {user.allowGroup && (
            <TicketsList
              status="group"
              showAll={showAllTickets}
              sortTickets={sortTickets ? "ASC" : "DESC"}
              selectedQueueIds={selectedQueueIds}
              updateCount={(val) => setGroupingCount(val)}
              style={applyPanelStyle("group")}
              setTabOpen={setTabOpen}
            />
          )}
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          setTabOpen={setTabOpen}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        {profile === "admin" && (
          <>
            <TicketsList
              statusFilter={selectedStatus}
              searchParam={searchParam}
              showAll={showAllTickets}
              tags={selectedTags}
              users={selectedUsers}
              selectedQueueIds={selectedQueueIds}
              whatsappIds={selectedWhatsapp}
              forceSearch={forceSearch}
              searchOnMessages={searchOnMessages}
              status="search"
            />
          </>
        )}

        {profile === "user" && (
          <TicketsList
            statusFilter={selectedStatus}
            searchParam={searchParam}
            showAll={false}
            tags={selectedTags}
            selectedQueueIds={selectedQueueIds}
            whatsappIds={selectedWhatsapp}
            forceSearch={forceSearch}
            searchOnMessages={searchOnMessages}
            status="search"
          />
        )}
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;