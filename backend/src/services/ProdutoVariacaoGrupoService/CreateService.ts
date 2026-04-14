import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";

interface CreateGrupoData {
  companyId: number;
  nome: string;
}

const CreateService = async ({ companyId, nome }: CreateGrupoData): Promise<ProdutoVariacaoGrupo> => {
  const trimmedName = nome?.trim();

  if (!trimmedName) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_INVALID_NAME", 400);
  }

  const duplicated = await ProdutoVariacaoGrupo.findOne({
    where: { companyId, nome: trimmedName }
  });

  if (duplicated) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_DUPLICATED", 400);
  }

  const grupo = await ProdutoVariacaoGrupo.create({ companyId, nome: trimmedName });

  return grupo;
};

export default CreateService;
