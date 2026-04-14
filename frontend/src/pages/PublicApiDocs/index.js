import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  page: {
    minHeight: "100vh",
    background: "#f7f8fb",
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
    color: "#111827"
  },
  hero: {
    background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e0ecff 100%)",
    borderRadius: 24,
    padding: theme.spacing(6),
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    marginBottom: theme.spacing(5),
    position: "relative",
    overflow: "hidden"
  },
  heroAccent: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    background: "radial-gradient(circle, rgba(59,130,246,0.25), transparent 60%)",
    borderRadius: "50%"
  },
  heroTitle: {
    fontWeight: 700,
    fontSize: "2.75rem",
    color: "#0f172a"
  },
  heroSubtitle: {
    marginTop: theme.spacing(2),
    maxWidth: 580,
    color: "#475569",
    fontSize: "1.05rem",
    lineHeight: 1.6
  },
  pill: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 600,
    color: "#2563eb",
    background: "rgba(37,99,235,0.1)",
    padding: "6px 14px",
    borderRadius: 999,
    display: "inline-block",
    marginBottom: theme.spacing(3),
    fontSize: 12
  },
  section: {
    background: "#fff",
    borderRadius: 20,
    padding: theme.spacing(4),
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.06)",
    marginBottom: theme.spacing(4)
  },
  codeBlock: {
    background: "#0f172a",
    color: "#cbd5f5",
    fontFamily: "'JetBrains Mono', Consolas, monospace",
    padding: theme.spacing(2),
    borderRadius: 12,
    marginTop: theme.spacing(2),
    wordBreak: "break-all",
    fontSize: 14
  },
  apiCard: {
    height: "100%",
    borderRadius: 20,
    padding: theme.spacing(3),
    border: "1px solid rgba(148, 163, 184, 0.2)"
  },
  apiTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1)
  },
  chipSet: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  methodChip: {
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  methodGET: {
    background: "rgba(34,197,94,0.15)",
    color: "#15803d"
  },
  methodPOST: {
    background: "rgba(59,130,246,0.15)",
    color: "#1d4ed8"
  },
  methodPUT: {
    background: "rgba(234,179,8,0.15)",
    color: "#a16207"
  },
  methodDELETE: {
    background: "rgba(248,113,113,0.15)",
    color: "#b91c1c"
  },
  timeline: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
    marginTop: theme.spacing(2)
  },
  timelineStep: {
    background: "#fff",
    borderRadius: 16,
    padding: theme.spacing(2.5),
    border: "1px solid rgba(226, 232, 240, 1)"
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#e0edff",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    marginBottom: theme.spacing(1.5)
  },
  footerCTA: {
    textAlign: "center",
    background: "linear-gradient(120deg, #2563eb, #7c3aed)",
    borderRadius: 24,
    padding: theme.spacing(5),
    color: "#fff",
    marginTop: theme.spacing(6)
  }
}));

const PublicApiDocs = () => {
  const classes = useStyles();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://api.seudominio.com";

  const apis = [
    {
      name: "Mensagens",
      description: "Dispare textos e mídias diretamente de seus fluxos.",
      endpoints: [{ method: "POST", path: "/api/messages/send" }],
      highlights: ["Suporte a templates", "Envio de mídia", "Atribuição de atendente"]
    },
    {
      name: "Clientes",
      description: "Sincronize o seu CRM com dados unificados na plataforma.",
      endpoints: [
        { method: "GET", path: "/api/external/clients" },
        { method: "POST", path: "/api/external/clients" },
        { method: "PUT", path: "/api/external/clients/:id" },
        { method: "DELETE", path: "/api/external/clients/:id" }
      ],
      highlights: ["Campos customizados", "Documentos e contatos", "Owners e status"]
    },
    {
      name: "Contatos",
      description: "Gerencie leads operacionais, tags e informações extras.",
      endpoints: [
        { method: "GET", path: "/api/external/contacts" },
        { method: "POST", path: "/api/external/contacts" },
        { method: "PUT", path: "/api/external/contacts/:id" },
        { method: "DELETE", path: "/api/external/contacts/:id" }
      ],
      highlights: ["Tags associadas", "ExtraInfo JSON", "Filtros e paginação"]
    },
    {
      name: "Tags",
      description: "Crie pipelines e marcadores inteligentes para tickets.",
      endpoints: [
        { method: "GET", path: "/api/external/tags" },
        { method: "POST", path: "/api/external/tags" },
        { method: "PUT", path: "/api/external/tags/:id" },
        { method: "DELETE", path: "/api/external/tags/:id" }
      ],
      highlights: ["Kanban e SLAs", "Configurações de lanes", "Eventos em webhooks"]
    }
  ];

  const onboardingSteps = [
    {
      title: "1. Gere um token",
      text: "No painel autenticado, acesse Mensagens API e crie um token externo por empresa."
    },
    {
      title: "2. Configure webhooks",
      text: "Informe a URL que receberá eventos de criação, atualização e exclusão dos recursos."
    },
    {
      title: "3. Monte as requisições",
      text: "Envie o header Authorization: Bearer {token}. Utilize HTTPS e mantenha o token seguro."
    },
    {
      title: "4. Monitore e versione",
      text: "Implemente retries, logging e versionamento de payloads para integrações futuras."
    }
  ];

  const methodClass = method => {
    switch (method) {
      case "GET":
        return `${classes.methodChip} ${classes.methodGET}`;
      case "POST":
        return `${classes.methodChip} ${classes.methodPOST}`;
      case "PUT":
        return `${classes.methodChip} ${classes.methodPUT}`;
      case "DELETE":
        return `${classes.methodChip} ${classes.methodDELETE}`;
      default:
        return classes.methodChip;
    }
  };

  return (
    <Box className={classes.page}>
      <Container maxWidth="lg">
        <Paper className={classes.hero} elevation={0}>
          <div className={classes.heroAccent} />
          <span className={classes.pill}>Whaticket API</span>
          <Typography className={classes.heroTitle}>
            Integrações modernas para sua operação omnichannel
          </Typography>
          <Typography className={classes.heroSubtitle}>
            Use nossas APIs REST para enviar mensagens, sincronizar clientes, organizar contatos e
            automatizar pipelines. A documentação pública está pronta para crescer com novas APIs e
            permite que sua equipe tenha uma visão clara do ecossistema.
          </Typography>
          <Box mt={4} display="flex" flexWrap="wrap" gap={16}>
            <Button
              variant="contained"
              color="primary"
              style={{ textTransform: "none", fontWeight: 600 }}
              onClick={() => window.open("/login", "_blank")}
            >
              Acessar painel e gerar token
            </Button>
            <Button
              variant="outlined"
              style={{ textTransform: "none", fontWeight: 600, borderColor: "#2563eb", color: "#2563eb" }}
              onClick={() => window.open("/docs/public/api", "_self")}
            >
              Download da coleção Postman
            </Button>
          </Box>
        </Paper>

        <Paper className={classes.section} elevation={0}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: 700, color: "#0f172a" }}>
            Autenticação e headers padrão
          </Typography>
          <Typography variant="body1" style={{ color: "#475569", lineHeight: 1.6 }}>
            Cada empresa possui um token exclusivo, emitido em <strong>/messages-api</strong> dentro do painel.
            Envie sempre via header <strong>Authorization: Bearer {"{token}"}</strong>. Recomendamos armazená-lo em
            variáveis de ambiente e rotacionar periodicamente.
          </Typography>
          <Typography className={classes.codeBlock}>
            POST {backendUrl}/api/messages/send{"\n"}
            Authorization: Bearer &lt;SEU_TOKEN&gt;{"\n"}
            Content-Type: application/json
          </Typography>
          <Divider style={{ margin: "24px 0" }} />
          <Typography variant="body2" style={{ color: "#64748b" }}>
            Todas as APIs respondem em JSON, seguem convenções REST e retornam códigos HTTP padronizados
            (2xx para sucesso, 4xx/5xx para erros). Mantenha TLS ativo e trate limites de 10 req/s por token.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {apis.map(api => (
            <Grid item xs={12} md={6} key={api.name}>
              <Paper elevation={0} className={classes.apiCard}>
                <div className={classes.apiTitle}>
                  <Typography variant="h6" style={{ fontWeight: 700 }}>
                    {api.name}
                  </Typography>
                  <Chip
                    label="Disponível"
                    size="small"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#15803d", fontWeight: 600 }}
                  />
                </div>
                <Typography variant="body2" style={{ color: "#475569", marginBottom: 12 }}>
                  {api.description}
                </Typography>
                <div className={classes.chipSet}>
                  {api.endpoints.map(endpoint => (
                    <Chip
                      key={`${api.name}-${endpoint.method}-${endpoint.path}`}
                      label={`${endpoint.method} ${endpoint.path}`}
                      className={methodClass(endpoint.method)}
                      size="small"
                    />
                  ))}
                </div>
                <Divider style={{ margin: "16px 0" }} />
                <Typography variant="caption" style={{ color: "#94a3b8", textTransform: "uppercase" }}>
                  Destaques
                </Typography>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#1f2937", lineHeight: 1.6 }}>
                  {api.highlights.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper className={classes.section} elevation={0}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: 700, color: "#0f172a" }}>
            Como começar
          </Typography>
          <div className={classes.timeline}>
            {onboardingSteps.map(step => (
              <div key={step.title} className={classes.timelineStep}>
                <div className={classes.stepNumber}>{step.title.split(".")[0]}</div>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" style={{ color: "#475569", marginTop: 4 }}>
                  {step.text}
                </Typography>
              </div>
            ))}
          </div>
        </Paper>

        <Paper className={classes.section} elevation={0}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: 700, color: "#0f172a" }}>
            Webhooks e melhores práticas
          </Typography>
          <Typography variant="body1" style={{ color: "#475569", lineHeight: 1.7 }}>
            Configure webhooks para ser notificado em eventos <code>tag.created</code>, <code>contact.updated</code>,
            <code>client.deleted</code> e outros. Validamos a origem com o header <code>x-whaticket-signature</code>
            e esperamos respostas em até 5 segundos. Caso não haja sucesso, executamos retentativas com backoff.
          </Typography>
          <Divider style={{ margin: "20px 0" }} />
          <ul style={{ paddingLeft: 20, color: "#1f2937", lineHeight: 1.8 }}>
            <li>Mantenha tokens e secrets em cofres seguros (Vault, AWS Secrets Manager, etc.).</li>
            <li>Implemente logs e dashboards para monitorar falhas e latência das integrações.</li>
            <li>Versãose payloads usando headers ou query params, evitando quebras em clientes antigos.</li>
            <li>Planeje limites: 10 requisições/segundo por token é o máximo recomendado.</li>
          </ul>
        </Paper>

        <Box className={classes.footerCTA}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: 700 }}>
            Mais APIs chegando
          </Typography>
          <Typography variant="body1" style={{ maxWidth: 520, margin: "0 auto 24px" }}>
            Já estamos preparando endpoints para filas, tickets e automações. Assine o boletim técnico e
            receba alertas sempre que novas APIs forem liberadas.
          </Typography>
          <Button
            variant="contained"
            style={{ background: "#fff", color: "#1d4ed8", fontWeight: 700, textTransform: "none", padding: "10px 28px" }}
            onClick={() => window.open("mailto:devrel@whaticket.com?subject=Quero%20novidades%20da%20API")}
          >
            Quero ser avisado
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicApiDocs;