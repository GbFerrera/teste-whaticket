import * as Yup from "yup";
import { Transaction, Op } from "sequelize";

import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

export interface UpdateFinanceiroFornecedorRequest {
  id: string | number;
  companyId: number;
  nome?: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  categoria?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  id: Yup.number().required(),
  companyId: Yup.number().required(),
  nome: Yup.string().max(150),
  documento: Yup.string().max(30).nullable(),
  email: Yup.string().email().max(150).nullable(),
  telefone: Yup.string().max(30).nullable(),
  endereco: Yup.string().max(255).nullable(),
  numero: Yup.string().max(20).nullable(),
  complemento: Yup.string().max(100).nullable(),
  bairro: Yup.string().max(100).nullable(),
  cidade: Yup.string().max(100).nullable(),
  estado: Yup.string().max(2).nullable(),
  cep: Yup.string().max(10).nullable(),
  categoria: Yup.string().max(50).nullable(),
  observacoes: Yup.string().nullable(),
  ativo: Yup.boolean()
});

const UpdateFinanceiroFornecedorService = async ({
  id,
  companyId,
  nome,
  documento,
  email,
  telefone,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  categoria,
  observacoes,
  ativo,
  transaction
}: UpdateFinanceiroFornecedorRequest): Promise<FinanceiroFornecedor> => {
  try {
    await schema.validate({
      id: Number(id),
      companyId,
      nome,
      documento,
      email,
      telefone,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      categoria,
      observacoes,
      ativo
    });
  } catch (err) {
    throw new AppError(err.message);
  }

  const fornecedor = await FinanceiroFornecedor.findByPk(id, {
    transaction
  });

  if (!fornecedor) {
    throw new AppError("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
  }

  // Verificar se já existe outro fornecedor com mesmo documento
  if (documento !== undefined && documento !== fornecedor.documento) {
    if (documento) {
      const existingFornecedor = await FinanceiroFornecedor.findOne({
        where: {
          companyId,
          documento: documento.trim(),
          id: { [Op.ne]: fornecedor.id }
        },
        transaction
      });

      if (existingFornecedor) {
        throw new AppError("Já existe um fornecedor com este documento.");
      }
    }
  }

  await fornecedor.update({
    nome: nome?.trim() || fornecedor.nome,
    documento: documento?.trim() || null,
    email: email?.trim() || null,
    telefone: telefone?.trim() || null,
    endereco: endereco?.trim() || null,
    numero: numero?.trim() || null,
    complemento: complemento?.trim() || null,
    bairro: bairro?.trim() || null,
    cidade: cidade?.trim() || null,
    estado: estado?.trim() || null,
    cep: cep?.trim() || null,
    categoria: categoria?.trim() || null,
    observacoes: observacoes?.trim() || null,
    ativo: ativo !== undefined ? ativo : fornecedor.ativo
  },
  {
    transaction
  });

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_fornecedor", {
    action: "update",
    data: fornecedor
  });

  return fornecedor;
};

export default UpdateFinanceiroFornecedorService;
