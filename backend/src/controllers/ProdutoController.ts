// @ts-nocheck
import { Request, Response } from "express";
import ListService from "../services/ProdutoService/ListService";
import CreateService from "../services/ProdutoService/CreateService";
import ShowService from "../services/ProdutoService/ShowService";
import UpdateService from "../services/ProdutoService/UpdateService";
import DeleteService from "../services/ProdutoService/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tipo, categoriaId } = req.query as { tipo?: string; categoriaId?: string };

  const produtos = await ListService({
    companyId,
    tipo,
    categoriaId: categoriaId ? Number(categoriaId) : undefined
  });

  return res.json(produtos);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  console.log("Dados recebidos no controller:", data);

  const produto = await CreateService({
    ...data,
    categoriaId: data.categoriaId ? Number(data.categoriaId) : null,
    companyId
  });

  return res.status(200).json(produto);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { produtoId } = req.params;

  const produto = await ShowService(produtoId, companyId);

  return res.status(200).json(produto);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { produtoId } = req.params;
  const data = req.body;

  console.log("Dados recebidos no update:", data);

  const produto = await UpdateService(produtoId, companyId, {
    ...data,
    categoriaId:
      data.hasOwnProperty("categoriaId") && data.categoriaId !== undefined
        ? data.categoriaId
          ? Number(data.categoriaId)
          : null
        : undefined
  });

  return res.status(200).json(produto);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { produtoId } = req.params;

  await DeleteService(produtoId, companyId);

  return res.status(200).json({ message: "Produto deleted" });
};

export const uploadImagem = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File | undefined;

  if (!file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  // multer já salvou o arquivo em disco usando uploadConfig
  // Precisamos devolver o caminho relativo dentro da pasta public
  // para que o frontend consiga montar a URL correta.

  const { companyId } = (req as any).user || {};
  const { typeArch } = (req.body || {}) as { typeArch?: string };

  let relativePath = file.filename;

  if (typeArch && typeArch !== "announcements" && typeArch !== "logo" && companyId) {
    // espelha a lógica de upload.ts (company{companyId}/typeArch/filename)
    relativePath = `company${companyId}/${typeArch}/${file.filename}`;
  }

  return res.status(200).json({ filename: relativePath });
};
