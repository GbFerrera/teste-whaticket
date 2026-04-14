import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import axios from "axios";
import { toast } from "react-toastify";

import toastError from "../../errors/toastError";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";

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
    maxWidth: 520
  },
  textRight: {
    textAlign: "right"
  },
  resultBox: {
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 13,
    padding: theme.spacing(2),
    borderRadius: 8,
    overflowX: "auto"
  }
}));

const ApiProdutosPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    async function checkPermission() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página!");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProductsEndpoint = () => `${process.env.REACT_APP_BACKEND_URL}/api/external/products`;

  const postmanRequests = [
    {
      name: "Listar produtos",
      method: "GET",
      url: getProductsEndpoint(),
      description: "Retorna os produtos externos cadastrados."
    },
    {
      name: "Buscar produto por ID",
      method: "GET",
      url: `${getProductsEndpoint()}/1`,
      description: "Substitua o ID ao final da URL para consultar um produto específico."
    },
    {
      name: "Criar produto",
      method: "POST",
      url: getProductsEndpoint(),
      description: "Cria um novo produto externo.",
      body: {
        nome: "Corte de cabelo",
        tipo: "servico",
        valor: 149.9,
        descricao: "Produto de exemplo",
        status: "disponivel"
      }
    },
    {
      name: "Atualizar produto",
      method: "PUT",
      url: `${getProductsEndpoint()}/1`,
      description: "Altere o ID para atualizar o produto desejado.",
      body: {
        nome: "Corte de cabelo (novo)",
        status: "indisponivel"
      }
    },
    {
      name: "Remover produto",
      method: "DELETE",
      url: `${getProductsEndpoint()}/1`,
      description: "Remove definitivamente o produto informado no path."
    }
  ];

  const formatJSON = (data) => JSON.stringify(data, null, 2);

  const cleanProduct = (product) => ({
    id: product.id,
    nome: product.nome,
    tipo: product.tipo,
    valor: Number(product.valor || 0),
    status: product.status,
    descricao: product.descricao,
    imagemPrincipal: product.imagem_principal,
    galeria: product.galeria,
    dadosEspecificos: product.dados_especificos
  });

  const saveResult = (title, payload) => {
    setTestResult({
      title,
      payload: typeof payload === "string" ? payload : formatJSON(payload),
      timestamp: new Date().toLocaleString()
    });
  };

  const handleListProducts = async (token) => {
    try {
      const { data } = await axios.get(getProductsEndpoint(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult("Lista de produtos", {
        ...data,
        products: data.products?.map(cleanProduct)
      });
      toast.success("Produtos carregados!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleShowProduct = async (token, productId) => {
    try {
      const { data } = await axios.get(`${getProductsEndpoint()}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      saveResult(`Produto ${productId}`, cleanProduct(data));
      toast.success("Produto carregado!");
    } catch (err) {
      toastError(err);
    }
  };

  const buildProductPayload = (values) => {
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      valor: values.valor ? Number(values.valor) : undefined,
      descricao: values.descricao || null,
      status: values.status || undefined
    };

    if (values.dadosEspecificos) {
      try {
        payload.dados_especificos = JSON.parse(values.dadosEspecificos);
      } catch (error) {
        throw new Error("JSON inválido em dados específicos.");
      }
    }

    return payload;
  };

  const handleCreateProduct = async (values) => {
    try {
      const payload = buildProductPayload(values);
      const { data } = await axios.post(getProductsEndpoint(), payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Produto criado", cleanProduct(data));
      toast.success("Produto criado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleUpdateProduct = async (values) => {
    try {
      const payload = buildProductPayload(values);
      const { data } = await axios.put(`${getProductsEndpoint()}/${values.productId}`, payload, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Produto atualizado", cleanProduct(data));
      toast.success("Produto atualizado com sucesso!");
    } catch (err) {
      if (err.message?.includes("JSON inválido")) {
        toast.error(err.message);
        return;
      }
      toastError(err);
    }
  };

  const handleDeleteProduct = async (values) => {
    try {
      await axios.delete(`${getProductsEndpoint()}/${values.productId}`, {
        headers: {
          Authorization: `Bearer ${values.token}`
        }
      });
      saveResult("Produto removido", { id: values.productId, deleted: true });
      toast.success("Produto removido!");
    } catch (err) {
      toastError(err);
    }
  };

  const renderListAndShowForm = () => (
    <Formik
      initialValues={{ token: "", productId: "" }}
      onSubmit={(values) => handleListProducts(values.token)}
    >
      {({ values, isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Product ID (opcional para buscar um)"
                name="productId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={isSubmitting}
                style={{ marginRight: 8 }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Listar todos"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!values.productId) {
                    toast.error("Informe o Product ID para buscar um registro.");
                    return;
                  }
                  handleShowProduct(values.token, values.productId);
                }}
              >
                Buscar por ID
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderCreateForm = () => (
    <Formik
      initialValues={{
        token: "",
        nome: "",
        tipo: "",
        descricao: "",
        valor: "",
        status: "disponivel",
        dadosEspecificos: ""
      }}
      onSubmit={async (values, actions) => {
        await handleCreateProduct(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Nome"
                name="nome"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Tipo"
                name="tipo"
                variant="outlined"
                margin="dense"
                fullWidth
                required
                placeholder="produto, serviço..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Valor"
                name="valor"
                variant="outlined"
                margin="dense"
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="disponivel, indisponivel..."
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Dados específicos (JSON)'
                name="dadosEspecificos"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='{"cor": "vermelho"}'
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Criar produto"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderUpdateForm = () => (
    <Formik
      initialValues={{
        token: "",
        productId: "",
        nome: "",
        tipo: "",
        descricao: "",
        valor: "",
        status: "",
        dadosEspecificos: ""
      }}
      onSubmit={async (values, actions) => {
        await handleUpdateProduct(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Product ID"
                name="productId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Nome"
                name="nome"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                as={TextField}
                label="Tipo"
                name="tipo"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Valor"
                name="valor"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Status"
                name="status"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Nome exibido"
                name="display"
                variant="outlined"
                margin="dense"
                fullWidth
                disabled
                helperText="Campo apenas ilustrativo"
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label="Descrição"
                name="descricao"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label='Dados específicos (JSON)'
                name="dadosEspecificos"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={3}
                placeholder='{"cor": "vermelho"}'
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Atualizar produto"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderDeleteForm = () => (
    <Formik
      initialValues={{ token: "", productId: "" }}
      onSubmit={async (values, actions) => {
        await handleDeleteProduct(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Token"
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Product ID"
                name="productId"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Excluir produto"}
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
          <Typography variant="h5">API de Produtos</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Gere, consulte e sincronize produtos externos utilizando os tokens desta conta.
          </Typography>
        </div>
        <Button startIcon={<ReplyIcon />} variant="outlined" onClick={() => history.push("/messages-api")}>
          Voltar para tokens
        </Button>
      </Box>

      <Box mb={4}>
        <Typography variant="h6">Visão geral</Typography>
        <Typography component="div" color="textSecondary">
          <ul>
            <li><b>Listar produtos:</b> GET {getProductsEndpoint()}</li>
            <li><b>Buscar produto:</b> GET {getProductsEndpoint()}/:id</li>
            <li><b>Criar produto:</b> POST {getProductsEndpoint()}</li>
            <li><b>Atualizar produto:</b> PUT {getProductsEndpoint()}/:id</li>
            <li><b>Excluir produto:</b> DELETE {getProductsEndpoint()}/:id</li>
          </ul>
          Sempre envie o header <code>Authorization: Bearer {"{token}"}</code> com um token ativo gerado na página de API.
        </Typography>
      </Box>

      <Divider />

      <ApiPostmanDownload
        collectionName="Whaticket - API de Produtos"
        requests={postmanRequests}
        filename="whaticket-api-produtos.json"
        helperText="Informe o token e clique em baixar para importar no Postman."
      />

      <Box mt={4}>
        <Typography variant="h6" color="primary">1. Consultar produtos</Typography>
        <Typography color="textSecondary">
          Informe apenas o token para listar todos ou adicione um Product ID para buscar um registro específico.
        </Typography>
        {renderListAndShowForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">2. Criar produto</Typography>
        <Typography color="textSecondary">
          Campos mínimos: <b>nome</b>, <b>tipo</b> e <b>valor</b>. Descrição, status e dados específicos são opcionais.
        </Typography>
        {renderCreateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">3. Atualizar produto</Typography>
        <Typography color="textSecondary">
          Informe o <b>Product ID</b> retornado pela criação/listagem e envie os campos que deseja atualizar.
        </Typography>
        {renderUpdateForm()}
      </Box>

      <Divider style={{ margin: "32px 0" }} />

      <Box>
        <Typography variant="h6" color="primary">4. Excluir produto</Typography>
        <Typography color="textSecondary">
          Esta operação remove o registro definitivamente. Utilize com cuidado.
        </Typography>
        {renderDeleteForm()}
      </Box>

      {testResult && (
        <Box mt={4}>
          <Typography variant="h6">Resultado do último teste</Typography>
          <Typography variant="body2" color="textSecondary">
            {testResult.title} — {testResult.timestamp}
          </Typography>
          <Box component="pre" mt={2} className={classes.resultBox}>
            {testResult.payload}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ApiProdutosPage;
