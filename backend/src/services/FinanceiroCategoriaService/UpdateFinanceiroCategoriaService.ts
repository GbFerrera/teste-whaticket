import * as Yup from "yup";
import { Transaction, Op } from "sequelize";

import FinanceiroCategoria from "../../models/FinanceiroCategoria";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

export interface UpdateFinanceiroCategoriaRequest {
  id: string | number;
  companyId: number;
  nome?: string;
  tipo?: "despesa" | "receita";
  paiId?: number | null;
  cor?: string;
  ativo?: boolean;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  id: Yup.number().required(),
  companyId: Yup.number().required(),
  nome: Yup.string().max(100),
  tipo: Yup.string().oneOf(["despesa", "receita"]),
  paiId: Yup.number().nullable(),
  cor: Yup.string().max(7),
  ativo: Yup.boolean()
});

const UpdateFinanceiroCategoriaService = async ({
  id,
  companyId,
  nome,
  tipo,
  paiId,
  cor,
  ativo,
  transaction
}: UpdateFinanceiroCategoriaRequest): Promise<FinanceiroCategoria> => {
  try {
    await schema.validate({
      id: Number(id),
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

  const categoria = await FinanceiroCategoria.findByPk(id, {
    transaction
  });

  if (!categoria) {
    throw new AppError("ERR_NO_FINANCEIRO_CATEGORIA_FOUND", 404);
  }

  // Se tiver paiId, verificar se o pai existe e é do mesmo tipo
  if (paiId !== undefined && paiId !== null) {
    if (paiId === categoria.id) {
      throw new AppError("Uma categoria não pode ser pai de si mesma.");
    }

    const categoriaPai = await FinanceiroCategoria.findByPk(paiId, {
      transaction
    });

    if (!categoriaPai) {
      throw new AppError("Categoria pai não encontrada.");
    }

    if (categoriaPai.companyId !== companyId) {
      throw new AppError("Categoria pai não pertence a esta empresa.");
    }

    if (categoriaPai.tipo !== (tipo || categoria.tipo)) {
      throw new AppError("Categoria pai deve ser do mesmo tipo.");
    }
  }

  // Verificar se já existe outra categoria com mesmo nome
  if (nome && nome.trim() !== categoria.nome) {
    const existingCategoria = await FinanceiroCategoria.findOne({
      where: {
        companyId,
        nome: nome.trim(),
        tipo: tipo || categoria.tipo,
        id: { [Op.ne]: categoria.id }
      },
      transaction
    });

    if (existingCategoria) {
      throw new AppError("Já existe uma categoria com este nome para este tipo.");
    }
  }

  await categoria.update({
    nome: nome?.trim() || categoria.nome,
    tipo: tipo || categoria.tipo,
    paiId: paiId !== undefined ? paiId : categoria.paiId,
    cor: cor || categoria.cor,
    ativo: ativo !== undefined ? ativo : categoria.ativo
  },
  {
    transaction
  });

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_categoria", {
    action: "update",
    data: categoria
  });

  return categoria;
};

export default UpdateFinanceiroCategoriaService;
