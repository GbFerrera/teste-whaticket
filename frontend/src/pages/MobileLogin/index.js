import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Paper
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import backgroundImage from "../../assets/fundoapp.png";

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: theme.spacing(3)
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: theme.spacing(4),
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.3)"
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(1)
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4)
  },
  textField: {
    marginBottom: theme.spacing(2.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: 14,
      "& fieldset": {
        borderColor: "rgba(15, 23, 42, 0.15)"
      },
      "&:hover fieldset": {
        borderColor: "rgba(15, 23, 42, 0.4)"
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(15, 23, 42, 0.8)"
      }
    }
  },
  button: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    borderRadius: 14,
    fontWeight: 600,
    backgroundColor: "#050505",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#111",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
    }
  }
}));

const MobileLogin = () => {
  const classes = useStyles();
  const { handleLogin, handleSetLoginOrigin } = useContext(AuthContext);
  const colorMode = useContext(ColorModeContext);
  const appName = colorMode?.appName || "Whaticket";
  const [user, setUser] = useState({ email: "", password: "" });

  useEffect(() => {
    handleSetLoginOrigin("mobile");
  }, [handleSetLoginOrigin]);

  const handleChange = event => {
    const { name, value } = event.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    handleSetLoginOrigin("mobile");
    handleLogin(user);
  };

  return (
    <Box className={classes.root}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper className={classes.card} elevation={0}>
          <Typography variant="h5" className={classes.title} align="center">
            Bem-vindo 👋
          </Typography>
          <Typography variant="body2" className={classes.subtitle} align="center">
            Acessar aplicativo
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              className={classes.textField}
              fullWidth
              label="E-mail"
              name="email"
              type="email"
              variant="outlined"
              value={user.email}
              onChange={handleChange}
              required
            />

            <TextField
              className={classes.textField}
              fullWidth
              label="Senha"
              name="password"
              type="password"
              variant="outlined"
              value={user.password}
              onChange={handleChange}
              required
            />

            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
            >
              Entrar
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default MobileLogin;
