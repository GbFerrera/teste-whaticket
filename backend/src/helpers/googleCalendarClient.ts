import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI as string;

export const createOAuth2Client = () => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  return oauth2Client;
};

export const getGoogleAuthUrl = (scopes: string[], state?: string) => {
  const oauth2Client = createOAuth2Client();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state
  });

  return url;
};

export const getTokensFromCode = async (code: string) => {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  return tokens;
};

export const buildCalendarClient = (tokens: any) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  return calendar;
};

export const createGoogleCalendarEvent = async (
  accessToken: string,
  refreshToken: string | null = null,
  eventData: any,
  calendarId: string = "primary"
) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    // Configurar credenciais com access e refresh tokens
    const credentials: any = { access_token: accessToken };
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    
    oauth2Client.setCredentials(credentials);

    // Configurar refresh automático se tiver refresh token
    if (refreshToken) {
      oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          // Aqui você poderia salvar o novo refresh token no banco
          console.log("DEBUG - Novos tokens recebidos:", tokens);
        }
      });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = await calendar.events.insert({
      calendarId,
      requestBody: eventData
    });

    return event.data;
  } catch (error: any) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    
    // Se for erro de token expirado, tentar refresh
    if (error.code === 401 && refreshToken) {
      try {
        console.log("DEBUG - Tentando refresh do token...");
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Tentar novamente com o novo token
        return await createGoogleCalendarEvent(
          credentials.access_token!,
          refreshToken,
          eventData,
          calendarId
        );
      } catch (refreshError) {
        console.error("ERROR - Falha no refresh do token:", refreshError);
        throw refreshError;
      }
    }
    
    throw error;
  }
};

export const updateGoogleCalendarEvent = async (
  accessToken: string,
  refreshToken: string | null = null,
  eventId: string,
  eventData: any,
  calendarId: string = "primary"
) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    // Configurar credenciais com access e refresh tokens
    const credentials: any = { access_token: accessToken };
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData
    });

    return event.data;
  } catch (error: any) {
    console.error("Erro ao atualizar evento no Google Calendar:", error);
    
    // Se for erro de token expirado, tentar refresh
    if (error.code === 401 && refreshToken) {
      try {
        console.log("DEBUG - Tentando refresh do token para update...");
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Tentar novamente com o novo token
        return await updateGoogleCalendarEvent(
          credentials.access_token!,
          refreshToken,
          eventId,
          eventData,
          calendarId
        );
      } catch (refreshError) {
        console.error("ERROR - Falha no refresh do token para update:", refreshError);
        throw refreshError;
      }
    }
    
    throw error;
  }
};

export const deleteGoogleCalendarEvent = async (
  accessToken: string,
  refreshToken: string | null = null,
  eventId: string,
  calendarId: string = "primary"
) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    // Configurar credenciais com access e refresh tokens
    const credentials: any = { access_token: accessToken };
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId,
      eventId
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao excluir evento no Google Calendar:", error);
    
    // Se for erro de token expirado, tentar refresh
    if (error.code === 401 && refreshToken) {
      try {
        console.log("DEBUG - Tentando refresh do token para delete...");
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Tentar novamente com o novo token
        return await deleteGoogleCalendarEvent(
          credentials.access_token!,
          refreshToken,
          eventId,
          calendarId
        );
      } catch (refreshError) {
        console.error("ERROR - Falha no refresh do token para delete:", refreshError);
        throw refreshError;
      }
    }
    
    throw error;
  }
};
