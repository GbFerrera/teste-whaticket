// @ts-nocheck
import Ferramenta from "../../models/Ferramenta";
import ShowService from "./ShowService";

interface FerramentaData {
  nome?: string;
  descricao?: string | null;
  url?: string;
  metodo?: string;
  headers?: any;
  body?: any;
  query_params?: any;
  placeholders?: any;
  status?: string;
}

const UpdateService = async (
  id: number | string,
  data: FerramentaData
): Promise<Ferramenta> => {
  const ferramenta = await ShowService(id);

  await ferramenta.update(data);

  return ferramenta;
};

export default UpdateService;
