import Servico from "../../models/Servico";
import AppError from "../../errors/AppError";

interface ShowParams {
  id: string | number;
  companyId: number;
}

const ShowServicoService = async ({ id, companyId }: ShowParams): Promise<Servico> => {
  const servico = await Servico.findOne({ where: { id, companyId } });

  if (!servico) {
    throw new AppError("Serviço não encontrado", 404);
  }

  return servico;
};

export default ShowServicoService;
