import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalServiceController from "../../controllers/api/ExternalServiceController";

const externalServiceRoutes = Router();

externalServiceRoutes.get(
  "/services",
  isAuthExternal,
  ExternalServiceController.index
);

externalServiceRoutes.get(
  "/services/:id",
  isAuthExternal,
  ExternalServiceController.show
);

externalServiceRoutes.post(
  "/services",
  isAuthExternal,
  ExternalServiceController.store
);

externalServiceRoutes.put(
  "/services/:id",
  isAuthExternal,
  ExternalServiceController.update
);

externalServiceRoutes.delete(
  "/services/:id",
  isAuthExternal,
  ExternalServiceController.remove
);

export default externalServiceRoutes;
