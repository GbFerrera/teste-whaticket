import { Op } from "sequelize";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";

interface ListFinanceiroFaturasQuery {
  companyId: number;
  searchParam?: string;
  status?: string;
  tipoRecorrencia?: string;
  ativa?: string;
  clientId?: string;
  projectId?: string;
  pageNumber?: string;
}

interface ListFinanceiroFaturasResponse {
  faturamentos: FinanceiroFatura[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroFaturasService = async ({
  companyId,
  searchParam = "",
  status,
  tipoRecorrencia,
  ativa,
  clientId,
  projectId,
  pageNumber = "1"
}: ListFinanceiroFaturasQuery): Promise<ListFinanceiroFaturasResponse> => {
  const where: any = { companyId };

  if (searchParam) {
    const term = `%${searchParam.trim().toLowerCase()}%`;
    where[Op.or] = [
      { descricao: { [Op.iLike]: term } },
      { status: { [Op.iLike]: term } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (tipoRecorrencia) {
    where.tipoRecorrencia = tipoRecorrencia;
  }

  if (typeof ativa !== "undefined") {
    where.ativa = ativa === "true";
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (projectId) {
    where.projectId = projectId;
  }

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const { rows, count } = await FinanceiroFatura.findAndCountAll({
    where,
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone", "status"]
      }
    ],
    limit,
    offset,
    order: [
      ["dataVencimento", "DESC"],
      ["id", "DESC"]
    ]
  });

  return {
    faturamentos: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListFinanceiroFaturasService;
