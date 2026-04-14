import { Request, Response } from "express";
import CreateFinanceiroReceitaService from "../services/FinanceiroReceitaService/CreateFinanceiroReceitaService";
import ListFinanceiroReceitasService from "../services/FinanceiroReceitaService/ListFinanceiroReceitasService";
import ShowFinanceiroReceitaService from "../services/FinanceiroReceitaService/ShowFinanceiroReceitaService";
import UpdateFinanceiroReceitaService from "../services/FinanceiroReceitaService/UpdateFinanceiroReceitaService";
import DeleteFinanceiroReceitaService from "../services/FinanceiroReceitaService/DeleteFinanceiroReceitaService";

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

  const result = await ListFinanceiroReceitasService({
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

  const record = await ShowFinanceiroReceitaService(id, Number(companyId));

  return res.json(record);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const record = await CreateFinanceiroReceitaService({
    ...req.body,
    companyId: Number(companyId)
  });

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await UpdateFinanceiroReceitaService(id, req.body, Number(companyId));

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroReceitaService(id, Number(companyId));

  return res.status(204).send();
};
