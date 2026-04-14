import GoogleCalendarIntegration from "../../models/GoogleCalendarIntegration";

interface Request {
  companyId: number;
  userId?: number | null;
  googleUserId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiryDate?: Date | null;
  calendarId?: string | null;
}

const UpsertIntegrationService = async ({
  companyId,
  userId,
  googleUserId,
  email,
  accessToken,
  refreshToken,
  expiryDate,
  calendarId
}: Request): Promise<GoogleCalendarIntegration> => {
  // Para compatibilidade, buscar por companyId apenas se userId for null
  const whereCondition: any = { companyId };
  if (userId !== null && userId !== undefined) {
    whereCondition.userId = userId;
  }
  
  const [integration] = await (GoogleCalendarIntegration as any).findOrCreate({
    where: whereCondition,
    defaults: {
      companyId,
      userId: userId || null,
      googleUserId,
      email,
      accessToken,
      refreshToken,
      expiryDate: expiryDate || null,
      calendarId: calendarId || "primary"
    }
  });

  integration.googleUserId = googleUserId;
  integration.email = email;
  integration.accessToken = accessToken;
  integration.refreshToken = refreshToken;
  integration.expiryDate = expiryDate || null;
  integration.calendarId = calendarId || "primary";

  await integration.save();

  return integration;
};

export default UpsertIntegrationService;
