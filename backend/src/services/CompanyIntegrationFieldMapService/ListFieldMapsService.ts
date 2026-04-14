import CompanyIntegrationFieldMap from "../../models/CompanyIntegrationFieldMap";

interface ListFieldMapsRequest {
  integrationId: number;
  companyId: number;
}

const ListFieldMapsService = async ({
  integrationId,
  companyId
}: ListFieldMapsRequest): Promise<CompanyIntegrationFieldMap[]> => {
  return CompanyIntegrationFieldMap.findAll({
    where: { integrationId },
    include: [
      {
        association: "integration",
        where: { companyId },
        attributes: []
      }
    ],
    order: [["externalField", "ASC"]]
  });
};

export default ListFieldMapsService;
