import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";

interface UpdateUserGoogleCalendarIntegrationData {
  googleUserId?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: Date;
  calendarId?: string;
  active?: boolean;
  syncToken?: string;
  lastSyncAt?: Date;
}

export const UpdateUserGoogleCalendarIntegrationService = async (
  userId: number,
  data: UpdateUserGoogleCalendarIntegrationData
): Promise<UserGoogleCalendarIntegration | null> => {
  const integration = await UserGoogleCalendarIntegration.findOne({
    where: { userId }
  });

  if (!integration) {
    return null;
  }

  await integration.update(data);

  return integration;
};

export default UpdateUserGoogleCalendarIntegrationService;
