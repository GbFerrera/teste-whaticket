import CompaniesSettings from "../../models/CompaniesSettings";

export const showHubToken = async (companyId: string): Promise<string> => {
  const notificameHubToken = await CompaniesSettings.findOne({
    where: {
      companyId,
    }
  });

  return notificameHubToken.notificameHub;
};
