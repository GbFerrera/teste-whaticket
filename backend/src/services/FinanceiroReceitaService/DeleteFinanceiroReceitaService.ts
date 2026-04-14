import FinanceiroReceita from "../../models/FinanceiroReceita";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroReceitaService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  console.log("DEBUG: DeleteReceita - ID:", id, "CompanyID:", companyId);
  
  const receita = await FinanceiroReceita.findOne({
    where: {
      id,
      companyId
    }
  });

  console.log("DEBUG: Receita encontrada:", receita ? "SIM" : "NÃO");

  if (!receita) {
    throw new AppError("ERR_NO_FINANCEIRO_RECEITA_FOUND", 404);
  }

  await receita.destroy();

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_receita", {
    action: "delete",
    id
  });
};

export default DeleteFinanceiroReceitaService;
