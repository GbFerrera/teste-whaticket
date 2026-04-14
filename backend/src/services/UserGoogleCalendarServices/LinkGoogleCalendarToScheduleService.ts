import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";
import UserSchedule from "../../models/UserSchedule";

export const LinkGoogleCalendarToScheduleService = async (
  userId: number,
  scheduleId: number
): Promise<UserSchedule | null> => {
  // Buscar integração do usuário
  const integration = await UserGoogleCalendarIntegration.findOne({
    where: { 
      userId,
      active: true
    }
  });

  if (!integration) {
    throw new Error("Usuário não possui integração com Google Calendar");
  }

  // Buscar agenda
  const schedule = await UserSchedule.findOne({
    where: { 
      id: scheduleId,
      userId
    }
  });

  if (!schedule) {
    throw new Error("Agenda não encontrada ou não pertence ao usuário");
  }

  // Vincular integração à agenda
  await schedule.update({
    userGoogleCalendarIntegrationId: integration.id
  });

  return schedule;
};

export const UnlinkGoogleCalendarFromScheduleService = async (
  userId: number,
  scheduleId: number
): Promise<UserSchedule | null> => {
  const schedule = await UserSchedule.findOne({
    where: { 
      id: scheduleId,
      userId
    }
  });

  if (!schedule) {
    throw new Error("Agenda não encontrada ou não pertence ao usuário");
  }

  // Desvincular integração da agenda
  await schedule.update({
    userGoogleCalendarIntegrationId: null
  });

  return schedule;
};

export default {
  LinkGoogleCalendarToScheduleService,
  UnlinkGoogleCalendarFromScheduleService
};
