import { Request, Response } from "express";

import CreateFinanceiroPagamentoService from "../services/FinanceiroPagamentoService/CreateFinanceiroPagamentoService";
import ListFinanceiroPagamentosService from "../services/FinanceiroPagamentoService/ListFinanceiroPagamentosService";
import ShowFinanceiroPagamentoService from "../services/FinanceiroPagamentoService/ShowFinanceiroPagamentoService";
import UpdateFinanceiroPagamentoService from "../services/FinanceiroPagamentoService/UpdateFinanceiroPagamentoService";
import DeleteFinanceiroPagamentoService from "../services/FinanceiroPagamentoService/DeleteFinanceiroPagamentoService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { faturaId, metodoPagamento, searchParam, pageNumber } =
    req.query as Record<string, string>;

  const result = await ListFinanceiroPagamentosService({
    companyId: Number(companyId),
    faturaId,
    metodoPagamento,
    searchParam,
    pageNumber
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const pagamento = await ShowFinanceiroPagamentoService(id, Number(companyId));

  return res.json(pagamento);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const pagamento = await CreateFinanceiroPagamentoService({
    ...req.body,
    companyId: Number(companyId)
  });

  return res.status(201).json(pagamento);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const pagamento = await UpdateFinanceiroPagamentoService({
    id,
    companyId: Number(companyId),
    ...req.body
  });

  return res.json(pagamento);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroPagamentoService(id, Number(companyId));

  return res.status(204).send();
};
