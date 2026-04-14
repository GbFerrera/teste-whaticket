import Profissional from "../../models/Profissional";

interface ListParams {
  companyId: number;
}

const ListProfissionaisService = async ({ companyId }: ListParams): Promise<Profissional[]> => {
  const profissionais = await Profissional.findAll({
    where: { companyId },
    order: [["nome", "ASC"]]
  });

  return profissionais;
};

export default ListProfissionaisService;
