import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroPagamentosController from "../controllers/FinanceiroPagamentosController";

const financeiroPagamentoRoutes = Router();

financeiroPagamentoRoutes.get(
  "/financeiro/pagamentos",
  isAuth,
  FinanceiroPagamentosController.index
);

financeiroPagamentoRoutes.get(
  "/financeiro/pagamentos/:id",
  isAuth,
  FinanceiroPagamentosController.show
);

financeiroPagamentoRoutes.post(
  "/financeiro/pagamentos",
  isAuth,
  FinanceiroPagamentosController.store
);

financeiroPagamentoRoutes.put(
  "/financeiro/pagamentos/:id",
  isAuth,
  FinanceiroPagamentosController.update
);

financeiroPagamentoRoutes.delete(
  "/financeiro/pagamentos/:id",
  isAuth,
  FinanceiroPagamentosController.remove
);

export default financeiroPagamentoRoutes;
