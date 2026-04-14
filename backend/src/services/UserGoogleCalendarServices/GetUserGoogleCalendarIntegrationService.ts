import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";

export const GetUserGoogleCalendarIntegrationService = async (
  userId: number
): Promise<UserGoogleCalendarIntegration | null> => {
  try {
    console.log("DEBUG GetUserGoogleCalendarIntegrationService - userId:", userId);
    console.log("DEBUG GetUserGoogleCalendarIntegrationService - Buscando integração...");
    
    const integration = await UserGoogleCalendarIntegration.findOne({
      where: { 
        userId,
        active: true
      }
    });

    console.log("DEBUG GetUserGoogleCalendarIntegrationService - integration:", integration);
    return integration;
  } catch (err) {
    console.error("DEBUG GetUserGoogleCalendarIntegrationService - Erro:", err);
    throw err;
  }
};

export default GetUserGoogleCalendarIntegrationService;
