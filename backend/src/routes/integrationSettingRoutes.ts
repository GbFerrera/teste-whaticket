import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CompanyIntegrationSettingsController from "../controllers/CompanyIntegrationSettingsController";

const integrationSettingRoutes = Router();

integrationSettingRoutes.get(
  "/integration-settings",
  isAuth,
  CompanyIntegrationSettingsController.index
);

integrationSettingRoutes.get(
  "/integration-settings/:id",
  isAuth,
  CompanyIntegrationSettingsController.show
);

integrationSettingRoutes.post(
  "/integration-settings",
  isAuth,
  CompanyIntegrationSettingsController.upsert
);

integrationSettingRoutes.put(
  "/integration-settings/:id",
  isAuth,
  CompanyIntegrationSettingsController.upsert
);

integrationSettingRoutes.delete(
  "/integration-settings/:id",
  isAuth,
  CompanyIntegrationSettingsController.remove
);

integrationSettingRoutes.put(
  "/integration-settings/:id/field-maps",
  isAuth,
  CompanyIntegrationSettingsController.upsertFieldMaps
);

export default integrationSettingRoutes;
