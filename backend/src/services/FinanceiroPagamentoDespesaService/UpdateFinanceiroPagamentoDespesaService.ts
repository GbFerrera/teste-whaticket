import FinanceiroPagamentoDespesa from "../../models/FinanceiroPagamentoDespesa";
import AppError from "../../errors/AppError";

interface UpdateData {
  valor?: number;
  metodoPagamento?: string;
  dataPagamento?: Date;
  observacoes?: string;
}

const UpdateFinanceiroPagamentoDespesaService = async (
  id: string,
  data: UpdateData,
  companyId: number
): Promise<FinanceiroPagamentoDespesa> => {
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

    await record.update(data);

    // Emitir evento via socket.io
    const io = require("../../libs/socket.io").getIO();
    io.to(`company-${companyId}-financeiro`).emit("financeiroPagamentoDespesa", {
      action: "update",
      record
    });

    return record.reload();
  } catch (err) {
    console.error("Erro ao atualizar pagamento de despesa:", err);
    throw new AppError("Erro ao atualizar pagamento de despesa", 500);
  }
};

export default UpdateFinanceiroPagamentoDespesaService;
