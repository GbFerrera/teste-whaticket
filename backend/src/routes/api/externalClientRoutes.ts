import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalCrmClientController from "../../controllers/api/ExternalCrmClientController";

const externalClientRoutes = Router();

externalClientRoutes.get(
  "/clients",
  isAuthExternal,
  ExternalCrmClientController.index
);

externalClientRoutes.get(
  "/clients/:id",
  isAuthExternal,
  ExternalCrmClientController.show
);

externalClientRoutes.post(
  "/clients",
  isAuthExternal,
  ExternalCrmClientController.store
);

externalClientRoutes.put(
  "/clients/:id",
  isAuthExternal,
  ExternalCrmClientController.update
);

externalClientRoutes.delete(
  "/clients/:id",
  isAuthExternal,
  ExternalCrmClientController.remove
);

export default externalClientRoutes;
