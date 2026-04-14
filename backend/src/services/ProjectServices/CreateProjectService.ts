import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Project from "../../models/Project";
import CrmClient from "../../models/CrmClient";

export interface CreateProjectRequest {
  companyId: number;
  clientId: number;
  invoiceId?: number;
  name: string;
  description?: string;
  deliveryTime?: Date;
  warranty?: string;
  terms?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

const CreateProjectService = async (
  data: CreateProjectRequest
): Promise<Project> => {
  const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    clientId: Yup.number().required(),
    name: Yup.string().required().min(2),
    status: Yup.string()
      .oneOf(["draft", "active", "paused", "completed", "cancelled"])
      .default("draft")
  });

  await schema.validate(data);

  const client = await CrmClient.findOne({
    where: {
      id: data.clientId,
      companyId: data.companyId
    }
  });

  if (!client) {
    throw new AppError("ERR_CLIENT_NOT_FOUND", 404);
  }

  const project = await Project.create({
    ...data,
    status: data.status || "draft"
  });

  return project;
};

export default CreateProjectService;
