import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroFaturasController from "../controllers/FinanceiroFaturasController";

const financeiroFaturaRoutes = Router();

financeiroFaturaRoutes.get(
  "/financeiro/faturas",
  isAuth,
  FinanceiroFaturasController.index
);

financeiroFaturaRoutes.get(
  "/financeiro/faturas/:id",
  isAuth,
  FinanceiroFaturasController.show
);

financeiroFaturaRoutes.post(
  "/financeiro/faturas",
  isAuth,
  FinanceiroFaturasController.store
);

financeiroFaturaRoutes.put(
  "/financeiro/faturas/:id",
  isAuth,
  FinanceiroFaturasController.update
);

financeiroFaturaRoutes.delete(
  "/financeiro/faturas/:id",
  isAuth,
  FinanceiroFaturasController.remove
);

export default financeiroFaturaRoutes;
