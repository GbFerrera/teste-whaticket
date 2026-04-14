import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";
import DeleteEventService from "../GoogleCalendar/DeleteEventService";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  console.log(
    "DeleteService - iniciando remoção de schedule",
    "id:",
    id,
    "companyId:",
    companyId
  );
  const schedule = await (Schedule as any).findOne({
    where: { id, companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  // Remove evento correspondente no Google Calendar, se existir
  console.log(
    "DeleteService - chamando DeleteEventService para schedule",
    (schedule as any).id,
    "googleEventId:",
    (schedule as any).googleEventId
  );
  await DeleteEventService({ schedule: schedule as any });

  await schedule.destroy();
  console.log(
    "DeleteService - schedule removido do banco",
    (schedule as any).id
  );
};

export default DeleteService;
