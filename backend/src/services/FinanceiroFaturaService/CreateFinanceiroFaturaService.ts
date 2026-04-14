import * as Yup from "yup";
import { Transaction } from "sequelize";

import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import { generatePaymentLink, PaymentProvider } from "../PaymentGatewayService";
import generateCheckoutToken from "./helpers/generateCheckoutToken";
import { getWbot } from "../../libs/wbot";
import formatBody from "../../helpers/Mustache";
import { SendMessage } from "../../helpers/SendMessage";

export interface CreateFinanceiroFaturaRequest {
  companyId: number;
  clientId: number;
  descricao: string;
  valor: number | string;
  status?: "aberta" | "paga" | "vencida" | "cancelada";
  dataVencimento: Date | string;
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
  projectId?: number | null;
  transaction?: Transaction;
}

const schema = Yup.object().shape({
  companyId: Yup.number().required(),
  clientId: Yup.number().required(),
  descricao: Yup.string().required().max(5000),
  valor: Yup.number().required().moreThan(0),
  status: Yup.string()
    .oneOf(["aberta", "paga", "vencida", "cancelada"])
    .default("aberta"),
  dataVencimento: Yup.date().required(),
  dataPagamento: Yup.date().nullable(),
  tipoReferencia: Yup.string().oneOf(["servico", "produto"]).nullable(),
  referenciaId: Yup.number().nullable(),
  tipoRecorrencia: Yup.string()
    .oneOf(["unica", "mensal", "anual"])
    .default("unica"),
  quantidadeCiclos: Yup.number().nullable(),
  cicloAtual: Yup.number().default(1),
  dataInicio: Yup.date().default(new Date()),
  dataFim: Yup.date().nullable(),
  ativa: Yup.boolean().default(true),
  observacoes: Yup.string().nullable(),
  paymentProvider: Yup.mixed<PaymentProvider>()
    .oneOf(["asaas", "mercadopago"])
    .nullable(),
  projectId: Yup.number().nullable()
});

// 🎯 Função para enviar mensagem WhatsApp da fatura
const sendFaturaWhatsAppMessage = async (fatura: FinanceiroFatura, client: CrmClient) => {
  console.log(`[FATURA-WHATSAPP] 📋 INICIANDO FUNÇÃO`);
  
  try {
    // Verificar se o cliente tem telefone
    if (!client.phone) {
      console.log("[FATURA-WHATSAPP] ❌ Cliente não tem telefone cadastrado, pulando envio");
      return;
    }

    console.log(`[FATURA-WHATSAPP] 📱 Cliente tem telefone: ${client.phone}`);

    // Buscar WhatsApp PADRÃO da empresa
    const Whatsapp = require("../../models/Whatsapp").default;
    console.log(`[FATURA-WHATSAPP] 🔍 Buscando WhatsApp padrão para company: ${fatura.companyId}`);
    
    const whatsapp = await Whatsapp.findOne({
      where: {
        companyId: fatura.companyId,
        isDefault: true
      }
    });

    if (!whatsapp) {
      console.log(`[FATURA-WHATSAPP] ❌ WhatsApp padrão não encontrado para a empresa ${fatura.companyId}`);
      return;
    }

    console.log(`[FATURA-WHATSAPP] ✅ WhatsApp padrão encontrado: ID ${whatsapp.id}, Nome: ${whatsapp.name}`);

    // Formatar ID da fatura
    const faturaId = `FAT-${String(fatura.id).padStart(4, '0')}`;

    // Formatar data de vencimento
    const dataVenc = new Date(fatura.dataVencimento);
    const dataFormatada = dataVenc.toLocaleDateString('pt-BR');

    // Montar mensagem
    let mensagem = `💰 *NOVA FATURA GERADA*\n\n`;
    mensagem += `🔢 *Fatura:* ${faturaId}\n`;
    mensagem += `💵 *Valor:* R$ ${parseFloat(fatura.valor).toFixed(2)}\n`;
    mensagem += `📅 *Vencimento:* ${dataFormatada}\n\n`;

    // Se tiver referência, mostrar informações
    if (fatura.tipoReferencia && fatura.referenciaId) {
      try {
        if (fatura.tipoReferencia === "servico") {
          const Servico = require("../../models/Servico").default;
          const servico = await Servico.findOne({
            where: { id: fatura.referenciaId, companyId: fatura.companyId }
          });
          if (servico) {
            mensagem += `🛠️ *Serviço:* ${servico.nome}\n`;
          }
        } else if (fatura.tipoReferencia === "produto") {
          const Produto = require("../../models/Produto").default;
          const produto = await Produto.findOne({
            where: { id: fatura.referenciaId, companyId: fatura.companyId }
          });
          if (produto) {
            mensagem += `📦 *Produto:* ${produto.nome}\n`;
          }
        } else if (fatura.tipoReferencia === "ordem_servico") {
          const ServiceOrder = require("../../models/ServiceOrder").default;
          const ordem = await ServiceOrder.findOne({
            where: { id: fatura.referenciaId, companyId: fatura.companyId }
          });
          if (ordem) {
            mensagem += `🔧 *Ordem de Serviço:* OS-${String(ordem.id).padStart(4, '0')}\n`;
          }
        }
      } catch (error) {
        console.log("[FATURA-WHATSAPP] Erro ao buscar referência:", error);
      }
    }

    // Adicionar link de pagamento se existir
    if (fatura.paymentLink) {
      mensagem += `\n💳 *Link para Pagamento:*\n${fatura.paymentLink}\n\n`;
      mensagem += `👆 Clique no link acima para pagar sua fatura`;
    } else {
      mensagem += `\n💡 *Entre em contato para formas de pagamento*`;
    }

    console.log(`[FATURA-WHATSAPP] 📝 Mensagem montada, enviando para ${client.phone}`);
    console.log(`[FATURA-WHATSAPP] 📝 Mensagem: ${mensagem.substring(0, 100)}...`);

    // Enviar mensagem direto sem criar ticket
    await SendMessage(whatsapp, {
      number: client.phone,
      body: mensagem
    });

    console.log(`[FATURA-WHATSAPP] ✅ Mensagem enviada com sucesso para ${client.name}`);

  } catch (error) {
    console.error("[FATURA-WHATSAPP] ❌ ERRO AO ENVIAR MENSAGEM:", error);
    console.error("[FATURA-WHATSAPP] ❌ STACK COMPLETO:", error.stack);
    throw error;
  }
};

const CreateFinanceiroFaturaService = async (
  data: CreateFinanceiroFaturaRequest
): Promise<FinanceiroFatura> => {
  const payload = await schema.validate(data, { abortEarly: false });

  if (
    (payload.tipoReferencia && !payload.referenciaId) ||
    (!payload.tipoReferencia && payload.referenciaId)
  ) {
    throw new AppError(
      "Para vincular uma referência é necessário informar tipo_referencia e referencia_id.",
      400
    );
  }

  if (
    payload.tipoRecorrencia === "unica" &&
    (payload.quantidadeCiclos || payload.dataFim)
  ) {
    throw new AppError(
      "Faturas com recorrência 'unica' não devem possuir quantidade_ciclos ou data_fim.",
      400
    );
  }

  const client = await CrmClient.findOne({
    where: { id: payload.clientId, companyId: payload.companyId }
  });

  if (!client) {
    throw new AppError("Cliente não encontrado para esta empresa.", 404);
  }

  let record = await FinanceiroFatura.create(
    {
      clientId: payload.clientId,
      descricao: payload.descricao,
      valor: payload.valor,
      status: payload.status || "aberta",
      dataVencimento: payload.dataVencimento,
      dataPagamento: payload.dataPagamento,
      tipoRecorrencia: payload.tipoRecorrencia || "unica",
      quantidadeCiclos: payload.quantidadeCiclos,
      cicloAtual: payload.cicloAtual || 1,
      ativa: payload.ativa ?? true,
      dataInicio: payload.dataInicio || new Date(),
      observacoes: payload.observacoes,
      tipoReferencia: payload.tipoReferencia,
      referenciaId: payload.referenciaId,
      paymentProvider: payload.paymentProvider,
      projectId: payload.projectId,
      companyId: payload.companyId
    },
    { transaction: payload.transaction }
  );

  console.log("✅ [CREATE-FATURA] Fatura criada no banco:", {
    id: record.id,
    valor: record.valor
  });

  if (payload.paymentProvider) {
    try {
      let checkoutToken = record.checkoutToken;
      if (!checkoutToken) {
        checkoutToken = await generateCheckoutToken();
      }

      const paymentData = await generatePaymentLink({
        invoice: record,
        provider: payload.paymentProvider
      });

      record = await record.update({
        paymentProvider: payload.paymentProvider,
        paymentLink: paymentData.paymentLink,
        paymentExternalId: paymentData.paymentExternalId,
        checkoutToken
      });
    } catch (error) {
      console.error("Erro ao gerar link de pagamento:", error);
    }
  }

  const io = getIO();
  io.of(String(payload.companyId)).emit(`company-${payload.companyId}-financeiro`, {
    action: "fatura:created",
    payload: record
  });

  // 🎯 Enviar mensagem WhatsApp para o cliente
  console.log(`[FATURA-WHATSAPP] INICIANDO ENVIO - Fatura ID: ${record.id}, Cliente: ${client.name}`);
  console.log(`[FATURA-WHATSAPP] Cliente phone: ${client.phone}`);
  console.log(`[FATURA-WHATSAPP] Company ID: ${record.companyId}`);
  
  try {
    await sendFaturaWhatsAppMessage(record, client);
    console.log(`[FATURA-WHATSAPP] ✅ ENVIO CONCLUÍDO COM SUCESSO`);
  } catch (error) {
    console.error("[FATURA-WHATSAPP] ❌ ERRO NO ENVIO:", error);
    console.error("[FATURA-WHATSAPP] ❌ STACK:", error.stack);
  }

  return record;
};

export default CreateFinanceiroFaturaService;
