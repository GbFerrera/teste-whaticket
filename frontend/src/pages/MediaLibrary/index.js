import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import FolderIcon from "@material-ui/icons/Folder";

import { toast } from "react-toastify";
import {
  getMediaFolders,
  deleteMediaFolder
} from "../../services/mediaLibraryService";
import MediaFolderModal from "../../components/MediaFolderModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.5)
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5)
  },
  titleIcon: {
    fontSize: 36,
    color: theme.palette.primary.main
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 520
  },
  searchField: {
    flex: 1,
    minWidth: 200,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8
    }
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  },
  content: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    overflow: "hidden"
  },
  list: {
    display: "flex",
    flexDirection: "column"
  },
  listItem: {
    display: "flex",
    gap: theme.spacing(2),
    padding: theme.spacing(2.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none"
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column"
    }
  },
  itemAvatar: {
    width: 56,
    height: 56,
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText
  },
  itemInfo: {
    flex: 1,
    minWidth: 0
  },
  itemNameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    flexWrap: "wrap"
  },
  itemName: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  itemDescription: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: 14
  },
  itemMeta: {
    marginTop: theme.spacing(1),
    fontSize: 13,
    color: theme.palette.text.secondary,
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2)
  },
  actionsColumn: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center"
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`
  }
}));

const formatDate = (value) => {
  if (!value) return "Sem registro";
  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch (err) {
    return value;
  }
};

const MediaLibrary = () => {
  const classes = useStyles();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getMediaFolders({ search: searchParam });
      setFolders(Array.isArray(data) ? data : data?.folders || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [searchParam]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchFolders();
    }, 400);

    return () => clearTimeout(delay);
  }, [fetchFolders]);

  const handleOpenModal = (folder = null) => {
    setSelectedFolder(folder);
    setFolderModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedFolder(null);
    setFolderModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    fetchFolders();
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;

    try {
      await deleteMediaFolder(deletingFolder.id);
      toast.success("Pasta excluída com sucesso!");
      fetchFolders();
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingFolder(null);
      setConfirmModalOpen(false);
    }
  };

  return (
    <Box className={classes.root}>
      <MediaFolderModal
        open={folderModalOpen}
        onClose={handleCloseModal}
        folder={selectedFolder}
        onSuccess={handleModalSuccess}
      />

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Excluir pasta"
        onConfirm={handleDeleteFolder}
      >
        Tem certeza que deseja excluir a pasta{" "}
        <strong>{deletingFolder?.name}</strong>? Todos os arquivos dentro dela
        serão removidos.
      </ConfirmationModal>

      <Box className={classes.header}>
        <Box className={classes.titleContainer}>
          <FolderIcon className={classes.titleIcon} />
          <Box>
            <Typography className={classes.title}>Biblioteca de Mídias</Typography>
            <Typography className={classes.subtitle}>
              Organize arquivos em pastas. {folders.length} pasta(s) encontrada(s).
            </Typography>
          </Box>
        </Box>

        <Box className={classes.actions}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Buscar pastas por nome ou descrição"
            value={searchParam}
            onChange={(event) => setSearchParam(event.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => handleOpenModal()}
          >
            Nova pasta
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        {folders.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <FolderIcon style={{ fontSize: 48, marginBottom: 12 }} color="disabled" />
            <Typography variant="h6">Nenhuma pasta encontrada</Typography>
            <Typography variant="body2">
              Crie a primeira pasta para começar a organizar seus arquivos.
            </Typography>
          </Box>
        ) : (
          <Box className={classes.list}>
            {folders.map((folder) => (
              <Box key={folder.id} className={classes.listItem}>
                <Avatar className={classes.itemAvatar}>
                  {folder.name?.charAt(0)?.toUpperCase() || "P"}
                </Avatar>

                <Box className={classes.itemInfo}>
                  <Box className={classes.itemNameRow}>
                    <Typography className={classes.itemName}>
                      {folder.name || "Pasta sem nome"}
                    </Typography>
                  </Box>
                  {folder.description && (
                    <Typography className={classes.itemDescription}>
                      {folder.description}
                    </Typography>
                  )}
                  <Box className={classes.itemMeta}>
                    <span>Atualizada em: {formatDate(folder.updatedAt)}</span>
                    <span>Criada em: {formatDate(folder.createdAt)}</span>
                  </Box>
                </Box>

                <Box className={classes.actionsColumn}>
                  <Tooltip title="Editar pasta">
                    <IconButton size="small" onClick={() => handleOpenModal(folder)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingFolder(folder);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {loading && (
          <Box className={classes.loadingBox}>
            <CircularProgress size={20} />
            <Typography variant="body2">Carregando pastas...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaLibrary;
