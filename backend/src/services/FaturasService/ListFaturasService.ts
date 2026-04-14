// @ts-nocheck
import { Op } from "sequelize";
import Fatura from "../../models/Fatura";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  faturas: Fatura[];
  count: number;
  hasMore: boolean;
}

const ListFaturasService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const where: any = { companyId };

  if (searchParam) {
    where[Op.or] = [
      { descricao: { [Op.iLike]: `%${searchParam.toLowerCase().trim()}%` } },
      { status: { [Op.iLike]: `%${searchParam.toLowerCase().trim()}%` } }
    ];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: faturas } = await Fatura.findAndCountAll({
    where,
    limit,
    offset,
    order: [["id", "DESC"]]
  });

  const hasMore = count > offset + faturas.length;

  return { faturas, count, hasMore };
};

export default ListFaturasService;
