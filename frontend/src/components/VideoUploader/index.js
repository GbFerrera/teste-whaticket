import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Card,
  CardContent,
  CardMedia,
} from "@material-ui/core";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  uploadArea: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.dragover": {
      borderColor: theme.palette.secondary.main,
      backgroundColor: theme.palette.action.selected,
    },
  },
  hiddenInput: {
    display: "none",
  },
  previewCard: {
    marginTop: theme.spacing(2),
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
  },
  videoPreview: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  thumbnailPreview: {
    width: "100%",
    height: 120,
    objectFit: "cover",
  },
  fileInfo: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(0.5),
  },
}));

const VideoUploader = ({
  onVideoSelect,
  onThumbnailSelect,
  videoFile,
  thumbnailFile,
  disabled = false,
}) => {
  const classes = useStyles();
  const videoInputRef = useRef();
  const thumbnailInputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "video/mp4") {
        toast.error("Apenas arquivos MP4 são permitidos");
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast.error("Arquivo muito grande. Máximo 100MB");
        return;
      }
      onVideoSelect(file);
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são permitidas para thumbnail");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      onThumbnailSelect(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const videoFile = files.find(file => file.type === "video/mp4");
    const imageFile = files.find(file => file.type.startsWith("image/"));
    
    if (videoFile) {
      if (videoFile.size > 100 * 1024 * 1024) {
        toast.error("Vídeo muito grande. Máximo 100MB");
        return;
      }
      onVideoSelect(videoFile);
    }
    
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      onThumbnailSelect(imageFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        className={`${classes.uploadArea} ${dragOver ? "dragover" : ""}`}
        onClick={() => !disabled && videoInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <UploadIcon style={{ fontSize: 48, color: "primary" }} />
        <Typography variant="h6" gutterBottom>
          Arraste e solte ou clique para selecionar
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Vídeo MP4 (máx. 100MB) e Thumbnail opcional (máx. 5MB)
        </Typography>
      </Box>

      {/* Hidden Inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4"
        onChange={handleVideoChange}
        className={classes.hiddenInput}
        disabled={disabled}
      />
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        onChange={handleThumbnailChange}
        className={classes.hiddenInput}
        disabled={disabled}
      />

      {/* Video Preview */}
      {videoFile && (
        <Card className={classes.previewCard}>
          <IconButton
            className={classes.deleteButton}
            onClick={() => onVideoSelect(null)}
            disabled={disabled}
          >
            <DeleteIcon />
          </IconButton>
          
          <CardMedia
            component="video"
            className={classes.videoPreview}
            src={URL.createObjectURL(videoFile)}
            controls
          />
          
          <CardContent>
            <Box className={classes.fileInfo}>
              <Typography variant="body2">
                <VideoIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
                <strong>Vídeo:</strong> {videoFile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tamanho: {formatFileSize(videoFile.size)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Thumbnail Preview */}
      {thumbnailFile && (
        <Card className={classes.previewCard}>
          <IconButton
            className={classes.deleteButton}
            onClick={() => onThumbnailSelect(null)}
            disabled={disabled}
          >
            <DeleteIcon />
          </IconButton>
          
          <CardMedia
            component="img"
            className={classes.thumbnailPreview}
            src={URL.createObjectURL(thumbnailFile)}
            alt="Thumbnail preview"
          />
          
          <CardContent>
            <Box className={classes.fileInfo}>
              <Typography variant="body2">
                <ImageIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
                <strong>Thumbnail:</strong> {thumbnailFile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tamanho: {formatFileSize(thumbnailFile.size)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Additional Upload Buttons */}
      <Box mt={2} display="flex" gap={1}>
        <Button
          variant="outlined"
          startIcon={<VideoIcon />}
          onClick={() => videoInputRef.current?.click()}
          disabled={disabled}
        >
          Selecionar Vídeo
        </Button>
        <Button
          variant="outlined"
          startIcon={<ImageIcon />}
          onClick={() => thumbnailInputRef.current?.click()}
          disabled={disabled}
        >
          Selecionar Thumbnail
        </Button>
      </Box>
    </Box>
  );
};

export default VideoUploader;
