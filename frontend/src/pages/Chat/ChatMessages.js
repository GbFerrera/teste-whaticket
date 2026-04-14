import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Modal,
  Button,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon"; // Ícone de emoji
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Estilo do editor
import EmojiPicker from "emoji-picker-react"; // Seletor de emojis
import GetAppIcon from "@material-ui/icons/GetApp"; // Ícone de download

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

import waBackground from '../../assets/wa-background.png'; // Importe a imagem de fundo

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
    backgroundImage: `url(${waBackground})`, // Adicione a imagem de fundo aqui
    backgroundSize: "auto", // Mantém o tamanho original da imagem
    backgroundRepeat: "repeat", // Repete a imagem tanto horizontal quanto verticalmente
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.5)", // Overlay branco semi-transparente
      pointerEvents: "none", // Permite interação com os elementos abaixo
    },
  },
  inputArea: {
    position: "relative",
    height: "auto",
    display: "flex",
    alignItems: "flex-start", // Alinha os itens ao topo
    padding: "20px",
  },
  editor: {
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px solid #ccc",
    flex: 1, // Ocupa o espaço restante
    marginLeft: "10px", // Espaço entre os botões e o editor
    "& .ql-toolbar": {
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      borderBottom: "1px solid #ccc",
    },
    "& .ql-container": {
      borderBottomLeftRadius: "4px",
      borderBottomRightRadius: "4px",
      height: "150px", // Altura do editor
    },
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column", // Organiza os botões em uma coluna
    alignItems: "center", // Centraliza os botões horizontalmente
    gap: "10px", // Espaço entre os botões
  },
  boxLeft: {
    padding: "10px 10px 5px",
    margin: "10px",
    position: "relative",
    backgroundColor: "#ffffff",
    color: "#303030",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    zIndex: 1, // Garante que as mensagens fiquem acima do overlay
  },
  boxRight: {
    padding: "10px 10px 5px",
    margin: "10px 10px 10px auto",
    position: "relative",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    textAlign: "right",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    zIndex: 1, // Garante que as mensagens fiquem acima do overlay
  },
  emojiPicker: {
    position: "absolute",
    bottom: "100%",
    left: 0, // Posiciona o seletor de emojis à esquerda
    zIndex: 10,
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    textAlign: "center",
  },
  modalImage: {
    maxWidth: "90%",
    maxHeight: "80vh",
    marginBottom: theme.spacing(2),
  },
  downloadButton: {
    marginTop: theme.spacing(2),
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Estado para controlar a exibição do seletor de emojis
  const [selectedImage, setSelectedImage] = useState(null); // Estado para controlar a imagem selecionada para ampliar

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  const handleSend = () => {
    if (contentMessage.trim() !== "") {
      handleSendMessage(contentMessage);
      setContentMessage("");
    }
  };

  // Função para adicionar emoji ao conteúdo da mensagem
  const handleEmojiClick = (emojiObject) => {
    setContentMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false); // Fecha o seletor de emojis após a seleção
  };

  // Função para abrir a imagem no modal
  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Função para baixar a imagem
  const handleDownloadImage = () => {
    if (selectedImage) {
      const link = document.createElement("a");
      link.href = selectedImage;
      link.download = "image.png"; // Nome do arquivo para download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Configuração da barra de ferramentas do editor
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"], // Negrito, Itálico, Sublinhado, Taxado
      ["image"], // Inserir imagem
    ],
  };

  // Efeito para adicionar eventos de clique nas imagens após o render
  useEffect(() => {
    const images = document.querySelectorAll(".messageContent img");
    images.forEach((img) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => handleImageClick(img.src));
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("click", () => handleImageClick(img.src));
      });
    };
  }, [messages]);

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            if (item.senderId === user.id) {
              return (
                <Box key={key} className={classes.boxRight}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  <div
                    className="messageContent"
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            } else {
              return (
                <Box key={key} className={classes.boxLeft}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  <div
                    className="messageContent"
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            }
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <div className={classes.buttonContainer}>
          <IconButton
           onClick={() => setShowEmojiPicker(!showEmojiPicker)}
           style={{
           backgroundColor: "#40BFFF", // Azul claro
           padding: "8px",
           borderRadius: "10px",
          }}
          >
            <InsertEmoticonIcon style={{ color: "#fff" }} />
          </IconButton>
          <IconButton
           style={{
           backgroundColor: "#4ec24e", // Verde
           padding: "8px",
           borderRadius: "10px",
           }}
            onClick={handleSend}
          >
            <SendIcon style={{ color: "#fff" }}/>
          </IconButton>
        </div>
        {showEmojiPicker && (
          <div className={classes.emojiPicker}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <ReactQuill
          value={contentMessage}
          onChange={setContentMessage}
          className={classes.editor}
          modules={modules} // Aplica a configuração da barra de ferramentas
        />
      </div>

      {/* Modal para exibir a imagem ampliada */}
      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        className={classes.modal}
      >
        <div className={classes.modalContent}>
          <img
            src={selectedImage}
            alt="Ampliada"
            className={classes.modalImage}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadImage}
            style={{
              color: "white",
              backgroundColor: "#437db5",
              boxShadow: "none",
              borderRadius: 0,
            }}
          >
            Baixar Imagem
          </Button>
        </div>
      </Modal>
    </Paper>
  );
}