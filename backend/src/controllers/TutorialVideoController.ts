import { Request, Response } from "express";

import CreateTutorialVideoService from "../services/TutorialVideoServices/CreateTutorialVideoService";
import ListTutorialVideosService from "../services/TutorialVideoServices/ListTutorialVideosService";
import ShowTutorialVideoService from "../services/TutorialVideoServices/ShowTutorialVideoService";
import UpdateTutorialVideoService from "../services/TutorialVideoServices/UpdateTutorialVideoService";
import DeleteTutorialVideoService from "../services/TutorialVideoServices/DeleteTutorialVideoService";
import AppError from "../errors/AppError";

const MASTER_TUTORIAL_COMPANY_ID = Number(process.env.MASTER_TUTORIAL_COMPANY_ID || 1);

const ensureMasterCompanyAdmin = (companyId: number, profile: string) => {
  if (companyId !== MASTER_TUTORIAL_COMPANY_ID || profile !== "admin") {
    throw new AppError("Apenas administradores da empresa mestre podem alterar tutoriais", 403);
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;

  ensureMasterCompanyAdmin(companyId, profile);

  try {
    const tutorialVideo = await CreateTutorialVideoService({
      title: req.body.title,
      description: req.body.description,
      videoUrl: req.body.videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      companyId: MASTER_TUTORIAL_COMPANY_ID,
      userId: Number(userId)
    });

    return res.status(201).json(tutorialVideo);
  } catch (error: any) {
    console.error("Erro ao criar vídeo tutorial:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, isActive } = req.query;

  try {
    const { tutorialVideos, count, hasMore } = await ListTutorialVideosService({
      companyId: MASTER_TUTORIAL_COMPANY_ID,
      searchParam: searchParam as string,
      pageNumber: pageNumber as string,
      isActive: isActive === "false" ? false : true
    });

    return res.json({ tutorialVideos, count, hasMore });
  } catch (error: any) {
    console.error("Erro ao listar vídeos tutoriais:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tutorialVideoId } = req.params;
  const { incrementView } = req.query;

  try {
    const tutorialVideo = await ShowTutorialVideoService({
      id: tutorialVideoId,
      companyId: MASTER_TUTORIAL_COMPANY_ID,
      incrementView: incrementView === "true"
    });

    return res.json(tutorialVideo);
  } catch (error: any) {
    console.error("Erro ao buscar vídeo tutorial:", error);
    return res.status(404).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  const { tutorialVideoId } = req.params;
  const tutorialVideoData = req.body;

  ensureMasterCompanyAdmin(companyId, profile);

  try {
    const tutorialVideo = await UpdateTutorialVideoService({
      tutorialVideoData,
      tutorialVideoId,
      companyId: MASTER_TUTORIAL_COMPANY_ID
    });

    return res.json(tutorialVideo);
  } catch (error: any) {
    console.error("Erro ao atualizar vídeo tutorial:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  const { tutorialVideoId } = req.params;
  const { hardDelete } = req.query;

  ensureMasterCompanyAdmin(companyId, profile);

  try {
    await DeleteTutorialVideoService({
      id: tutorialVideoId,
      companyId: MASTER_TUTORIAL_COMPANY_ID,
      hardDelete: hardDelete === "true"
    });

    return res.json({ message: "Vídeo tutorial removido com sucesso" });
  } catch (error: any) {
    console.error("Erro ao remover vídeo tutorial:", error);
    return res.status(400).json({ error: error.message });
  }
};
