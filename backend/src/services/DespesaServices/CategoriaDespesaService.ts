import AppError from "../../errors/AppError";
import CategoriaDespesa from "../../models/CategoriaDespesa";

interface CategoriaData {
  nome: string;
  cor?: string;
  descricao?: string;
}

interface Response {
  id: number;
  nome: string;
  cor: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreateCategoriaDespesaService = async (
  companyId: number,
  categoriaData: CategoriaData
): Promise<Response> => {
  const { nome, cor = "#6B7280", descricao } = categoriaData;

  // Verificar se já existe categoria com mesmo nome para a empresa
  const existingCategoria = await CategoriaDespesa.findOne({
    where: {
      companyId,
      nome
    }
  });

  if (existingCategoria) {
    throw new AppError("ERR_CATEGORY_ALREADY_EXISTS", 409);
  }

  const categoria = await CategoriaDespesa.create({
    companyId,
    nome,
    cor,
    descricao
  });

  return {
    id: categoria.id,
    nome: categoria.nome,
    cor: categoria.cor,
    descricao: categoria.descricao,
    ativo: categoria.ativo,
    createdAt: categoria.createdAt,
    updatedAt: categoria.updatedAt
  };
};

export default CreateCategoriaDespesaService;
