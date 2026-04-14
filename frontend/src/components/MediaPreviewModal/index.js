import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  makeStyles,
  Typography,
  TextField,
} from "@material-ui/core";
import { 
  Close as CloseIcon, 
  Send as SendIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      maxWidth: "600px",
      width: "100%",
      backgroundColor: "#1f2c33",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#2a3942",
    borderBottom: "1px solid #3b4a54",
  },
  closeButton: {
    color: "#8696a0",
  },
  content: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#0b141a",
  },
  previewContainer: {
    width: "100%",
    maxHeight: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px",
    backgroundColor: "#000",
    borderRadius: "8px",
    overflow: "hidden",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "400px",
    objectFit: "contain",
  },
  previewAudio: {
    width: "100%",
    padding: "16px",
  },
  previewVideo: {
    maxWidth: "100%",
    maxHeight: "400px",
  },
  fileInfo: {
    color: "#8696a0",
    padding: "16px",
    textAlign: "center",
  },
  actions: {
    padding: "16px",
    backgroundColor: "#2a3942",
    borderTop: "1px solid #3b4a54",
    justifyContent: "space-between",
  },
  sendButton: {
    backgroundColor: "#00a884",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#008f6f",
    },
  },
  filesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "8px",
    width: "100%",
    marginBottom: "16px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  fileCard: {
    position: "relative",
    width: "100%",
    height: "120px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#2a3942",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  fileCardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fileCardDoc: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    textAlign: "center",
  },
  deleteButton: {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "4px",
    "&:hover": {
      backgroundColor: "rgba(244,67,54,0.8)",
    },
  },
  fileCount: {
    color: "#8696a0",
    fontSize: "14px",
    marginBottom: "8px",
  },
  captionInput: {
    width: "100%",
    marginTop: "16px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#2a3942",
      color: "#e9edef",
      "& fieldset": {
        borderColor: "#3b4a54",
      },
      "&:hover fieldset": {
        borderColor: "#4a5964",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00a884",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#8696a0",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#00a884",
    },
    "& .MuiInputBase-input": {
      color: "#e9edef",
    },
  },
}));

const MediaPreviewModal = ({ open, onClose, file, files, onSend }) => {
  const classes = useStyles();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
    } else if (file) {
      setSelectedFiles([file]);
    } else {
      setSelectedFiles([]);
    }
    // Limpa a legenda ao abrir o modal
    setCaption("");
  }, [file, files, open]);

  const handleSend = () => {
    const payload = {
      files: selectedFiles.length === 1 ? selectedFiles[0] : [...selectedFiles],
      caption: caption.trim()
    };

    setSelectedFiles([]);
    setCaption("");
    onClose();
    onSend(payload);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setCaption("");
    onClose();
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      handleClose();
    }
  };

  const renderFileCard = (file, index) => {
    const fileType = file.type.split("/")[0];
    const fileUrl = URL.createObjectURL(file);

    return (
      <div key={index} className={classes.fileCard}>
        <IconButton
          size="small"
          className={classes.deleteButton}
          onClick={() => handleRemoveFile(index)}
        >
          <DeleteIcon style={{ fontSize: 18 }} />
        </IconButton>

        {fileType === "image" ? (
          <img
            src={fileUrl}
            alt={file.name}
            className={classes.fileCardImage}
          />
        ) : fileType === "video" ? (
          <video
            src={fileUrl}
            className={classes.fileCardImage}
          />
        ) : (
          <div className={classes.fileCardDoc}>
            <FileIcon style={{ fontSize: 40, color: "#8696a0" }} />
            <Typography
              style={{
                fontSize: 11,
                color: "#e9edef",
                marginTop: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {file.name}
            </Typography>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (selectedFiles.length === 0) return null;

    // Se for apenas um arquivo, mostra preview grande
    if (selectedFiles.length === 1) {
      const file = selectedFiles[0];
      const fileType = file.type.split("/")[0];
      const fileUrl = URL.createObjectURL(file);

      switch (fileType) {
        case "image":
          return (
            <img
              src={fileUrl}
              alt="Preview"
              className={classes.previewImage}
            />
          );
        case "video":
          return (
            <video
              src={fileUrl}
              controls
              className={classes.previewVideo}
            />
          );
        case "audio":
          return (
            <audio
              src={fileUrl}
              controls
              className={classes.previewAudio}
            />
          );
        default:
          return (
            <div className={classes.fileInfo}>
              <p>📄 {file.name}</p>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          );
      }
    }

    // Múltiplos arquivos - mostra grid
    return (
      <>
        <Typography className={classes.fileCount}>
          {selectedFiles.length} arquivo(s) selecionado(s)
        </Typography>
        <div className={classes.filesGrid}>
          {selectedFiles.map((file, index) => renderFileCard(file, index))}
        </div>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classes.dialog}
      maxWidth="md"
    >
      <div className={classes.header}>
        <span style={{ color: "#e9edef", fontSize: "16px", fontWeight: 500 }}>
          {selectedFiles.length > 1 ? `Enviar ${selectedFiles.length} arquivos` : "Pré-visualização"}
        </span>
        <IconButton
          onClick={handleClose}
          className={classes.closeButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>

      <DialogContent className={classes.content}>
        <div className={classes.previewContainer}>
          {renderPreview()}
        </div>
        <TextField
          className={classes.captionInput}
          placeholder="Adicione uma legenda..."
          multiline
          rows={2}
          rowsMax={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          variant="outlined"
          size="small"
        />
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={handleClose} style={{ color: "#8696a0" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          className={classes.sendButton}
          startIcon={<SendIcon />}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaPreviewModal;
