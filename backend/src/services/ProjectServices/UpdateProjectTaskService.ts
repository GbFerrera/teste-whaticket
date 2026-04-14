import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ProjectTask from "../../models/ProjectTask";

export interface UpdateProjectTaskRequest {
  id: number;
  companyId: number;
  title?: string;
  description?: string;
  status?: string;
  order?: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
}

const UpdateProjectTaskService = async (
  data: UpdateProjectTaskRequest
): Promise<ProjectTask> => {
  const schema = Yup.object().shape({
    id: Yup.number().required(),
    companyId: Yup.number().required(),
    title: Yup.string().min(2),
    status: Yup.string().oneOf(["pending", "in_progress", "review", "completed", "cancelled"])
  });

  await schema.validate(data);

  const task = await ProjectTask.findOne({
    where: { id: data.id, companyId: data.companyId }
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND", 404);
  }

  const { id, companyId, ...updateData } = data;

  if (updateData.status === "completed" && !updateData.completedAt) {
    updateData.completedAt = new Date();
  }

  await task.update(updateData);

  return task;
};

export default UpdateProjectTaskService;
