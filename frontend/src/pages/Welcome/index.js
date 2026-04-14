import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  CssBaseline,
  Card,
  CardContent,
  Grid,
  Fade,
  CircularProgress,
} from "@material-ui/core";
import {
  CheckCircle,
  PlayArrow,
  ArrowForward,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import wallfundo from "../../assets/f002.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  
  leftPanel: (props) => ({
    flex: 1,
    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${props.backgroundImage || wallfundo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }),

  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },

  videoContainer: {
    width: "100%",
    maxWidth: "800px",
    aspectRatio: "16/9",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    marginBottom: theme.spacing(4),
    position: "relative",
    backgroundColor: "#000",
  },

  videoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    position: "relative",
    cursor: "pointer",
    "&:hover .playButton": {
      transform: "scale(1.1)",
    },
  },

  playButton: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },

  playIcon: {
    fontSize: 40,
    color: "#1e3c72",
    marginLeft: 4,
  },

  welcomeContent: {
    textAlign: "center",
    maxWidth: 600,
  },

  welcomeTitle: {
    fontSize: "3.5rem",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: theme.spacing(2),
    lineHeight: 1.2,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  welcomeSubtitle: {
    fontSize: "1.25rem",
    color: "#6b7280",
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
  },

  accessButton: {
    padding: theme.spacing(2, 6),
    fontSize: "1.125rem",
    fontWeight: 600,
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: 50,
    textTransform: "none",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.6)",
      backgroundColor: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
    },
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },

  loadingText: {
    marginTop: theme.spacing(2),
    color: "#6b7280",
    fontSize: "1.125rem",
  },

  mobileContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: theme.spacing(4),
    textAlign: "center",
  },
}));

const Welcome = () => {
  const history = useHistory();
  const classes = useStyles({ backgroundImage: wallfundo });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        history.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        history.push("/login");
        return;
      }

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    };

    checkAuth();
  }, [history]);

  const handlePlayVideo = () => {
    // Abrir vídeo do YouTube ou tutorial
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  };

  const handleAccessPanel = () => {
    history.push("/canais");
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CssBaseline />
        <CircularProgress size={60} thickness={4} />
        <Typography className={classes.loadingText}>
          Preparando seu ambiente...
        </Typography>
      </div>
    );
  }

  const isMobile = window.innerWidth <= 960;

  if (isMobile) {
    return (
      <div className={classes.mobileContainer}>
        <CssBaseline />
        <div className={classes.videoContainer}>
          <div className={classes.videoPlaceholder} onClick={handlePlayVideo}>
            <div className={classes.playButton}>
              <PlayArrow className={classes.playIcon} />
            </div>
          </div>
        </div>
        
        <div className={classes.welcomeContent}>
          <Typography variant="h3" className={classes.welcomeTitle}>
            Bem-vindo!
          </Typography>
          <Typography variant="h6" className={classes.welcomeSubtitle}>
            {user?.name || "Usuário"}, sua jornada começa agora. 
            Estamos muito felizes em ter você conosco!
          </Typography>
          <Button
            variant="contained"
            className={classes.accessButton}
            onClick={handleAccessPanel}
            endIcon={<ArrowForward />}
          >
            Acessar Painel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      
      <div className={classes.leftPanel}>
        <div className={classes.videoContainer}>
          <div className={classes.videoPlaceholder} onClick={handlePlayVideo}>
            <div className={classes.playButton}>
              <PlayArrow className={classes.playIcon} />
            </div>
          </div>
        </div>
      </div>

      <div className={classes.rightPanel}>
        <Fade in={!loading} timeout={1000}>
          <div className={classes.welcomeContent}>
            <Typography variant="h2" className={classes.welcomeTitle}>
              Bem-vindo!
            </Typography>
            <Typography variant="h5" className={classes.welcomeSubtitle}>
              {user?.name || "Usuário"}, sua jornada começa agora. 
              Estamos muito felizes em ter você conosco!
            </Typography>
            
            <Box mt={4}>
              <Button
                variant="contained"
                className={classes.accessButton}
                onClick={handleAccessPanel}
                endIcon={<ArrowForward />}
                size="large"
              >
                Acessar Painel
              </Button>
            </Box>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default Welcome;
