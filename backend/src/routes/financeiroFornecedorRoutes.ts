import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroFornecedoresController from "../controllers/FinanceiroFornecedoresController";

const financeiroFornecedorRoutes = Router();

financeiroFornecedorRoutes.get(
  "/financeiro/fornecedores",
  isAuth,
  FinanceiroFornecedoresController.index
);

financeiroFornecedorRoutes.get(
  "/financeiro/fornecedores/:id",
  isAuth,
  FinanceiroFornecedoresController.show
);

financeiroFornecedorRoutes.post(
  "/financeiro/fornecedores",
  isAuth,
  FinanceiroFornecedoresController.store
);

financeiroFornecedorRoutes.put(
  "/financeiro/fornecedores/:id",
  isAuth,
  FinanceiroFornecedoresController.update
);

financeiroFornecedorRoutes.delete(
  "/financeiro/fornecedores/:id",
  isAuth,
  FinanceiroFornecedoresController.remove
);

export default financeiroFornecedorRoutes;
