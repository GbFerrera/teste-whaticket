import AppError from "../../errors/AppError";
import Produto from "../../models/Produto";
import ProdutoCategoria from "../../models/ProdutoCategoria";

interface DeleteParams {
  id: string | number;
  companyId: number;
}

const DeleteService = async ({ id, companyId }: DeleteParams): Promise<void> => {
  const categoria = await ProdutoCategoria.findOne({
    where: { id, companyId }
  });

  if (!categoria) {
    throw new AppError("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
  }

  const linkedProduct = await Produto.findOne({
    where: {
      companyId,
      categoriaId: id
    }
  });

  if (linkedProduct) {
    throw new AppError("ERR_PRODUTO_CATEGORIA_IN_USE", 400);
  }

  await categoria.destroy();
};

export default DeleteService;
