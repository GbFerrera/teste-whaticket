import React, { useState, useEffect, useReducer, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import { AccountCircle } from "@material-ui/icons";
import whatsappIcon from '../../assets/nopicture.png';
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

const backendUrl = getBackendUrl();

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  schedulesButton: {
    borderRadius: 8,
    padding: "6px 16px",
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#059669",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#047857",
    },
  },
  content: {
    padding: "0 24px 16px",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tableHead: {
    backgroundColor: "var(--sidebar-color, #1e293b)",
    "& th": {
      color: "#cbd5e1",
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "none",
      padding: "14px 16px",
    },
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  userAvatar: {
    width: 36,
    height: 36,
  },
  profileChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  actionBtn: {
    minWidth: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
  },
}));

const Users = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const { user: loggedInUser, socket } = useContext(AuthContext);
  const { profileImage } = loggedInUser;
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (loggedInUser) {
      const companyId = loggedInUser.companyId;
      const onCompanyUser = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_USERS", payload: data.user });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_USER", payload: +data.userId });
        }
      };
      socket.on(`company-${companyId}-user`, onCompanyUser);
      return () => {
        socket.off(`company-${companyId}-user`, onCompanyUser);
      };
    }
  }, [socket]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPage) => prevPage + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const renderProfileImage = (user) => {
    if (user.id === loggedInUser.id) {
      return (
        <Avatar
          src={`${backendUrl}/public/company${user.companyId}/user/${profileImage ? profileImage : whatsappIcon}`}
          alt={user.name}
          className={classes.userAvatar}
        />
      );
    }
    if (user.id !== loggedInUser.id) {
      return (
        <Avatar
          src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : whatsappIcon}
          alt={user.name}
          className={classes.userAvatar}
        />
      );
    }
    return <AccountCircle />;
  };

  const filteredUsers = users.filter((user) => user.id !== 1);
  const paginatedItems = filteredUsers.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const getUserTypeLabel = (userType) => {
    if (userType === "admin") return "Administrador";
    if (userType === "manager") return "Gerente";
    if (userType === "attendant") return "Atendente";
    if (userType === "professional") return "Profissional";
    return userType || "";
  };

  const getUserTypeColor = (userType) => {
    if (userType === "admin") return { bg: "#e0f2fe", color: "#0369a1" };
    if (userType === "manager") return { bg: "#fef3c7", color: "#b45309" };
    if (userType === "attendant") return { bg: "#ecfdf3", color: "#047857" };
    if (userType === "professional") return { bg: "#eef2ff", color: "#4338ca" };
    return { bg: "#f3f4f6", color: "#374151" };
  };

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
      {loggedInUser.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <>
          <Box className={classes.header}>
            <Box className={classes.headerLeft}>
              <Box>
                <Typography className={classes.headerTitle}>
                  {i18n.t("users.title")}
                </Typography>
                <Typography className={classes.headerSubtitle}>
                  {filteredUsers.length} usuário(s) cadastrado(s)
                </Typography>
              </Box>
            </Box>
            <Box className={classes.headerRight}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Pesquisar..."
                value={searchParam}
                onChange={handleSearch}
                className={classes.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#999" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                className={classes.schedulesButton}
                startIcon={<EventAvailableIcon />}
                onClick={() => history.push("/user-schedules")}
              >
                Agendas
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenUserModal}
                className={classes.addButton}
              >
                Novo Usuário
              </Button>
            </Box>
          </Box>

          <Box className={classes.content}>
            <Box className={classes.tableWrapper}>
              <Table size="small">
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell style={{ width: 50 }}></TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell align="center">E-mail</TableCell>
                    <TableCell align="center">Tipo</TableCell>
                    <TableCell align="center">Horário</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {loading && users.length === 0 ? (
                    <TableRowSkeleton columns={7} />
                  ) : paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box className={classes.emptyState}>
                          <Typography>Nenhum usuário encontrado</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((user) => (
                      <TableRow
                        key={user.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEditUser(user)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {renderProfileImage(user)}
                        </TableCell>
                        <TableCell>
                          <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#999" }}>
                            ID: {user.id}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{user.email}</TableCell>
                        <TableCell align="center">
                          {user.userType && (
                            <Chip
                              size="small"
                              label={getUserTypeLabel(user.userType)}
                              className={classes.profileChip}
                              style={{
                                backgroundColor: getUserTypeColor(user.userType).bg,
                                color: getUserTypeColor(user.userType).color,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {user.startWork || "—"} - {user.endWork || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" style={{ gap: 4 }}>
                            <UserStatusIcon user={user} />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUser(user);
                                }}
                                style={{ color: "#1976d2" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmModalOpen(true);
                                  setDeletingUser(user);
                                }}
                                style={{ color: "#ef4444" }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {filteredUsers.length > 0 && (
                <Box className={classes.paginationBar}>
                  <Typography variant="body2" style={{ color: "#666" }}>
                    Exibindo {tablePage * rowsPerPage + 1} a{" "}
                    {Math.min((tablePage + 1) * rowsPerPage, filteredUsers.length)} de{" "}
                    {filteredUsers.length} resultado(s)
                  </Typography>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <Button
                      size="small"
                      disabled={tablePage === 0}
                      onClick={() => setTablePage(tablePage - 1)}
                      className={classes.actionBtn}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageIdx = i;
                      if (totalPages > 5) {
                        const start = Math.max(0, Math.min(tablePage - 2, totalPages - 5));
                        pageIdx = start + i;
                      }
                      return (
                        <Button
                          key={pageIdx}
                          size="small"
                          variant={pageIdx === tablePage ? "contained" : "text"}
                          color={pageIdx === tablePage ? "primary" : "default"}
                          onClick={() => setTablePage(pageIdx)}
                          style={{
                            minWidth: 32,
                            borderRadius: 6,
                            fontWeight: pageIdx === tablePage ? 700 : 400,
                          }}
                        >
                          {pageIdx + 1}
                        </Button>
                      );
                    })}
                    <Button
                      size="small"
                      disabled={tablePage >= totalPages - 1}
                      onClick={() => setTablePage(tablePage + 1)}
                      className={classes.actionBtn}
                    >
                      Próximo
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Users;