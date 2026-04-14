import TutorialVideo from "../../models/TutorialVideo";
import AppError from "../../errors/AppError";
import ShowTutorialVideoService from "./ShowTutorialVideoService";

interface TutorialVideoData {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

interface Request {
  tutorialVideoData: TutorialVideoData;
  tutorialVideoId: string | number;
  companyId: number;
}

const UpdateTutorialVideoService = async ({
  tutorialVideoData,
  tutorialVideoId,
  companyId
}: Request): Promise<TutorialVideo> => {
  const tutorialVideo = await ShowTutorialVideoService({
    id: tutorialVideoId,
    companyId
  });

  // Validações
  if (tutorialVideoData.title !== undefined) {
    if (!tutorialVideoData.title || tutorialVideoData.title.trim().length === 0) {
      throw new AppError("Título é obrigatório", 400);
    }
  }

  if (tutorialVideoData.description !== undefined && tutorialVideoData.description) {
    if (tutorialVideoData.description.length > 300) {
      throw new AppError("Descrição deve ter no máximo 300 caracteres", 400);
    }
  }

  // Preparar dados para atualização
  const updateData: any = {};

  if (tutorialVideoData.title !== undefined) {
    updateData.title = tutorialVideoData.title.trim();
  }

  if (tutorialVideoData.description !== undefined) {
    updateData.description = tutorialVideoData.description?.trim();
  }

  if (tutorialVideoData.videoUrl !== undefined) {
    updateData.videoUrl = tutorialVideoData.videoUrl?.trim();
  }

  if (tutorialVideoData.thumbnailUrl !== undefined) {
    updateData.thumbnailUrl = tutorialVideoData.thumbnailUrl?.trim();
  }

  if (tutorialVideoData.isActive !== undefined) {
    updateData.isActive = tutorialVideoData.isActive;
  }

  await tutorialVideo.update(updateData);

  await tutorialVideo.reload({
    include: [
      {
        model: require("../../models/User").default,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: require("../../models/Company").default,
        as: "company",
        attributes: ["id", "name"]
      }
    ]
  });

  return tutorialVideo;
};

export default UpdateTutorialVideoService;
