import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroPagamentosDespesasController from "../controllers/FinanceiroPagamentosDespesasController";

const financeiroPagamentoDespesaRoutes = Router();

financeiroPagamentoDespesaRoutes.get(
  "/financeiro/pagamentos-despesas",
  isAuth,
  FinanceiroPagamentosDespesasController.index
);

financeiroPagamentoDespesaRoutes.get(
  "/financeiro/pagamentos-despesas/:id",
  isAuth,
  FinanceiroPagamentosDespesasController.show
);

financeiroPagamentoDespesaRoutes.post(
  "/financeiro/pagamentos-despesas",
  isAuth,
  FinanceiroPagamentosDespesasController.store
);

financeiroPagamentoDespesaRoutes.put(
  "/financeiro/pagamentos-despesas/:id",
  isAuth,
  FinanceiroPagamentosDespesasController.update
);

financeiroPagamentoDespesaRoutes.delete(
  "/financeiro/pagamentos-despesas/:id",
  isAuth,
  FinanceiroPagamentosDespesasController.remove
);

export default financeiroPagamentoDespesaRoutes;
