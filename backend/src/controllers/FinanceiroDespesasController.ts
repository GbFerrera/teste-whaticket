import { Request, Response } from "express";
import CreateFinanceiroDespesaService from "../services/FinanceiroDespesaService/CreateFinanceiroDespesaService";
import ListFinanceiroDespesasService from "../services/FinanceiroDespesaService/ListFinanceiroDespesasService";
import ShowFinanceiroDespesaService from "../services/FinanceiroDespesaService/ShowFinanceiroDespesaService";
import UpdateFinanceiroDespesaService from "../services/FinanceiroDespesaService/UpdateFinanceiroDespesaService";
import DeleteFinanceiroDespesaService from "../services/FinanceiroDespesaService/DeleteFinanceiroDespesaService";
import PagarFinanceiroDespesaService from "../services/FinanceiroDespesaService/PagarFinanceiroDespesaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    searchParam,
    fornecedorId,
    categoriaId,
    status,
    dataVencimentoInicio,
    dataVencimentoFim,
    pageNumber
  } = req.query as Record<string, any>;

  const result = await ListFinanceiroDespesasService({
    companyId: Number(companyId),
    searchParam,
    fornecedorId: fornecedorId ? Number(fornecedorId) : undefined,
    categoriaId: categoriaId ? Number(categoriaId) : undefined,
    status,
    dataVencimentoInicio,
    dataVencimentoFim,
    pageNumber: pageNumber ? Number(pageNumber) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await ShowFinanceiroDespesaService(id, Number(companyId));

  return res.json(record);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  console.log("DEBUG: companyId do usuário:", companyId);
  console.log("DEBUG: req.body:", req.body);

  const record = await CreateFinanceiroDespesaService({
    ...req.body,
    companyId: Number(companyId)
  });

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await UpdateFinanceiroDespesaService(id, req.body, Number(companyId));

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroDespesaService(id, Number(companyId));

  return res.status(204).send();
};

export const pagar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await PagarFinanceiroDespesaService(id, Number(companyId), req.body);

  return res.json(record);
};
