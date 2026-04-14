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
  const {
    nome,
    cor = "#6B7280",
    descricao
  } = categoriaData;

  try {
    const createdCategoria = await CategoriaDespesa.create({
      companyId,
      nome,
      cor,
      descricao
    });

    return {
      id: createdCategoria.id,
      nome: createdCategoria.nome,
      cor: createdCategoria.cor,
      descricao: createdCategoria.descricao,
      ativo: createdCategoria.ativo,
      createdAt: createdCategoria.createdAt,
      updatedAt: createdCategoria.updatedAt
    };
  } catch (error) {
    console.error("Error creating categoria:", error);
    throw new AppError("ERR_CREATE_EXPENSE_CATEGORY", 500);
  }
};

export default CreateCategoriaDespesaService;
