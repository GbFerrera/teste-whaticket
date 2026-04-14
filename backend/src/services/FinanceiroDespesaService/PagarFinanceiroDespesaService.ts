import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import AppError from "../../errors/AppError";

interface PagamentoData {
  dataPagamento: Date;
  metodoPagamento: string;
  observacoes?: string;
}

const PagarFinanceiroDespesaService = async (
  id: string,
  companyId: number,
  data: PagamentoData
): Promise<FinanceiroDespesa> => {
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

    if (record.status === "paga") {
      throw new AppError("Despesa já está paga", 400);
    }

    await record.update({
      status: "paga",
      dataPagamento: data.dataPagamento,
      metodoPagamentoReal: data.metodoPagamento
    });

    // Emitir evento via socket.io
    const io = require("../../libs/socket.io").getIO();
    io.to(`company-${companyId}-financeiro`).emit("financeiroDespesa", {
      action: "pagar",
      record
    });

    return record.reload();
  } catch (err) {
    console.error("Erro ao pagar despesa:", err);
    throw new AppError("Erro ao pagar despesa", 500);
  }
};

export default PagarFinanceiroDespesaService;
