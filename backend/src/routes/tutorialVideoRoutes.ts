import express from "express";
import isAuth from "../middleware/isAuth";
import * as TutorialVideoController from "../controllers/TutorialVideoController";

const tutorialVideoRoutes = express.Router();

// Middleware de autenticação para todas as rotas
tutorialVideoRoutes.use(isAuth);

// GET /tutorial-videos - Listar vídeos tutoriais
tutorialVideoRoutes.get("/", TutorialVideoController.index);

// GET /tutorial-videos/:tutorialVideoId - Buscar vídeo específico
tutorialVideoRoutes.get("/:tutorialVideoId", TutorialVideoController.show);

// POST /tutorial-videos - Criar novo vídeo tutorial
tutorialVideoRoutes.post("/", TutorialVideoController.store);

// PUT /tutorial-videos/:tutorialVideoId - Atualizar vídeo tutorial
tutorialVideoRoutes.put("/:tutorialVideoId", TutorialVideoController.update);

// DELETE /tutorial-videos/:tutorialVideoId - Remover vídeo tutorial
tutorialVideoRoutes.delete("/:tutorialVideoId", TutorialVideoController.remove);

export default tutorialVideoRoutes;
