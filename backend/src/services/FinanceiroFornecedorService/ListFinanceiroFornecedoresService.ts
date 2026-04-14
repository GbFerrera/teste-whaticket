import { Op } from "sequelize";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";

interface ListParams {
  companyId: number;
  searchParam?: string;
  categoria?: string;
  ativo?: boolean;
  pageNumber?: number;
}

interface ListFinanceiroFornecedoresResponse {
  fornecedores: FinanceiroFornecedor[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroFornecedoresService = async ({
  companyId,
  searchParam = "",
  categoria,
  ativo,
  pageNumber = 1
}: ListParams): Promise<ListFinanceiroFornecedoresResponse> => {
  const where: any = { companyId };

  if (searchParam) {
    const term = `%${searchParam.trim().toLowerCase()}%`;
    where[Op.or] = [
      { nome: { [Op.iLike]: term } },
      { documento: { [Op.iLike]: term } },
      { email: { [Op.iLike]: term } },
      { telefone: { [Op.iLike]: term } },
      { categoria: { [Op.iLike]: term } }
    ];
  }

  if (categoria) {
    where.categoria = { [Op.iLike]: `%${categoria.trim()}%` };
  }

  if (typeof ativo !== "undefined") {
    where.ativo = ativo;
  }

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const { count, rows: fornecedores } = await FinanceiroFornecedor.findAndCountAll({
    where,
    limit,
    offset,
    order: [["nome", "ASC"]]
  });

  const hasMore = count > offset + fornecedores.length;

  return {
    fornecedores,
    count,
    hasMore
  };
};

export default ListFinanceiroFornecedoresService;
