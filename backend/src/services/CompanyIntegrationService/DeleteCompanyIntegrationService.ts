import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";

interface DeleteCompanyIntegrationRequest {
  id: number;
  companyId: number;
}

const DeleteCompanyIntegrationService = async ({
  id,
  companyId
}: DeleteCompanyIntegrationRequest): Promise<void> => {
  await CompanyIntegrationSetting.destroy({
    where: {
      id,
      companyId
    }
  });
};

export default DeleteCompanyIntegrationService;
