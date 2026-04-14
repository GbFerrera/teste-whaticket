import Produto from "../../models/Produto";
import ProdutoCategoria from "../../models/ProdutoCategoria";
import ProdutoVariacaoItem from "../../models/ProdutoVariacaoItem";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";
import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import AppError from "../../errors/AppError";

const ShowService = async (
  id: string | number,
  companyId: number
): Promise<Produto> => {
  const produto = await Produto.findOne({
    where: {
      id,
      companyId
    },
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
    ]
  });

  if (!produto) {
    throw new AppError("ERR_PRODUTO_NOT_FOUND", 404);
  }

  return produto;
};

export default ShowService;
