import Produto from "../../models/Produto";
import AppError from "../../errors/AppError";

const DeleteService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const produto = await Produto.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!produto) {
    throw new AppError("ERR_PRODUTO_NOT_FOUND", 404);
  }

  await produto.destroy();
};

export default DeleteService;
