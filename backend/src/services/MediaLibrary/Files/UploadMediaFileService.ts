import AppError from "../../../errors/AppError";
import MediaFile from "../../../models/MediaFile";
import getFolderOrThrow from "../helpers/getFolderOrThrow";
import { getRelativeStoragePath } from "../../../utils/mediaLibraryPaths";

interface Request {
  folderId: number;
  companyId: number;
  file?: Express.Multer.File;
}

const UploadMediaFileService = async ({
  folderId,
  companyId,
  file
}: Request): Promise<MediaFile> => {
  if (!file) {
    throw new AppError("Arquivo não recebido.");
  }

  await getFolderOrThrow(folderId, companyId);

  const mediaFile = await MediaFile.create({
    folderId,
    companyId,
    originalName: file.originalname,
    customName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath: getRelativeStoragePath(file.path)
  });

  return mediaFile;
};

export default UploadMediaFileService;
