import { Op } from "sequelize";

import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import FinanceiroFatura from "../../models/FinanceiroFatura";

interface ListFinanceiroPagamentosRequest {
  companyId: number;
  faturaId?: string;
  metodoPagamento?: string;
  searchParam?: string;
  pageNumber?: string;
}

interface ListFinanceiroPagamentosResponse {
  pagamentos: FinanceiroPagamento[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroPagamentosService = async ({
  companyId,
  faturaId,
  metodoPagamento,
  searchParam = "",
  pageNumber = "1"
}: ListFinanceiroPagamentosRequest): Promise<ListFinanceiroPagamentosResponse> => {
  const where: any = { companyId };

  if (faturaId) {
    where.faturaId = faturaId;
  }

  if (metodoPagamento) {
    where.metodoPagamento = metodoPagamento;
  }

  if (searchParam) {
    const term = `%${searchParam.trim().toLowerCase()}%`;
    where[Op.or] = [
      { metodoPagamento: { [Op.iLike]: term } },
      { observacoes: { [Op.iLike]: term } }
    ];
  }

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const { rows, count } = await FinanceiroPagamento.findAndCountAll({
    where,
    include: [
      {
        model: FinanceiroFatura,
        as: "fatura",
        attributes: ["id", "descricao", "valor", "status", "clientId"]
      }
    ],
    limit,
    offset,
    order: [
      ["dataPagamento", "DESC"],
      ["id", "DESC"]
    ]
  });

  return {
    pagamentos: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListFinanceiroPagamentosService;
