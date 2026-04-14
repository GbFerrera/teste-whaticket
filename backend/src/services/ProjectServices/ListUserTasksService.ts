import ProjectTask from "../../models/ProjectTask";
import ProjectTaskUser from "../../models/ProjectTaskUser";
import Project from "../../models/Project";
import User from "../../models/User";
import { Op } from "sequelize";

interface ListUserTasksQuery {
  companyId: number;
  userId: number;
  status?: string;
  pageNumber?: number;
}

interface ListUserTasksResponse {
  tasks: ProjectTask[];
  count: number;
  hasMore: boolean;
}

const ListUserTasksService = async ({
  companyId,
  userId,
  status,
  pageNumber = 1
}: ListUserTasksQuery): Promise<ListUserTasksResponse> => {
  const limit = 50;
  const offset = (pageNumber - 1) * limit;

  // Buscar IDs das tarefas atribuídas ao usuário
  const taskUserRecords = await ProjectTaskUser.findAll({
    where: { userId, companyId },
    attributes: ["taskId"]
  });

  const taskIds = taskUserRecords.map(tu => tu.taskId);

  if (taskIds.length === 0) {
    return { tasks: [], count: 0, hasMore: false };
  }

  const where: any = {
    id: { [Op.in]: taskIds },
    companyId
  };

  if (status) {
    where.status = status;
  }

  const { count, rows: tasks } = await ProjectTask.findAndCountAll({
    where,
    include: [
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      },
      {
        model: User,
        as: "assignedUsers",
        attributes: ["id", "name", "email"],
        through: { attributes: ["responsibility"] }
      }
    ],
    order: [
      ["dueDate", "ASC"],
      ["order", "ASC"],
      ["createdAt", "DESC"]
    ],
    limit,
    offset
  });

  const hasMore = count > offset + tasks.length;

  return { tasks, count, hasMore };
};

export default ListUserTasksService;
