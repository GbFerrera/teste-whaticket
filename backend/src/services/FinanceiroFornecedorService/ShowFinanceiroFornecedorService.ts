import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import AppError from "../../errors/AppError";

const ShowFinanceiroFornecedorService = async (
  id: string | number,
  companyId: number
): Promise<FinanceiroFornecedor> => {
  const fornecedor = await FinanceiroFornecedor.findByPk(id);

  if (!fornecedor) {
    throw new AppError("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
  }

  return fornecedor;
};

export default ShowFinanceiroFornecedorService;
