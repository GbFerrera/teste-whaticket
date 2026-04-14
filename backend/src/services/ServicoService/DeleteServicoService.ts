import Servico from "../../models/Servico";
import AppError from "../../errors/AppError";

interface DeleteParams {
  id: string | number;
  companyId: number;
}

const DeleteServicoService = async ({ id, companyId }: DeleteParams): Promise<void> => {
  const servico = await Servico.findOne({ where: { id, companyId } });

  if (!servico) {
    throw new AppError("Serviço não encontrado", 404);
  }

  await servico.destroy();
};

export default DeleteServicoService;
