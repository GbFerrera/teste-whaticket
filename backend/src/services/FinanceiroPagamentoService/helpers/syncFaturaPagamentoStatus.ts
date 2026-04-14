import { Transaction } from "sequelize";
import FinanceiroFatura from "../../../models/FinanceiroFatura";
import FinanceiroPagamento from "../../../models/FinanceiroPagamento";

interface SyncOptions {
  companyId: number;
  faturaId: number;
  transaction?: Transaction;
}

const syncFaturaPagamentoStatus = async ({
  companyId,
  faturaId,
  transaction
}: SyncOptions): Promise<void> => {
  const fatura = await FinanceiroFatura.findOne({
    where: { id: faturaId, companyId },
    transaction
  });

  if (!fatura) {
    return;
  }

  const totalPagoRaw = await FinanceiroPagamento.sum("valor", {
    where: { companyId, faturaId },
    transaction
  });

  const totalPago = Number(totalPagoRaw || 0);
  const valorFatura = Number(fatura.valor || 0);

  const ultimoPagamento = await FinanceiroPagamento.findOne({
    where: { companyId, faturaId },
    order: [
      ["dataPagamento", "DESC"],
      ["id", "DESC"]
    ],
    transaction
  });

  let novoStatus = fatura.status;
  let dataPagamento: Date | null = ultimoPagamento?.dataPagamento || null;

  const isCancelada = fatura.status === "cancelada";
  const isTotalQuitado = valorFatura <= 0 || totalPago >= valorFatura;
  const venceu =
    !!fatura.dataVencimento &&
    new Date(fatura.dataVencimento).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0);

  if (!isCancelada) {
    if (isTotalQuitado) {
      novoStatus = "paga";
      if (!dataPagamento) {
        dataPagamento = new Date();
      }
    } else if (venceu) {
      novoStatus = "vencida";
      dataPagamento = null;
    } else {
      novoStatus = "aberta";
      dataPagamento = null;
    }
  }

  await fatura.update(
    {
      status: novoStatus,
      dataPagamento,
      valorPago: totalPago
    },
    { transaction }
  );
};

export default syncFaturaPagamentoStatus;
