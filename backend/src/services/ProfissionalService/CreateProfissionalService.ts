import Profissional from "../../models/Profissional";
import AppError from "../../errors/AppError";

interface AgendaItem {
  dia?: string;
  horarios?: string[];
  duracao?: number;
}

interface CreateProfissionalData {
  companyId: number;
  nome: string;
  servicos?: any[];
  agenda?: AgendaItem[];
  ativo?: boolean;
  comissao?: number;
  valorEmAberto?: number;
  valoresRecebidos?: number;
  valoresAReceber?: number;
}

const CreateProfissionalService = async ({
  companyId,
  nome,
  servicos = [],
  agenda = [],
  ativo = true,
  comissao = 0,
  valorEmAberto = 0,
  valoresRecebidos = 0,
  valoresAReceber = 0
}: CreateProfissionalData): Promise<Profissional> => {
  if (!nome?.trim()) {
    throw new AppError("Nome do profissional é obrigatório");
  }

  const profissional = await Profissional.create({
    companyId,
    nome,
    servicos,
    agenda,
    ativo,
    comissao,
    valorEmAberto,
    valoresRecebidos,
    valoresAReceber
  });

  return profissional;
};

export default CreateProfissionalService;
