import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Invoices from "../models/Invoices";
import Company from "../models/Company";
import Setting from "../models/Setting";
import { SendMailWithSettings } from "../helpers/SendMailWithSettings";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import FindCompaniesWhatsappService from "../services/CompanyService/FindCompaniesWhatsappService";
import { getWbot } from "../libs/wbot";
import moment from "moment";

import FindAllInvoiceService from "../services/InvoicesService/FindAllInvoiceService";
import ListInvoicesServices from "../services/InvoicesService/ListInvoicesServices";
import ShowInvoceService from "../services/InvoicesService/ShowInvoiceService";
import UpdateInvoiceService from "../services/InvoicesService/UpdateInvoiceService";
import DeleteInvoiceService from "../services/InvoicesService/DeleteInvoiceService";
import CreateInvoiceService from "../services/InvoicesService/CreateInvoiceService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreInvoiceData = {
  companyId: number;
  dueDate: string;
  detail: string;
  status: string;
  value: number;
  users: number;
  connections: number;
  queues: number;
  useWhatsapp: boolean;
  useFacebook: boolean;
  useInstagram: boolean;
  useCampaigns: boolean;
  useSchedules: boolean;
  useInternalChat: boolean;
  useExternalApi: boolean;
  linkInvoice: string;
};

type UpdateInvoiceData = {
  status: string;
  id?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { invoices, count, hasMore } = await ListInvoicesServices({
    searchParam,
    pageNumber
  });

  return res.json({ invoices, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const invoice = await ShowInvoceService(id);

  return res.status(200).json(invoice);
};


export const store = async (req: Request, res: Response): Promise<Response> => {
  const newPlan: StoreInvoiceData = req.body;

  const plan = await CreateInvoiceService(newPlan);

  return res.status(200).json(plan);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  // Company 1 (super admin) vê todas as faturas
  if (+companyId === 1) {
    const allInvoices = await Invoices.findAll({
      include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
      order: [["id", "ASC"]]
    });
    return res.status(200).json(allInvoices);
  }

  const invoice: Invoices[] = await FindAllInvoiceService(+companyId);

  return res.status(200).json(invoice);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const InvoiceData: UpdateInvoiceData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(InvoiceData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, status } = InvoiceData;

  const plan = await UpdateInvoiceService({
    id,
    status,

  });

  // const io = getIO();
  // io.of(companyId.toString())
  // .emit("plan", {
  //   action: "update",
  //   plan
  // });

  return res.status(200).json(plan);
};
export const pay = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { invoiceId, amount, description, dueDate, companyId } = req.body;
  const userId = req.user.id; // Corrigido: usar req.user.id

  try {
    // Aqui você implementaria a integração com gateway de pagamento
    // Por enquanto, vamos simular o pagamento
    
    // 1. Atualizar status da fatura para "paid"
    const invoice = await UpdateInvoiceService({
      id: invoiceId,
      status: "paid"
    });

    // 2. Gerar link de pagamento (simulado)
    const paymentLink = `https://checkout.pagamento.com.br/pay/${invoiceId}`;
    
    // 3. Retornar dados do pagamento
    return res.status(200).json({
      success: true,
      invoiceId,
      paymentLink,
      amount,
      status: "paid",
      message: "Pagamento processado com sucesso"
    });
  } catch (err) {
    throw new AppError("Erro ao processar pagamento: " + err.message);
  }
};

export const adminManualPay = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id } = req.params;

  const invoice = await Invoices.findByPk(id);

  if (!invoice) {
    throw new AppError("ERR_NO_INVOICE_FOUND", 404);
  }

  await invoice.update({ status: "paid" });

  // Estender dueDate da empresa em 30 dias a partir de hoje
  if (invoice.companyId) {
    const Company = require("../models/Company").default;
    const company = await Company.findByPk(invoice.companyId);
    if (company) {
      const moment = require("moment");
      const currentDueDate = moment(company.dueDate);
      const today = moment();
      const baseDate = currentDueDate.isAfter(today) ? currentDueDate : today;
      const newDueDate = baseDate.add(30, "days").format("YYYY-MM-DD");
      await company.update({ dueDate: newDueDate });
    }
  }

  return res.status(200).json({
    message: "Fatura marcada como paga com sucesso!",
    invoice
  });
};

const formatPhoneToWhatsappJid = (rawPhone?: string): string | null => {
  if (!rawPhone) return null;
  let digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }
  return digits + "@s.whatsapp.net";
};

export const sendBillingNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id } = req.params;

  const invoice = await Invoices.findByPk(id, {
    include: [{ model: Company, as: "company" }]
  });

  if (!invoice) {
    throw new AppError("ERR_NO_INVOICE_FOUND", 404);
  }

  const targetCompany = invoice.company;
  if (!targetCompany) {
    throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
  }

  let appName = "Sistema";
  try {
    const setting = await Setting.findOne({
      where: { companyId: 1, key: "appName" }
    });
    appName = setting?.value || "Sistema";
  } catch (e) {}

  const dueDate = moment(invoice.dueDate).format("DD/MM/YYYY");
  const value = Number(invoice.value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  // Determinar tipo de cobrança baseado na data de vencimento
  const hoje = moment().startOf("day");
  const venc = moment(invoice.dueDate).startOf("day");
  const dias = venc.diff(hoje, "days");

  let settingKey = "invoiceMsgAviso"; // antes do vencimento
  if (dias < 0) {
    settingKey = "invoiceMsgAtrasada"; // vencida
  } else if (dias === 0) {
    settingKey = "invoiceMsgDia"; // vence hoje
  }

  // Buscar template configurável
  let msgTemplate = "";
  try {
    const msgSetting = await Setting.findOne({
      where: { companyId: 1, key: settingKey }
    });
    msgTemplate = msgSetting?.value || "";
  } catch (e) {}

  // Função para substituir variáveis no template
  const replaceVars = (text: string): string => {
    return text
      .replace(/\{empresa\}/g, targetCompany.name || "")
      .replace(/\{plano\}/g, invoice.detail || "")
      .replace(/\{valor\}/g, value)
      .replace(/\{vencimento\}/g, dueDate)
      .replace(/\{link\}/g, "");
  };

  // Mensagem padrão caso não tenha template configurado
  const defaultWhatsappBody = `*Aviso de Cobrança - ${appName}*\n\nOlá *${targetCompany.name}*,\n\nIdentificamos que a fatura abaixo encontra-se em aberto:\n\n*Detalhes:* ${invoice.detail}\n*Valor:* ${value}\n*Vencimento:* ${dueDate}\n\nPor favor, regularize o pagamento o mais breve possível para evitar a suspensão dos serviços.\n\nEm caso de dúvidas, entre em contato conosco.\n\nAtenciosamente,\n*${appName}*`;

  const whatsappBody = msgTemplate ? replaceVars(msgTemplate) : defaultWhatsappBody;

  const results = { email: false, whatsapp: false };

  // Enviar email de cobrança
  if (targetCompany.email) {
    try {
      const emailBody = `
        <h2>Aviso de Cobrança - ${appName}</h2>
        <p>Olá <strong>${targetCompany.name}</strong>,</p>
        <p>Identificamos que a fatura abaixo encontra-se em aberto:</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Detalhes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${invoice.detail}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Valor</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vencimento</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dueDate}</td></tr>
        </table>
        <p>Por favor, regularize o pagamento o mais breve possível para evitar a suspensão dos serviços.</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <br>
        <p>Atenciosamente,<br><strong>${appName}</strong></p>
      `;

      const sent = await SendMailWithSettings({
        to: targetCompany.email,
        subject: `Aviso de Cobrança - Fatura ${invoice.detail} - ${appName}`,
        html: emailBody
      });
      results.email = sent;
    } catch (error) {
      console.error("Error sending billing email:", error);
    }
  }

  // Enviar WhatsApp de cobrança
  if (targetCompany.phone) {
    try {
      const adminCompany = await ShowCompanyService(1);
      const whatsappCompany = await FindCompaniesWhatsappService(adminCompany.id);
      const firstWhatsapp = whatsappCompany.whatsapps[0];
      const phoneJid = formatPhoneToWhatsappJid(targetCompany.phone);

      if (firstWhatsapp?.status === "CONNECTED" && phoneJid) {
        const wbot = getWbot(firstWhatsapp.id);

        const sendOptions: any = { createChat: false };
        await wbot.sendMessage(phoneJid, { text: whatsappBody }, sendOptions);
        results.whatsapp = true;
      }
    } catch (error) {
      console.error("Error sending billing WhatsApp:", error);
    }
  }

  return res.status(200).json({
    message: "Notificação de cobrança enviada!",
    results
  });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const invoice = await DeleteInvoiceService(id);

  return res.status(200).json(invoice);
}; 
