import { Op } from "sequelize";
import FinanceiroPagamentoDespesa from "../../models/FinanceiroPagamentoDespesa";
import AppError from "../../errors/AppError";

interface RequestData {
  despesaId: number;
  valor: number;
  metodoPagamento: string;
  dataPagamento: Date;
  observacoes?: string;
}

const CreateFinanceiroPagamentoDespesaService = async (
  data: RequestData,
  companyId: number
): Promise<FinanceiroPagamentoDespesa> => {
  try {
    // Verificar se a despesa existe e pertence à empresa
    const despesa = await FinanceiroPagamentoDespesa.findOne({
      where: {
        id: data.despesaId,
        companyId
      }
    });

    if (!despesa) {
      throw new AppError("Despesa não encontrada", 404);
    }

    const record = await FinanceiroPagamentoDespesa.create({
      despesaId: data.despesaId,
      valor: data.valor,
      metodoPagamento: data.metodoPagamento,
      dataPagamento: data.dataPagamento,
      observacoes: data.observacoes || null,
      companyId
    });

    // Atualizar status da despesa para paga
    await despesa.update({
      status: "paga",
      dataPagamento: data.dataPagamento,
      metodoPagamentoReal: data.metodoPagamento
    });

    // Emitir evento via socket.io
    const io = require("../../libs/socket.io").getIO();
    io.to(`company-${companyId}-financeiro`).emit("financeiroPagamentoDespesa", {
      action: "create",
      record: record
    });

    return record;
  } catch (err) {
    console.error("Erro ao criar pagamento de despesa:", err);
    throw new AppError("Erro ao criar pagamento de despesa", 500);
  }
};

export default CreateFinanceiroPagamentoDespesaService;
