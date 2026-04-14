import { Request, Response } from "express";
import ListGrupoService from "../services/ProdutoVariacaoGrupoService/ListService";
import CreateGrupoService from "../services/ProdutoVariacaoGrupoService/CreateService";
import UpdateGrupoService from "../services/ProdutoVariacaoGrupoService/UpdateService";
import DeleteGrupoService from "../services/ProdutoVariacaoGrupoService/DeleteService";
import CreateOpcaoService from "../services/ProdutoVariacaoOpcaoService/CreateService";
import UpdateOpcaoService from "../services/ProdutoVariacaoOpcaoService/UpdateService";
import DeleteOpcaoService from "../services/ProdutoVariacaoOpcaoService/DeleteService";

export const listGrupos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const grupos = await ListGrupoService(companyId);
  return res.json(grupos);
};

export const createGrupo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;

  const grupo = await CreateGrupoService({ companyId, nome });
  return res.status(201).json(grupo);
};

export const updateGrupo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { grupoId } = req.params;
  const { nome } = req.body;

  const grupo = await UpdateGrupoService({
    companyId,
    grupoId: Number(grupoId),
    nome
  });

  return res.json(grupo);
};

export const deleteGrupo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { grupoId } = req.params;

  await DeleteGrupoService({ companyId, grupoId: Number(grupoId) });
  return res.status(204).send();
};

export const createOpcao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { grupoId, nome, ordem } = req.body;

  const opcao = await CreateOpcaoService({
    companyId,
    grupoId: Number(grupoId),
    nome,
    ordem: ordem !== undefined ? Number(ordem) : undefined
  });

  return res.status(201).json(opcao);
};

export const updateOpcao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { opcaoId } = req.params;
  const { nome, ordem } = req.body;

  const opcao = await UpdateOpcaoService({
    companyId,
    opcaoId: Number(opcaoId),
    nome,
    ordem: ordem !== undefined ? Number(ordem) : undefined
  });

  return res.json(opcao);
};

export const deleteOpcao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { opcaoId } = req.params;

  await DeleteOpcaoService({ companyId, opcaoId: Number(opcaoId) });
  return res.status(204).send();
};
