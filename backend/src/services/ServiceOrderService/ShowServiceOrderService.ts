import AppError from "../../errors/AppError";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import CrmClient from "../../models/CrmClient";
import Ticket from "../../models/Ticket";
import Produto from "../../models/Produto";
import Servico from "../../models/Servico";

interface Request {
  companyId: number;
  orderId: number;
}

const ShowServiceOrderService = async ({ companyId, orderId }: Request) => {
  const order = await ServiceOrder.findOne({
    where: { id: orderId, companyId },
    include: [
      {
        model: CrmClient,
        as: "customer",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id", "status"]
      },
      {
        model: ServiceOrderItem,
        as: "items",
        include: [
          {
            model: Produto,
            as: "product",
            attributes: ["id", "nome", "valor", "controleEstoque"]
          },
          {
            model: Servico,
            as: "service",
            attributes: ["id", "nome", "valorOriginal", "valorComDesconto"]
          }
        ]
      }
    ]
  });

  if (!order) {
    throw new AppError("ERR_SERVICE_ORDER_NOT_FOUND", 404);
  }

  return order;
};

export default ShowServiceOrderService;
