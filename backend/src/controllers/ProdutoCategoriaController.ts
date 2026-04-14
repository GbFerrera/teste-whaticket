import { Request, Response } from "express";
import CreateService from "../services/ProdutoCategoriaService/CreateService";
import ListService from "../services/ProdutoCategoriaService/ListService";
import ShowService from "../services/ProdutoCategoriaService/ShowService";
import UpdateService from "../services/ProdutoCategoriaService/UpdateService";
import DeleteService from "../services/ProdutoCategoriaService/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const categorias = await ListService({ companyId });
  return res.json(categorias);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, slug, descricao } = req.body;

  const categoria = await CreateService({ companyId, nome, slug, descricao });
  return res.status(201).json(categoria);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { categoriaId } = req.params;

  const categoria = await ShowService({ id: categoriaId, companyId });
  return res.json(categoria);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { categoriaId } = req.params;
  const { nome, slug, descricao } = req.body;

  const categoria = await UpdateService({
    id: categoriaId,
    companyId,
    nome,
    slug,
    descricao
  });

  return res.json(categoria);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { categoriaId } = req.params;

  await DeleteService({ id: categoriaId, companyId });
  return res.json({ message: "Categoria removida" });
};
