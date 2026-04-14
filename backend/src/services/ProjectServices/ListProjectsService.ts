import { Op, WhereOptions } from "sequelize";
import Project from "../../models/Project";
import CrmClient from "../../models/CrmClient";
import ProjectUser from "../../models/ProjectUser";
import ProjectTask from "../../models/ProjectTask";
import User from "../../models/User";

interface Request {
  companyId: number;
  searchParam?: string;
  status?: string;
  clientId?: number;
  pageNumber?: number;
  limit?: number;
}

const ListProjectsService = async ({
  companyId,
  searchParam,
  status,
  clientId,
  pageNumber = 1,
  limit = 20
}: Request) => {
  const where: WhereOptions = {
    companyId
  };

  if (status) {
    where.status = status;
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (searchParam) {
    const like = { [Op.iLike]: `%${searchParam}%` };
    (where as any)[Op.or] = [
      { name: like },
      { description: like }
    ];
  }

  const offset = (pageNumber - 1) * limit;

  const { rows, count } = await Project.findAndCountAll({
    where,
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "companyName"]
      },
      {
        model: ProjectUser,
        as: "users",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          }
        ]
      },
      {
        model: ProjectTask,
        as: "tasks",
        attributes: ["id", "title", "status"]
      }
    ],
    order: [["updatedAt", "DESC"]],
    limit,
    offset
  });

  return {
    projects: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListProjectsService;
