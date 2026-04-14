// @ts-nocheck
import Negocio from "../../models/Negocio";

const ListService = async (companyId: number): Promise<Negocio[]> => {
  const negocios = await Negocio.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]]
  });

  return negocios;
};

export default ListService;
