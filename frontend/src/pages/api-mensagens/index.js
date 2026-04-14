import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import axios from "axios";
import { toast } from "react-toastify";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";

import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import ApiPostmanDownload from "../../components/ApiPostmanDownload";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100
  },
  elementMargin: {
    padding: theme.spacing(2)
  },
  formContainer: {
    maxWidth: 500
  },
  textRight: {
    textAlign: "right"
  }
}));

const ApiMensagensPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [formMessageTextData] = useState({
    token: "",
    number: "",
    body: "",
    userId: "",
    queueId: ""
  });
  const [formMessageMediaData] = useState({
    token: "",
    number: "",
    medias: "",
    body: "",
    userId: "",
    queueId: ""
  });
  const [file, setFile] = useState({});

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + "/api/messages/send";
  };

  const postmanRequests = [
    {
      name: "Enviar mensagem de texto",
      method: "POST",
      url: getEndpoint(),
      description: "Dispara uma mensagem de texto simples para o número informado.",
      body: {
        number: "5599999999999",
        body: "Olá! Esta é uma mensagem de teste",
        userId: 1,
        queueId: 1,
        noRegister: true
      }
    },
    {
      name: "Enviar mensagem com mídia",
      method: "POST",
      url: getEndpoint(),
      description: "Envie uma mídia (imagem, PDF, etc). O arquivo deve ser anexado via form-data.",
      bodyMode: "formdata",
      formData: [
        { key: "number", value: "5599999999999", type: "text" },
        { key: "body", value: "Arquivo de teste", type: "text" },
        { key: "userId", value: "1", type: "text" },
        { key: "queueId", value: "1", type: "text" },
        { key: "noRegister", value: "true", type: "text" },
        { key: "medias", src: "/caminho/para/arquivo.jpg", type: "file" }
      ]
    }
  ];

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    const data = { number, body, userId, queueId, noRegister: true };
    try {
      await axios.request({
        url: getEndpoint(),
        method: "POST",
        data,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${values.token}`
        }
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append("number", values.number);
      data.append("body", values.body ? values.body : firstFile.name);
      data.append("userId", values.userId);
      data.append("queueId", values.queueId);
      data.append("noRegister", "true");
      data.append("medias", firstFile);
      await axios.request({
        url: getEndpoint(),
        method: "POST",
        data,
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${values.token}`
        }
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const renderFormMessageText = () => (
    <Formik
      initialValues={formMessageTextData}
      enableReinitialize={true}
      onSubmit={(values, actions) => {
        setTimeout(async () => {
          await handleSendTextMessage(values);
          actions.setSubmitting(false);
          actions.resetForm();
        }, 400);
      }}
      className={classes.elementMargin}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.token")}
                name="token"
                autoFocus
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.body")}
                name="body"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.userId")}
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.queueId")}
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                style={{
                  color: "white",
                  backgroundColor: "#FFA500",
                  boxShadow: "none",
                  borderRadius: "5px"
                }}
                variant="contained"
                className={classes.btnWrapper}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                ) : (
                  "Enviar"
                )}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderFormMessageMedia = () => (
    <Formik
      initialValues={formMessageMediaData}
      enableReinitialize={true}
      onSubmit={(values, actions) => {
        setTimeout(async () => {
          await handleSendMediaMessage(values);
          actions.setSubmitting(false);
          actions.resetForm();
          document.getElementById("api-mensagens-medias").files = null;
          document.getElementById("api-mensagens-medias").value = null;
        }, 400);
      }}
      className={classes.elementMargin}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.token")}
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.body")}
                name="body"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.userId")}
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.queueId")}
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                name="medias"
                id="api-mensagens-medias"
                required
                onChange={(e) => setFile(e.target.files)}
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px"
                }}
                variant="contained"
                className={classes.btnWrapper}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                ) : (
                  "Enviar"
                )}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h5">API de Mensagens</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Utilize os tokens já gerados para testar os envios de mensagens de texto e mídia.
          </Typography>
        </div>
        <Button
          startIcon={<ReplyIcon />}
          variant="outlined"
          onClick={() => history.push("/messages-api")}
        >
          Voltar
        </Button>
      </Box>

      <ApiPostmanDownload
        collectionName="Whaticket - API de Mensagens"
        requests={postmanRequests}
        filename="whaticket-api-mensagens.json"
        helperText="Informe o token e clique em baixar para importar os exemplos no Postman."
      />
      <Box className="container" style={{ color: "rgba(255,255,255,0.8)" }}>
        <Typography variant="h6" gutterBottom>
          Visão geral
        </Typography>
        <Typography variant="body2" gutterBottom>
          Utilize os tokens da conta para enviar mensagens de texto ou mídia para contatos do Whaticket.
          Lembre-se de manter o header <code>Authorization: Bearer {"{token}"}</code> em todas as requisições.
        </Typography>
        <Box component="div" mt={2}>
          <ul style={{ lineHeight: 1.6 }}>
            <li>
              <b>Enviar texto:</b> POST {getEndpoint()} &mdash; Content-Type <code>application/json</code>
            </li>
            <li>
              <b>Enviar mídia:</b> POST {getEndpoint()} &mdash; Content-Type <code>multipart/form-data</code>
            </li>
            <li>
              Campos básicos: <code>number</code>, <code>body</code>, <code>userId</code>, <code>queueId</code>, <code>noRegister</code>
            </li>
          </ul>
        </Box>
      </Box>

      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        {i18n.t("messagesAPI.API.methods.title")}
      </Typography>
      <Typography component="div">
        <ol>
          <li>{i18n.t("messagesAPI.API.methods.messagesText")}</li>
          <li>{i18n.t("messagesAPI.API.methods.messagesMidia")}</li>
        </ol>
      </Typography>

      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        {i18n.t("messagesAPI.API.instructions.title")}
      </Typography>
      <Typography className={classes.elementMargin} component="div">
        <b>{i18n.t("messagesAPI.API.instructions.comments")}</b>
        <br />
        <ul>
          <li>{i18n.t("messagesAPI.API.instructions.comments1")}</li>
          <li>
            {i18n.t("messagesAPI.API.instructions.comments2")}
            <ul>
              <li>{i18n.t("messagesAPI.API.instructions.codeCountry")}</li>
              <li>{i18n.t("messagesAPI.API.instructions.code")}</li>
              <li>{i18n.t("messagesAPI.API.instructions.number")}</li>
            </ul>
          </li>
          <li>
            Arquivos enviados com extensão <b>.bin</b> ou tipo
            <b> application/octet-stream</b> serão automaticamente convertidos
            e enviados como <b>PDF</b>.
          </li>
        </ul>
      </Typography>

      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        {i18n.t("messagesAPI.API.text.title")}
      </Typography>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin} component="div">
            <p>{i18n.t("messagesAPI.API.text.instructions")}</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization Bearer (token registrado) e Content-Type (application/json) <br />
            <b>Body: </b> {"{"} <br />
            "number": "558599999999" <br />
            "body": "Message" <br />
            "userId": ID usuário ou "" <br />
            "queueId": ID Fila ou "" <br />
            "sendSignature": Assinar mensagem - true/false <br />
            "closeTicket": Encerrar o ticket - true/false <br />
            {"}"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de Envio</b>
          </Typography>
          {renderFormMessageText()}
        </Grid>
      </Grid>

      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        {i18n.t("messagesAPI.API.media.title")}
      </Typography>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin} component="div">
            <p>{i18n.t("messagesAPI.API.media.instructions")}</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization Bearer (token cadastrado) e Content-Type (multipart/form-data) <br />
            <b>FormData: </b> <br />
            <ul>
              <li>
                <b>number: </b> 558599999999
              </li>
              <li>
                <b>body:</b> Message
              </li>
              <li>
                <b>userId:</b> ID usuário ou ""
              </li>
              <li>
                <b>queueId:</b> ID da fila ou ""
              </li>
              <li>
                <b>medias: </b> arquivo
              </li>
              <li>
                Se o arquivo for <b>.bin</b> ou <b>application/octet-stream</b>,
                será convertido automaticamente para <b>PDF</b> antes do envio.
              </li>
              <li>
                <b>sendSignature:</b> Assinar mensagem true/false
              </li>
              <li>
                <b>closeTicket:</b> Encerrar ticket true/false
              </li>
            </ul>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de Envio</b>
          </Typography>
          {renderFormMessageMedia()}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ApiMensagensPage;
