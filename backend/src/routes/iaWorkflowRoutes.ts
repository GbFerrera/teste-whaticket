import express from "express";
import isAuth from "../middleware/isAuth";
import * as IaWorkflowController from "../controllers/IaWorkflowController";

const iaWorkflowRoutes = express.Router();

iaWorkflowRoutes.get("/ia-workflows", isAuth, IaWorkflowController.index);
iaWorkflowRoutes.get("/ia-workflows/:id", isAuth, IaWorkflowController.show);
iaWorkflowRoutes.post("/ia-workflows", isAuth, IaWorkflowController.store);
iaWorkflowRoutes.put("/ia-workflows/:id", isAuth, IaWorkflowController.update);
iaWorkflowRoutes.delete("/ia-workflows/:id", isAuth, IaWorkflowController.remove);

export default iaWorkflowRoutes;
