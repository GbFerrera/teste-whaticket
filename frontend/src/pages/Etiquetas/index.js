import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { toast } from "react-toastify";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
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
import PeopleIcon from "@material-ui/icons/People";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ContactTagListModal from "../../components/ContactTagListModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS":
      const tag = action.payload;
      const tagIndex = state.findIndex((s) => s.id === tag.id);

      if (tagIndex !== -1) {
        state[tagIndex] = tag;
        return [...state];
      } else {
        return [tag, ...state];
      }
    case "DELETE_TAGS":
      const tagId = action.payload;
      return state.filter((tag) => tag.id !== tagId);
    case "RESET":
      return [];
    default:
      return state;
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
  contactLink: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    color: "#1976d2",
    "&:hover": {
      textDecoration: "underline",
    },
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

const Tags = () => {
  const classes = useStyles();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const { user, socket } = useContext(AuthContext);

  const [selectedTagContacts, setSelectedTagContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTagName, setSelectedTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchMoreTags = async () => {
      try {
        const { data } = await api.get("/tags/", {
          params: { searchParam, pageNumber, kanban: 0 },
        });
        dispatch({ type: "LOAD_TAGS", payload: data.tags });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreTags();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);

    return () => {
      socket.off(`company${user.companyId}-tag`, onCompanyTags);
    };
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleShowContacts = (contacts, tag) => {
    if (!contacts || contacts.length === 0) return;
    setSelectedTagContacts(contacts);
    setContactModalOpen(true);
    setSelectedTagName(tag);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedTagContacts([]);
    setSelectedTagName("");
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const paginatedItems = tags.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(tags.length / rowsPerPage);

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      {contactModalOpen && (
        <ContactTagListModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          tag={selectedTagName}
        />
      )}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />

      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>
              {i18n.t("tags.title")}
            </Typography>
            <Typography className={classes.headerSubtitle}>
              {tags.length} {tags.length === 1 ? "tag cadastrada" : "tags cadastradas"}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            variant="outlined"
            size="small"
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
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>Tag</TableCell>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Cor</TableCell>
                <TableCell align="center">Contatos</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading && tags.length === 0 ? (
                <TableRowSkeleton columns={5} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhuma tag encontrada</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((tag) => (
                  <TableRow
                    key={tag.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditTag(tag)}
                  >
                    <TableCell>
                      <Chip
                        label={tag.name}
                        style={{
                          backgroundColor: tag.color,
                          color: "#fff",
                          fontWeight: 600,
                          textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{tag.id}</TableCell>
                    <TableCell align="center">
                      <Box
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: tag.color || "#4B5563",
                          margin: "0 auto",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={tag?.contacts?.length > 0 ? "Ver contatos" : ""}>
                        <Box
                          className={tag?.contacts?.length > 0 ? classes.contactLink : undefined}
                          style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: 4 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowContacts(tag?.contacts, tag);
                          }}
                        >
                          <PeopleIcon style={{ fontSize: 16 }} />
                          <span>
                            {tag?.contacts?.length || 0}{" "}
                            {tag?.contacts?.length === 1 ? "contato" : "contatos"}
                          </span>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTag(tag);
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
                              setDeletingTag(tag);
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

          {tags.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, tags.length)} de{" "}
                {tags.length} resultado(s)
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
    </Box>
  );
};

export default Tags;
