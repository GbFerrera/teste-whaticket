import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroDespesasController from "../controllers/FinanceiroDespesasController";

const financeiroDespesaRoutes = Router();

financeiroDespesaRoutes.get(
  "/financeiro/despesas",
  isAuth,
  FinanceiroDespesasController.index
);

financeiroDespesaRoutes.get(
  "/financeiro/despesas/:id",
  isAuth,
  FinanceiroDespesasController.show
);

financeiroDespesaRoutes.post(
  "/financeiro/despesas",
  isAuth,
  FinanceiroDespesasController.store
);

financeiroDespesaRoutes.put(
  "/financeiro/despesas/:id",
  isAuth,
  FinanceiroDespesasController.update
);

financeiroDespesaRoutes.delete(
  "/financeiro/despesas/:id",
  isAuth,
  FinanceiroDespesasController.remove
);

financeiroDespesaRoutes.post(
  "/financeiro/despesas/:id/pagar",
  isAuth,
  FinanceiroDespesasController.pagar
);

export default financeiroDespesaRoutes;
