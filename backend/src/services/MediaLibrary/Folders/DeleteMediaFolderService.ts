import MediaFolder from "../../../models/MediaFolder";
import MediaFile from "../../../models/MediaFile";
import getFolderOrThrow from "../helpers/getFolderOrThrow";
import { deleteStoredFile } from "../../../utils/mediaLibraryPaths";

interface Request {
  folderId: number;
  companyId: number;
}

const DeleteMediaFolderService = async ({
  folderId,
  companyId
}: Request): Promise<void> => {
  const folder = await getFolderOrThrow(folderId, companyId);

  const files = await MediaFile.findAll({
    where: { folderId, companyId }
  });

  for (const file of files) {
    await deleteStoredFile(file.storagePath);
    await file.destroy();
  }

  await folder.destroy();
};

export default DeleteMediaFolderService;
