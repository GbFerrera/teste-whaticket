import ProdutoCategoria from "../../models/ProdutoCategoria";

interface ListParams {
  companyId: number;
}

const ListService = async ({ companyId }: ListParams): Promise<ProdutoCategoria[]> => {
  return ProdutoCategoria.findAll({
    where: { companyId },
    order: [["nome", "ASC"]]
  });
};

export default ListService;
