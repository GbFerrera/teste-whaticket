import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  Avatar,
  Fab,
  Drawer,
  Chip,
} from "@material-ui/core";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Android as AndroidIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8f9fa",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: "#667eea",
    color: "#fff",
  },
  headerTitle: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  messagesContainer: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: "#f8f9fa",
  },
  messageContainer: {
    display: "flex",
    marginBottom: theme.spacing(2),
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
  userMessage: {
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: theme.spacing(1.5),
    borderRadius: 16,
    wordBreak: "break-word",
  },
  userBubble: {
    backgroundColor: "#667eea",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #e0e0e0",
    borderBottomLeftRadius: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
  },
  inputContainer: {
    display: "flex",
    padding: theme.spacing(2),
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
    gap: theme.spacing(1),
  },
  inputField: {
    flex: 1,
  },
  statusChip: {
    marginLeft: theme.spacing(1),
    fontSize: "0.7rem",
    height: 20,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60%",
    color: "#999",
    "& svg": {
      fontSize: 48,
      marginBottom: theme.spacing(2),
    },
  },
}));

const FlowTestPage = () => {
  const classes = useStyles();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flowName, setFlowName] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Carregar informações do fluxo
    const loadFlowInfo = async () => {
      try {
        const response = await api.get(`/flowbuilder/${id}`);
        setFlowName(response.data.flow?.name || `Fluxo ${id}`);
      } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
        setFlowName(`Fluxo ${id}`);
      }
    };

    if (id) {
      loadFlowInfo();
    }
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Enviar mensagem para testar o fluxo
      const response = await api.post(`/flowbuilder/test/${id}`, {
        message: inputMessage,
        contactNumber: "5511999999999", // Número de teste
      });

      const botResponse = {
        id: Date.now() + 1,
        text: response.data.response || "Resposta do fluxo processada com sucesso!",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Erro ao testar fluxo:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Erro ao processar mensagem. Verifique se o fluxo está configurado corretamente.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Erro ao testar fluxo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className={classes.container}>
      {/* Header */}
      <Box className={classes.header}>
        <IconButton onClick={() => window.close()} style={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
        <Box className={classes.headerTitle}>
          <AndroidIcon />
          <Typography variant="h6" noWrap>
            Teste: {flowName}
          </Typography>
          <Chip
            label="Teste"
            size="small"
            className={classes.statusChip}
            style={{ backgroundColor: "#ffc107", color: "#333" }}
          />
        </Box>
      </Box>

      {/* Mensagens */}
      <Box className={classes.messagesContainer}>
        {messages.length === 0 ? (
          <Box className={classes.emptyState}>
            <AndroidIcon />
            <Typography variant="body2">
              Chat de teste para o fluxo "{flowName}"
            </Typography>
            <Typography variant="caption">
              Envie uma mensagem para testar o funcionamento
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <Box
                key={message.id}
                className={`${classes.messageContainer} ${
                  message.sender === "user" ? classes.userMessage : ""
                }`}
              >
                <Avatar
                  className={classes.messageAvatar}
                  style={{
                    backgroundColor:
                      message.sender === "user" ? "#667eea" : "#e9ecef",
                    color: message.sender === "user" ? "#fff" : "#666",
                  }}
                >
                  {message.sender === "user" ? (
                    <PersonIcon fontSize="small" />
                  ) : (
                    <AndroidIcon fontSize="small" />
                  )}
                </Avatar>
                <Box>
                  <Paper
                    className={`${classes.messageBubble} ${
                      message.sender === "user"
                        ? classes.userBubble
                        : classes.botBubble
                    }`}
                    elevation={0}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    style={{
                      marginTop: 4,
                      fontSize: "0.7rem",
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <Box className={classes.messageContainer}>
                <Avatar
                  className={classes.messageAvatar}
                  style={{ backgroundColor: "#e9ecef", color: "#666" }}
                >
                  <AndroidIcon fontSize="small" />
                </Avatar>
                <Paper className={classes.botBubble} elevation={0}>
                  <Typography variant="body2" style={{ opacity: 0.7 }}>
                    Processando...
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input */}
      <Box className={classes.inputContainer}>
        <TextField
          className={classes.inputField}
          variant="outlined"
          size="small"
          placeholder="Digite sua mensagem de teste..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{ backgroundColor: "#667eea", color: "#fff" }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default FlowTestPage;
