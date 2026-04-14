import Produto from "../../models/Produto";
import ProdutoCategoria from "../../models/ProdutoCategoria";
import ProdutoVariacaoItem from "../../models/ProdutoVariacaoItem";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";

interface ListParams {
  companyId: number;
  tipo?: string;
  categoriaId?: number;
}

const ListService = async ({ companyId, tipo, categoriaId }: ListParams): Promise<Produto[]> => {
  const whereCondition: any = {
    companyId
  };

  if (tipo) {
    whereCondition.tipo = tipo;
  }

  if (categoriaId) {
    whereCondition.categoriaId = categoriaId;
  }

  const produtos = await Produto.findAll({
    where: whereCondition,
    include: [
      {
        model: ProdutoCategoria,
        attributes: ["id", "nome"]
      },
      {
        model: ProdutoVariacaoItem,
        include: [
          {
            model: ProdutoVariacaoOpcao,
            attributes: ["id", "nome", "ordem", "grupoId"],
            include: [
              {
                model: ProdutoVariacaoGrupo,
                attributes: ["id", "nome"]
              }
            ]
          }
        ]
      }
    ],
    order: [["nome", "ASC"]]
  });

  return produtos;
};

export default ListService;
