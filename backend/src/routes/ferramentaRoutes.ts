import express from "express";
import isAuth from "../middleware/isAuth";

import * as FerramentaController from "../controllers/FerramentaController";

const ferramentaRoutes = express.Router();

ferramentaRoutes.get("/ferramentas", isAuth, FerramentaController.index);
ferramentaRoutes.post("/ferramentas", isAuth, FerramentaController.store);
ferramentaRoutes.get("/ferramentas/:ferramentaId", isAuth, FerramentaController.show);
ferramentaRoutes.put("/ferramentas/:ferramentaId", isAuth, FerramentaController.update);
ferramentaRoutes.delete("/ferramentas/:ferramentaId", isAuth, FerramentaController.remove);

export default ferramentaRoutes;
