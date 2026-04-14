import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    maxWidth: "900px",
    width: "90%",
    maxHeight: "80vh",
    borderRadius: 16,
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  closeButton: {
    color: theme.palette.grey[500],
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  dialogContent: {
    padding: 0,
    background: "#000",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    position: "relative",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "contain",
  },
  iframe: {
    width: "100%",
    height: "500px",
    border: "none",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#1976d2",
    width: 80,
    height: 80,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "white",
      transform: "translate(-50%, -50%) scale(1.1)",
    },
  },
  thumbnail: {
    width: "100%",
    height: "500px",
    objectFit: "cover",
    cursor: "pointer",
  },
  description: {
    padding: theme.spacing(2, 3),
    color: theme.palette.text.secondary,
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  dialogActions: {
    padding: theme.spacing(1, 3, 2),
    justifyContent: "flex-end",
  },
  actionButton: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 500,
  },
}));

const VideoModal = ({ 
  open, 
  onClose, 
  title, 
  description, 
  videoUrl, 
  thumbnailUrl,
  isYoutube = false 
}) => {
  const classes = useStyles();
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [open]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    
    // Extrair ID do YouTube de diferentes formatos de URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    
    return url;
  };

  const renderVideoContent = () => {
    if (!videoUrl) {
      return (
        <Box className={classes.videoContainer}>
          <Typography variant="body1" color="textSecondary">
            Vídeo não disponível
          </Typography>
        </Box>
      );
    }

    if (isYoutube) {
      if (!isPlaying && thumbnailUrl) {
        return (
          <Box className={classes.videoContainer}>
            <img 
              src={thumbnailUrl} 
              alt={title}
              className={classes.thumbnail}
              onClick={handlePlay}
            />
            <Box className={classes.playButton} onClick={handlePlay}>
              <PlayArrowIcon style={{ fontSize: 40, marginLeft: 4 }} />
            </Box>
          </Box>
        );
      }
      
      return (
        <iframe
          className={classes.iframe}
          src={getYouTubeEmbedUrl(videoUrl)}
          title={title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    // Para vídeos diretos (MP4, etc.)
    return (
      <video 
        key={videoUrl}
        className={classes.video}
        controls
        autoPlay={isPlaying}
        poster={thumbnailUrl}
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      classes={{ paper: classes.dialogPaper }}
      aria-labelledby="video-modal-title"
    >
      <DialogTitle className={classes.dialogTitle} disableTypography>
        <Typography className={classes.title} id="video-modal-title">
          {title || "Vídeo Tutorial"}
        </Typography>
        <IconButton
          className={classes.closeButton}
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {renderVideoContent()}
      </DialogContent>

      {description && (
        <Box className={classes.description}>
          <Typography variant="body2">
            {description}
          </Typography>
        </Box>
      )}

      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleClose}
          className={classes.actionButton}
          variant="outlined"
          color="primary"
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoModal;
