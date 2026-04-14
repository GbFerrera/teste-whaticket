import Profissional from "../../models/Profissional";
import AppError from "../../errors/AppError";

interface ShowParams {
  id: string | number;
  companyId: number;
}

const ShowProfissionalService = async ({ id, companyId }: ShowParams): Promise<Profissional> => {
  const profissional = await Profissional.findOne({ where: { id, companyId } });

  if (!profissional) {
    throw new AppError("Profissional não encontrado", 404);
  }

  return profissional;
};

export default ShowProfissionalService;
