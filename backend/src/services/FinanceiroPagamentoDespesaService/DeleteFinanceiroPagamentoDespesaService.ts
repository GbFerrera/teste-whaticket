import FinanceiroPagamentoDespesa from "../../models/FinanceiroPagamentoDespesa";
import AppError from "../../errors/AppError";

const DeleteFinanceiroPagamentoDespesaService = async (
  id: string,
  companyId: number
): Promise<void> => {
  try {
    const record = await FinanceiroPagamentoDespesa.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!record) {
      throw new AppError("Pagamento não encontrado", 404);
    }

    await record.destroy();

    // Emitir evento via socket.io
    const io = require("../../libs/socket.io").getIO();
    io.to(`company-${companyId}-financeiro`).emit("financeiroPagamentoDespesa", {
      action: "delete",
      id
    });
  } catch (err) {
    console.error("Erro ao excluir pagamento de despesa:", err);
    throw new AppError("Erro ao excluir pagamento de despesa", 500);
  }
};

export default DeleteFinanceiroPagamentoDespesaService;
