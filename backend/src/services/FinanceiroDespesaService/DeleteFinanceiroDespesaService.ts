import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroDespesaService = async (
  id: string,
  companyId: number
): Promise<void> => {
  try {
    const record = await FinanceiroDespesa.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!record) {
      throw new AppError("Despesa não encontrada", 404);
    }

    await record.destroy();

    // Emitir evento via socket.io
    const io = getIO();
    io.to(`company-${companyId}`).emit("financeiro_despesa", {
      action: "delete",
      id
    });
  } catch (err) {
    console.error("Erro ao excluir despesa:", err);
    throw new AppError("Erro ao excluir despesa", 500);
  }
};

export default DeleteFinanceiroDespesaService;
