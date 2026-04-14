import express, { RequestHandler } from "express";
import multer from "multer";

import uploadConfig from "../../config/upload";
import isAuth from "../../middleware/isAuth";
import * as MessageController from "../controllers/MessageController";

const hubMessageRoutes = express.Router();
const upload = multer(uploadConfig);

hubMessageRoutes.post(
  "/hub-message/:ticketId",
  isAuth,
  upload.array("medias") as unknown as RequestHandler,
  MessageController.send
);

export default hubMessageRoutes;
