import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalProductController from "../../controllers/api/ExternalProductController";

const externalProductRoutes = Router();

externalProductRoutes.get(
  "/products",
  isAuthExternal,
  ExternalProductController.index
);

externalProductRoutes.get(
  "/products/:id",
  isAuthExternal,
  ExternalProductController.show
);

externalProductRoutes.post(
  "/products",
  isAuthExternal,
  ExternalProductController.store
);

externalProductRoutes.put(
  "/products/:id",
  isAuthExternal,
  ExternalProductController.update
);

externalProductRoutes.delete(
  "/products/:id",
  isAuthExternal,
  ExternalProductController.remove
);

export default externalProductRoutes;
