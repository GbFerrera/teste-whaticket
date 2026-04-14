import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalWhatsappController from "../../controllers/api/ExternalWhatsappController";

const externalWhatsappRoutes = Router();

externalWhatsappRoutes.get(
  "/whatsapps",
  isAuthExternal,
  ExternalWhatsappController.index
);

externalWhatsappRoutes.get(
  "/whatsapps/:id",
  isAuthExternal,
  ExternalWhatsappController.show
);

externalWhatsappRoutes.get(
  "/whatsapps/:id/status",
  isAuthExternal,
  ExternalWhatsappController.status
);

externalWhatsappRoutes.get(
  "/whatsapps/:id/qrcode",
  isAuthExternal,
  ExternalWhatsappController.qrcode
);

externalWhatsappRoutes.post(
  "/whatsapps",
  isAuthExternal,
  ExternalWhatsappController.store
);

externalWhatsappRoutes.put(
  "/whatsapps/:id",
  isAuthExternal,
  ExternalWhatsappController.update
);

externalWhatsappRoutes.delete(
  "/whatsapps/:id",
  isAuthExternal,
  ExternalWhatsappController.remove
);

externalWhatsappRoutes.post(
  "/whatsapps/:id/restart",
  isAuthExternal,
  ExternalWhatsappController.restart
);

externalWhatsappRoutes.post(
  "/whatsapps/:id/disconnect",
  isAuthExternal,
  ExternalWhatsappController.disconnect
);

export default externalWhatsappRoutes;
