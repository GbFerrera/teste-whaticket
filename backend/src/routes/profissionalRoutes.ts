import express from "express";

import isAuth from "../middleware/isAuth";
import * as ProfissionalController from "../controllers/ProfissionalController";

const profissionalRoutes = express.Router();

profissionalRoutes.use(isAuth);

profissionalRoutes.get("/profissionais", ProfissionalController.index);
profissionalRoutes.get("/profissionais/:profissionalId", ProfissionalController.show);
profissionalRoutes.post("/profissionais", ProfissionalController.store);
profissionalRoutes.put("/profissionais/:profissionalId", ProfissionalController.update);
profissionalRoutes.delete("/profissionais/:profissionalId", ProfissionalController.remove);

export default profissionalRoutes;
