import Schedule from "../../models/Schedule";
import GetIntegrationService from "./GetIntegrationService";
import { buildCalendarClient } from "../../helpers/googleCalendarClient";

interface DeleteEventRequest {
  schedule: Schedule;
}

const DeleteEventService = async ({ schedule }: DeleteEventRequest): Promise<void> => {
  const companyId = schedule.companyId;

  const integration = await GetIntegrationService(companyId);

  if (!integration) {
    return;
  }

  const { accessToken, refreshToken, expiryDate, calendarId } = integration;

  const tokens: any = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate ? expiryDate.getTime() : undefined
  };

  const calendar = buildCalendarClient(tokens);
  const calendarIdToUse = calendarId || "primary";

  const googleEventId = (schedule as any).googleEventId;

  if (!googleEventId) {
    return;
  }

  try {
    console.log(
      "DeleteEventService - removendo evento do Google Calendar",
      "scheduleId:",
      (schedule as any).id,
      "eventId:",
      googleEventId
    );
    await calendar.events.delete({
      calendarId: calendarIdToUse,
      eventId: googleEventId
    });
  } catch (err) {
    console.error("Erro ao remover evento do Google Calendar", err);
  }
};

export default DeleteEventService;
