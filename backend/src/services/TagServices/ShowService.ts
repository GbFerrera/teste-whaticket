import { FindOptions } from "sequelize";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

const TagService = async (
  id: string | number,
  companyId?: number
): Promise<Tag> => {
  const whereCondition: FindOptions["where"] = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  const tag = await Tag.findOne({
    where: whereCondition,
    include: ["contacts"]
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  return tag;
};

export default TagService;
