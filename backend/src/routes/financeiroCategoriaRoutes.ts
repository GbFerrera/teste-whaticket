import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroCategoriasController from "../controllers/FinanceiroCategoriasController";

const financeiroCategoriaRoutes = Router();

financeiroCategoriaRoutes.get(
  "/financeiro/categorias",
  isAuth,
  FinanceiroCategoriasController.index
);

financeiroCategoriaRoutes.get(
  "/financeiro/categorias/:id",
  isAuth,
  FinanceiroCategoriasController.show
);

financeiroCategoriaRoutes.post(
  "/financeiro/categorias",
  isAuth,
  FinanceiroCategoriasController.store
);

financeiroCategoriaRoutes.put(
  "/financeiro/categorias/:id",
  isAuth,
  FinanceiroCategoriasController.update
);

financeiroCategoriaRoutes.delete(
  "/financeiro/categorias/:id",
  isAuth,
  FinanceiroCategoriasController.remove
);

export default financeiroCategoriaRoutes;
