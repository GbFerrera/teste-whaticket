import React, { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Forward as ForwardIcon,
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "100%",
      height: "100%",
      margin: 0,
      backgroundColor: "#0b141a",
    },
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "rgba(11, 20, 26, 0.9)",
    zIndex: 10,
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    color: "#e9edef",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  content: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 100px",
  },
  mediaContainer: {
    maxWidth: "100%",
    maxHeight: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  media: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  navigationButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#e9edef",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    width: "48px",
    height: "48px",
  },
  prevButton: {
    left: "24px",
  },
  nextButton: {
    right: "24px",
  },
  counter: {
    position: "absolute",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(11, 20, 26, 0.8)",
    color: "#e9edef",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  thumbnailStrip: {
    position: "absolute",
    bottom: "70px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
    maxWidth: "80%",
    overflowX: "auto",
    padding: "8px",
    backgroundColor: "rgba(11, 20, 26, 0.8)",
    borderRadius: "8px",
    "&::-webkit-scrollbar": {
      height: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderRadius: "3px",
    },
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
    cursor: "pointer",
    opacity: 0.6,
    transition: "opacity 0.2s",
    border: "2px solid transparent",
    "&:hover": {
      opacity: 1,
    },
  },
  thumbnailActive: {
    opacity: 1,
    border: "2px solid #00a884",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "rgba(11, 20, 26, 0.9)",
    gap: "16px",
    zIndex: 10,
  },
  actionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    color: "#e9edef",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px 16px",
    transition: "background-color 0.2s",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  actionIcon: {
    fontSize: "24px",
    color: "#e9edef",
  },
  actionLabel: {
    fontSize: "12px",
    color: "#8696a0",
  },
}));

const MediaGalleryModal = ({ 
  open, 
  onClose, 
  medias, 
  initialIndex = 0,
  onDelete,
  onForward 
}) => {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!open) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [open, currentIndex, medias]);

  if (!medias || medias.length === 0) return null;

  const currentMedia = medias[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : medias.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < medias.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    if (currentMedia?.mediaUrl) {
      window.open(currentMedia.mediaUrl, "_blank");
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && currentMedia) {
      onDelete(currentMedia);
    }
  };

  const handleForwardClick = () => {
    if (onForward && currentMedia) {
      onForward(currentMedia);
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth={false}
      fullScreen
    >
      <div className={classes.header}>
        <div className={classes.headerInfo}>
          <Typography style={{ color: "#e9edef", fontSize: "16px", fontWeight: 500 }}>
            {currentMedia?.fromMe ? "Você" : currentMedia?.contactName || "Contato"}
          </Typography>
          <Typography style={{ color: "#8696a0", fontSize: "13px" }}>
            {formatDate(currentMedia?.createdAt)}
          </Typography>
        </div>
        <div className={classes.headerActions}>
          <IconButton
            onClick={handleDownload}
            className={classes.iconButton}
            size="small"
            title="Download"
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            className={classes.iconButton}
            size="small"
            title="Fechar"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>

      <div className={classes.content}>
        <div className={classes.mediaContainer}>
          {currentMedia?.mediaType === "image" ? (
            <img
              src={currentMedia.mediaUrl}
              alt=""
              className={classes.media}
            />
          ) : currentMedia?.mediaType === "video" ? (
            <video
              src={currentMedia.mediaUrl}
              controls
              autoPlay
              className={classes.media}
            />
          ) : null}
        </div>

        {medias.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              className={`${classes.navigationButton} ${classes.prevButton}`}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              className={`${classes.navigationButton} ${classes.nextButton}`}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}
      </div>

      {medias.length > 1 && (
        <>
          <div className={classes.counter}>
            {currentIndex + 1} / {medias.length}
          </div>

          <div className={classes.thumbnailStrip}>
            {medias.map((media, index) => (
              <img
                key={media.id}
                src={media.mediaUrl}
                alt=""
                className={`${classes.thumbnail} ${
                  index === currentIndex ? classes.thumbnailActive : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer com botões de ação */}
      <div className={classes.footer}>
        <IconButton
          onClick={handleForwardClick}
          className={classes.actionButton}
          disabled={!onForward}
        >
          <ForwardIcon className={classes.actionIcon} />
          <Typography className={classes.actionLabel}>Encaminhar</Typography>
        </IconButton>

        <IconButton
          onClick={handleDownload}
          className={classes.actionButton}
        >
          <DownloadIcon className={classes.actionIcon} />
          <Typography className={classes.actionLabel}>Baixar</Typography>
        </IconButton>

        <IconButton
          onClick={handleDeleteClick}
          className={classes.actionButton}
          disabled={!onDelete}
        >
          <DeleteIcon className={classes.actionIcon} />
          <Typography className={classes.actionLabel}>Apagar</Typography>
        </IconButton>
      </div>
    </Dialog>
  );
};

export default MediaGalleryModal;
