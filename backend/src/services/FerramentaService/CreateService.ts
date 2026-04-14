// @ts-nocheck
import Ferramenta from "../../models/Ferramenta";

interface FerramentaData {
  nome: string;
  descricao?: string | null;
  url: string;
  metodo: string;
  headers?: any;
  body?: any;
  query_params?: any;
  placeholders?: any;
  status?: string;
}

const CreateService = async (data: FerramentaData): Promise<Ferramenta> => {
  const ferramenta = await Ferramenta.create(data);
  return ferramenta;
};

export default CreateService;
