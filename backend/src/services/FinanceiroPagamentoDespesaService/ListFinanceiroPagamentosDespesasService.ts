import { Op } from "sequelize";
import FinanceiroPagamentoDespesa from "../../models/FinanceiroPagamentoDespesa";
import AppError from "../../errors/AppError";

interface ListParams {
  companyId: number;
  searchParam?: string;
  despesaId?: number;
  metodoPagamento?: string;
  dataPagamentoInicio?: string;
  dataPagamentoFim?: string;
  pageNumber?: number;
}

interface ResponseData {
  pagamentos: FinanceiroPagamentoDespesa[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroPagamentosDespesasService = async (
  params: ListParams
): Promise<ResponseData> => {
  try {
    const whereConditions: any = {
      companyId: params.companyId
    };

    if (params.searchParam) {
      whereConditions[Op.or] = [
        { observacoes: { [Op.like]: `%${params.searchParam}%` } },
        { metodoPagamento: { [Op.like]: `%${params.searchParam}%` } }
      ];
    }

    if (params.despesaId) {
      whereConditions.despesaId = params.despesaId;
    }

    if (params.metodoPagamento) {
      whereConditions.metodoPagamento = params.metodoPagamento;
    }

    if (params.dataPagamentoInicio || params.dataPagamentoFim) {
      whereConditions.dataPagamento = {};
      if (params.dataPagamentoInicio) {
        whereConditions.dataPagamento[Op.gte] = new Date(params.dataPagamentoInicio);
      }
      if (params.dataPagamentoFim) {
        whereConditions.dataPagamento[Op.lte] = new Date(params.dataPagamentoFim);
      }
    }

    const limit = 20;
    const offset = params.pageNumber ? (params.pageNumber - 1) * limit : 0;

    const { count, rows: pagamentos } = await FinanceiroPagamentoDespesa.findAndCountAll({
      where: whereConditions,
      include: [
        {
          association: "despesa",
          attributes: ["id", "descricao", "status"]
        }
      ],
      limit,
      offset,
      order: [["dataPagamento", "DESC"]]
    });

    const hasMore = count > offset + pagamentos.length;

    return {
      pagamentos,
      count,
      hasMore
    };
  } catch (err) {
    console.error("Erro ao listar pagamentos de despesas:", err);
    throw new AppError("Erro ao listar pagamentos de despesas", 500);
  }
};

export default ListFinanceiroPagamentosDespesasService;
