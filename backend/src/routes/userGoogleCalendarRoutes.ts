import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as UserGoogleCalendarController from "../controllers/UserGoogleCalendarController";

const router = Router();

// Obter URL de autenticação Google para usuário específico
router.get("/auth-url", isAuth, UserGoogleCalendarController.getUserAuthUrl);

// Callback OAuth do Google para usuário específico
router.get("/oauth-callback", UserGoogleCalendarController.userOauthCallback);

// Obter integração do usuário atual
router.get("/integration", isAuth, UserGoogleCalendarController.getUserIntegration);

// Desconectar integração do usuário atual
router.delete("/integration", isAuth, UserGoogleCalendarController.disconnectUserIntegration);

// Criar integração do usuário baseada na empresarial
router.post("/create-from-company", isAuth, UserGoogleCalendarController.createFromCompanyIntegration);

// Vincular Google Calendar a uma agenda do usuário
router.post("/link-schedule", isAuth, UserGoogleCalendarController.linkCalendarToSchedule);

// Desvincular Google Calendar de uma agenda do usuário
router.delete("/unlink-schedule", isAuth, UserGoogleCalendarController.unlinkCalendarFromSchedule);

export default router;
