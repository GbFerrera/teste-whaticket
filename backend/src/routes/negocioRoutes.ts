import express from "express";
import isAuth from "../middleware/isAuth";

import * as NegocioController from "../controllers/NegocioController";

const negocioRoutes = express.Router();

negocioRoutes.get("/negocios", isAuth, NegocioController.index);
negocioRoutes.post("/negocios", isAuth, NegocioController.store);
negocioRoutes.get("/negocios/:negocioId", isAuth, NegocioController.show);
negocioRoutes.put("/negocios/:negocioId", isAuth, NegocioController.update);
negocioRoutes.delete("/negocios/:negocioId", isAuth, NegocioController.remove);

export default negocioRoutes;
