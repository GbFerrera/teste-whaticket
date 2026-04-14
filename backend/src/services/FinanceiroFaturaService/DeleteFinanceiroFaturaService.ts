import AppError from "../../errors/AppError";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import { getIO } from "../../libs/socket";

const DeleteFinanceiroFaturaService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const record = await FinanceiroFatura.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("Fatura não encontrada.", 404);
  }

  await record.destroy();

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
    action: "fatura:deleted",
    payload: { id: record.id }
  });
};

export default DeleteFinanceiroFaturaService;
