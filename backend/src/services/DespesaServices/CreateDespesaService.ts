import AppError from "../../errors/AppError";
import Despesa from "../../models/Despesa";

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

  try {
    const createdDespesa = await Despesa.create({
      companyId,
      titulo,
      valor,
      dataVencimento,
      categoriaId,
      contatoId,
      recorrente,
      tipoRecorrencia,
      observacoes
    });

    return {
      id: createdDespesa.id,
      titulo: createdDespesa.titulo,
      valor: createdDespesa.valor,
      dataVencimento: createdDespesa.dataVencimento,
      status: createdDespesa.status,
      recorrente: createdDespesa.recorrente,
      tipoRecorrencia: createdDespesa.tipoRecorrencia,
      observacoes: createdDespesa.observacoes,
      createdAt: createdDespesa.createdAt,
      updatedAt: createdDespesa.updatedAt,
      categoriaId: createdDespesa.categoriaId,
      contatoId: createdDespesa.contatoId
    };
  } catch (error) {
    console.error("Error creating despesa:", error);
    throw new AppError("ERR_CREATE_EXPENSE", 500);
  }
};

export default CreateDespesaService;
