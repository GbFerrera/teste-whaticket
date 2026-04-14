import { Router } from "express";
import * as ExternalApiController from "../controllers/ExternalApiController";
import isAuth from "../middleware/isAuth";

const externalApiRoutes = Router();

// Rotas públicas (não requerem autenticação)
externalApiRoutes.post("/login", ExternalApiController.login);
externalApiRoutes.post("/refresh", ExternalApiController.refresh);

// Rotas protegidas (requerem autenticação)
externalApiRoutes.post("/logout", isAuth, ExternalApiController.logout);
externalApiRoutes.get("/verify", isAuth, ExternalApiController.verify);

export default externalApiRoutes;
