import AppError from "../../errors/AppError";
import Project from "../../models/Project";
import CrmClient from "../../models/CrmClient";
import Invoice from "../../models/Invoices";
import ProjectService from "../../models/ProjectService";
import ProjectProduct from "../../models/ProjectProduct";
import ProjectUser from "../../models/ProjectUser";
import ProjectTask from "../../models/ProjectTask";
import ProjectTaskUser from "../../models/ProjectTaskUser";
import Servico from "../../models/Servico";
import Produto from "../../models/Produto";
import User from "../../models/User";

interface Request {
  id: number;
  companyId: number;
}

const ShowProjectService = async ({ id, companyId }: Request): Promise<Project> => {
  const project = await Project.findOne({
    where: { id, companyId },
    include: [
      {
        model: CrmClient,
        as: "client"
      },
      {
        model: Invoice,
        as: "invoice"
      },
      {
        model: ProjectService,
        as: "services",
        include: [
          {
            model: Servico,
            as: "service"
          }
        ]
      },
      {
        model: ProjectProduct,
        as: "products",
        include: [
          {
            model: Produto,
            as: "product"
          }
        ]
      },
      {
        model: ProjectUser,
        as: "users",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"]
          }
        ]
      },
      {
        model: ProjectTask,
        as: "tasks",
        include: [
          {
            model: ProjectTaskUser,
            as: "taskUsers",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "name"]
              }
            ]
          }
        ],
        order: [["order", "ASC"]]
      }
    ]
  });

  if (!project) {
    throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
  }

  return project;
};

export default ShowProjectService;
