import express, { RequestHandler } from "express";
import multer from "multer";

import uploadConfig from "../../config/upload";
import * as WebhookController from "../controllers/WebhookController";

const hubWebhookRoutes = express.Router();
const upload = multer(uploadConfig);

hubWebhookRoutes.get("/hub-webhook/:channelId", WebhookController.index);

hubWebhookRoutes.post(
  "/hub-webhook/:channelId",
  upload.array("medias") as unknown as RequestHandler,
  WebhookController.listen
);

export default hubWebhookRoutes;
