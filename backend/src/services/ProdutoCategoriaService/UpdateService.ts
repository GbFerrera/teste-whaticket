import AppError from "../../errors/AppError";
import ProdutoCategoria from "../../models/ProdutoCategoria";

interface UpdateParams {
  id: string | number;
  companyId: number;
  nome?: string;
  slug?: string | null;
  descricao?: string | null;
}

const UpdateService = async ({ id, companyId, nome, slug, descricao }: UpdateParams): Promise<ProdutoCategoria> => {
  const categoria = await ProdutoCategoria.findOne({
    where: { id, companyId }
  });

  if (!categoria) {
    throw new AppError("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
  }

  if (nome && nome !== categoria.nome) {
    const duplicate = await ProdutoCategoria.findOne({
      where: { companyId, nome }
    });

    if (duplicate) {
      throw new AppError("ERR_PRODUTO_CATEGORIA_DUPLICATED", 400);
    }
  }

  await categoria.update({
    nome: nome ?? categoria.nome,
    slug: slug ?? categoria.slug,
    descricao: descricao ?? categoria.descricao
  });

  return categoria;
};

export default UpdateService;
