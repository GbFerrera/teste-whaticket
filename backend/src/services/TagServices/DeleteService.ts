import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId?: number;
}

const DeleteService = async ({ id, companyId }: Request): Promise<void> => {
  const tag = await Tag.findOne({
    where: {
      id,
      ...(companyId ? { companyId } : {})
    }
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tag.destroy();
};

export default DeleteService;
