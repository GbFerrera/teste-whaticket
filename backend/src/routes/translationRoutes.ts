import express from "express";
import isAuth from "../middleware/isAuth";
import * as TranslationController from "../controllers/TranslationController";

const translationRoutes = express.Router();

// Public routes (for frontend to load translations on init)
translationRoutes.get("/translations", TranslationController.listAllTranslations);
translationRoutes.get("/translations/languages", TranslationController.listLanguages);

// Language management (super admin only)
translationRoutes.post("/translations/languages", isAuth, TranslationController.createLanguage);
translationRoutes.put("/translations/languages/:id", isAuth, TranslationController.updateLanguage);
translationRoutes.delete("/translations/languages/:id", isAuth, TranslationController.deleteLanguage);

// Translation management
translationRoutes.get("/translations/:language/export", TranslationController.exportTranslations);
translationRoutes.get("/translations/:language", TranslationController.getTranslationsByLanguage);
translationRoutes.put("/translations/:language", isAuth, TranslationController.saveTranslations);
translationRoutes.post("/translations/:language/import", isAuth, TranslationController.importTranslations);

// Auto-translate (LibreTranslate)
translationRoutes.post("/translations/:language/auto-translate", isAuth, TranslationController.autoTranslate);

export default translationRoutes;
