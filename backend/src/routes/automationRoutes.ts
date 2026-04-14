import express from "express";
import isAuth from "../middleware/isAuth";
import * as AutomationController from "../controllers/AutomationController";

const automationRoutes = express.Router();

automationRoutes.get("/automations", isAuth, AutomationController.index);
automationRoutes.get("/automations/:automationId", isAuth, AutomationController.show);
automationRoutes.post("/automations", isAuth, AutomationController.store);
automationRoutes.put("/automations/:automationId", isAuth, AutomationController.update);
automationRoutes.delete("/automations/:automationId", isAuth, AutomationController.remove);
automationRoutes.patch("/automations/:automationId/toggle", isAuth, AutomationController.toggleActive);

export default automationRoutes;
