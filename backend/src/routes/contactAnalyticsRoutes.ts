import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ContactAnalyticsController from "../controllers/ContactAnalyticsController";

const routes = Router();

// Analytics de contatos
routes.get("/contacts/analytics/stats", isAuth, ContactAnalyticsController.getContactStats);
routes.get("/contacts/analytics/deduplication", isAuth, ContactAnalyticsController.getDeduplicationReport);
routes.get("/contacts/analytics/saving", isAuth, ContactAnalyticsController.getSavingReport);
routes.get("/contacts/analytics/top", isAuth, ContactAnalyticsController.getTopContacts);
routes.get("/contacts/analytics/export", isAuth, ContactAnalyticsController.exportData);

export default routes;
