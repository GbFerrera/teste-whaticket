import Profissional from "../../models/Profissional";
import AppError from "../../errors/AppError";

interface UpdateParams {
  id: string | number;
  companyId: number;
  nome?: string;
  servicos?: any[];
  agenda?: any[];
  ativo?: boolean;
  comissao?: number;
  valorEmAberto?: number;
  valoresRecebidos?: number;
  valoresAReceber?: number;
}

const UpdateProfissionalService = async ({
  id,
  companyId,
  nome,
  servicos,
  agenda,
  ativo,
  comissao,
  valorEmAberto,
  valoresRecebidos,
  valoresAReceber
}: UpdateParams): Promise<Profissional> => {
  const profissional = await Profissional.findOne({ where: { id, companyId } });

  if (!profissional) {
    throw new AppError("Profissional não encontrado", 404);
  }

  await profissional.update({
    nome: nome ?? profissional.nome,
    servicos: servicos ?? profissional.servicos,
    agenda: agenda ?? profissional.agenda,
    ativo: ativo ?? profissional.ativo,
    comissao: comissao ?? profissional.comissao,
    valorEmAberto: valorEmAberto ?? profissional.valorEmAberto,
    valoresRecebidos: valoresRecebidos ?? profissional.valoresRecebidos,
    valoresAReceber: valoresAReceber ?? profissional.valoresAReceber
  });

  return profissional;
};

export default UpdateProfissionalService;
