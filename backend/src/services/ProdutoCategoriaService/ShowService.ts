import AppError from "../../errors/AppError";
import ProdutoCategoria from "../../models/ProdutoCategoria";

interface ShowParams {
  id: string | number;
  companyId: number;
}

const ShowService = async ({ id, companyId }: ShowParams): Promise<ProdutoCategoria> => {
  const categoria = await ProdutoCategoria.findOne({
    where: { id, companyId }
  });

  if (!categoria) {
    throw new AppError("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
  }

  return categoria;
};

export default ShowService;
