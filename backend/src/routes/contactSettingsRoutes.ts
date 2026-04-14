import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ContactSettingsController from "../controllers/ContactSettingsController";

const routes = Router();

// Configurações de contatos
routes.get("/contact-settings", isAuth, ContactSettingsController.index);
routes.put("/contact-settings", isAuth, ContactSettingsController.update);
routes.get("/contact-settings/stats", isAuth, ContactSettingsController.getStats);
routes.post("/contact-settings/batch-save", isAuth, ContactSettingsController.batchSaveToPhone);
routes.post("/contact-settings/test", isAuth, ContactSettingsController.testConfiguration);
routes.post("/contact-settings/reset", isAuth, ContactSettingsController.resetSettings);

export default routes;
