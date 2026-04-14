import * as Yup from "yup";
import { Transaction } from "sequelize";

import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import AppError from "../../errors/AppError";
import syncFaturaPagamentoStatus from "./helpers/syncFaturaPagamentoStatus";
import { getIO } from "../../libs/socket";

export interface CreateFinanceiroPagamentoRequest {
  companyId: number;
  faturaId: number;
  metodoPagamento: "pix" | "cartao" | "boleto" | "transferencia" | "dinheiro" | "manual";
  valor: number | string;
  dataPagamento?: Date | string;
  observacoes?: string | null;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  companyId: Yup.number().required(),
  faturaId: Yup.number().required(),
  metodoPagamento: Yup.string()
    .required()
    .oneOf(["pix", "cartao", "boleto", "transferencia", "dinheiro", "manual"]),
  valor: Yup.number().required().moreThan(0),
  dataPagamento: Yup.date().nullable(),
  observacoes: Yup.string().nullable()
});

const CreateFinanceiroPagamentoService = async (
  data: CreateFinanceiroPagamentoRequest
): Promise<FinanceiroPagamento> => {
  const payload = await schema.validate(data, { abortEarly: false });

  const fatura = await FinanceiroFatura.findOne({
    where: { id: payload.faturaId, companyId: payload.companyId }
  });

  if (!fatura) {
    throw new AppError("Fatura não encontrada para esta empresa.", 404);
  }

  const pagamento = await FinanceiroPagamento.create(
    {
      ...payload,
      dataPagamento: payload.dataPagamento || new Date()
    },
    { transaction: payload.transaction }
  );

  await syncFaturaPagamentoStatus({
    companyId: payload.companyId,
    faturaId: payload.faturaId,
    transaction: payload.transaction
  });

  await fatura.reload();

  const io = getIO();
  io.of(String(payload.companyId)).emit(`company-${payload.companyId}-financeiro`, {
    action: "pagamento:created",
    payload: {
      pagamento,
      fatura
    }
  });

  return pagamento;
};

export default CreateFinanceiroPagamentoService;
