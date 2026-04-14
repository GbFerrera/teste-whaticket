import { Op } from "sequelize";
import ServiceOrder from "../../models/ServiceOrder";
import ServiceOrderItem from "../../models/ServiceOrderItem";
import CrmClient from "../../models/CrmClient";
import Ticket from "../../models/Ticket";

interface ListRequest {
  companyId: number;
  searchParam?: string;
  status?: string;
  customerId?: number;
  pageNumber?: number;
  limit?: number;
}

const ListServiceOrdersService = async ({
  companyId,
  searchParam,
  status,
  customerId,
  pageNumber = 1,
  limit = 20
}: ListRequest) => {
  const where: any = { companyId };

  if (status) {
    where.status = status;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (searchParam) {
    where[Op.or] = [
      { "$customer.name$": { [Op.iLike]: `%${searchParam}%` } },
      { "$customer.phone$": { [Op.iLike]: `%${searchParam}%` } },
      { "$customer.email$": { [Op.iLike]: `%${searchParam}%` } },
      { "$ticket.id$": Number.isFinite(Number(searchParam)) ? Number(searchParam) : undefined }
    ].filter(Boolean);
  }

  const { count, rows } = await ServiceOrder.findAndCountAll({
    where,
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
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: limit * (pageNumber - 1)
  });

  return {
    serviceOrders: rows,
    count,
    hasMore: count > limit * pageNumber
  };
};

export default ListServiceOrdersService;
