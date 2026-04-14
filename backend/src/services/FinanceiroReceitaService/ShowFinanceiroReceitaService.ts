import FinanceiroReceita from "../../models/FinanceiroReceita";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";

const ShowFinanceiroReceitaService = async (
  id: string | number,
  companyId: number
): Promise<FinanceiroReceita> => {
  const receita = await FinanceiroReceita.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: FinanceiroFornecedor,
        as: "fornecedor",
        required: false
      },
      {
        model: FinanceiroCategoria,
        as: "categoria",
        required: false
      }
    ]
  });

  if (!receita) {
    throw new AppError("ERR_NO_FINANCEIRO_RECEITA_FOUND", 404);
  }

  return receita;
};

export default ShowFinanceiroReceitaService;
