import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalTagController from "../../controllers/api/ExternalTagController";

const externalTagRoutes = Router();

externalTagRoutes.get("/tags", isAuthExternal, ExternalTagController.index);
externalTagRoutes.get("/tags/:id", isAuthExternal, ExternalTagController.show);
externalTagRoutes.post("/tags", isAuthExternal, ExternalTagController.store);
externalTagRoutes.put("/tags/:id", isAuthExternal, ExternalTagController.update);
externalTagRoutes.delete("/tags/:id", isAuthExternal, ExternalTagController.remove);

export default externalTagRoutes;
