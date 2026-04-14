import Profissional from "../../models/Profissional";
import AppError from "../../errors/AppError";

interface DeleteParams {
  id: string | number;
  companyId: number;
}

const DeleteProfissionalService = async ({ id, companyId }: DeleteParams): Promise<void> => {
  const profissional = await Profissional.findOne({ where: { id, companyId } });

  if (!profissional) {
    throw new AppError("Profissional não encontrado", 404);
  }

  await profissional.destroy();
};

export default DeleteProfissionalService;
