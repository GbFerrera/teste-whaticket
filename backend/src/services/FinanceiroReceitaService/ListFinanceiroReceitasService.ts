import FinanceiroReceita from "../../models/FinanceiroReceita";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";

interface ListFinanceiroReceitasParams {
  companyId: number;
  searchParam?: string;
  fornecedorId?: number;
  categoriaId?: number;
  status?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  pageNumber?: number;
}

const ListFinanceiroReceitasService = async ({
  companyId,
  searchParam = "",
  fornecedorId,
  categoriaId,
  status,
  dataVencimentoInicio,
  dataVencimentoFim,
  pageNumber = 1
}: ListFinanceiroReceitasParams) => {
  const limit = 20;
  const offset = limit * (pageNumber - 1);

  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition.descricao = { [require("sequelize").Op.iLike]: `%${searchParam}%` };
  }

  if (fornecedorId) {
    whereCondition.fornecedorId = fornecedorId;
  }

  if (categoriaId) {
    whereCondition.categoriaId = categoriaId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (dataVencimentoInicio || dataVencimentoFim) {
    whereCondition.dataVencimento = {};
    if (dataVencimentoInicio) {
      whereCondition.dataVencimento[require("sequelize").Op.gte] = dataVencimentoInicio;
    }
    if (dataVencimentoFim) {
      whereCondition.dataVencimento[require("sequelize").Op.lte] = dataVencimentoFim;
    }
  }

  const { count, rows: receitas } = await FinanceiroReceita.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: FinanceiroFornecedor,
        as: "fornecedor",
        attributes: ["id", "nome"]
      },
      {
        model: FinanceiroCategoria,
        as: "categoria",
        attributes: ["id", "nome", "tipo", "cor"]
      }
    ],
    limit,
    offset,
    order: [["dataVencimento", "ASC"]]
  });

  const hasMore = count > offset + receitas.length;

  return {
    receitas,
    count,
    hasMore
  };
};

export default ListFinanceiroReceitasService;
