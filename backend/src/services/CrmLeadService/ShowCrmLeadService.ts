import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";

interface Request {
  id: number | string;
  companyId: number;
}

const ShowCrmLeadService = async ({ id, companyId }: Request): Promise<CrmLead> => {
  // Validar se id é um número válido
  const leadId = typeof id === 'string' ? Number(id) : id;
  
  if (!leadId || isNaN(leadId)) {
    throw new AppError("ID inválido.", 400);
  }

  const lead = await CrmLead.findOne({
    where: { id: leadId, companyId }
  });

  if (!lead) {
    throw new AppError("Lead não encontrado.", 404);
  }

  return lead;
};

export default ShowCrmLeadService;
