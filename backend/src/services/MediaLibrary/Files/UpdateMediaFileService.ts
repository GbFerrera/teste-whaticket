import AppError from "../../../errors/AppError";
import MediaFile from "../../../models/MediaFile";

interface Request {
  fileId: number;
  companyId: number;
  customName?: string;
}

const UpdateMediaFileService = async ({
  fileId,
  companyId,
  customName
}: Request): Promise<MediaFile> => {
  const file = await MediaFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado.", 404);
  }

  if (customName !== undefined) {
    const trimmed = customName.trim();
    file.customName = trimmed || file.originalName;
  }

  await file.save();

  return file;
};

export default UpdateMediaFileService;
