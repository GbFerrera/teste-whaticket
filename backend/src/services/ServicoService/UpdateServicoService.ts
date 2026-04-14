import Servico from "../../models/Servico";
import AppError from "../../errors/AppError";

interface UpdateParams {
  id: string | number;
  companyId: number;
  nome?: string;
  descricao?: string;
  valorOriginal?: number;
  possuiDesconto?: boolean;
  valorComDesconto?: number | null;
}

const UpdateServicoService = async ({
  id,
  companyId,
  nome,
  descricao,
  valorOriginal,
  possuiDesconto,
  valorComDesconto
}: UpdateParams): Promise<Servico> => {
  const servico = await Servico.findOne({ where: { id, companyId } });

  if (!servico) {
    throw new AppError("Serviço não encontrado", 404);
  }

  const descontoAtivo = possuiDesconto ?? servico.possuiDesconto;
  let descontoValor = valorComDesconto ?? servico.valorComDesconto;

  if (descontoAtivo && (descontoValor === null || descontoValor === undefined)) {
    throw new AppError("Informe o valor com desconto");
  }

  if (!descontoAtivo) {
    descontoValor = null;
  }

  await servico.update({
    nome: nome ?? servico.nome,
    descricao: descricao ?? servico.descricao,
    valorOriginal: valorOriginal ?? servico.valorOriginal,
    possuiDesconto: descontoAtivo,
    valorComDesconto: descontoValor
  });

  return servico;
};

export default UpdateServicoService;
