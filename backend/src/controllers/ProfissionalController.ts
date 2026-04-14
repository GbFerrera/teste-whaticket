import { Request, Response } from "express";

import ListProfissionaisService from "../services/ProfissionalService/ListProfissionaisService";
import CreateProfissionalService from "../services/ProfissionalService/CreateProfissionalService";
import ShowProfissionalService from "../services/ProfissionalService/ShowProfissionalService";
import UpdateProfissionalService from "../services/ProfissionalService/UpdateProfissionalService";
import DeleteProfissionalService from "../services/ProfissionalService/DeleteProfissionalService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const profissionais = await ListProfissionaisService({ companyId });
  return res.json(profissionais);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { profissionalId } = req.params;

  const profissional = await ShowProfissionalService({ id: profissionalId, companyId });
  return res.json(profissional);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    nome,
    servicos,
    agenda,
    ativo,
    comissao,
    valorEmAberto,
    valoresRecebidos,
    valoresAReceber
  } = req.body;

  const profissional = await CreateProfissionalService({
    companyId,
    nome,
    servicos,
    agenda,
    ativo,
    comissao,
    valorEmAberto,
    valoresRecebidos,
    valoresAReceber
  });

  return res.status(201).json(profissional);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { profissionalId } = req.params;
  const {
    nome,
    servicos,
    agenda,
    ativo,
    comissao,
    valorEmAberto,
    valoresRecebidos,
    valoresAReceber
  } = req.body;

  const profissional = await UpdateProfissionalService({
    id: profissionalId,
    companyId,
    nome,
    servicos,
    agenda,
    ativo,
    comissao,
    valorEmAberto,
    valoresRecebidos,
    valoresAReceber
  });

  return res.json(profissional);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { profissionalId } = req.params;

  await DeleteProfissionalService({ id: profissionalId, companyId });
  return res.json({ message: "Profissional removido com sucesso" });
};
