import { Request, Response } from "express";
import { Op } from "sequelize";

import FinanceiroFatura from "../models/FinanceiroFatura";
import AppError from "../errors/AppError";

export const showCheckout = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.params;

  const invoice = await FinanceiroFatura.findOne({
    where: {
      checkoutToken: token,
      paymentLink: {
        [Op.ne]: null
      }
    },
    include: [
      {
        association: "client",
        attributes: [
          "id",
          "name",
          "email",
          "phone",
          "document",
          "zipCode",
          "address",
          "number",
          "complement",
          "neighborhood",
          "city",
          "state"
        ]
      }
    ]
  });

  if (!invoice) {
    throw new AppError("Checkout não encontrado ou indisponível.", 404);
  }

  return res.json({
    id: invoice.id,
    descricao: invoice.descricao,
    valor: invoice.valor,
    status: invoice.status,
    dataVencimento: invoice.dataVencimento,
    paymentProvider: invoice.paymentProvider,
    paymentLink: invoice.paymentLink,
    paymentExternalId: invoice.paymentExternalId,
    client: invoice.client,
    companyId: invoice.companyId
  });
};
