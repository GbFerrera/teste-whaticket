import AppError from "../../errors/AppError";
import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import FinanceiroFatura from "../../models/FinanceiroFatura";

const ShowFinanceiroPagamentoService = async (
  id: string | number,
  companyId: number
): Promise<FinanceiroPagamento> => {
  const pagamento = await FinanceiroPagamento.findOne({
    where: { id, companyId },
    include: [
      {
        model: FinanceiroFatura,
        as: "fatura",
        attributes: ["id", "descricao", "valor", "status", "clientId"]
      }
    ]
  });

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  return pagamento;
};

export default ShowFinanceiroPagamentoService;
