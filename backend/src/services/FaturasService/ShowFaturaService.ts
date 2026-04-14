// @ts-nocheck
import Fatura from "../../models/Fatura";
import AppError from "../../errors/AppError";

const ShowFaturaService = async (
  id: string | number,
  companyId: number
): Promise<Fatura> => {
  const fatura = await Fatura.findOne({ where: { id, companyId } });

  if (!fatura) {
    throw new AppError("ERR_NO_FATURA_FOUND", 404);
  }

  return fatura;
};

export default ShowFaturaService;
