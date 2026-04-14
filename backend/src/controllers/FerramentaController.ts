// @ts-nocheck
import { Request, Response } from "express";
import ListService from "../services/FerramentaService/ListService";
import CreateService from "../services/FerramentaService/CreateService";
import ShowService from "../services/FerramentaService/ShowService";
import UpdateService from "../services/FerramentaService/UpdateService";
import DeleteService from "../services/FerramentaService/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { status } = req.query as { status?: string };
  const { companyId } = req.user;

  const ferramentas = await ListService({ status, companyId });

  return res.json(ferramentas);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;

  const ferramenta = await CreateService({
    ...data,
    companyId
  });

  return res.status(200).json(ferramenta);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ferramentaId } = req.params;

  const ferramenta = await ShowService(ferramentaId);

  return res.status(200).json(ferramenta);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ferramentaId } = req.params;
  const data = req.body;

  const ferramenta = await UpdateService(ferramentaId, data);

  return res.status(200).json(ferramenta);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ferramentaId } = req.params;

  await DeleteService(ferramentaId);

  return res.status(200).json({ message: "Ferramenta deleted" });
};
