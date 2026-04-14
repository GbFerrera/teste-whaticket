import CompanyPaymentSetting from "../../models/CompanyPaymentSetting";
import AppError from "../../errors/AppError";

interface DeleteRequest {
  id: number;
  companyId: number;
}

const DeleteCompanyPaymentSettingService = async ({
  id,
  companyId
}: DeleteRequest): Promise<void> => {
  const record = await CompanyPaymentSetting.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("Configuração não encontrada.", 404);
  }

  await record.destroy();
};

export default DeleteCompanyPaymentSettingService;
