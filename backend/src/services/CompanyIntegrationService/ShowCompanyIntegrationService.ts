import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";
import CompanyIntegrationFieldMap from "../../models/CompanyIntegrationFieldMap";
import AppError from "../../errors/AppError";

interface ShowRequest {
  id: number;
  companyId: number;
}

const ShowCompanyIntegrationService = async ({
  id,
  companyId
}: ShowRequest): Promise<CompanyIntegrationSetting> => {
  const record = await CompanyIntegrationSetting.findOne({
    where: { id, companyId },
    include: [
      {
        model: CompanyIntegrationFieldMap,
        as: "fieldMaps"
      }
    ]
  });

  if (!record) {
    throw new AppError("Integração não encontrada.", 404);
  }

  return record;
};

export default ShowCompanyIntegrationService;
