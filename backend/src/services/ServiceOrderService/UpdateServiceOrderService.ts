import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import Ticket from "../../models/Ticket";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import Produto from "../../models/Produto";
import {
  applyStockAdjustments,
  buildItemPayload,
  RawItemInput,
  recalcOrderTotals,
  StockAdjustment,
  withTransaction
} from "./helpers";
import ShowServiceOrderService from "./ShowServiceOrderService";

interface UpdateServiceOrderRequest {
  companyId: number;
  orderId: number;
  customerId?: number;
  ticketId?: number | null;
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
  orderId: Yup.number().required(),
  customerId: Yup.number().optional(),
  ticketId: Yup.number().optional().nullable(),
  status: Yup.string()
    .oneOf(["aberta", "em_execucao", "concluida", "entregue", "cancelada"])
    .optional(),
  garantiaPrazoDias: Yup.number().optional().nullable(),
  entregaPrevista: Yup.date().optional().nullable()
});

const UpdateServiceOrderService = async (data: UpdateServiceOrderRequest) => {
  await schema.validate(data);

  const {
    companyId,
    orderId,
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
    items
  } = data;

  const order = await ServiceOrder.findOne({
    where: { id: orderId, companyId },
    include: [
      {
        model: ServiceOrderItem,
        as: "items",
        include: [
          {
            model: Produto,
            as: "product",
            attributes: ["id", "controleEstoque"]
          }
        ]
      }
    ]
  });

  if (!order) {
    throw new AppError("ERR_SERVICE_ORDER_NOT_FOUND", 404);
  }

  if (customerId) {
    const customer = await CrmClient.findOne({ where: { id: customerId, companyId } });
    if (!customer) {
      throw new AppError("ERR_CLIENT_NOT_FOUND", 404);
    }
  }

  if (ticketId) {
    const ticket = await Ticket.findOne({ where: { id: ticketId, companyId } });
    if (!ticket) {
      throw new AppError("ERR_TICKET_NOT_FOUND", 404);
    }
  }

  await withTransaction(async (transaction) => {
    await order.update(
      {
        customerId: customerId ?? order.customerId,
        ticketId: ticketId === undefined ? order.ticketId : ticketId,
        status: status ?? order.status,
        garantiaFlag: garantiaFlag ?? order.garantiaFlag,
        garantiaPrazoDias: garantiaPrazoDias ?? order.garantiaPrazoDias,
        garantiaDescricao: garantiaDescricao ?? order.garantiaDescricao,
        entregaPrevista: entregaPrevista ?? order.entregaPrevista,
        pagamentoTipo: pagamentoTipo ?? order.pagamentoTipo,
        gerarFatura: gerarFatura ?? order.gerarFatura,
        pagamentoManualReferencia: pagamentoManualReferencia ?? order.pagamentoManualReferencia,
        observacoesInternas: observacoesInternas ?? order.observacoesInternas,
        observacoesCliente: observacoesCliente ?? order.observacoesCliente
      },
      { transaction }
    );

    if (Array.isArray(items)) {
      const adjustments: StockAdjustment[] = [];

      order.items.forEach((item) => {
        if (item.itemType === "product" && item.productId && item.product?.controleEstoque) {
          adjustments.push({
            productId: item.productId,
            quantity: Number(item.quantity),
            type: "increment"
          });
        }
      });

      await ServiceOrderItem.destroy({ where: { serviceOrderId: order.id }, transaction });

      for (const rawItem of items) {
        const built = await buildItemPayload({ companyId, input: rawItem });
        await ServiceOrderItem.create(
          {
            ...built.payload,
            serviceOrderId: order.id,
            companyId
          },
          { transaction }
        );

        if (built.stockDiscount) {
          adjustments.push({
            productId: built.stockDiscount.productId,
            quantity: built.stockDiscount.quantity,
            type: "decrement"
          });
        }
      }

      if (adjustments.length) {
        await applyStockAdjustments(companyId, adjustments, transaction);
      }

      await recalcOrderTotals(order.id, transaction);
    }
  });

  return ShowServiceOrderService({ companyId, orderId: order.id });
};

export default UpdateServiceOrderService;
