import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";

export interface UpdateScheduledDispatcherDTO {
  companyId: number;
  dispatcherId: number;
  title?: string;
  messageTemplate?: string;
  eventType?: "birthday" | "invoice_reminder" | "invoice_overdue";
  whatsappId?: number | null;
  startTime?: string;
  sendIntervalSeconds?: number;
  daysBeforeDue?: number | null;
  daysAfterDue?: number | null;
  active?: boolean;
}

const allowedEvents = ["birthday", "invoice_reminder", "invoice_overdue"];

const UpdateScheduledDispatcherService = async (
  payload: UpdateScheduledDispatcherDTO
): Promise<ScheduledDispatcher> => {
  const dispatcher = await ScheduledDispatcher.findOne({
    where: { id: payload.dispatcherId, companyId: payload.companyId }
  });

  if (!dispatcher) {
    throw new AppError("Scheduled dispatcher not found", 404);
  }

  const schema = Yup.object().shape({
    title: Yup.string().trim(),
    messageTemplate: Yup.string().trim(),
    eventType: Yup.mixed().oneOf(allowedEvents),
    startTime: Yup.string().matches(/^\d{2}:\d{2}$/),
    sendIntervalSeconds: Yup.number().min(1).max(3600),
    daysBeforeDue: Yup.number().min(0).nullable(),
    daysAfterDue: Yup.number().min(0).nullable()
  });

  try {
    await schema.validate(payload, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const updates: Partial<ScheduledDispatcher> = {};

  if (payload.title !== undefined) updates.title = payload.title.trim();
  if (payload.messageTemplate !== undefined)
    updates.messageTemplate = payload.messageTemplate;
  if (payload.eventType !== undefined) updates.eventType = payload.eventType;
  if (payload.whatsappId !== undefined) updates.whatsappId = payload.whatsappId;
  if (payload.startTime !== undefined) updates.startTime = payload.startTime;
  if (payload.sendIntervalSeconds !== undefined)
    updates.sendIntervalSeconds = payload.sendIntervalSeconds;
  if (payload.active !== undefined) updates.active = payload.active;

  if (updates.eventType || payload.daysBeforeDue !== undefined || payload.daysAfterDue !== undefined) {
    const event = updates.eventType || dispatcher.eventType;
    if (event === "invoice_reminder") {
      updates.daysBeforeDue =
        payload.daysBeforeDue !== undefined ? payload.daysBeforeDue : dispatcher.daysBeforeDue ?? 0;
      updates.daysAfterDue = null;
    } else if (event === "invoice_overdue") {
      updates.daysAfterDue =
        payload.daysAfterDue !== undefined ? payload.daysAfterDue : dispatcher.daysAfterDue ?? 0;
      updates.daysBeforeDue = null;
    } else {
      updates.daysBeforeDue = null;
      updates.daysAfterDue = null;
    }
  }

  await dispatcher.update(updates);

  await dispatcher.reload();

  return dispatcher;
};

export default UpdateScheduledDispatcherService;
