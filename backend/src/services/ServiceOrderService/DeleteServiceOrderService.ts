import AppError from "../../errors/AppError";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import Produto from "../../models/Produto";
import { applyStockAdjustments, StockAdjustment, withTransaction } from "./helpers";

interface Request {
  companyId: number;
  orderId: number;
}

const DeleteServiceOrderService = async ({ companyId, orderId }: Request) => {
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

  await withTransaction(async (transaction) => {
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
    await order.destroy({ transaction });

    if (adjustments.length) {
      await applyStockAdjustments(companyId, adjustments, transaction);
    }
  });
};

export default DeleteServiceOrderService;
