import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalTicketController from "../../controllers/api/ExternalTicketController";

const externalTicketRoutes = Router();

externalTicketRoutes.get(
  "/tickets",
  isAuthExternal,
  ExternalTicketController.index
);

externalTicketRoutes.get(
  "/tickets/:id",
  isAuthExternal,
  ExternalTicketController.show
);

externalTicketRoutes.get(
  "/tickets/:id/messages",
  isAuthExternal,
  ExternalTicketController.messages
);

externalTicketRoutes.put(
  "/tickets/:id",
  isAuthExternal,
  ExternalTicketController.update
);

externalTicketRoutes.post(
  "/tickets/:id/close",
  isAuthExternal,
  ExternalTicketController.close
);

externalTicketRoutes.post(
  "/tickets/:id/reopen",
  isAuthExternal,
  ExternalTicketController.reopen
);

externalTicketRoutes.post(
  "/tickets/:id/transfer",
  isAuthExternal,
  ExternalTicketController.transfer
);

export default externalTicketRoutes;
