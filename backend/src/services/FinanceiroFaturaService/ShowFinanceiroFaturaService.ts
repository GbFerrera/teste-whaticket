import AppError from "../../errors/AppError";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";

const ShowFinanceiroFaturaService = async (
  id: string | number,
  companyId: number
): Promise<FinanceiroFatura> => {
  const record = await FinanceiroFatura.findOne({
    where: { id, companyId },
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone", "status"]
      }
    ]
  });

  if (!record) {
    throw new AppError("Fatura não encontrada.", 404);
  }

  return record;
};

export default ShowFinanceiroFaturaService;
