import { Op } from "sequelize";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";

interface ListParams {
  companyId: number;
  searchParam?: string;
  tipo?: string;
  ativo?: boolean;
  paiId?: number;
  pageNumber?: number;
}

interface ListFinanceiroCategoriasResponse {
  categorias: FinanceiroCategoria[];
  count: number;
  hasMore: boolean;
}

const ListFinanceiroCategoriasService = async ({
  companyId,
  searchParam = "",
  tipo,
  ativo,
  paiId,
  pageNumber = 1
}: ListParams): Promise<ListFinanceiroCategoriasResponse> => {
  const where: any = { companyId };

  if (searchParam) {
    const term = `%${searchParam.trim().toLowerCase()}%`;
    where[Op.or] = [
      { nome: { [Op.iLike]: term } },
      { tipo: { [Op.iLike]: term } }
    ];
  }

  if (tipo) {
    where.tipo = { [Op.iLike]: String(tipo).trim() };
  }

  if (typeof ativo !== "undefined") {
    where.ativo = ativo;
  }

  if (paiId) {
    where.paiId = paiId;
  }

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const { count, rows: categorias } = await FinanceiroCategoria.findAndCountAll({
    where,
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
    ],
    limit,
    offset,
    order: [["nome", "ASC"]]
  });

  const hasMore = count > offset + categorias.length;

  return {
    categorias,
    count,
    hasMore
  };
};

export default ListFinanceiroCategoriasService;
