import { Router } from "express";
import * as MobileWebhookController from "../controllers/MobileWebhookController";
import isAuth from "../middleware/isAuth";

const mobileWebhookRoutes = Router();

// Rota para registrar webhook de notificação mobile
mobileWebhookRoutes.post("/register", isAuth, MobileWebhookController.registerWebhook);

// Rota para remover webhook de notificação mobile
mobileWebhookRoutes.delete("/unregister", isAuth, MobileWebhookController.unregisterWebhook);

// Rota para listar webhooks registrados
mobileWebhookRoutes.get("/list", isAuth, MobileWebhookController.listWebhooks);

// Rota para testar webhook
mobileWebhookRoutes.post("/test", isAuth, MobileWebhookController.testWebhook);

export default mobileWebhookRoutes;
