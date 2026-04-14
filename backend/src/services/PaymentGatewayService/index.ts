import axios from "axios";
import { v4 as uuid } from "uuid";
import CompanyPaymentSetting from "../../models/CompanyPaymentSetting";
import AppError from "../../errors/AppError";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";
import syncAsaasCustomer from "./helpers/syncAsaasCustomer";

const mercadopago = require("mercadopago");
const ASAAS_BASE_URL = "https://api.asaas.com/v3";

export type PaymentProvider = "asaas" | "mercadopago";

interface GeneratePaymentLinkParams {
  invoice: FinanceiroFatura;
  provider: PaymentProvider;
}

interface PaymentLinkResult {
  paymentLink: string;
  paymentExternalId: string | null;
}

export const getCompanyPaymentToken = async (
  companyId: number,
  provider: PaymentProvider
) => {
  const setting = await CompanyPaymentSetting.findOne({
    where: { companyId, provider, active: true }
  });

  if (!setting) {
    throw new AppError(`Token para ${provider} não configurado.`, 400);
  }

  return setting;
};

const generateMercadoPagoLink = async (
  invoice: FinanceiroFatura,
  token: string
): Promise<PaymentLinkResult> => {
  mercadopago.configure({
    access_token: token
  });

  const baseNotificationUrl = process.env.MP_NOTIFICATION_URL;
  const notificationUrl =
    baseNotificationUrl && invoice.companyId
      ? `${baseNotificationUrl}?companyId=${invoice.companyId}&invoiceId=${invoice.id}`
      : baseNotificationUrl;

  const preference = {
    external_reference: String(invoice.id),
    notification_url: notificationUrl,
    items: [
      {
        title: invoice.descricao || `Fatura #${invoice.id}`,
        unit_price: Number(invoice.valor),
        quantity: 1
      }
    ]
  };

  const response = await mercadopago.preferences.create(preference);

  return {
    paymentLink: response.body.init_point,
    paymentExternalId: response.body.id || null
  };
};

const sanitizePayload = (payload: Record<string, any>) => {
  const sanitized = { ...payload };
  Object.keys(sanitized).forEach(key => {
    if (
      sanitized[key] === undefined ||
      sanitized[key] === null ||
      sanitized[key] === ""
    ) {
      delete sanitized[key];
    }
  });
  return sanitized;
};

const extractAsaasErrorMessage = (error: any) => {
  const responseData = error?.response?.data;

  if (responseData?.errors?.length) {
    return responseData.errors
      .map((err: any) => err?.description || err?.message || err?.code)
      .filter(Boolean)
      .join("; ");
  }

  return (
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    "Erro desconhecido na Asaas"
  );
};

const generateAsaasPayment = async (
  invoice: FinanceiroFatura,
  token: string,
  customerId: string
): Promise<PaymentLinkResult> => {
  const payload = sanitizePayload({
    customer: customerId,
    name: invoice.descricao || `Fatura #${invoice.id}`,
    description: invoice.descricao || `Fatura #${invoice.id}`,
    value: Number(invoice.valor),
    billingType: "UNDEFINED",
    dueDate: invoice.dataVencimento
      ? new Date(invoice.dataVencimento).toISOString().substring(0, 10)
      : undefined,
    notificationEnabled: true,
    externalReference: String(invoice.id)
  });

  try {
    const response = await axios.post(
      "https://api.asaas.com/v3/payments",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          access_token: token
        }
      }
    );

    const paymentLink =
      response.data?.invoiceUrl ||
      response.data?.bankSlipUrl ||
      response.data?.invoicePdf ||
      response.data?.checkoutUrl;

    return {
      paymentLink: paymentLink || response.data?.url,
      paymentExternalId: response.data?.id || uuid()
    };
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = extractAsaasErrorMessage(error);
    throw new AppError(`[Asaas] ${message}`, status);
  }
};

interface AsaasPixData {
  payload?: string;
  encodedImage?: string;
  expirationDate?: string;
  copyAndPaste?: string;
  payloadBase64?: string;
}

export interface AsaasSecondCopyResult {
  paymentId: string;
  customerName?: string;
  customerCpfCnpj?: string;
  dueDate?: string;
  value?: number;
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string | null;
  invoicePdfUrl?: string | null;
  digitableLine?: string;
  barcodeNumber?: string;
  pixCopyPaste?: string | null;
  pixQrCodeImage?: string | null;
  pixExpirationDate?: string | null;
}

export const getAsaasSecondCopyByCpf = async (
  companyId: number,
  cpf: string
): Promise<AsaasSecondCopyResult> => {
  const sanitizedCpf = normalizeDocument(cpf);

  if (!sanitizedCpf || sanitizedCpf.length < 11) {
    throw new AppError("CPF inválido.", 400);
  }

  const { headers } = await getAsaasHeaders(companyId);

  const customerParams = new URLSearchParams({
    cpfCnpj: sanitizedCpf,
    limit: "1",
    offset: "0"
  });

  const customerResponse = await axios.get(
    `${ASAAS_BASE_URL}/customers?${customerParams.toString()}`,
    { headers }
  );

  const customer = customerResponse.data?.data?.[0];

  if (!customer?.id) {
    throw new AppError("CPF não encontrado ou não cadastrado no Asaas.", 404);
  }

  const queryParams = new URLSearchParams({
    customer: customer.id,
    limit: "10",
    offset: "0",
    sort: "dueDate",
    order: "desc"
  });

  const listResponse = await axios.get(
    `${ASAAS_BASE_URL}/payments?${queryParams.toString()}`,
    { headers }
  );

  const payments = listResponse.data?.data || [];

  const allowedStatuses = ["PENDING", "OVERDUE", "DUNNING_REQUESTED", "DUNNING_RECEIVED"];
  const payment =
    payments.find(item => allowedStatuses.includes(item?.status)) ||
    payments[0];

  if (!payment) {
    throw new AppError("Nenhum boleto pendente encontrado para este CPF.", 404);
  }

  const paymentId = payment.id;

  const [identificationFieldResponse, pixResponse] = await Promise.all([
    axios
      .get(`${ASAAS_BASE_URL}/payments/${paymentId}/identificationField`, {
        headers
      })
      .catch(error => {
        if (error?.response?.status === 404) {
          return { data: null };
        }
        throw error;
      }),
    axios
      .get(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
        headers
      })
      .catch(error => {
        if (error?.response?.status === 404) {
          return { data: null };
        }
        throw error;
      })
  ]);

  const identificationData = identificationFieldResponse?.data || {};
  const pixData: AsaasPixData | null = pixResponse?.data || null;

  return {
    paymentId,
    customerName: payment?.customerName,
    customerCpfCnpj: payment?.customerCpfCnpj,
    dueDate: payment?.dueDate,
    value: payment?.value,
    status: payment?.status,
    invoiceUrl: payment?.invoiceUrl || payment?.url || null,
    bankSlipUrl: payment?.bankSlipUrl || null,
    invoicePdfUrl: payment?.invoicePdf || null,
    digitableLine:
      identificationData?.digitableLine ||
      identificationData?.identificationField,
    barcodeNumber: identificationData?.barcodeNumber,
    pixCopyPaste:
      pixData?.copyAndPaste ||
      pixData?.payload ||
      pixData?.payloadBase64 ||
      null,
    pixQrCodeImage: pixData?.encodedImage || null,
    pixExpirationDate: pixData?.expirationDate || null
  };
};

export const generatePaymentLink = async ({
  invoice,
  provider
}: GeneratePaymentLinkParams): Promise<PaymentLinkResult> => {
  const tokenRecord = await getCompanyPaymentToken(invoice.companyId, provider);

  if (!tokenRecord.token) {
    throw new AppError(`Token para ${provider} inválido.`, 400);
  }

  if (provider === "mercadopago") {
    return generateMercadoPagoLink(invoice, tokenRecord.token);
  }

  if (provider === "asaas") {
    const client = await CrmClient.findOne({
      where: {
        id: invoice.clientId,
        companyId: invoice.companyId
      }
    });

    if (!client) {
      throw new AppError("Cliente associado à fatura não encontrado.", 404);
    }

    const customerId = await syncAsaasCustomer({
      client,
      token: tokenRecord.token
    });

    return generateAsaasPayment(invoice, tokenRecord.token, customerId);
  }

  throw new AppError("Gateway não suportado.", 400);
};

const getAsaasHeaders = async (companyId: number) => {
  const tokenRecord = await getCompanyPaymentToken(companyId, "asaas");

  if (!tokenRecord.token) {
    throw new AppError("Token Asaas não configurado.", 400);
  }

  return {
    headers: {
      "Content-Type": "application/json",
      access_token: tokenRecord.token
    }
  };
};

const sanitize = (payload: Record<string, any>) => {
  const copy = { ...payload };
  Object.keys(copy).forEach(key => {
    if (copy[key] === undefined || copy[key] === null || copy[key] === "") {
      delete copy[key];
    }
  });
  return copy;
};

const normalizeDocument = (value: string) => (value || "").replace(/\D/g, "");

export const updateAsaasPayment = async (
  invoice: FinanceiroFatura,
  payload: Record<string, any>
): Promise<void> => {
  if (!invoice.paymentExternalId) return;

  const { headers } = await getAsaasHeaders(invoice.companyId);
  await axios.put(
    `${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}`,
    sanitize(payload),
    { headers }
  );
};

interface ReceiveAsaasPaymentOptions {
  value: number;
  paymentDate?: Date | string | null;
  description?: string | null;
}

export const receiveAsaasPayment = async (
  invoice: FinanceiroFatura,
  options: ReceiveAsaasPaymentOptions
): Promise<void> => {
  if (!invoice.paymentExternalId) return;

  const { headers } = await getAsaasHeaders(invoice.companyId);
  const body = sanitize({
    value: options.value,
    paymentDate: options.paymentDate
      ? new Date(options.paymentDate).toISOString().substring(0, 10)
      : undefined,
    description: options.description
  });

  await axios.post(
    `${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}/receive`,
    body,
    { headers }
  );
};

export const cancelAsaasPayment = async (invoice: FinanceiroFatura): Promise<void> => {
  if (!invoice.paymentExternalId) return;

  const { headers } = await getAsaasHeaders(invoice.companyId);

  try {
    await axios.delete(`${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}`, {
      headers
    });
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && [404, 400].includes(status)) {
      return;
    }
    throw error;
  }
};

const configureMercadoPago = async (companyId: number) => {
  const tokenRecord = await getCompanyPaymentToken(companyId, "mercadopago");
  if (!tokenRecord.token) {
    throw new AppError("Token Mercado Pago não configurado.", 400);
  }
  mercadopago.configure({
    access_token: tokenRecord.token
  });
};

export const cancelMercadoPagoPreference = async (
  invoice: FinanceiroFatura
): Promise<void> => {
  if (!invoice.paymentExternalId) return;

  await configureMercadoPago(invoice.companyId);
  try {
    await mercadopago.preferences.cancel(invoice.paymentExternalId);
  } catch (error: any) {
    if (error?.status === 404) {
      return;
    }
    throw error;
  }
};

export const cancelGatewayPayment = async (invoice: FinanceiroFatura): Promise<void> => {
  if (!invoice.paymentProvider || !invoice.paymentExternalId) {
    return;
  }

  if (invoice.paymentProvider === "asaas") {
    await cancelAsaasPayment(invoice);
    return;
  }

  if (invoice.paymentProvider === "mercadopago") {
    await cancelMercadoPagoPreference(invoice);
  }
};
