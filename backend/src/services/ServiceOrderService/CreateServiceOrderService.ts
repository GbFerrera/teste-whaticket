import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import Ticket from "../../models/Ticket";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import {
  applyStockAdjustments,
  buildItemPayload,
  RawItemInput,
  recalcOrderTotals,
  StockAdjustment,
  withTransaction
} from "./helpers";
import ShowServiceOrderService from "./ShowServiceOrderService";

interface CreateServiceOrderRequest {
  companyId: number;
  customerId: number;
  ticketId?: number;
  status?: string;
  garantiaFlag?: boolean;
  garantiaPrazoDias?: number | null;
  garantiaDescricao?: string | null;
  entregaPrevista?: Date | null;
  pagamentoTipo?: string | null;
  gerarFatura?: boolean;
  pagamentoManualReferencia?: string | null;
  observacoesInternas?: string | null;
  observacoesCliente?: string | null;
  items?: RawItemInput[];
}

const schema = Yup.object().shape({
  companyId: Yup.number().required(),
  customerId: Yup.number().required(),
  ticketId: Yup.number().optional().nullable(),
  status: Yup.string().oneOf(["aberta", "em_execucao", "concluida", "entregue", "cancelada"]).optional(),
  garantiaPrazoDias: Yup.number().optional().nullable(),
  entregaPrevista: Yup.date().optional().nullable()
});

const CreateServiceOrderService = async (data: CreateServiceOrderRequest) => {
  await schema.validate(data);

  const {
    companyId,
    customerId,
    ticketId,
    status,
    garantiaFlag,
    garantiaPrazoDias,
    garantiaDescricao,
    entregaPrevista,
    pagamentoTipo,
    gerarFatura,
    pagamentoManualReferencia,
    observacoesInternas,
    observacoesCliente,
    items = []
  } = data;

  const customer = await CrmClient.findOne({ where: { id: customerId, companyId } });
  if (!customer) {
    throw new AppError("ERR_CLIENT_NOT_FOUND", 404);
  }

  if (ticketId) {
    const ticket = await Ticket.findOne({ where: { id: ticketId, companyId } });
    if (!ticket) {
      throw new AppError("ERR_TICKET_NOT_FOUND", 404);
    }
  }

  const order = await withTransaction(async (transaction) => {
    const created = await ServiceOrder.create(
      {
        companyId,
        customerId,
        ticketId: ticketId || null,
        status: status || "aberta",
        garantiaFlag: garantiaFlag ?? false,
        garantiaPrazoDias: garantiaPrazoDias ?? null,
        garantiaDescricao: garantiaDescricao ?? null,
        entregaPrevista: entregaPrevista ?? null,
        pagamentoTipo: pagamentoTipo ?? null,
        gerarFatura: gerarFatura ?? false,
        pagamentoManualReferencia: pagamentoManualReferencia ?? null,
        observacoesInternas: observacoesInternas ?? null,
        observacoesCliente: observacoesCliente ?? null,
        subtotal: 0,
        descontos: 0,
        total: 0
      },
      { transaction }
    );

    const stockAdjustments: StockAdjustment[] = [];

    for (const rawItem of items) {
      const built = await buildItemPayload({ companyId, input: rawItem });
      await ServiceOrderItem.create(
        {
          ...built.payload,
          serviceOrderId: created.id,
          companyId
        },
        { transaction }
      );

      if (built.stockDiscount) {
        stockAdjustments.push({
          productId: built.stockDiscount.productId,
          quantity: built.stockDiscount.quantity,
          type: "decrement"
        });
      }
    }

    if (stockAdjustments.length) {
      await applyStockAdjustments(companyId, stockAdjustments, transaction);
    }

    await recalcOrderTotals(created.id, transaction);

    return created;
  });

  return ShowServiceOrderService({ companyId, orderId: order.id });
};

export default CreateServiceOrderService;
