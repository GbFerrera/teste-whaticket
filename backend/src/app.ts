import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { config as dotenvConfig } from "dotenv";
import bodyParser from 'body-parser';

import "./database";
import uploadConfig from "./config/upload";
import { ValidationError, DatabaseError, ForeignKeyConstraintError } from "sequelize";
import AppError from "./errors/AppError";
import routes from "./routes";
import logger from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import BullQueue from "./libs/queue"
import BullBoard from 'bull-board';
import basicAuth from 'basic-auth';

// Função de middleware para autenticação básica
export const isBullAuth = (req, res, next) => {
  const user = basicAuth(req);

  if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Carregar variáveis de ambiente
dotenvConfig();

// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Configuração de filas
app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

// Domínios liberados para CORS
const allowAnyOrigin = String(process.env.CORS_ALLOW_ALL).toLowerCase() === "true";

const environmentOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3
].filter(Boolean) as string[];

const extraOrigins =
  process.env.CORS_EXTRA_ORIGINS?.split(",")
    .map(origin => origin.trim())
    .filter(Boolean) || [];

const defaultDevOrigins = [
  "http://localhost",
  "http://localhost:3000",
  "http://127.0.0.1",
  "http://127.0.0.1:3000"
];

const allowedOrigins = allowAnyOrigin
  ? undefined
  : Array.from(
    new Set([...environmentOrigins, ...extraOrigins, ...defaultDevOrigins])
  );

// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use('/admin/queues', isBullAuth, BullBoard.UI);
}


app.use(compression()); // Compressão HTTP
app.use(bodyParser.json({ limit: '2gb' })); // Aumentar o limite de carga para 2 GB
app.use(bodyParser.urlencoded({ limit: '2gb', extended: true }));
// Configuração CORS para permitir qualquer origem
app.use(
  cors({
    credentials: true,
    origin: true // Permite qualquer origem
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
// Arquivos públicos com cache curto (1 hora) para evitar cache excessivo
app.use("/public", express.static(uploadConfig.directory, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Arquivos de mídia podem ter cache mais longo
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 dia para imagens
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora para outros
    }
  }
}));

// Middleware para evitar cache nas respostas da API
app.use((req: Request, res: Response, next: NextFunction) => {
  // Não cachear respostas da API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Rotas
app.use(routes);

// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());

// Middleware de tratamento de erros
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  // Verificar se headers já foram enviados
  if (res.headersSent) {
    return;
  }

  const formatFieldName = (field?: string) => {
    if (!field) return "campo obrigatório";
    return field
      .replace(/_/g, " ")
      .replace(/\b\w/g, match => match.toUpperCase());
  };

  if (err instanceof ValidationError) {
    const messages = err.errors.map(error => error.message || `Campo '${error.path}' inválido.`);
    logger.warn(err);
    return res.status(400).json({ error: messages[0], errors: messages });
  }

  if (err instanceof ForeignKeyConstraintError) {
    logger.warn(err);
    return res.status(400).json({
      error: "Alguma informação relacionada não foi encontrada ou é inválida. Verifique os dados enviados."
    });
  }

  if (err instanceof DatabaseError) {
    const pgCode = (err.parent as any)?.code;
    const column = (err.parent as any)?.column;

    if (pgCode === "23502") {
      logger.warn(err);
      return res.status(400).json({
        error: `O campo '${formatFieldName(column)}' é obrigatório.`
      });
    }

    if (pgCode === "23505") {
      logger.warn(err);
      return res.status(400).json({
        error: "Já existe um registro com essas informações. Ajuste os dados e tente novamente."
      });
    }
  }

  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
