// @ts-nocheck
import Fatura from "../../models/Fatura";

export interface FaturaData {
  companyId: number;
  contactId: number;
  valor: number;
  descricao?: string;
  status?: string;
  dataVencimento: Date;
  dataPagamento?: Date | null;
  recorrente?: boolean;
  intervalo?: string | null;
  proximaCobranca?: Date | null;
  limiteRecorrencias?: number | null;
}

const CreateFaturaService = async (data: FaturaData): Promise<Fatura> => {
  const fatura = await Fatura.create({
    ...data,
    status: data.status || "pendente"
  });

  return fatura;
};

export default CreateFaturaService;
