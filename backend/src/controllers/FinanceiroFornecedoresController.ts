import { Request, Response } from "express";
import CreateFinanceiroFornecedorService from "../services/FinanceiroFornecedorService/CreateFinanceiroFornecedorService";
import ListFinanceiroFornecedoresService from "../services/FinanceiroFornecedorService/ListFinanceiroFornecedoresService";
import ShowFinanceiroFornecedorService from "../services/FinanceiroFornecedorService/ShowFinanceiroFornecedorService";
import UpdateFinanceiroFornecedorService from "../services/FinanceiroFornecedorService/UpdateFinanceiroFornecedorService";
import DeleteFinanceiroFornecedorService from "../services/FinanceiroFornecedorService/DeleteFinanceiroFornecedorService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    searchParam,
    categoria,
    ativo,
    pageNumber
  } = req.query as Record<string, any>;

  const result = await ListFinanceiroFornecedoresService({
    companyId: Number(companyId),
    searchParam,
    categoria,
    ativo: ativo === "true" ? true : ativo === "false" ? false : undefined,
    pageNumber: pageNumber ? Number(pageNumber) : undefined
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await ShowFinanceiroFornecedorService(id, Number(companyId));

  return res.json(record);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const record = await CreateFinanceiroFornecedorService({
    ...req.body,
    companyId: Number(companyId)
  });

  return res.status(201).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const record = await UpdateFinanceiroFornecedorService({
    id,
    companyId: Number(companyId),
    ...req.body
  });

  return res.json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFinanceiroFornecedorService(id, Number(companyId));

  return res.status(204).send();
};
