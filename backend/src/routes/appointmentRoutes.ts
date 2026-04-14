import express from "express";
import isAuth from "../middleware/isAuth";
import * as AppointmentController from "../controllers/AppointmentController";

const appointmentRoutes = express.Router();

appointmentRoutes.get("/appointments", isAuth, AppointmentController.index);
appointmentRoutes.get("/appointments/:id", isAuth, AppointmentController.show);
appointmentRoutes.post("/appointments", isAuth, AppointmentController.store);
appointmentRoutes.put("/appointments/:id", isAuth, AppointmentController.update);
appointmentRoutes.delete("/appointments/:id", isAuth, AppointmentController.remove);

export default appointmentRoutes;
