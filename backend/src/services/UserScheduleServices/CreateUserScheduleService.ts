import * as Yup from "yup";
import AppError from "../../errors/AppError";
import UserSchedule from "../../models/UserSchedule";
import User from "../../models/User";

interface CreateUserScheduleData {
  name: string;
  description?: string;
  active?: boolean;
  userId: number;
  companyId: number;
}

const CreateUserScheduleService = async (
  data: CreateUserScheduleData
): Promise<UserSchedule> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório").max(100),
    description: Yup.string().nullable(),
    active: Yup.boolean().default(true),
    userId: Yup.number().required("Usuário é obrigatório"),
    companyId: Yup.number().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const user = await User.findOne({
    where: { id: data.userId, companyId: data.companyId }
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  const existingSchedule = await UserSchedule.findOne({
    where: { userId: data.userId }
  });

  if (existingSchedule) {
    throw new AppError("Este usuário já possui uma agenda vinculada", 400);
  }

  const schedule = await UserSchedule.create({
    name: data.name,
    description: data.description || null,
    active: data.active ?? true,
    userId: data.userId,
    companyId: data.companyId
  });

  return schedule;
};

export default CreateUserScheduleService;
