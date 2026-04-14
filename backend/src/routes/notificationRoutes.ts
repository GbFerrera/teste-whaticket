import { Router } from "express";
import * as NotificationController from "../controllers/NotificationController";
import isAuth from "../middleware/isAuth";

const notificationRoutes = Router();

notificationRoutes.post("/register-device", isAuth, NotificationController.registerDevice);
notificationRoutes.post("/unregister-device", isAuth, NotificationController.unregisterDevice);

export default notificationRoutes;
