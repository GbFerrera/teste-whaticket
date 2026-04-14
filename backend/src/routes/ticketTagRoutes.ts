import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketTagController from "../controllers/TicketTagController";

const ticketTagRoutes = express.Router();

ticketTagRoutes.put("/ticket-tags/:ticketId/:tagId", isAuth, TicketTagController.store);
// Suporta tanto DELETE /ticket-tags/:ticketId quanto DELETE /ticket-tags/:ticketId/:tagId
ticketTagRoutes.delete("/ticket-tags/:ticketId/:tagId", isAuth, TicketTagController.remove);
ticketTagRoutes.delete("/ticket-tags/:ticketId", isAuth, TicketTagController.remove);

export default ticketTagRoutes;
