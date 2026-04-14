import { Op } from "sequelize";
import AppError from "../../../errors/AppError";
import MediaFolder from "../../../models/MediaFolder";

interface Request {
  name: string;
  description?: string;
  companyId: number;
}

const CreateMediaFolderService = async ({
  name,
  description,
  companyId
}: Request): Promise<MediaFolder> => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    throw new AppError("O nome da pasta é obrigatório.");
  }

  const existing = await MediaFolder.findOne({
    where: {
      companyId,
      name: { [Op.iLike]: trimmedName }
    }
  });

  if (existing) {
    throw new AppError("Já existe uma pasta com esse nome.");
  }

  const folder = await MediaFolder.create({
    name: trimmedName,
    description: description?.trim(),
    companyId
  });

  return folder;
};

export default CreateMediaFolderService;
