import AppError from "../../errors/AppError";
import Project from "../../models/Project";

interface Request {
  id: number;
  companyId: number;
}

const DeleteProjectService = async ({ id, companyId }: Request): Promise<void> => {
  const project = await Project.findOne({
    where: { id, companyId }
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  await project.destroy();
};

export default DeleteProjectService;
