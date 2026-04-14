import ProdutoVariacaoGrupo from "../../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoOpcao from "../../models/ProdutoVariacaoOpcao";

const ListService = async (companyId: number): Promise<ProdutoVariacaoGrupo[]> => {
  const grupos = await ProdutoVariacaoGrupo.findAll({
    where: { companyId },
    include: [
      {
        model: ProdutoVariacaoOpcao,
        as: "opcoes"
      }
    ],
    order: [
      ["nome", "ASC"],
      [{ model: ProdutoVariacaoOpcao, as: "opcoes" }, "ordem", "ASC"],
      [{ model: ProdutoVariacaoOpcao, as: "opcoes" }, "nome", "ASC"]
    ]
  });

  return grupos;
};

export default ListService;
