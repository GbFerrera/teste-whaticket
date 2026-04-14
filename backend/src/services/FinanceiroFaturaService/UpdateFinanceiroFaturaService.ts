import * as Yup from "yup";

import FinanceiroFatura from "../../models/FinanceiroFatura";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import {
  generatePaymentLink,
  updateAsaasPayment,
  receiveAsaasPayment,
  cancelGatewayPayment
} from "../PaymentGatewayService";
import generateCheckoutToken from "./helpers/generateCheckoutToken";

export interface UpdateFinanceiroFaturaRequest {
  id: number | string;
  companyId: number;
  descricao?: string;
  valor?: number | string;
  status?: "aberta" | "paga" | "vencida" | "cancelada";
  dataVencimento?: Date | string;
  dataPagamento?: Date | string | null;
  tipoReferencia?: "servico" | "produto" | null;
  referenciaId?: number | null;
  tipoRecorrencia?: "unica" | "mensal" | "anual";
  quantidadeCiclos?: number | null;
  cicloAtual?: number;
  dataInicio?: Date | string;
  dataFim?: Date | string | null;
  ativa?: boolean;
  observacoes?: string | null;
  paymentProvider?: "asaas" | "mercadopago" | null;
}

const schema = Yup.object().shape({
  descricao: Yup.string().max(5000),
  valor: Yup.number().positive(),
  status: Yup.string().oneOf(["aberta", "paga", "vencida", "cancelada"]),
  dataVencimento: Yup.date(),
  dataPagamento: Yup.date().nullable(),
  tipoReferencia: Yup.string().oneOf(["servico", "produto"]).nullable(),
  referenciaId: Yup.number().nullable(),
  tipoRecorrencia: Yup.string().oneOf(["unica", "mensal", "anual"]),
  quantidadeCiclos: Yup.number().integer().positive().nullable(),
  cicloAtual: Yup.number().integer().min(1),
  dataInicio: Yup.date(),
  dataFim: Yup.date().nullable(),
  ativa: Yup.boolean(),
  observacoes: Yup.string().nullable(),
  paymentProvider: Yup.mixed<"asaas" | "mercadopago">()
    .oneOf(["asaas", "mercadopago"])
    .nullable()
});

const UpdateFinanceiroFaturaService = async ({
  id,
  companyId,
  ...fields
}: UpdateFinanceiroFaturaRequest): Promise<FinanceiroFatura> => {
  const record = await FinanceiroFatura.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("Fatura não encontrada.", 404);
  }

  const data = await schema.validate(fields, { abortEarly: false });
  const previousSnapshot = record.get({ plain: true }) as FinanceiroFatura;
  const { paymentProvider, ...updatableFields } = data;

  if (
    (typeof data.tipoReferencia !== "undefined" ||
      typeof data.referenciaId !== "undefined") &&
    ((data.tipoReferencia && !data.referenciaId) ||
      (!data.tipoReferencia && data.referenciaId))
  ) {
    throw new AppError(
      "Para vincular uma referência é necessário informar tipo_referencia e referencia_id.",
      400
    );
  }

  if (
    data.tipoRecorrencia === "unica" &&
    (typeof data.quantidadeCiclos !== "undefined" ||
      typeof data.dataFim !== "undefined")
  ) {
    throw new AppError(
      "Faturas com recorrência 'unica' não devem possuir quantidade_ciclos ou data_fim.",
      400
    );
  }

  if (Object.keys(updatableFields).length > 0) {
    await record.update(updatableFields);
  }

  if (typeof paymentProvider !== "undefined") {
    const providerChanged =
      record.paymentProvider &&
      record.paymentExternalId &&
      (paymentProvider !== record.paymentProvider || !paymentProvider);

    if (providerChanged) {
      await cancelGatewayPayment(record);
    }

    if (paymentProvider) {
      let checkoutToken = record.checkoutToken;
      if (!checkoutToken) {
        checkoutToken = await generateCheckoutToken();
      }

      const paymentData = await generatePaymentLink({
        invoice: record,
        provider: paymentProvider
      });

      await record.update({
        paymentProvider,
        paymentLink: paymentData.paymentLink,
        paymentExternalId: paymentData.paymentExternalId,
        checkoutToken
      });
    } else {
      await record.update({
        paymentProvider: null,
        paymentLink: null,
        paymentExternalId: null,
        checkoutToken: null
      });
    }
  }

  await record.reload();

  const statusChanged =
    typeof data.status !== "undefined" && data.status !== previousSnapshot.status;

  const baseFieldsChanged =
    typeof data.valor !== "undefined" ||
    typeof data.descricao !== "undefined" ||
    typeof data.dataVencimento !== "undefined";

  const canSyncAsaas =
    record.paymentProvider === "asaas" && Boolean(record.paymentExternalId);

  if (baseFieldsChanged) {
    if (canSyncAsaas) {
      const payload: Record<string, any> = {};

      if (typeof data.valor !== "undefined") {
        payload.value = Number(record.valor);
      }

      if (typeof data.descricao !== "undefined") {
        payload.description = record.descricao;
      }

      if (typeof data.dataVencimento !== "undefined") {
        payload.dueDate = record.dataVencimento
          ? new Date(record.dataVencimento).toISOString().substring(0, 10)
          : undefined;
      }

      if (Object.keys(payload).length > 0) {
        await updateAsaasPayment(record, payload);
      }
    } else if (record.paymentProvider === "mercadopago") {
      await cancelGatewayPayment(record);
      const paymentData = await generatePaymentLink({
        invoice: record,
        provider: "mercadopago"
      });
      await record.update({
        paymentLink: paymentData.paymentLink,
        paymentExternalId: paymentData.paymentExternalId
      });
    }
  }

  if (statusChanged) {
    if (record.status === "paga") {
      if (record.paymentProvider === "asaas") {
        const value = Number(record.valorPago || record.valor || 0);
        await receiveAsaasPayment(record, {
          value,
          paymentDate: record.dataPagamento
        });
      }
    } else if (record.status === "cancelada") {
      await cancelGatewayPayment(record);
    }
  }

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
    action: "fatura:updated",
    payload: record
  });

  return record;
};

export default UpdateFinanceiroFaturaService;
