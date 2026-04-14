import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CompanyPaymentSettingsController from "../controllers/CompanyPaymentSettingsController";

const paymentSettingRoutes = Router();

paymentSettingRoutes.get(
  "/payment-settings",
  isAuth,
  CompanyPaymentSettingsController.index
);

paymentSettingRoutes.post(
  "/payment-settings",
  isAuth,
  CompanyPaymentSettingsController.upsert
);

paymentSettingRoutes.put(
  "/payment-settings/:id",
  isAuth,
  CompanyPaymentSettingsController.upsert
);

paymentSettingRoutes.delete(
  "/payment-settings/:id",
  isAuth,
  CompanyPaymentSettingsController.remove
);

export default paymentSettingRoutes;
