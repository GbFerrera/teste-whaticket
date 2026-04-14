import * as Yup from "yup";
import { Transaction } from "sequelize";

import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

export interface CreateFinanceiroCategoriaRequest {
  companyId: number;
  nome: string;
  tipo: "despesa" | "receita";
  paiId?: number | null;
  cor?: string;
  ativo?: boolean;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  companyId: Yup.number().required(),
  nome: Yup.string().required().max(100),
  tipo: Yup.string()
    .oneOf(["despesa", "receita"])
    .required(),
  paiId: Yup.number().nullable(),
  cor: Yup.string().max(7).default("#6B7280"),
  ativo: Yup.boolean().default(true)
});

const CreateFinanceiroCategoriaService = async ({
  companyId,
  nome,
  tipo,
  paiId,
  cor = "#6B7280",
  ativo = true,
  transaction
}: CreateFinanceiroCategoriaRequest): Promise<FinanceiroCategoria> => {
  try {
    await schema.validate({
      companyId,
      nome,
      tipo,
      paiId,
      cor,
      ativo
    });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Verificar se já existe categoria com mesmo nome para esta empresa
  const existingCategoria = await FinanceiroCategoria.findOne({
    where: {
      companyId,
      nome: nome.trim(),
      tipo
    },
    transaction
  });

  if (existingCategoria) {
    throw new AppError("Já existe uma categoria com este nome para este tipo.");
  }

  // Se tiver paiId, verificar se o pai existe e é do mesmo tipo
  if (paiId) {
    const categoriaPai = await FinanceiroCategoria.findByPk(paiId, {
      transaction
    });

    if (!categoriaPai) {
      throw new AppError("Categoria pai não encontrada.");
    }

    if (categoriaPai.companyId !== companyId) {
      throw new AppError("Categoria pai não pertence a esta empresa.");
    }

    if (categoriaPai.tipo !== tipo) {
      throw new AppError("Categoria pai deve ser do mesmo tipo.");
    }
  }

  const categoria = await FinanceiroCategoria.create({
    companyId,
    nome: nome.trim(),
    tipo,
    paiId,
    cor,
    ativo
  },
  {
    include: [
      {
        association: "pai"
      }
    ],
    transaction
  });

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_categoria", {
    action: "create",
    data: categoria
  });

  return categoria;
};

export default CreateFinanceiroCategoriaService;
