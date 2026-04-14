import express from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsappCoexistenceController from "../controllers/WhatsappCoexistenceController";

const whatsappCoexistenceRoutes = express.Router();

whatsappCoexistenceRoutes.post(
  "/whatsapp/:whatsappId/coexistence/enable",
  isAuth,
  WhatsappCoexistenceController.enable
);

whatsappCoexistenceRoutes.get(
  "/whatsapp/:whatsappId/coexistence/status",
  isAuth,
  WhatsappCoexistenceController.status
);

whatsappCoexistenceRoutes.post(
  "/whatsapp/:whatsappId/coexistence/sync",
  isAuth,
  WhatsappCoexistenceController.sync
);

whatsappCoexistenceRoutes.get(
  "/whatsapp/:whatsappId/coexistence/routing",
  isAuth,
  WhatsappCoexistenceController.getRouting
);

whatsappCoexistenceRoutes.post(
  "/whatsapp/:whatsappId/coexistence/routing",
  isAuth,
  WhatsappCoexistenceController.updateRouting
);

whatsappCoexistenceRoutes.post(
  "/whatsapp/:whatsappId/coexistence/simulate",
  isAuth,
  WhatsappCoexistenceController.simulateRouting
);

export default whatsappCoexistenceRoutes;
