import Schedule from "../../models/Schedule";
import GetIntegrationService from "./GetIntegrationService";
import { buildCalendarClient } from "../../helpers/googleCalendarClient";

interface SyncEventRequest {
  schedule: Schedule;
}

const SyncEventService = async ({ schedule }: SyncEventRequest): Promise<void> => {
  const companyId = schedule.companyId;
  console.log(
    "SyncEventService - iniciando sincronização com Google Calendar",
    "scheduleId:",
    (schedule as any).id,
    "companyId:",
    companyId
  );

  const integration = await GetIntegrationService(companyId);

  if (!integration) {
    console.log(
      "SyncEventService - nenhuma integração Google Calendar encontrada para companyId",
      companyId
    );
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

  // Aqui vai a lógica real de montar o evento a partir do Schedule.
  // Por enquanto deixamos o esqueleto pronto para não quebrar nada.
  const event: any = {
    summary: schedule.body || "Compromisso",
    start: {
      dateTime: schedule.sendAt,
      timeZone: "America/Sao_Paulo"
    },
    end: {
      dateTime: schedule.sendAt,
      timeZone: "America/Sao_Paulo"
    }
  };

  try {
    const googleEventId = (schedule as any).googleEventId;

    console.log(
      "SyncEventService - googleEventId atual do schedule",
      (schedule as any).id,
      "=",
      googleEventId
    );

    if (googleEventId) {
      console.log(
        "SyncEventService - fazendo UPDATE de evento no Google Calendar para schedule",
        (schedule as any).id,
        "eventId:",
        googleEventId
      );
      await calendar.events.update({
        calendarId: calendarIdToUse,
        eventId: googleEventId,
        requestBody: event
      });
    } else {
      const response = await calendar.events.insert({
        calendarId: calendarIdToUse,
        requestBody: event
      });

      const createdEvent = response.data;

      if (createdEvent && createdEvent.id) {
        console.log(
          "SyncEventService - EVENTO CRIADO no Google Calendar para schedule",
          (schedule as any).id,
          "eventId:",
          createdEvent.id
        );
        (schedule as any).googleEventId = createdEvent.id;
        await (schedule as any).save();
      }
    }
  } catch (err) {
    // Em caso de erro na integração, não quebra o fluxo principal.
    console.error("Erro ao sincronizar evento com Google Calendar", err);
  }
};

export default SyncEventService;
