import { Request, Response } from "express";

import ListServicosService from "../services/ServicoService/ListServicosService";
import CreateServicoService from "../services/ServicoService/CreateServicoService";
import ShowServicoService from "../services/ServicoService/ShowServicoService";
import UpdateServicoService from "../services/ServicoService/UpdateServicoService";
import DeleteServicoService from "../services/ServicoService/DeleteServicoService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const servicos = await ListServicosService({ companyId });
  return res.json(servicos);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { servicoId } = req.params;

  const servico = await ShowServicoService({ id: servicoId, companyId });
  return res.json(servico);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, descricao, valorOriginal, possuiDesconto, valorComDesconto } = req.body;

  const servico = await CreateServicoService({
    companyId,
    nome,
    descricao,
    valorOriginal,
    possuiDesconto,
    valorComDesconto
  });

  return res.status(201).json(servico);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { servicoId } = req.params;
  const { nome, descricao, valorOriginal, possuiDesconto, valorComDesconto } = req.body;

  const servico = await UpdateServicoService({
    id: servicoId,
    companyId,
    nome,
    descricao,
    valorOriginal,
    possuiDesconto,
    valorComDesconto
  });

  return res.json(servico);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { servicoId } = req.params;

  await DeleteServicoService({ id: servicoId, companyId });
  return res.json({ message: "Serviço removido com sucesso" });
};
