import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface UpdateData {
  fornecedorId?: number;
  categoriaId?: number;
  descricao?: string;
  valor?: number;
  status?: string;
  dataVencimento?: Date;
  dataPagamento?: Date;
  metodoPagamentoPrevisto?: string;
  metodoPagamentoReal?: string;
  observacoes?: string;
  recorrente?: boolean;
  dataInicio?: Date;
  dataFim?: Date;
  tipoRecorrencia?: string;
  quantidadeCiclos?: number;
  cicloAtual?: number;
}

const UpdateFinanceiroDespesaService = async (
  id: string,
  data: UpdateData,
  companyId: number
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

    await record.update(data);

    // Emitir evento via socket.io
    const io = getIO();
    io.to(`company-${companyId}`).emit("financeiro_despesa", {
      action: "update",
      record
    });

    return record.reload();
  } catch (err) {
    console.error("Erro ao atualizar despesa:", err);
    throw new AppError("Erro ao atualizar despesa", 500);
  }
};

export default UpdateFinanceiroDespesaService;
