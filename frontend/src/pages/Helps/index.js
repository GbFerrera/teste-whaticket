import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Button,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import VideoModal from "../../components/VideoModal";

import {
  listTutorialVideos,
  showTutorialVideo,
  getVideoThumbnailFallback,
} from "../../services/tutorialVideoService";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#e8eaf6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 24,
      color: "#3f51b5",
    },
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
    gap: "12px",
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 260,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
    },
  },
  content: {
    flex: 1,
    padding: "16px 24px",
  },
  cardsWrapper: {
    marginTop: theme.spacing(2),
  },
  cardsGrid: {
    marginTop: theme.spacing(1),
  },
  videoCard: {
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.1)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  videoCardMedia: {
    height: 130,
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "0.95rem",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardActions: {
    padding: theme.spacing(0.5, 1.5, 1.5),
    justifyContent: "flex-end",
  },
  skeletonCard: {
    height: 240,
    borderRadius: 16,
    backgroundColor: theme.palette.action.hover,
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    "& svg": {
      fontSize: 64,
      marginBottom: 16,
      opacity: 0.5,
    },
  },
}));

const Helps = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tutorialVideos, setTutorialVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);

  const fetchTutorialVideos = async () => {
    setLoading(true);
    try {
      const { data } = await listTutorialVideos({
        searchParam,
        pageNumber: 1,
      });
      setTutorialVideos(data.tutorialVideos || []);
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      toast.error("Erro ao carregar vídeos tutoriais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorialVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam]);

  const isYoutubeUrl = (url) => {
    if (!url) return false;
    return /youtu\.be|youtube\.com/.test(url);
  };

  const handlePreviewVideo = async (video) => {
    try {
      await showTutorialVideo(video.id, true);
      setTutorialVideos((prev) =>
        prev.map((v) =>
          v.id === video.id
            ? { ...v, viewsCount: (v.viewsCount || 0) + 1 }
            : v
        )
      );
    } catch (error) {
      console.error("Erro ao registrar visualização:", error);
    }

    setPreviewVideo({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl:
        video.thumbnailUrl || getVideoThumbnailFallback(video.videoUrl) || undefined,
      isYoutube: isYoutubeUrl(video.videoUrl),
    });
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerIcon}>
            <VideoLibraryIcon />
          </Box>
          <Box>
            <Typography className={classes.headerTitle}>Ajuda</Typography>
            <Typography className={classes.headerSubtitle}>
              {tutorialVideos.length} {tutorialVideos.length === 1 ? "vídeo disponível" : "vídeos disponíveis"}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => history.push("/messages-api")}
          >
            Ir para Documentação
          </Button>
          <TextField
            placeholder="Buscar vídeo..."
            variant="outlined"
            size="small"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.cardsWrapper}>
          {loading ? (
            <Grid container spacing={3} className={classes.cardsGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
                  <div className={classes.skeletonCard} />
                </Grid>
              ))}
            </Grid>
          ) : tutorialVideos.length === 0 ? (
            <Box className={classes.emptyState}>
              <VideoLibraryIcon />
              <Typography>Nenhum vídeo tutorial encontrado</Typography>
            </Box>
          ) : (
            <Grid container spacing={3} className={classes.cardsGrid}>
              {tutorialVideos.map((video) => {
                const thumbnail =
                  video.thumbnailUrl ||
                  getVideoThumbnailFallback(video.videoUrl) ||
                  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60";

                return (
                  <Grid item xs={12} sm={6} md={3} key={video.id}>
                    <Card className={classes.videoCard}>
                      <CardMedia
                        className={classes.videoCardMedia}
                        image={thumbnail}
                        title={video.title}
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography className={classes.cardTitle} title={video.title}>
                          {video.title}
                        </Typography>
                      </CardContent>
                      <CardActions className={classes.cardActions}>
                        <Tooltip title="Assistir">
                          <IconButton
                            color="primary"
                            onClick={() => handlePreviewVideo(video)}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>

      <VideoModal
        open={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={previewVideo?.title}
        description={previewVideo?.description}
        videoUrl={previewVideo?.videoUrl}
        thumbnailUrl={previewVideo?.thumbnailUrl}
        isYoutube={previewVideo?.isYoutube}
      />
    </Box>
  );
};

export default Helps;