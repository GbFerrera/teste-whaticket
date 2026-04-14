import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";
import CompanyIntegrationFieldMap from "../../models/CompanyIntegrationFieldMap";

interface ListCompanyIntegrationsRequest {
  companyId: number;
}

const ListCompanyIntegrationsService = async ({
  companyId
}: ListCompanyIntegrationsRequest): Promise<CompanyIntegrationSetting[]> => {
  const records = await CompanyIntegrationSetting.findAll({
    where: { companyId },
    include: [
      {
        model: CompanyIntegrationFieldMap,
        as: "fieldMaps"
      }
    ],
    order: [
      ["name", "ASC"],
      [{ model: CompanyIntegrationFieldMap, as: "fieldMaps" }, "externalField", "ASC"]
    ]
  });

  return records;
};

export default ListCompanyIntegrationsService;
