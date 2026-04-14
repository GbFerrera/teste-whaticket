import { Router } from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as CrmLeadController from "../controllers/CrmLeadController";

const upload = multer(uploadConfig);

const crmLeadRoutes = Router();

crmLeadRoutes.get("/crm/leads", isAuth, CrmLeadController.index);
crmLeadRoutes.get("/crm/leads/:leadId", isAuth, CrmLeadController.show);
crmLeadRoutes.post("/crm/leads", isAuth, CrmLeadController.store);
crmLeadRoutes.put("/crm/leads/:leadId", isAuth, CrmLeadController.update);
crmLeadRoutes.post("/crm/leads/:leadId/convert", isAuth, CrmLeadController.convert);
crmLeadRoutes.delete("/crm/leads/:leadId", isAuth, CrmLeadController.remove);
crmLeadRoutes.get("/crm/leads/export", isAuth, CrmLeadController.exportLeads);
crmLeadRoutes.post("/crm/leads/export", isAuth, CrmLeadController.exportLeads);
crmLeadRoutes.post("/crm/leads/import", isAuth, upload.single('file'), CrmLeadController.importLeads);

export default crmLeadRoutes;
