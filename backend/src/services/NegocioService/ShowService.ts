// @ts-nocheck
import AppError from "../../errors/AppError";
import Negocio from "../../models/Negocio";

const ShowService = async (id: number | string, companyId: number): Promise<Negocio> => {
  const negocio = await Negocio.findOne({
    where: { id, companyId }
  });

  if (!negocio) {
    throw new AppError("ERR_NEGOCIO_NOT_FOUND", 404);
  }

  return negocio;
};

export default ShowService;
