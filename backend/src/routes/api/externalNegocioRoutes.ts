import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalNegocioController from "../../controllers/api/ExternalNegocioController";

const externalNegocioRoutes = Router();

externalNegocioRoutes.get(
  "/negocios",
  isAuthExternal,
  ExternalNegocioController.index
);

externalNegocioRoutes.get(
  "/negocios/:id",
  isAuthExternal,
  ExternalNegocioController.show
);

externalNegocioRoutes.post(
  "/negocios",
  isAuthExternal,
  ExternalNegocioController.store
);

externalNegocioRoutes.put(
  "/negocios/:id",
  isAuthExternal,
  ExternalNegocioController.update
);

externalNegocioRoutes.delete(
  "/negocios/:id",
  isAuthExternal,
  ExternalNegocioController.remove
);

export default externalNegocioRoutes;
