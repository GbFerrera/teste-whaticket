import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroCategoriaService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  console.log("DEBUG: DeleteCategoria - ID:", id, "CompanyID:", companyId);
  
  const categoria = await FinanceiroCategoria.findOne({
    where: {
      id,
      companyId
    }
  });

  console.log("DEBUG: Categoria encontrada:", categoria ? "SIM" : "NÃO");

  if (!categoria) {
    throw new AppError("ERR_NO_FINANCEIRO_CATEGORIA_FOUND", 404);
  }

  // Verificar se existem categorias filhas
  const categoriasFilhas = await FinanceiroCategoria.findAll({
    where: {
      paiId: categoria.id
    }
  });

  if (categoriasFilhas.length > 0) {
    throw new AppError("Não é possível excluir categoria que possui categorias filhas.");
  }

  await categoria.destroy();

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_categoria", {
    action: "delete",
    data: { id }
  });
};

export default DeleteFinanceiroCategoriaService;
