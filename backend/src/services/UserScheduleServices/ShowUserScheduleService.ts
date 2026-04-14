import AppError from "../../errors/AppError";
import UserSchedule from "../../models/UserSchedule";
import User from "../../models/User";
import Appointment from "../../models/Appointment";

const ShowUserScheduleService = async (
  id: string | number,
  companyId: number
): Promise<UserSchedule> => {
  const schedule = await UserSchedule.findOne({
    where: { id, companyId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "startWork", "endWork"]
      },
      {
        model: Appointment,
        as: "appointments"
      }
    ]
  });

  if (!schedule) {
    throw new AppError("Agenda não encontrada", 404);
  }

  return schedule;
};

export default ShowUserScheduleService;
