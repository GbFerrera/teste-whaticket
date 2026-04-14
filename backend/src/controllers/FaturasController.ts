import { Request, Response } from "express";
import CreateFaturaService from "../services/FaturasService/CreateFaturaService";
import ListFaturasService from "../services/FaturasService/ListFaturasService";
import ShowFaturaService from "../services/FaturasService/ShowFaturaService";
import UpdateFaturaService from "../services/FaturasService/UpdateFaturaService";
import DeleteFaturaService from "../services/FaturasService/DeleteFaturaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam = "", pageNumber = "1" } = req.query as any;

  const result = await ListFaturasService({
    companyId: +companyId,
    searchParam: String(searchParam || ""),
    pageNumber: String(pageNumber || "1")
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const fatura = await ShowFaturaService(id, +companyId);

  return res.json(fatura);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  const fatura = await CreateFaturaService({
    ...data,
    companyId: +companyId
  });

  return res.status(201).json(fatura);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const fields = req.body;

  const fatura = await UpdateFaturaService({
    id,
    companyId: +companyId,
    ...fields
  });

  return res.json(fatura);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteFaturaService(id, +companyId);

  return res.status(204).send();
};
