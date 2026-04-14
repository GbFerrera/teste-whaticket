// @ts-nocheck
import Fatura from "../../models/Fatura";
import AppError from "../../errors/AppError";

interface UpdateData {
  id: number | string;
  companyId: number;
  status?: string;
  dataPagamento?: Date | null;
  proximaCobranca?: Date | null;
  recorrenciasRealizadas?: number;
}

const UpdateFaturaService = async (data: UpdateData): Promise<Fatura> => {
  const { id, companyId, ...fields } = data;

  const fatura = await Fatura.findOne({ where: { id, companyId } });

  if (!fatura) {
    throw new AppError("ERR_NO_FATURA_FOUND", 404);
  }

  await fatura.update(fields);

  return fatura;
};

export default UpdateFaturaService;
