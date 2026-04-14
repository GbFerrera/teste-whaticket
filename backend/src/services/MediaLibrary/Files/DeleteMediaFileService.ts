import AppError from "../../../errors/AppError";
import MediaFile from "../../../models/MediaFile";
import { deleteStoredFile } from "../../../utils/mediaLibraryPaths";

interface Request {
  fileId: number;
  companyId: number;
}

const DeleteMediaFileService = async ({
  fileId,
  companyId
}: Request): Promise<void> => {
  const file = await MediaFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado.", 404);
  }

  await deleteStoredFile(file.storagePath);
  await file.destroy();
};

export default DeleteMediaFileService;
