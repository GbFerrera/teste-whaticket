import { Router } from "express";

import isAuth from "../middleware/isAuth";
import { secondCopyByCpf } from "../controllers/AsaasController";

const asaasRoutes = Router();

asaasRoutes.post("/asaas/second-copy", isAuth, secondCopyByCpf);

export default asaasRoutes;
