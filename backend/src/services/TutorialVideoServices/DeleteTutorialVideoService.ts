import TutorialVideo from "../../models/TutorialVideo";
import AppError from "../../errors/AppError";
import ShowTutorialVideoService from "./ShowTutorialVideoService";

interface Request {
  id: string | number;
  companyId: number;
  hardDelete?: boolean; // Se true, remove fisicamente. Se false, apenas marca como inativo
}

const DeleteTutorialVideoService = async ({
  id,
  companyId,
  hardDelete = false
}: Request): Promise<void> => {
  const tutorialVideo = await ShowTutorialVideoService({
    id,
    companyId
  });

  if (hardDelete) {
    await tutorialVideo.destroy();
  } else {
    await tutorialVideo.update({
      isActive: false
    });
  }
};

export default DeleteTutorialVideoService;
