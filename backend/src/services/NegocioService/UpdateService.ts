// @ts-nocheck
import Negocio from "../../models/Negocio";
import ShowService from "./ShowService";

interface NegocioData {
  name?: string;
  description?: string | null;
  kanbanBoards?: any;
  users?: any;
}

const UpdateService = async (
  id: number | string,
  companyId: number,
  data: NegocioData
): Promise<Negocio> => {
  const negocio = await ShowService(id, companyId);

  await negocio.update(data);

  return negocio;
};

export default UpdateService;
