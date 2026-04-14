import AppError from "../../errors/AppError";
import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import syncFaturaPagamentoStatus from "./helpers/syncFaturaPagamentoStatus";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroPagamentoService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const pagamento = await FinanceiroPagamento.findOne({
    where: { id, companyId }
  });

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  await pagamento.destroy();

  await syncFaturaPagamentoStatus({
    companyId,
    faturaId: pagamento.faturaId
  });

  const fatura = await FinanceiroFatura.findOne({
    where: { id: pagamento.faturaId, companyId }
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
    action: "pagamento:deleted",
    payload: {
      pagamentoId: pagamento.id,
      fatura
    }
  });
};

export default DeleteFinanceiroPagamentoService;
