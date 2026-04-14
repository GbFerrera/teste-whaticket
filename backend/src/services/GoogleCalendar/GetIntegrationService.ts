import GoogleCalendarIntegration from "../../models/GoogleCalendarIntegration";

const GetIntegrationService = async (companyId: number): Promise<GoogleCalendarIntegration | null> => {
  const integration = await (GoogleCalendarIntegration as any).findOne({
    where: { companyId }
  });

  return integration;
};

export default GetIntegrationService;
