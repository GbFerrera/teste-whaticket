import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroReceitasController from "../controllers/FinanceiroReceitasController";

const financeiroReceitaRoutes = Router();

financeiroReceitaRoutes.get(
  "/financeiro/receitas",
  isAuth,
  FinanceiroReceitasController.index
);

financeiroReceitaRoutes.get(
  "/financeiro/receitas/:id",
  isAuth,
  FinanceiroReceitasController.show
);

financeiroReceitaRoutes.post(
  "/financeiro/receitas",
  isAuth,
  FinanceiroReceitasController.store
);

financeiroReceitaRoutes.put(
  "/financeiro/receitas/:id",
  isAuth,
  FinanceiroReceitasController.update
);

financeiroReceitaRoutes.delete(
  "/financeiro/receitas/:id",
  isAuth,
  FinanceiroReceitasController.remove
);

export default financeiroReceitaRoutes;
