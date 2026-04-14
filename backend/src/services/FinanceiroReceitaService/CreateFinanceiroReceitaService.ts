import * as Yup from "yup";
import { Transaction } from "sequelize";

import FinanceiroReceita from "../../models/FinanceiroReceita";
import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

export interface CreateFinanceiroReceitaRequest {
  companyId: number;
  fornecedorId?: number | null;
  categoriaId?: number | null;
  descricao: string;
  valor: number | string;
  status?: "aberto" | "recebido" | "vencido" | "cancelado";
  dataVencimento: Date | string;
  dataPagamento?: Date | string | null;
  metodoPagamentoPrevisto?: string | null;
  metodoPagamentoReal?: string | null;
  observacoes?: string | null;
  anexoUrl?: string | null;
  recorrente?: boolean;
  dataInicio?: Date | string | null;
  dataFim?: Date | string | null;
  tipoRecorrencia?: "diario" | "semanal" | "mensal" | "anual";
  quantidadeCiclos?: number | null;
  cicloAtual?: number;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  companyId: Yup.number().required(),
  fornecedorId: Yup.number().nullable(),
  categoriaId: Yup.number().nullable(),
  descricao: Yup.string().required().max(255),
  valor: Yup.number().required().moreThan(0),
  status: Yup.string()
    .oneOf(["aberto", "recebido", "vencido", "cancelado"])
    .default("aberto"),
  dataVencimento: Yup.date().required(),
  dataPagamento: Yup.date().nullable(),
  metodoPagamentoPrevisto: Yup.string().max(50).nullable(),
  metodoPagamentoReal: Yup.string().max(50).nullable(),
  observacoes: Yup.string().nullable(),
  anexoUrl: Yup.string().max(500).nullable(),
  recorrente: Yup.boolean().default(false),
  dataInicio: Yup.date().nullable(),
  dataFim: Yup.date().nullable(),
  tipoRecorrencia: Yup.string()
    .oneOf(["diario", "semanal", "mensal", "anual"])
    .nullable()
    .default("mensal"),
  quantidadeCiclos: Yup.number().integer().positive().nullable(),
  cicloAtual: Yup.number().integer().min(1).default(1)
});

const CreateFinanceiroReceitaService = async ({
  companyId,
  fornecedorId,
  categoriaId,
  descricao,
  valor,
  status = "aberto",
  dataVencimento,
  dataPagamento,
  metodoPagamentoPrevisto,
  metodoPagamentoReal,
  observacoes,
  anexoUrl,
  recorrente = false,
  dataInicio,
  dataFim,
  tipoRecorrencia = "mensal",
  quantidadeCiclos,
  cicloAtual = 1,
  transaction
}: CreateFinanceiroReceitaRequest): Promise<FinanceiroReceita> => {
  try {
    await schema.validate({
      companyId,
      fornecedorId,
      categoriaId,
      descricao,
      valor,
      status,
      dataVencimento,
      dataPagamento,
      metodoPagamentoPrevisto,
      metodoPagamentoReal,
      observacoes,
      anexoUrl,
      recorrente,
      dataInicio,
      dataFim,
      tipoRecorrencia,
      quantidadeCiclos,
      cicloAtual
    });

    // Validar fornecedor
    if (fornecedorId) {
      const fornecedor = await FinanceiroFornecedor.findOne({
        where: {
          id: fornecedorId,
          companyId
        },
        transaction
      });

      if (!fornecedor) {
        throw new AppError("Fornecedor não encontrado.");
      }
    }

    // Validar categoria
    if (categoriaId) {
      const categoria = await FinanceiroCategoria.findOne({
        where: {
          id: categoriaId,
          companyId
        },
        transaction
      });

      if (!categoria) {
        throw new AppError("Categoria não encontrada.");
      }

      if (categoria.tipo !== "receita") {
        throw new AppError("Categoria deve ser do tipo receita.");
      }
    }

    // Validar status
    if (status === "recebido" && !dataPagamento) {
      throw new AppError("Receita recebida deve ter data de pagamento.");
    }

    // Validar recorrência
    if (recorrente && !dataInicio) {
      throw new AppError("Receita recorrente deve ter data de início.");
    }

    const receita = await FinanceiroReceita.create({
      companyId,
      fornecedorId,
      categoriaId,
      descricao: descricao.trim(),
      valor: Number(valor),
      status,
      dataVencimento,
      dataPagamento,
      metodoPagamentoPrevisto,
      metodoPagamentoReal,
      observacoes: observacoes?.trim() || null,
      anexoUrl,
      recorrente,
      dataInicio,
      dataFim,
      tipoRecorrencia,
      quantidadeCiclos,
      cicloAtual
    },
    {
      include: [
        {
          association: "fornecedor"
        },
        {
          association: "categoria"
        }
      ],
      transaction
    });

    // Emitir evento via socket.io
    const io = getIO();
    io.to(`company-${companyId}`).emit("financeiro_receita", {
      action: "create",
      data: receita
    });

    return receita;
  } catch (err) {
    throw new AppError(err.message);
  }
};

export default CreateFinanceiroReceitaService;
