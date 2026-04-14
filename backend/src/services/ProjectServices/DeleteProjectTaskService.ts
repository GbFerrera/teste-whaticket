import AppError from "../../errors/AppError";
import ProjectTask from "../../models/ProjectTask";

interface Request {
  id: number;
  companyId: number;
}

const DeleteProjectTaskService = async ({ id, companyId }: Request): Promise<void> => {
  const task = await ProjectTask.findOne({
    where: { id, companyId }
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND", 404);
  }

  await task.destroy();
};

export default DeleteProjectTaskService;
