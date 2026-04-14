import * as Yup from "yup";

import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import AppError from "../../errors/AppError";
import syncFaturaPagamentoStatus from "./helpers/syncFaturaPagamentoStatus";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import { getIO } from "../../libs/socket";

export interface UpdateFinanceiroPagamentoRequest {
  id: string | number;
  companyId: number;
  metodoPagamento?: "pix" | "cartao" | "boleto" | "transferencia" | "dinheiro" | "manual";
  valor?: number | string;
  dataPagamento?: Date | string;
  observacoes?: string | null;
}

const schema = Yup.object().shape({
  metodoPagamento: Yup.string().oneOf([
    "pix",
    "cartao",
    "boleto",
    "transferencia",
    "dinheiro",
    "manual"
  ]),
  valor: Yup.number().moreThan(0),
  dataPagamento: Yup.date(),
  observacoes: Yup.string().nullable()
});

const UpdateFinanceiroPagamentoService = async ({
  id,
  companyId,
  ...fields
}: UpdateFinanceiroPagamentoRequest): Promise<FinanceiroPagamento> => {
  const pagamento = await FinanceiroPagamento.findOne({
    where: { id, companyId }
  });

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  const data = await schema.validate(fields, { abortEarly: false });

  await pagamento.update(data);

  await syncFaturaPagamentoStatus({
    companyId,
    faturaId: pagamento.faturaId
  });

  const fatura = await FinanceiroFatura.findOne({
    where: { id: pagamento.faturaId, companyId }
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
    action: "pagamento:updated",
    payload: {
      pagamento,
      fatura
    }
  });

  return pagamento;
};

export default UpdateFinanceiroPagamentoService;
