import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CompanyApiKeysController from "../controllers/CompanyApiKeysController";

const companyApiKeyRoutes = Router();

companyApiKeyRoutes.get(
  "/company-api-keys",
  isAuth,
  CompanyApiKeysController.index
);

companyApiKeyRoutes.post(
  "/company-api-keys",
  isAuth,
  CompanyApiKeysController.store
);

companyApiKeyRoutes.put(
  "/company-api-keys/:id",
  isAuth,
  CompanyApiKeysController.update
);

companyApiKeyRoutes.delete(
  "/company-api-keys/:id",
  isAuth,
  CompanyApiKeysController.remove
);

export default companyApiKeyRoutes;
