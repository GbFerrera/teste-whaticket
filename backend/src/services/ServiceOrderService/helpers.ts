/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, literal } from "sequelize";
import sequelize from "../../database";
import AppError from "../../errors/AppError";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import Produto from "../../models/Produto";
import Servico from "../../models/Servico";

export interface RawItemInput {
  itemType: "service" | "product";
  serviceId?: number;
  productId?: number;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
}

interface BuildItemOptions {
  companyId: number;
  input: RawItemInput;
}

export interface BuiltItemPayload {
  payload: {
    itemType: "service" | "product";
    serviceId: number | null;
    productId: number | null;
    description: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  };
  stockDiscount?: {
    productId: number;
    quantity: number;
  };
}

export interface StockAdjustment {
  productId: number;
  quantity: number;
  type: "increment" | "decrement";
}

export const buildItemPayload = async ({ companyId, input }: BuildItemOptions): Promise<BuiltItemPayload> => {
  const quantity = Number(input.quantity ?? 1);
  if (quantity <= 0) {
    throw new AppError("ERR_SERVICE_ORDER_INVALID_QUANTITY", 400);
  }

  const discount = Number(input.discount ?? 0);

  if (input.itemType === "service") {
    if (!input.serviceId) {
      throw new AppError("ERR_SERVICE_ORDER_SERVICE_REQUIRED", 400);
    }

    const service = await Servico.findOne({ where: { id: input.serviceId, companyId } });
    if (!service) {
      throw new AppError("ERR_SERVICE_NOT_FOUND", 404);
    }

    const unitPrice = Number(
      input.unitPrice ?? service.valorComDesconto ?? service.valorOriginal ?? 0
    );

    return {
      payload: {
        itemType: "service",
        serviceId: service.id,
        productId: null,
        description: input.description || service.nome,
        quantity,
        unitPrice,
        discount,
        total: quantity * unitPrice - discount
      }
    };
  }

  if (!input.productId) {
    throw new AppError("ERR_SERVICE_ORDER_PRODUCT_REQUIRED", 400);
  }

  const product = await Produto.findOne({ where: { id: input.productId, companyId } });
  if (!product) {
    throw new AppError("ERR_PRODUCT_NOT_FOUND", 404);
  }

  if (product.controleEstoque && quantity > (product.estoqueAtual ?? 0)) {
    throw new AppError("ERR_PRODUCT_STOCK_UNAVAILABLE", 400);
  }

  const unitPrice = Number(input.unitPrice ?? product.valor ?? 0);

  return {
    payload: {
      itemType: "product",
      productId: product.id,
      serviceId: null,
      description: input.description || product.nome,
      quantity,
      unitPrice,
      discount,
      total: quantity * unitPrice - discount
    },
    stockDiscount: product.controleEstoque
      ? {
          productId: product.id,
          quantity
        }
      : undefined
  };
};

export const recalcOrderTotals = async (orderId: number, transaction?: Transaction) => {
  const items = await ServiceOrderItem.findAll({ where: { serviceOrderId: orderId }, transaction });
  const subtotal = items.reduce((acc, item) => acc + Number(item.unitPrice) * Number(item.quantity), 0);
  const descontos = items.reduce((acc, item) => acc + Number(item.discount ?? 0), 0);
  const total = items.reduce((acc, item) => acc + Number(item.total ?? 0), 0);

  await ServiceOrder.update(
    { subtotal, descontos, total },
    { where: { id: orderId }, transaction }
  );

  return { subtotal, descontos, total };
};

export const withTransaction = async <T>(fn: (t: Transaction) => Promise<T>) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await fn(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const applyStockAdjustments = async (
  companyId: number,
  adjustments: StockAdjustment[],
  transaction?: Transaction
) => {
  for (const adj of adjustments) {
    const expression =
      adj.type === "decrement"
        ? literal(`GREATEST(0, "estoqueAtual" - ${adj.quantity})`)
        : literal(`COALESCE("estoqueAtual", 0) + ${adj.quantity}`);

    await Produto.update(
      { estoqueAtual: expression },
      { where: { id: adj.productId, companyId }, transaction }
    );
  }
};
