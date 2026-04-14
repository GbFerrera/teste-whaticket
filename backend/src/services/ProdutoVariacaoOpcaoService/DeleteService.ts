import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoItem from "../../models/ProdutoVariacaoItem";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";

interface DeleteOpcaoData {
  companyId: number;
  opcaoId: number;
}

const DeleteService = async ({ companyId, opcaoId }: DeleteOpcaoData): Promise<void> => {
  const opcao = await ProdutoVariacaoOpcao.findByPk(opcaoId, {
    include: [ProdutoVariacaoGrupo]
  });

  if (!opcao || !opcao.grupo || opcao.grupo.companyId !== companyId) {
    throw new AppError("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
  }

  await ProdutoVariacaoItem.destroy({ where: { opcaoId } });
  await opcao.destroy();
};

export default DeleteService;
