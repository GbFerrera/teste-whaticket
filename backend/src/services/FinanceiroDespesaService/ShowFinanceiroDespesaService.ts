import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";

const ShowFinanceiroDespesaService = async (
  id: string,
  companyId: number
): Promise<FinanceiroDespesa> => {
  try {
    const record = await FinanceiroDespesa.findOne({
      where: {
        id: Number(id),
        companyId
      },
      include: [
        {
          model: FinanceiroFornecedor,
          as: "fornecedor",
          attributes: ["id", "nome", "documento", "email", "telefone"]
        },
        {
          model: FinanceiroCategoria,
          as: "categoria",
          attributes: ["id", "nome", "cor"]
        }
      ]
    });

    if (!record) {
      throw new AppError("Despesa não encontrada", 404);
    }

    return record;
  } catch (err) {
    console.error("Erro ao buscar despesa:", err);
    throw new AppError("Erro ao buscar despesa", 500);
  }
};

export default ShowFinanceiroDespesaService;
