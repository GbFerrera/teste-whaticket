import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";

export interface CreateScheduledDispatcherDTO {
  companyId: number;
  title: string;
  messageTemplate: string;
  eventType: "birthday" | "invoice_reminder" | "invoice_overdue";
  whatsappId?: number | null;
  startTime: string;
  sendIntervalSeconds: number;
  daysBeforeDue?: number | null;
  daysAfterDue?: number | null;
  active?: boolean;
}

const allowedEvents = ["birthday", "invoice_reminder", "invoice_overdue"];

export const CreateScheduledDispatcherService = async (
  payload: CreateScheduledDispatcherDTO
): Promise<ScheduledDispatcher> => {
  const schema = Yup.object().shape({
    title: Yup.string().trim().required("Título é obrigatório"),
    messageTemplate: Yup.string().trim().required("Mensagem é obrigatória"),
    eventType: Yup.mixed().oneOf(allowedEvents),
    startTime: Yup.string()
      .matches(/^\d{2}:\d{2}$/, "startTime deve estar no formato HH:mm")
      .required(),
    sendIntervalSeconds: Yup.number().min(1).max(3600).required(),
    daysBeforeDue: Yup.number().min(0).nullable(),
    daysAfterDue: Yup.number().min(0).nullable()
  });

  try {
    await schema.validate(payload, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const dispatcher = await ScheduledDispatcher.create({
    companyId: payload.companyId,
    title: payload.title.trim(),
    messageTemplate: payload.messageTemplate,
    eventType: payload.eventType,
    whatsappId: payload.whatsappId ?? null,
    startTime: payload.startTime,
    sendIntervalSeconds: payload.sendIntervalSeconds,
    daysBeforeDue:
      payload.eventType === "invoice_reminder" ? payload.daysBeforeDue ?? 0 : null,
    daysAfterDue:
      payload.eventType === "invoice_overdue" ? payload.daysAfterDue ?? 0 : null,
    active: payload.active ?? true
  });

  return dispatcher;
};

export default CreateScheduledDispatcherService;
