import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroFornecedorService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  console.log("DEBUG: DeleteFornecedor - ID:", id, "CompanyID:", companyId);
  
  const fornecedor = await FinanceiroFornecedor.findOne({
    where: {
      id,
      companyId
    }
  });

  console.log("DEBUG: Fornecedor encontrado:", fornecedor ? "SIM" : "NÃO");

  if (!fornecedor) {
    throw new AppError("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
  }

  // Verificar se existem despesas vinculadas
  const despesasCount = await FinanceiroDespesa.count({
    where: {
      fornecedorId: fornecedor.id
    }
  });

  if (despesasCount > 0) {
    throw new AppError("Não é possível excluir fornecedor que possui despesas vinculadas.");
  }

  await fornecedor.destroy();

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_fornecedor", {
    action: "delete",
    data: { id }
  });
};

export default DeleteFinanceiroFornecedorService;
