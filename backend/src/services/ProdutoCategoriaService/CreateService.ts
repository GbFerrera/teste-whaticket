import AppError from "../../errors/AppError";
import ProdutoCategoria from "../../models/ProdutoCategoria";

interface CreateData {
  companyId: number;
  nome: string;
  slug?: string | null;
  descricao?: string | null;
}

const CreateService = async ({ companyId, nome, slug, descricao }: CreateData): Promise<ProdutoCategoria> => {
  const existing = await ProdutoCategoria.findOne({
    where: {
      companyId,
      nome
    }
  });

  if (existing) {
    throw new AppError("ERR_PRODUTO_CATEGORIA_DUPLICATED", 400);
  }

  const categoria = await ProdutoCategoria.create({
    companyId,
    nome,
    slug: slug || null,
    descricao: descricao || null
  });

  return categoria;
};

export default CreateService;
