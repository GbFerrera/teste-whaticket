import Servico from "../../models/Servico";

interface ListParams {
  companyId: number;
}

const ListServicosService = async ({ companyId }: ListParams): Promise<Servico[]> => {
  const servicos = await Servico.findAll({
    where: { companyId },
    order: [["nome", "ASC"]]
  });

  return servicos;
};

export default ListServicosService;
