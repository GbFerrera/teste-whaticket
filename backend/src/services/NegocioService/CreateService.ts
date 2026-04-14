// @ts-nocheck
import Negocio from "../../models/Negocio";

interface NegocioData {
  companyId: number;
  name: string;
  description?: string | null;
  kanbanBoards?: any;
  users?: any;
}

const CreateService = async (data: NegocioData): Promise<Negocio> => {
  const negocio = await Negocio.create(data);
  return negocio;
};

export default CreateService;
