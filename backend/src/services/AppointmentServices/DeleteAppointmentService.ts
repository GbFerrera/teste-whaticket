import AppError from "../../errors/AppError";
import Appointment from "../../models/Appointment";
import UserSchedule from "../../models/UserSchedule";
import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";
import { deleteGoogleCalendarEvent } from "../../helpers/googleCalendarClient";

const DeleteAppointmentService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const appointment = await Appointment.findOne({
    where: { id, companyId }
  });

  if (!appointment) {
    throw new AppError("Compromisso não encontrado", 404);
  }

  console.log("DEBUG - Excluindo appointment:", {
    id: appointment.id,
    title: appointment.title,
    googleEventId: appointment.googleEventId,
    scheduleId: appointment.scheduleId
  });

  // Sincronizar com Google Calendar se tiver evento vinculado
  if (appointment.googleEventId) {
    try {
      console.log("DEBUG - Excluindo evento no Google Calendar:", appointment.googleEventId);
      
      const schedule = await UserSchedule.findOne({
        where: { id: appointment.scheduleId }
      });

      console.log("DEBUG - Schedule encontrada:", {
        id: schedule?.id,
        userGoogleCalendarIntegrationId: schedule?.userGoogleCalendarIntegrationId
      });

      if (schedule?.userGoogleCalendarIntegrationId) {
        const integration = await UserGoogleCalendarIntegration.findOne({
          where: { id: schedule.userGoogleCalendarIntegrationId }
        });

        console.log("DEBUG - Integração encontrada:", {
          id: integration?.id,
          email: integration?.email,
          hasAccessToken: !!integration?.accessToken,
          hasRefreshToken: !!integration?.refreshToken,
          calendarId: integration?.calendarId
        });

        if (integration && integration.accessToken) {
          console.log("DEBUG - Chamando deleteGoogleCalendarEvent...");
          await deleteGoogleCalendarEvent(
            integration.accessToken,
            integration.refreshToken,
            appointment.googleEventId,
            integration.calendarId
          );
          
          console.log("DEBUG - Evento excluído do Google Calendar:", appointment.googleEventId);
        } else {
          console.log("DEBUG - Integração não encontrada ou sem accessToken");
        }
      } else {
        console.log("DEBUG - Schedule não tem integração vinculada");
      }
    } catch (error) {
      console.error("ERROR - Falha ao excluir evento do Google Calendar:", error);
      // Não falhar a exclusão do appointment se falhar no Google Calendar
    }
  } else {
    console.log("DEBUG - Appointment não tem googleEventId para excluir");
  }

  await appointment.destroy();
};

export default DeleteAppointmentService;
