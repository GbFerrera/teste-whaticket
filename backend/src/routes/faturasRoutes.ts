import express from "express";
import isAuth from "../middleware/isAuth";
import * as FaturasController from "../controllers/FaturasController";

const faturasRoutes = express.Router();

faturasRoutes.get("/faturas", isAuth, FaturasController.index);
faturasRoutes.get("/faturas/:id", isAuth, FaturasController.show);
faturasRoutes.post("/faturas", isAuth, FaturasController.store);
faturasRoutes.put("/faturas/:id", isAuth, FaturasController.update);
faturasRoutes.delete("/faturas/:id", isAuth, FaturasController.remove);

export default faturasRoutes;
