import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";

interface Request {
  id: number | string;
  companyId: number;
}

const DeleteCrmLeadService = async ({ id, companyId }: Request): Promise<void> => {
  const lead = await CrmLead.findOne({
    where: { id, companyId }
  });

  if (!lead) {
    throw new AppError("Lead não encontrado.", 404);
  }

  await lead.destroy();
};

export default DeleteCrmLeadService;
