import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";

interface CreateOpcaoData {
  companyId: number;
  grupoId: number;
  nome: string;
  ordem?: number;
}

const CreateService = async ({ companyId, grupoId, nome, ordem }: CreateOpcaoData): Promise<ProdutoVariacaoOpcao> => {
  const grupo = await ProdutoVariacaoGrupo.findOne({ where: { id: grupoId, companyId } });

  if (!grupo) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
  }

  const trimmedName = nome?.trim();
  if (!trimmedName) {
    throw new AppError("ERR_PRODUTO_VARIACAO_OPTION_INVALID_NAME", 400);
  }

  const opcao = await ProdutoVariacaoOpcao.create({
    grupoId,
    nome: trimmedName,
    ordem: Number.isFinite(ordem) ? Number(ordem) : 0
  });

  return opcao;
};

export default CreateService;
