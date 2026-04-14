import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Project from "../../models/Project";
import ProjectTask from "../../models/ProjectTask";

export interface CreateProjectTaskRequest {
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  status?: string;
  order?: number;
  startDate?: Date;
  dueDate?: Date;
}

const CreateProjectTaskService = async (
  data: CreateProjectTaskRequest
): Promise<ProjectTask> => {
  const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    projectId: Yup.number().required(),
    title: Yup.string().required().min(2),
    status: Yup.string()
      .oneOf(["pending", "in_progress", "review", "completed", "cancelled"])
      .default("pending")
  });

  await schema.validate(data);

  const project = await Project.findOne({
    where: {
      id: data.projectId,
      companyId: data.companyId
    }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  const lastTask = await ProjectTask.findOne({
    where: { projectId: data.projectId },
    order: [["order", "DESC"]]
  });

  const task = await ProjectTask.create({
    ...data,
    status: data.status || "pending",
    order: data.order ?? (lastTask ? lastTask.order + 1 : 0)
  });

  return task;
};

export default CreateProjectTaskService;
