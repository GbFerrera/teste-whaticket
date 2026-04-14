import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import * as ChatController from "../controllers/ChatController";

const routes = express.Router();

// Configuração do multer para processamento de arquivos
const upload = multer({
  storage: multer.memoryStorage()
});

routes.get("/chats", isAuth, ChatController.index);
routes.get("/chats/:id", isAuth, ChatController.show);
routes.get("/chats/:id/messages", isAuth, ChatController.messages);
routes.post(
  "/chats/:id/messages",
  isAuth,
  upload.array("medias"),
  ChatController.saveMessage
);
routes.post("/chats/:id/read", isAuth, ChatController.checkAsRead);
routes.post("/chats", isAuth, ChatController.store);
routes.put("/chats/:id", isAuth, ChatController.update);
routes.delete("/chats/:id", isAuth, ChatController.remove);

export default routes;
