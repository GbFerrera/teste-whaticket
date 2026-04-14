import FinanceiroFatura from "../../models/FinanceiroFatura";
import { PaymentProvider } from "../PaymentGatewayService";
import { getIO } from "../../libs/socket";
import Company from "../../models/Company";
import AffiliateCommission from "../../models/AffiliateCommission";

const getAffiliateModel = () => require("../../models/Affiliate").default;

interface HandlePaymentGatewayUpdateParams {
  provider: PaymentProvider;
  invoiceId?: number | string | null;
  paymentExternalId?: string | number | null;
  status?: string;
  paidAmount?: number | string | null;
  paymentDate?: Date | string | null;
}

const statusMap: Record<
  PaymentProvider,
  Record<string, "aberta" | "paga" | "vencida" | "cancelada">
> = {
  mercadopago: {
    approved: "paga",
    authorized: "paga",
    in_process: "aberta",
    pending: "aberta",
    in_mediation: "aberta",
    rejected: "cancelada",
    cancelled: "cancelada",
    refunded: "cancelada",
    charged_back: "cancelada"
  },
  asaas: {
    pending: "aberta",
    awaiting: "aberta",
    received: "paga",
    confirmed: "paga",
    received_in_cash: "paga",
    overdue: "vencida",
    expired: "vencida",
    cancelled: "cancelada",
    refunded: "cancelada",
    chargeback_requested: "cancelada",
    chargeback_dispute: "cancelada",
    payment_pending: "aberta",
    payment_awaiting: "aberta",
    payment_overdue: "vencida",
    payment_expired: "vencida",
    payment_cancelled: "cancelada",
    payment_deleted: "cancelada",
    payment_refunded: "cancelada",
    payment_chargeback_requested: "cancelada",
    payment_chargeback_dispute: "cancelada",
    payment_confirmed: "paga",
    payment_received: "paga",
    payment_received_in_cash: "paga"
  }
};

const normalizeStatus = (provider: PaymentProvider, status?: string) => {
  if (!status) {
    return undefined;
  }

  const normalized = status.toLowerCase();
  return statusMap[provider]?.[normalized];
};

const HandlePaymentGatewayUpdateService = async ({
  provider,
  invoiceId,
  paymentExternalId,
  status,
  paidAmount,
  paymentDate
}: HandlePaymentGatewayUpdateParams): Promise<FinanceiroFatura | null> => {
  const where: Record<string, any> = {};

  if (invoiceId) {
    where.id = Number(invoiceId);
  }

  if (!where.id && paymentExternalId) {
    where.paymentExternalId = String(paymentExternalId);
  } else if (paymentExternalId) {
    where.paymentExternalId = String(paymentExternalId);
  }

  if (!where.id && !where.paymentExternalId) {
    return null;
  }

  const fatura = await FinanceiroFatura.findOne({ where });

  if (!fatura) {
    return null;
  }

  const updates: Record<string, any> = {};
  const mappedStatus = normalizeStatus(provider, status);

  if (paymentExternalId) {
    updates.paymentExternalId = String(paymentExternalId);
  }

  if (typeof paidAmount !== "undefined" && paidAmount !== null) {
    const amount = Number(paidAmount);
    if (!Number.isNaN(amount)) {
      updates.valorPago = amount.toFixed(2);
    }
  }

  if (mappedStatus) {
    updates.status = mappedStatus;
    if (mappedStatus === "paga") {
      updates.dataPagamento = paymentDate
        ? new Date(paymentDate)
        : new Date();
      if (typeof updates.valorPago === "undefined") {
        updates.valorPago = Number(fatura.valor || 0).toFixed(2);
      }
    } else {
      updates.dataPagamento = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return fatura;
  }

  const previousStatus = fatura.status;
  await fatura.update(updates);
  await fatura.reload();

  // Se a fatura acabou de ser marcada como paga, verificar se a empresa foi indicada por um afiliado
  if (mappedStatus === "paga" && previousStatus !== "paga") {
    try {
      await createAffiliateCommission(fatura);
    } catch (err) {
      console.error("Error creating affiliate commission:", err);
    }
  }

  const io = getIO();
  io.of(String(fatura.companyId)).emit(`company-${fatura.companyId}-financeiro`, {
    action: "fatura:updated",
    payload: fatura
  });

  return fatura;
};

const createAffiliateCommission = async (fatura: FinanceiroFatura) => {
  // Buscar a empresa que pagou a fatura
  const company = await Company.findByPk(fatura.companyId);
  if (!company || !company.affiliateId) {
    return; // Empresa não foi indicada por nenhum afiliado
  }

  const Affiliate = getAffiliateModel();
  const affiliate = await Affiliate.findByPk(company.affiliateId);
  if (!affiliate || affiliate.status !== "active") {
    return; // Afiliado não existe ou está inativo
  }

  // Verificar se já existe comissão para esta fatura (evitar duplicatas)
  const existingCommission = await AffiliateCommission.findOne({
    where: {
      affiliateId: affiliate.id,
      faturaId: fatura.id
    }
  });

  if (existingCommission) {
    return; // Comissão já foi criada para esta fatura
  }

  const faturaValue = parseFloat(String(fatura.valorPago || fatura.valor || 0));
  if (faturaValue <= 0) {
    return;
  }

  const commissionRate = parseFloat(String(affiliate.commissionRate || 10));
  const commissionAmount = (faturaValue * commissionRate) / 100;

  // Criar comissão
  await AffiliateCommission.create({
    affiliateId: affiliate.id,
    referredCompanyId: company.id,
    faturaId: fatura.id,
    commissionAmount: commissionAmount.toFixed(2),
    commissionRate: commissionRate.toFixed(2),
    status: "pending",
    notes: `Comissão automática - Fatura #${fatura.id} paga por ${company.name}`,
    metadata: {
      faturaValor: faturaValue,
      faturaDescricao: fatura.descricao,
      faturaDataPagamento: fatura.dataPagamento,
      companyName: company.name
    }
  });

  // Atualizar totalEarned do afiliado
  const currentTotal = parseFloat(String(affiliate.totalEarned || 0));
  await affiliate.update({
    totalEarned: (currentTotal + commissionAmount).toFixed(2)
  });

  console.log(`[AFFILIATE] Commission created: R$${commissionAmount.toFixed(2)} for affiliate #${affiliate.id} from company #${company.id} (fatura #${fatura.id})`);
};

export default HandlePaymentGatewayUpdateService;
