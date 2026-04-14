import TutorialVideo from "../../models/TutorialVideo";
import AppError from "../../errors/AppError";

interface Request {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  companyId: number;
  userId: number;
}

const CreateTutorialVideoService = async ({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  companyId,
  userId
}: Request): Promise<TutorialVideo> => {
  // Validações
  if (!title || title.trim().length === 0) {
    throw new AppError("Título é obrigatório", 400);
  }

  if (!videoUrl || videoUrl.trim().length === 0) {
    throw new AppError("URL do vídeo é obrigatória", 400);
  }

  if (description && description.length > 300) {
    throw new AppError("Descrição deve ter no máximo 300 caracteres", 400);
  }

  const tutorialVideo = await TutorialVideo.create({
    title: title.trim(),
    description: description?.trim(),
    videoUrl: videoUrl.trim(),
    thumbnailUrl: thumbnailUrl?.trim(),
    companyId,
    userId,
    isActive: true,
    viewsCount: 0
  });

  return tutorialVideo;
};

export default CreateTutorialVideoService;
