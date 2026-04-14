import * as Yup from "yup";
import { Transaction } from "sequelize";

import FinanceiroFornecedor from "../../models/FinanceiroFornecedor";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

export interface CreateFinanceiroFornecedorRequest {
  companyId: number;
  nome: string;
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
  companyId: Yup.number().required(),
  nome: Yup.string().required().max(150),
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
  ativo: Yup.boolean().default(true)
});

const CreateFinanceiroFornecedorService = async ({
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
  ativo = true,
  transaction
}: CreateFinanceiroFornecedorRequest): Promise<FinanceiroFornecedor> => {
  try {
    await schema.validate({
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

  // Verificar se já existe fornecedor com mesmo documento para esta empresa
  if (documento) {
    const existingFornecedor = await FinanceiroFornecedor.findOne({
      where: {
        companyId,
        documento: documento.trim()
      },
      transaction
    });

    if (existingFornecedor) {
      throw new AppError("Já existe um fornecedor com este documento.");
    }
  }

  const fornecedor = await FinanceiroFornecedor.create({
    companyId,
    nome: nome.trim(),
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
    ativo
  },
  {
    transaction
  });

  const io = getIO();
  io.to(`company-${companyId}`).emit("financeiro_fornecedor", {
    action: "create",
    data: fornecedor
  });

  return fornecedor;
};

export default CreateFinanceiroFornecedorService;
