import React, { useState, useEffect, useContext } from "react";
import {
  IconButton,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
} from "@material-ui/icons";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import TutorialVideoModal from "../../components/TutorialVideoModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  listTutorialVideos,
  deleteTutorialVideo,
  getVideoThumbnailFallback,
} from "../../services/tutorialVideoService";
import VideoModal from "../../components/VideoModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
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
  statusChip: {
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

const TutorialVideos = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const isAuthorized = user && user.companyId === 1 && user.profile === "admin";

  const [tutorialVideos, setTutorialVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    if (isAuthorized) {
      fetchTutorialVideos();
    }
  }, [isAuthorized, searchParam]);

  const fetchTutorialVideos = async () => {
    setLoading(true);
    try {
      const { data } = await listTutorialVideos({
        searchParam,
        pageNumber: 1,
      });
      setTutorialVideos(data.tutorialVideos);
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      toast.error("Erro ao carregar vídeos tutoriais");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (video = null) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setModalOpen(false);
  };

  const handleVideoSuccess = () => {
    fetchTutorialVideos();
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    try {
      await deleteTutorialVideo(videoToDelete.id, false);
      toast.success("Vídeo removido com sucesso!");
      fetchTutorialVideos();
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast.error("Erro ao remover vídeo");
    } finally {
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const handlePreviewVideo = (video) => {
    setPreviewVideo({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || getVideoThumbnailFallback(video.videoUrl) || undefined,
      isYoutube: true,
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredVideos = tutorialVideos;
  const paginatedVideos = filteredVideos.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filteredVideos.length / rowsPerPage);

  if (!isAuthorized) {
    return (
      <Box className={classes.root}>
        <Box className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body1">
            Esta página é restrita apenas ao administrador da empresa principal.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      {/* Modal de Criação/Edição */}
      <TutorialVideoModal
        open={modalOpen}
        onClose={handleCloseModal}
        tutorialVideo={selectedVideo}
        onSuccess={handleVideoSuccess}
      />

      {/* Preview usando VideoModal */}
      <VideoModal
        open={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={previewVideo?.title}
        description={previewVideo?.description}
        videoUrl={previewVideo?.videoUrl}
        thumbnailUrl={previewVideo?.thumbnailUrl}
        isYoutube={previewVideo?.isYoutube}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover o vídeo "{videoToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            Esta ação pode ser desfeita reativando o vídeo posteriormente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Vídeos Tutoriais</Typography>
            <Typography className={classes.headerSubtitle}>
              {filteredVideos.length} vídeo(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar vídeo..."
            variant="outlined"
            size="small"
            className={classes.searchField}
            value={searchParam}
            onChange={(e) => {
              setSearchParam(e.target.value);
              setTablePage(0);
            }}
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
            onClick={() => handleOpenModal()}
            className={classes.addButton}
          >
            Novo Vídeo
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Views</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Autor</TableCell>
                <TableCell align="center">Criado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={8} />
              ) : paginatedVideos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum vídeo tutorial encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVideos.map((video) => (
                  <TableRow
                    key={video.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenModal(video)}
                  >
                    <TableCell>{video.id}</TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {video.title || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        style={{
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={video.description}
                      >
                        {video.description || "Sem descrição"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{video.viewsCount || 0}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={video.isActive ? "Ativo" : "Inativo"}
                        className={classes.statusChip}
                        style={{
                          backgroundColor: video.isActive ? "#dcfce7" : "#fee2e2",
                          color: video.isActive ? "#166534" : "#991b1b",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {video.user?.name || "—"}
                    </TableCell>
                    <TableCell align="center">{formatDate(video.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Assistir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewVideo(video);
                            }}
                            style={{ color: "#0ea5e9" }}
                          >
                            <PlayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(video);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(video);
                            }}
                            style={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredVideos.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredVideos.length)} de{" "}
                {filteredVideos.length} resultado(s)
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
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant={i === tablePage ? "contained" : "text"}
                    color={i === tablePage ? "primary" : "default"}
                    onClick={() => setTablePage(i)}
                    style={{
                      minWidth: 32,
                      borderRadius: 6,
                      fontWeight: i === tablePage ? 700 : 400,
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
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

export default TutorialVideos;
