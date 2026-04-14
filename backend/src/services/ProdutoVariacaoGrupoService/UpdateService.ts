import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";

interface UpdateGrupoData {
  companyId: number;
  grupoId: number;
  nome: string;
}

const UpdateService = async ({ companyId, grupoId, nome }: UpdateGrupoData): Promise<ProdutoVariacaoGrupo> => {
  const trimmedName = nome?.trim();

  if (!trimmedName) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_INVALID_NAME", 400);
  }

  const grupo = await ProdutoVariacaoGrupo.findOne({ where: { id: grupoId, companyId } });

  if (!grupo) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
  }

  const duplicated = await ProdutoVariacaoGrupo.findOne({
    where: {
      companyId,
      nome: trimmedName,
      id: {
        [Op.ne]: grupoId
      }
    }
  });

  if (duplicated) {
    throw new AppError("ERR_PRODUTO_VARIACAO_GRUPO_DUPLICATED", 400);
  }

  await grupo.update({ nome: trimmedName });

  return grupo;
};

export default UpdateService;
