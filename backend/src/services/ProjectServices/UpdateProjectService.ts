import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Project from "../../models/Project";

export interface UpdateProjectRequest {
  id: number;
  companyId: number;
  clientId?: number;
  invoiceId?: number;
  name?: string;
  description?: string;
  deliveryTime?: Date;
  warranty?: string;
  terms?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

const UpdateProjectService = async (
  data: UpdateProjectRequest
): Promise<Project> => {
  const schema = Yup.object().shape({
    id: Yup.number().required(),
    companyId: Yup.number().required(),
    name: Yup.string().min(2),
    status: Yup.string().oneOf(["draft", "active", "paused", "completed", "cancelled"])
  });

  await schema.validate(data);

  const project = await Project.findOne({
    where: { id: data.id, companyId: data.companyId }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  const { id, companyId, ...updateData } = data;

  await project.update(updateData);

  return project;
};

export default UpdateProjectService;
