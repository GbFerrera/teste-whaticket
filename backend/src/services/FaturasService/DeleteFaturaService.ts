// @ts-nocheck
import Fatura from "../../models/Fatura";
import AppError from "../../errors/AppError";

const DeleteFaturaService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const fatura = await Fatura.findOne({ where: { id, companyId } });

  if (!fatura) {
    throw new AppError("ERR_NO_FATURA_FOUND", 404);
  }

  await fatura.destroy();
};

export default DeleteFaturaService;
