import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalContactController from "../../controllers/api/ExternalContactController";

const externalContactRoutes = Router();

externalContactRoutes.get(
  "/contacts",
  isAuthExternal,
  ExternalContactController.index
);

externalContactRoutes.get(
  "/contacts/:id",
  isAuthExternal,
  ExternalContactController.show
);

externalContactRoutes.post(
  "/contacts",
  isAuthExternal,
  ExternalContactController.store
);

externalContactRoutes.put(
  "/contacts/:id",
  isAuthExternal,
  ExternalContactController.update
);

externalContactRoutes.delete(
  "/contacts/:id",
  isAuthExternal,
  ExternalContactController.remove
);

export default externalContactRoutes;
