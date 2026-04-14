import MediaFile from "../../../models/MediaFile";
import getFolderOrThrow from "../helpers/getFolderOrThrow";

interface Request {
  folderId: number;
  companyId: number;
}

const ListMediaFilesService = async ({
  folderId,
  companyId
}: Request): Promise<MediaFile[]> => {
  await getFolderOrThrow(folderId, companyId);

  const files = await MediaFile.findAll({
    where: { folderId, companyId },
    order: [["createdAt", "DESC"]]
  });

  return files;
};

export default ListMediaFilesService;
