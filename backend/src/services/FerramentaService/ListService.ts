// @ts-nocheck
import Ferramenta from "../../models/Ferramenta";

interface ListParams {
  status?: string;
  companyId: number;
}

const ListService = async ({ status, companyId }: ListParams): Promise<Ferramenta[]> => {
  const where: any = { companyId };
  if (status) {
    where.status = status;
  }

  const ferramentas = await Ferramenta.findAll({
    where,
    order: [["createdAt", "DESC"]]
  });

  return ferramentas;
};

export default ListService;
