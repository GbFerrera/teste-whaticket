import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import AppError from "../errors/AppError";
import HandlePaymentGatewayUpdateService from "../services/FinanceiroFaturaService/HandlePaymentGatewayUpdateService";
import { getCompanyPaymentToken } from "../services/PaymentGatewayService";
import FinanceiroFatura from "../models/FinanceiroFatura";

const mercadopago = require("mercadopago");

const safeNumber = (value: any): number | undefined => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return undefined;
};

const findInvoiceCompany = async (invoiceId?: number | string | null) => {
  if (!invoiceId) {
    return undefined;
  }

  const record = await FinanceiroFatura.findByPk(invoiceId);
  return record?.companyId;
};

export const mercadoPagoWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const paymentId = req.body?.data?.id || req.body?.id;

  if (!paymentId) {
    return res.status(200).json({ ignored: true });
  }

  try {
    const invoiceIdParam = safeNumber(req.query.invoiceId);
    let companyId = safeNumber(req.query.companyId);

    if (!companyId && invoiceIdParam) {
      companyId = await findInvoiceCompany(invoiceIdParam);
    }

    if (!companyId) {
      throw new AppError("companyId não informado no webhook.", 400);
    }

    const tokenRecord = await getCompanyPaymentToken(companyId, "mercadopago");

    mercadopago.configure({
      access_token: tokenRecord.token
    });

    const payment = await mercadopago.payment.get(paymentId);
    const paymentBody = payment?.body;

    await HandlePaymentGatewayUpdateService({
      provider: "mercadopago",
      invoiceId: invoiceIdParam || paymentBody?.external_reference,
      paymentExternalId: paymentBody?.id,
      status: paymentBody?.status,
      paidAmount: paymentBody?.transaction_amount,
      paymentDate: paymentBody?.date_approved
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("MercadoPago webhook error:", error);
    return res.status(200).json({ ok: false });
  }
};

export const asaasWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const payload = req.body;
  const payment = payload?.payment || payload?.data?.payment || payload;

  if (!payment) {
    return res.status(200).json({ ignored: true });
  }

  try {
    await HandlePaymentGatewayUpdateService({
      provider: "asaas",
      invoiceId: payment.externalReference,
      paymentExternalId: payment.id,
      status: payment.status || payload?.event,
      paidAmount: payment.value,
      paymentDate:
        payment.receivedDate ||
        payment.confirmedDate ||
        payment.paymentDate ||
        payment.dateCreated
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Asaas webhook error:", error);
    return res.status(200).json({ ok: false });
  }
};
