import { Router } from "express";
import { authenticate, authCallback, getAuthStatus, testConnection, executeOperation } from "../controllers/GoogleSheetsController";

const router = Router();

// Autenticação
router.post("/auth", authenticate);
router.get("/auth/callback", authCallback);
router.get("/auth-status", getAuthStatus);

// Teste e operações
router.post("/test", testConnection);
router.post("/execute", executeOperation);

export default router;
