import * as Yup from "yup";
import AppError from "../../errors/AppError";
import UserSchedule from "../../models/UserSchedule";

interface UpdateUserScheduleData {
  id: string | number;
  name?: string;
  description?: string;
  active?: boolean;
  companyId: number;
}

const UpdateUserScheduleService = async (
  data: UpdateUserScheduleData
): Promise<UserSchedule> => {
  const schema = Yup.object().shape({
    name: Yup.string().max(100),
    description: Yup.string().nullable(),
    active: Yup.boolean()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const schedule = await UserSchedule.findOne({
    where: { id: data.id, companyId: data.companyId }
  });

  if (!schedule) {
    throw new AppError("Agenda não encontrada", 404);
  }

  await schedule.update({
    name: data.name ?? schedule.name,
    description: data.description !== undefined ? data.description : schedule.description,
    active: data.active !== undefined ? data.active : schedule.active
  });

  return schedule;
};

export default UpdateUserScheduleService;
