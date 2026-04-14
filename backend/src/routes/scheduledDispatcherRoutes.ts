import { Router } from "express";
import * as ScheduledDispatcherController from "../controllers/ScheduledDispatcherController";
import isAuth from "../middleware/isAuth";

const scheduledDispatcherRoutes = Router();

scheduledDispatcherRoutes.get(
  "/scheduled-dispatchers",
  isAuth,
  ScheduledDispatcherController.index
);

scheduledDispatcherRoutes.get(
  "/scheduled-dispatchers/:id",
  isAuth,
  ScheduledDispatcherController.show
);

scheduledDispatcherRoutes.post(
  "/scheduled-dispatchers",
  isAuth,
  ScheduledDispatcherController.store
);

scheduledDispatcherRoutes.put(
  "/scheduled-dispatchers/:id",
  isAuth,
  ScheduledDispatcherController.update
);

scheduledDispatcherRoutes.patch(
  "/scheduled-dispatchers/:id/toggle",
  isAuth,
  ScheduledDispatcherController.toggle
);

scheduledDispatcherRoutes.delete(
  "/scheduled-dispatchers/:id",
  isAuth,
  ScheduledDispatcherController.remove
);

export default scheduledDispatcherRoutes;
