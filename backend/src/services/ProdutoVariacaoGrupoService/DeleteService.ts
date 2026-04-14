import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";
import ProdutoVariacaoItem from "../../models/ProdutoVariacaoItem";

interface DeleteGrupoData {
  companyId: number;
  grupoId: number;
}

const DeleteService = async ({ companyId, grupoId }: DeleteGrupoData): Promise<void> => {
  const grupo = await ProdutoVariacaoGrupo.findOne({
    where: { id: grupoId, companyId },
    include: [{ model: ProdutoVariacaoOpcao }]
  });

  if (!grupo) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
  }

  const opcaoIds = grupo.opcoes?.map((opcao) => opcao.id) || [];

  if (opcaoIds.length) {
    await ProdutoVariacaoItem.destroy({ where: { opcaoId: opcaoIds } });
    await ProdutoVariacaoOpcao.destroy({ where: { id: opcaoIds } });
  }

  await grupo.destroy();
};

export default DeleteService;
