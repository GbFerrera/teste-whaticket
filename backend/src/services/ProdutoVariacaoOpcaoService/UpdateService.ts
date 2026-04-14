import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";

interface UpdateOpcaoData {
  companyId: number;
  opcaoId: number;
  nome?: string;
  ordem?: number;
}

const UpdateService = async ({ companyId, opcaoId, nome, ordem }: UpdateOpcaoData): Promise<ProdutoVariacaoOpcao> => {
  const opcao = await ProdutoVariacaoOpcao.findByPk(opcaoId, {
    include: [ProdutoVariacaoGrupo]
  });

  if (!opcao || !opcao.grupo || opcao.grupo.companyId !== companyId) {
    throw new AppError("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
  }

  const trimmedName = nome?.trim();
  const payload: Partial<ProdutoVariacaoOpcao> = {};

  if (trimmedName) {
    payload.nome = trimmedName;
  }

  if (ordem !== undefined) {
    payload.ordem = Number.isFinite(ordem) ? Number(ordem) : 0;
  }

  if (Object.keys(payload).length === 0) {
    return opcao;
  }

  await opcao.update(payload);

  return opcao;
};

export default UpdateService;
