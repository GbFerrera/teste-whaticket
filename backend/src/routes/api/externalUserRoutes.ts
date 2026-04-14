import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalUserController from "../../controllers/api/ExternalUserController";

const externalUserRoutes = Router();

externalUserRoutes.get(
  "/users",
  isAuthExternal,
  ExternalUserController.index
);

externalUserRoutes.get(
  "/users/:id",
  isAuthExternal,
  ExternalUserController.show
);

externalUserRoutes.post(
  "/users",
  isAuthExternal,
  ExternalUserController.store
);

externalUserRoutes.put(
  "/users/:id",
  isAuthExternal,
  ExternalUserController.update
);

externalUserRoutes.delete(
  "/users/:id",
  isAuthExternal,
  ExternalUserController.remove
);

// ==================== SERVIÇOS DO USUÁRIO ====================

externalUserRoutes.get(
  "/users/:id/services",
  isAuthExternal,
  ExternalUserController.listServices
);

externalUserRoutes.post(
  "/users/:id/services",
  isAuthExternal,
  ExternalUserController.addServices
);

externalUserRoutes.put(
  "/users/:id/services",
  isAuthExternal,
  ExternalUserController.setServices
);

externalUserRoutes.delete(
  "/users/:id/services",
  isAuthExternal,
  ExternalUserController.removeServices
);

// ==================== AGENDA DO USUÁRIO ====================

externalUserRoutes.get(
  "/users/:id/schedule",
  isAuthExternal,
  ExternalUserController.getSchedule
);

externalUserRoutes.post(
  "/users/:id/schedule",
  isAuthExternal,
  ExternalUserController.createSchedule
);

externalUserRoutes.put(
  "/users/:id/schedule",
  isAuthExternal,
  ExternalUserController.updateSchedule
);

// ==================== COMPROMISSOS DO USUÁRIO ====================

externalUserRoutes.get(
  "/users/:id/appointments",
  isAuthExternal,
  ExternalUserController.listAppointments
);

externalUserRoutes.post(
  "/users/:id/appointments",
  isAuthExternal,
  ExternalUserController.createAppointment
);

externalUserRoutes.put(
  "/users/:id/appointments/:appointmentId",
  isAuthExternal,
  ExternalUserController.updateAppointment
);

externalUserRoutes.delete(
  "/users/:id/appointments/:appointmentId",
  isAuthExternal,
  ExternalUserController.deleteAppointment
);

externalUserRoutes.patch(
  "/users/:id/appointments/:appointmentId/status",
  isAuthExternal,
  ExternalUserController.updateAppointmentStatus
);

export default externalUserRoutes;
