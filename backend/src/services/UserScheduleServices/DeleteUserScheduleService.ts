import AppError from "../../errors/AppError";
import UserSchedule from "../../models/UserSchedule";

const DeleteUserScheduleService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const schedule = await UserSchedule.findOne({
    where: { id, companyId }
  });

  if (!schedule) {
    throw new AppError("Agenda não encontrada", 404);
  }

  await schedule.destroy();
};

export default DeleteUserScheduleService;
