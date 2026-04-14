import FinanceiroPagamentoDespesa from "../../models/FinanceiroPagamentoDespesa";
import AppError from "../../errors/AppError";

const ShowFinanceiroPagamentoDespesaService = async (
  id: string,
  companyId: number
): Promise<FinanceiroPagamentoDespesa> => {
  try {
    const record = await FinanceiroPagamentoDespesa.findOne({
      where: {
        id: Number(id),
        companyId
      },
      include: [
        {
          association: "despesa",
          attributes: ["id", "descricao", "status"]
        }
      ]
    });

    if (!record) {
      throw new AppError("Pagamento não encontrado", 404);
    }

    return record;
  } catch (err) {
    console.error("Erro ao buscar pagamento de despesa:", err);
    throw new AppError("Erro ao buscar pagamento de despesa", 500);
  }
};

export default ShowFinanceiroPagamentoDespesaService;
