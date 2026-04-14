import { Op, WhereOptions } from "sequelize";
import MediaFolder from "../../../models/MediaFolder";

interface Request {
  companyId: number;
  searchParam?: string;
}

const ListMediaFoldersService = async ({
  companyId,
  searchParam
}: Request): Promise<MediaFolder[]> => {
  const where: WhereOptions = {
    companyId
  };

  if (searchParam) {
    const like = { [Op.iLike]: `%${searchParam}%` };
    (where as any)[Op.or] = [{ name: like }, { description: like }];
  }

  const folders = await MediaFolder.findAll({
    where,
    order: [["updatedAt", "DESC"]]
  });

  return folders;
};

export default ListMediaFoldersService;
