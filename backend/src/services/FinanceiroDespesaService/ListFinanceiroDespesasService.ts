import { Op } from "sequelize";
import FinanceiroDespesa from "../../models/FinanceiroDespesa";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";

interface ListParams {
  companyId: number;
  searchParam?: string;
  fornecedorId?: number;
  categoriaId?: number;
  status?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  pageNumber?: number;
}

interface ResponseData {
  despesas: FinanceiroDespesa[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroDespesasService = async (
  params: ListParams
): Promise<ResponseData> => {
  try {
    const whereConditions: any = {
      companyId: params.companyId
    };

    if (params.searchParam) {
      whereConditions[Op.or] = [
        { descricao: { [Op.like]: `%${params.searchParam}%` } },
        { observacoes: { [Op.like]: `%${params.searchParam}%` } }
      ];
    }

    if (params.fornecedorId) {
      whereConditions.fornecedorId = params.fornecedorId;
    }

    if (params.categoriaId) {
      whereConditions.categoriaId = params.categoriaId;
    }

    if (params.status) {
      whereConditions.status = params.status;
    }

    if (params.dataVencimentoInicio || params.dataVencimentoFim) {
      whereConditions.dataVencimento = {};
      if (params.dataVencimentoInicio) {
        whereConditions.dataVencimento[Op.gte] = new Date(params.dataVencimentoInicio);
      }
      if (params.dataVencimentoFim) {
        whereConditions.dataVencimento[Op.lte] = new Date(params.dataVencimentoFim);
      }
    }

    const limit = 20;
    const offset = params.pageNumber ? (params.pageNumber - 1) * limit : 0;

    const { count, rows: despesas } = await FinanceiroDespesa.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: FinanceiroFornecedor,
          as: "fornecedor",
          attributes: ["id", "nome", "documento"]
        },
        {
          model: FinanceiroCategoria,
          as: "categoria", 
          attributes: ["id", "nome", "cor"]
        }
      ],
      limit,
      offset,
      order: [["dataVencimento", "DESC"]]
    });

    const hasMore = count > offset + despesas.length;

    return {
      despesas,
      count,
      hasMore
    };
  } catch (err) {
    console.error("Erro ao listar despesas:", err);
    throw new AppError("Erro ao listar despesas", 500);
  }
};

export default ListFinanceiroDespesasService;
