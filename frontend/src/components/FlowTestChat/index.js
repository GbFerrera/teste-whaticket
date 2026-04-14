import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
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
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 400,
    height: "100vh",
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: "#667eea",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  title: {
    flex: 1,
    fontSize: "16px",
    fontWeight: 600,
  },
  messagesContainer: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: "#f8f9fa",
    minHeight: 400,
  },
  message: {
    marginBottom: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "flex-start",
  },
  userMessage: {
    flexDirection: "row-reverse",
  },
  messageContent: {
    maxWidth: "70%",
    padding: theme.spacing(1.5),
    borderRadius: 12,
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
  },
  userMessageContent: {
    backgroundColor: "#667eea",
    color: "#fff",
    border: "none",
  },
  inputContainer: {
    padding: theme.spacing(2),
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    gap: theme.spacing(1),
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    "&:focus": {
      borderColor: "#667eea",
    },
  },
  sendButton: {
    backgroundColor: "#667eea",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#5a6fd8",
    },
    "&:disabled": {
      backgroundColor: "#ccc",
    },
  },
  avatar: {
    width: 32,
    height: 32,
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#999",
  },
}));

const FlowTestChat = ({ flowId, flowName, open, onClose }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await api.post(`/flowbuilder/test/${flowId}`, {
        message: inputValue,
        contactNumber: "5511999999999",
        contactName: "Usuário Teste",
      });

      if (response.data.responses && Array.isArray(response.data.responses)) {
        response.data.responses.forEach((text, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + index + 1,
              text,
              sender: "bot",
              time: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }]);
          }, index * 800);
        });
      } else if (response.data.response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: response.data.response,
          sender: "bot",
          time: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Erro ao processar mensagem. Tente novamente.",
        sender: "bot",
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.drawer }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        {/* Header */}
        <Box className={classes.header}>
          <IconButton onClick={onClose} style={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
          <AndroidIcon />
          <Typography className={classes.title}>
            Teste: {flowName}
          </Typography>
          <Chip
            label="Versão beta"
            size="small"
            style={{ backgroundColor: "#ff9800", color: "#fff" }}
          />
        </Box>

        {/* Messages */}
        <Box className={classes.messagesContainer}>
          {messages.length === 0 ? (
            <Box className={classes.emptyState}>
              <AndroidIcon style={{ fontSize: 48, marginBottom: 16 }} />
              <Typography>Chat de teste para o fluxo "{flowName}"</Typography>
              <Typography variant="caption">
                Envie uma mensagem para testar
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                className={`${classes.message} ${
                  message.sender === "user" ? classes.userMessage : ""
                }`}
              >
                <Avatar
                  className={classes.avatar}
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
                  <Box
                    className={`${classes.messageContent} ${
                      message.sender === "user" ? classes.userMessageContent : ""
                    }`}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                    {message.time}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          {loading && (
            <Box className={classes.message}>
              <Avatar className={classes.avatar} style={{ backgroundColor: "#e9ecef" }}>
                <AndroidIcon fontSize="small" style={{ color: "#666" }} />
              </Avatar>
              <Box className={classes.messageContent}>
                <Typography variant="body2" style={{ opacity: 0.7 }}>
                  Digitando...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box className={classes.inputContainer}>
          <input
            type="text"
            className={classes.input}
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <IconButton
            className={classes.sendButton}
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FlowTestChat;