import TutorialVideo from "../../models/TutorialVideo";
import User from "../../models/User";
import Company from "../../models/Company";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
  incrementView?: boolean;
}

const ShowTutorialVideoService = async ({
  id,
  companyId,
  incrementView = false
}: Request): Promise<TutorialVideo> => {
  const tutorialVideo = await TutorialVideo.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!tutorialVideo) {
    throw new AppError("Vídeo tutorial não encontrado", 404);
  }

  // Incrementar contador de visualizações se solicitado
  if (incrementView) {
    await tutorialVideo.update({
      viewsCount: tutorialVideo.viewsCount + 1
    });
    
    // Recarregar para obter o valor atualizado
    await tutorialVideo.reload();
  }

  return tutorialVideo;
};

export default ShowTutorialVideoService;
