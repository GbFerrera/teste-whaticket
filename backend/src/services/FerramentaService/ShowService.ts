// @ts-nocheck
import AppError from "../../errors/AppError";
import Ferramenta from "../../models/Ferramenta";

const ShowService = async (id: number | string): Promise<Ferramenta> => {
  const ferramenta = await Ferramenta.findOne({
    where: { id }
  });

  if (!ferramenta) {
    throw new AppError("ERR_FERRAMENTA_NOT_FOUND", 404);
  }

  return ferramenta;
};

export default ShowService;
