import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalFaturaController from "../../controllers/api/ExternalFaturaController";

const externalFaturaRoutes = Router();

externalFaturaRoutes.get(
  "/faturas",
  isAuthExternal,
  ExternalFaturaController.index
);

externalFaturaRoutes.get(
  "/faturas/:id",
  isAuthExternal,
  ExternalFaturaController.show
);

externalFaturaRoutes.post(
  "/faturas",
  isAuthExternal,
  ExternalFaturaController.store
);

externalFaturaRoutes.put(
  "/faturas/:id",
  isAuthExternal,
  ExternalFaturaController.update
);

externalFaturaRoutes.delete(
  "/faturas/:id",
  isAuthExternal,
  ExternalFaturaController.remove
);

externalFaturaRoutes.post(
  "/faturas/:id/pay",
  isAuthExternal,
  ExternalFaturaController.markAsPaid
);

externalFaturaRoutes.post(
  "/faturas/:id/cancel",
  isAuthExternal,
  ExternalFaturaController.cancel
);

externalFaturaRoutes.get(
  "/faturas/project/:projectId",
  isAuthExternal,
  ExternalFaturaController.listByProject
);

externalFaturaRoutes.get(
  "/faturas/client/:clientId",
  isAuthExternal,
  ExternalFaturaController.listByClient
);

export default externalFaturaRoutes;
