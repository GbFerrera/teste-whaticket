import express from "express";
import isAuth from "../middleware/isAuth";
import * as UserScheduleController from "../controllers/UserScheduleController";

const userScheduleRoutes = express.Router();

userScheduleRoutes.get("/user-schedules", isAuth, UserScheduleController.index);
userScheduleRoutes.get("/user-schedules/:id", isAuth, UserScheduleController.show);
userScheduleRoutes.post("/user-schedules", isAuth, UserScheduleController.store);
userScheduleRoutes.put("/user-schedules/:id", isAuth, UserScheduleController.update);
userScheduleRoutes.delete("/user-schedules/:id", isAuth, UserScheduleController.remove);
userScheduleRoutes.post("/user-schedules/:id/google-integration", isAuth, UserScheduleController.linkGoogleIntegration);

export default userScheduleRoutes;
