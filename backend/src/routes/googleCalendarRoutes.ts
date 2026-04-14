import express from "express";
import isAuth from "../middleware/isAuth";
import * as GoogleCalendarController from "../controllers/GoogleCalendarController";

const googleCalendarRoutes = express.Router();

googleCalendarRoutes.get("/google-calendar/auth-url", isAuth, GoogleCalendarController.getAuthUrl);

googleCalendarRoutes.get("/google-calendar/oauth/callback", GoogleCalendarController.oauthCallback);

googleCalendarRoutes.get("/google-calendar/integration", isAuth, GoogleCalendarController.getIntegration);

googleCalendarRoutes.get("/google-calendar/integrations", isAuth, GoogleCalendarController.getIntegrations);

googleCalendarRoutes.delete("/google-calendar/integration", isAuth, GoogleCalendarController.disconnectIntegration);

export default googleCalendarRoutes;
