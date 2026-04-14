// @ts-nocheck
import { Request, Response } from "express";
import ListService from "../services/NegocioService/ListService";
import CreateService from "../services/NegocioService/CreateService";
import ShowService from "../services/NegocioService/ShowService";
import UpdateService from "../services/NegocioService/UpdateService";
import DeleteService from "../services/NegocioService/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const negocios = await ListService(companyId);

  return res.json(negocios);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, description, kanbanBoards, users } = req.body;

  const negocio = await CreateService({
    companyId,
    name,
    description,
    kanbanBoards,
    users
  });

  return res.status(200).json(negocio);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { negocioId } = req.params;

  const negocio = await ShowService(negocioId, companyId);

  return res.status(200).json(negocio);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { negocioId } = req.params;
  const data = req.body;

  const negocio = await UpdateService(negocioId, companyId, data);

  return res.status(200).json(negocio);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { negocioId } = req.params;

  await DeleteService(negocioId, companyId);

  return res.status(200).json({ message: "Negocio deleted" });
};
