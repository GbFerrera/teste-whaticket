import CompanyPaymentSetting from "../../models/CompanyPaymentSetting";

interface ListRequest {
  companyId: number;
}

const ListCompanyPaymentSettingsService = async ({
  companyId
}: ListRequest): Promise<CompanyPaymentSetting[]> => {
  const records = await CompanyPaymentSetting.findAll({
    where: { companyId },
    order: [["provider", "ASC"]]
  });

  return records;
};

export default ListCompanyPaymentSettingsService;
