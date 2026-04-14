import Servico from "../../models/Servico";
import AppError from "../../errors/AppError";

interface CreateServicoData {
  companyId: number;
  nome: string;
  descricao?: string;
  valorOriginal?: number;
  possuiDesconto?: boolean;
  valorComDesconto?: number | null;
}

const CreateServicoService = async ({
  companyId,
  nome,
  descricao,
  valorOriginal = 0,
  possuiDesconto = false,
  valorComDesconto = null
}: CreateServicoData): Promise<Servico> => {
  if (!nome?.trim()) {
    throw new AppError("Nome do serviço é obrigatório");
  }

  if (possuiDesconto && (valorComDesconto === null || valorComDesconto === undefined)) {
    throw new AppError("Informe o valor com desconto");
  }

  const servico = await Servico.create({
    companyId,
    nome,
    descricao,
    valorOriginal,
    possuiDesconto,
    valorComDesconto: possuiDesconto ? valorComDesconto : null
  });

  return servico;
};

export default CreateServicoService;
