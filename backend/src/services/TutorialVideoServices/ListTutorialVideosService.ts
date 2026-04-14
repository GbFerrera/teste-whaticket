import { Op } from "sequelize";
import TutorialVideo from "../../models/TutorialVideo";
import User from "../../models/User";
import Company from "../../models/Company";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string;
  isActive?: boolean;
}

interface Response {
  tutorialVideos: TutorialVideo[];
  count: number;
  hasMore: boolean;
}

const ListTutorialVideosService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
  isActive = true
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (isActive !== undefined) {
    whereCondition.isActive = isActive;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${searchParam}%`
        }
      },
      {
        description: {
          [Op.iLike]: `%${searchParam}%`
        }
      }
    ];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tutorialVideos } = await TutorialVideo.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"]
      }
    ]
  });

  const hasMore = count > offset + tutorialVideos.length;

  return {
    tutorialVideos,
    count,
    hasMore
  };
};

export default ListTutorialVideosService;
