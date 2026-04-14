import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalQueueController from "../../controllers/api/ExternalQueueController";

const externalQueueRoutes = Router();

externalQueueRoutes.get(
  "/queues",
  isAuthExternal,
  ExternalQueueController.index
);

externalQueueRoutes.get(
  "/queues/:id",
  isAuthExternal,
  ExternalQueueController.show
);

externalQueueRoutes.post(
  "/queues",
  isAuthExternal,
  ExternalQueueController.store
);

externalQueueRoutes.put(
  "/queues/:id",
  isAuthExternal,
  ExternalQueueController.update
);

externalQueueRoutes.delete(
  "/queues/:id",
  isAuthExternal,
  ExternalQueueController.remove
);

export default externalQueueRoutes;
