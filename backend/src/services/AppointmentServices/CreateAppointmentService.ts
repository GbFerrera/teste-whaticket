import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Appointment from "../../models/Appointment";
import UserSchedule from "../../models/UserSchedule";
import User from "../../models/User";
import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";
import { Op } from "sequelize";
import { createGoogleCalendarEvent } from "../../helpers/googleCalendarClient";

interface CreateAppointmentData {
  title: string;
  description?: string;
  startDatetime: Date | string;
  durationMinutes: number;
  status?: string;
  scheduleId: number;
  serviceId?: number;
  clientId?: number;
  contactId?: number;
  leadId?: number;
  companyId: number;
}

const CreateAppointmentService = async (
  data: CreateAppointmentData
): Promise<Appointment> => {
  const schema = Yup.object().shape({
    title: Yup.string().required("Título é obrigatório").max(200),
    description: Yup.string().nullable(),
    startDatetime: Yup.date().required("Data/hora de início é obrigatória"),
    durationMinutes: Yup.number().required("Duração é obrigatória").min(1),
    status: Yup.string().oneOf(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).default("scheduled"),
    scheduleId: Yup.number().required("Agenda é obrigatória"),
    serviceId: Yup.number().nullable(),
    clientId: Yup.number().nullable(),
    contactId: Yup.number().nullable(),
    leadId: Yup.number().nullable(),
    companyId: Yup.number().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Validar que apenas um tipo de vínculo seja fornecido
  const vinculosCount = [data.contactId, data.leadId, data.clientId].filter(id => id !== null && id !== undefined).length;
  if (vinculosCount > 1) {
    throw new AppError("Você pode vincular apenas um: Contato, Lead ou Cliente", 400);
  }

  const schedule = await UserSchedule.findOne({
    where: { id: data.scheduleId, companyId: data.companyId },
    include: [{ model: User, as: "user" }]
  });

  if (!schedule) {
    throw new AppError("Agenda não encontrada", 404);
  }

  if (!schedule.active) {
    throw new AppError("Esta agenda não está ativa", 400);
  }

  const startDatetime = new Date(data.startDatetime);
  const endDatetime = new Date(startDatetime.getTime() + data.durationMinutes * 60000);

  const user = schedule.user;
  const userStartWork = user?.startWork || "00:00";
  const userEndWork = user?.endWork || "23:59";
  const userWorkDays = user?.workDays || "0,1,2,3,4,5,6";
  const userLunchStart = user?.lunchStart || null;
  const userLunchEnd = user?.lunchEnd || null;

  // Validar dia de trabalho
  const dayOfWeek = startDatetime.getDay(); // 0 = Domingo, 6 = Sábado
  const workDaysArray = userWorkDays.split(",").map(d => parseInt(d.trim(), 10));
  
  if (!workDaysArray.includes(dayOfWeek)) {
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    throw new AppError(
      `O profissional não trabalha neste dia (${dayNames[dayOfWeek]}). Dias de trabalho: ${workDaysArray.map(d => dayNames[d]).join(", ")}`,
      400
    );
  }

  // Validar horário de trabalho
  const startTime = startDatetime.toTimeString().substring(0, 5);
  const endTime = endDatetime.toTimeString().substring(0, 5);

  if (startTime < userStartWork || endTime > userEndWork) {
    throw new AppError(
      `O compromisso deve estar dentro do horário de trabalho do profissional (${userStartWork} - ${userEndWork})`,
      400
    );
  }

  // Validar horário de almoço
  if (userLunchStart && userLunchEnd) {
    // Verificar se o compromisso conflita com o horário de almoço
    const lunchStartMinutes = parseInt(userLunchStart.split(":")[0], 10) * 60 + parseInt(userLunchStart.split(":")[1], 10);
    const lunchEndMinutes = parseInt(userLunchEnd.split(":")[0], 10) * 60 + parseInt(userLunchEnd.split(":")[1], 10);
    
    const appointmentStartMinutes = startDatetime.getHours() * 60 + startDatetime.getMinutes();
    const appointmentEndMinutes = endDatetime.getHours() * 60 + endDatetime.getMinutes();

    // Verifica se há sobreposição com o horário de almoço
    const overlapsLunch = (
      (appointmentStartMinutes >= lunchStartMinutes && appointmentStartMinutes < lunchEndMinutes) ||
      (appointmentEndMinutes > lunchStartMinutes && appointmentEndMinutes <= lunchEndMinutes) ||
      (appointmentStartMinutes <= lunchStartMinutes && appointmentEndMinutes >= lunchEndMinutes)
    );

    if (overlapsLunch) {
      throw new AppError(
        `O compromisso não pode ser agendado durante o horário de almoço do profissional (${userLunchStart} - ${userLunchEnd})`,
        400
      );
    }
  }

  const existingAppointments = await Appointment.findAll({
    where: {
      scheduleId: data.scheduleId,
      status: { [Op.notIn]: ["cancelled", "no_show"] }
    }
  });

  for (const existing of existingAppointments) {
    const existingStart = new Date(existing.startDatetime).getTime();
    const existingEnd = existingStart + existing.durationMinutes * 60000;
    const newStart = startDatetime.getTime();
    const newEnd = endDatetime.getTime();

    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      throw new AppError("Já existe um compromisso neste horário", 400);
    }
  }

  const appointment = await Appointment.create({
    title: data.title,
    description: data.description || null,
    startDatetime,
    durationMinutes: data.durationMinutes,
    status: data.status || "scheduled",
    scheduleId: data.scheduleId,
    serviceId: data.serviceId || null,
    clientId: data.clientId || null,
    contactId: data.contactId || null,
    leadId: data.leadId || null,
    companyId: data.companyId
  });

  // Verificar se a agenda tem integração com Google Calendar
  if (schedule.userGoogleCalendarIntegrationId) {
    try {
      console.log("DEBUG - Criando evento no Google Calendar para appointment:", appointment.id);
      
      const integration = await UserGoogleCalendarIntegration.findOne({
        where: { id: schedule.userGoogleCalendarIntegrationId }
      });

      if (integration && integration.accessToken) {
        console.log("DEBUG - Usando integração:", {
          email: integration.email,
          calendarId: integration.calendarId,
          googleUserId: integration.googleUserId
        });
        
        // Buscar informações adicionais para descrição completa
        let fullDescription = data.description || "";
        
        if (data.serviceId) {
          // TODO: Buscar informações do serviço
          fullDescription += fullDescription ? "\n\n" : "";
          fullDescription += `Serviço ID: ${data.serviceId}`;
        }
        
        if (data.clientId) {
          // TODO: Buscar informações do cliente
          fullDescription += fullDescription ? "\n\n" : "";
          fullDescription += `Cliente ID: ${data.clientId}`;
        }
        
        if (data.contactId) {
          // TODO: Buscar informações do contato
          fullDescription += fullDescription ? "\n\n" : "";
          fullDescription += `Contato ID: ${data.contactId}`;
        }
        
        if (data.leadId) {
          // TODO: Buscar informações do lead
          fullDescription += fullDescription ? "\n\n" : "";
          fullDescription += `Lead ID: ${data.leadId}`;
        }

        fullDescription += fullDescription ? "\n\n" : "";
        fullDescription += `Status: ${appointment.status}`;
        fullDescription += `\nAgendado via sistema em: ${appointment.createdAt.toLocaleDateString('pt-BR')}`;

        const googleEvent = await createGoogleCalendarEvent(
          integration.accessToken,
          integration.refreshToken,
          {
            summary: data.title,
            description: fullDescription,
            start: {
              dateTime: startDatetime.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: endDatetime.toISOString(),
              timeZone: 'America/Sao_Paulo'
            }
          },
          integration.calendarId
        );

        if (googleEvent && googleEvent.id) {
          // Salvar o ID do evento do Google Calendar
          await appointment.update({ googleEventId: googleEvent.id });
          console.log("DEBUG - Evento criado no Google Calendar:", googleEvent.id);
        }
      }
    } catch (error) {
      console.error("ERROR - Falha ao criar evento no Google Calendar:", error);
      // Não falhar a criação do appointment se falhar a sincronização
    }
  }

  return appointment;
};

export default CreateAppointmentService;
