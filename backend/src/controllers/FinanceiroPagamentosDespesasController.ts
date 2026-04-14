import { Request, Response } from "express";
import CreateFinanceiroPagamentoDespesaService from "../services/FinanceiroPagamentoDespesaService/CreateFinanceiroPagamentoDespesaService";
import ListFinanceiroPagamentosDespesasService from "../services/FinanceiroPagamentoDespesaService/ListFinanceiroPagamentosDespesasService";
import ShowFinanceiroPagamentoDespesaService from "../services/FinanceiroPagamentoDespesaService/ShowFinanceiroPagamentoDespesaService";
import UpdateFinanceiroPagamentoDespesaService from "../services/FinanceiroPagamentoDespesaService/UpdateFinanceiroPagamentoDespesaService";
import DeleteFinanceiroPagamentoDespesaService from "../services/FinanceiroPagamentoDespesaService/DeleteFinanceiroPagamentoDespesaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    searchParam,
    despesaId,
    metodoPagamento,
    dataPagamentoInicio,
    dataPagamentoFim,
    pageNumber
  } = req.query as Record<string, any>;

  const result = await ListFinanceiroPagamentosDespesasService({
    companyId: Number(companyId),
    searchParam,
    despesaId: despesaId ? Number(despesaId) : undefined,
    metodoPagamento,
    dataPagamentoInicio,
    dataPagamentoFim,
    pageNumber: pageNumber ? Number(pageNumber) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await ShowFinanceiroPagamentoDespesaService(id, Number(companyId));

  return res.json(record);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const record = await CreateFinanceiroPagamentoDespesaService(req.body, Number(companyId));

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await UpdateFinanceiroPagamentoDespesaService(id, req.body, Number(companyId));

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroPagamentoDespesaService(id, Number(companyId));

  return res.status(204).send();
};
