import AppError from "../../../errors/AppError";
import MediaFolder from "../../../models/MediaFolder";

const getFolderOrThrow = async (folderId: number, companyId: number) => {
  const folder = await MediaFolder.findOne({
    where: {
      id: folderId,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada.", 404);
  }

  return folder;
};

export default getFolderOrThrow;
