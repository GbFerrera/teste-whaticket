import { Request, Response } from "express";
import CreateFinanceiroCategoriaService from "../services/FinanceiroCategoriaService/CreateFinanceiroCategoriaService";
import ListFinanceiroCategoriasService from "../services/FinanceiroCategoriaService/ListFinanceiroCategoriasService";
import ShowFinanceiroCategoriaService from "../services/FinanceiroCategoriaService/ShowFinanceiroCategoriaService";
import UpdateFinanceiroCategoriaService from "../services/FinanceiroCategoriaService/UpdateFinanceiroCategoriaService";
import DeleteFinanceiroCategoriaService from "../services/FinanceiroCategoriaService/DeleteFinanceiroCategoriaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    searchParam,
    tipo,
    ativa,
    pageNumber
  } = req.query as Record<string, any>;

  const result = await ListFinanceiroCategoriasService({
    companyId: Number(companyId),
    searchParam,
    tipo,
    ativo: ativa === "true" ? true : ativa === "false" ? false : undefined,
    pageNumber: pageNumber ? Number(pageNumber) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await ShowFinanceiroCategoriaService(id, Number(companyId));

  return res.json(record);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const record = await CreateFinanceiroCategoriaService({
    ...req.body,
    companyId: Number(companyId)
  });

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await UpdateFinanceiroCategoriaService({
    id,
    companyId: Number(companyId),
    ...req.body
  });

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroCategoriaService(id, Number(companyId));

  return res.status(204).send();
};
