import AppError from "../../errors/AppError";
import Despesa from "../../models/Despesa";
import CategoriaDespesa from "../../models/CategoriaDespesa";
import Contact from "../../models/Contact";

interface DespesaData {
  titulo: string;
  valor: number;
  dataVencimento: Date;
  categoriaId?: number;
  contatoId?: number;
  recorrente?: boolean;
  tipoRecorrencia?: "diario" | "semanal" | "mensal" | "anual";
  observacoes?: string;
}

interface Response {
  id: number;
  titulo: string;
  valor: number;
  dataVencimento: Date;
  status: string;
  recorrente: boolean;
  tipoRecorrencia: string;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoriaId: number | null;
  contatoId: number | null;
}

const CreateDespesaService = async (
  companyId: number,
  despesaData: DespesaData
): Promise<Response> => {
  const {
    titulo,
    valor,
    dataVencimento,
    categoriaId,
    contatoId,
    recorrente = false,
    tipoRecorrencia = "mensal",
    observacoes
  } = despesaData;

  // Validar valor
  if (valor <= 0) {
    throw new AppError("ERR_INVALID_EXPENSE_VALUE", 400);
  }

  // Verificar se categoria existe e pertence à empresa
  if (categoriaId) {
    const category = await CategoriaDespesa.findOne({
      where: {
        id: categoriaId,
        companyId,
        ativo: true
      }
    });

    if (!category) {
      throw new AppError("ERR_CATEGORY_NOT_FOUND", 404);
    }
  }

  // Verificar se contato existe e pertence à empresa
  if (contatoId) {
    const contact = await Contact.findOne({
      where: {
        id: contatoId,
        companyId
      }
    });

    if (!contact) {
      throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
    }
  }

  const despesa = await Despesa.create({
    companyId,
    categoriaId,
    contatoId,
    titulo,
    valor,
    dataVencimento,
    status: "pendente",
    recorrente,
    tipoRecorrencia,
    observacoes
  });

  // Buscar despesa completa com relacionamentos
  const createdDespesa = await Despesa.findByPk(despesa.id, {
    include: [
      {
        model: CategoriaDespesa,
        as: "categoria",
        required: false
      }
    ]
  });

  // Buscar contato separadamente para evitar conflito
  let contact = null;
  if (contatoId) {
    contact = await Contact.findByPk(contatoId);
  }

  return {
    id: createdDespesa!.id,
    titulo: createdDespesa!.titulo,
    valor: createdDespesa!.valor,
    dataVencimento: createdDespesa!.dataVencimento,
    status: createdDespesa!.status,
    recorrente: createdDespesa!.recorrente,
    tipoRecorrencia: createdDespesa!.tipoRecorrencia,
    observacoes: createdDespesa!.observacoes,
    createdAt: createdDespesa!.createdAt,
    updatedAt: createdDespesa!.updatedAt,
    categoriaId: createdDespesa!.categoriaId,
    contatoId: createdDespesa!.contatoId
  };
};

export default CreateDespesaService;
