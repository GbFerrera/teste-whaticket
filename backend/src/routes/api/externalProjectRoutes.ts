import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalProjectController from "../../controllers/api/ExternalProjectController";

const externalProjectRoutes = Router();

externalProjectRoutes.get(
  "/projects",
  isAuthExternal,
  ExternalProjectController.index
);

externalProjectRoutes.get(
  "/projects/:id",
  isAuthExternal,
  ExternalProjectController.show
);

externalProjectRoutes.post(
  "/projects",
  isAuthExternal,
  ExternalProjectController.store
);

externalProjectRoutes.put(
  "/projects/:id",
  isAuthExternal,
  ExternalProjectController.update
);

externalProjectRoutes.delete(
  "/projects/:id",
  isAuthExternal,
  ExternalProjectController.remove
);

export default externalProjectRoutes;
