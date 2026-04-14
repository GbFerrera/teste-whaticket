import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalProjectTaskController from "../../controllers/api/ExternalProjectTaskController";

const externalProjectTaskRoutes = Router();

externalProjectTaskRoutes.get(
  "/project-tasks",
  isAuthExternal,
  ExternalProjectTaskController.index
);

externalProjectTaskRoutes.get(
  "/project-tasks/:id",
  isAuthExternal,
  ExternalProjectTaskController.show
);

externalProjectTaskRoutes.post(
  "/project-tasks",
  isAuthExternal,
  ExternalProjectTaskController.store
);

externalProjectTaskRoutes.put(
  "/project-tasks/:id",
  isAuthExternal,
  ExternalProjectTaskController.update
);

externalProjectTaskRoutes.delete(
  "/project-tasks/:id",
  isAuthExternal,
  ExternalProjectTaskController.remove
);

export default externalProjectTaskRoutes;
