import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";

const ShowFinanceiroCategoriaService = async (
  id: string | number,
  companyId: number
): Promise<FinanceiroCategoria> => {
  const categoria = await FinanceiroCategoria.findByPk(id, {
    include: [
      {
        model: FinanceiroCategoria,
        as: "filhos",
        required: false
      },
      {
        model: FinanceiroCategoria,
        as: "pai",
        required: false
      }
    ]
  });

  if (!categoria) {
    throw new AppError("ERR_NO_FINANCEIRO_CATEGORIA_FOUND", 404);
  }

  return categoria;
};

export default ShowFinanceiroCategoriaService;
