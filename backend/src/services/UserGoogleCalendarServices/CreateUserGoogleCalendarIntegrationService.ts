import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";
import { getGoogleAuthUrl, getTokensFromCode } from "../../helpers/googleCalendarClient";

interface CreateUserGoogleCalendarIntegrationData {
  userId: number;
  companyId: number;
  googleUserId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  calendarId: string;
}

export const CreateUserGoogleCalendarIntegrationService = async (
  data: CreateUserGoogleCalendarIntegrationData
): Promise<UserGoogleCalendarIntegration> => {
  const {
    userId,
    companyId,
    googleUserId,
    email,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId
  } = data;

  // Verificar se já existe integração para este usuário
  const existingIntegration = await UserGoogleCalendarIntegration.findOne({
    where: { userId }
  });

  if (existingIntegration) {
    // Atualizar integração existente
    await existingIntegration.update({
      googleUserId,
      email,
      accessToken,
      refreshToken,
      expiryDate,
      calendarId,
      active: true,
      lastSyncAt: new Date()
    });

    return existingIntegration;
  }

  // Criar nova integração
  const integration = await UserGoogleCalendarIntegration.create({
    userId,
    companyId,
    googleUserId,
    email,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId,
    active: true,
    lastSyncAt: new Date()
  });

  return integration;
};

export default CreateUserGoogleCalendarIntegrationService;
