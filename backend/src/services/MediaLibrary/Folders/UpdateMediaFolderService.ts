import { Op } from "sequelize";
import AppError from "../../../errors/AppError";
import MediaFolder from "../../../models/MediaFolder";
import getFolderOrThrow from "../helpers/getFolderOrThrow";

interface Request {
  folderId: number;
  companyId: number;
  name?: string;
  description?: string;
}

const UpdateMediaFolderService = async ({
  folderId,
  companyId,
  name,
  description
}: Request): Promise<MediaFolder> => {
  const folder = await getFolderOrThrow(folderId, companyId);

  const trimmedName = name?.trim();
  const trimmedDescription = description?.trim();

  if (trimmedName) {
    const existing = await MediaFolder.findOne({
      where: {
        companyId,
        name: trimmedName,
        id: { [Op.ne]: folderId }
      }
    });

    if (existing) {
      throw new AppError("Já existe uma pasta com esse nome.");
    }

    folder.name = trimmedName;
  }

  if (description !== undefined) {
    folder.description = trimmedDescription || null;
  }

  await folder.save();

  return folder;
};

export default UpdateMediaFolderService;
