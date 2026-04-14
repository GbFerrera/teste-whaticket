import { Router } from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as CrmClientController from "../controllers/CrmClientController";

const upload = multer(uploadConfig);

const crmClientRoutes = Router();

crmClientRoutes.get("/crm/clients", isAuth, CrmClientController.index);
crmClientRoutes.get("/crm/clients/:clientId", isAuth, CrmClientController.show);
crmClientRoutes.post("/crm/clients", isAuth, CrmClientController.store);
crmClientRoutes.put("/crm/clients/:clientId", isAuth, CrmClientController.update);
crmClientRoutes.delete("/crm/clients/:clientId", isAuth, CrmClientController.remove);
crmClientRoutes.get("/crm/clients/export", isAuth, CrmClientController.exportClients);
crmClientRoutes.post("/crm/clients/export", isAuth, CrmClientController.exportClients);
crmClientRoutes.post("/crm/clients/import", isAuth, upload.single('file'), CrmClientController.importClients);

export default crmClientRoutes;
