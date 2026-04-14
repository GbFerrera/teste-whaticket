import { Router } from "express";
import isAuthExternal from "../../middleware/isAuthExternal";
import * as ExternalTagKanbanController from "../../controllers/api/ExternalTagKanbanController";

const externalTagKanbanRoutes = Router();

externalTagKanbanRoutes.get(
  "/tags-kanban",
  isAuthExternal,
  ExternalTagKanbanController.index
);

externalTagKanbanRoutes.get(
  "/tags-kanban/:id",
  isAuthExternal,
  ExternalTagKanbanController.show
);

externalTagKanbanRoutes.post(
  "/tags-kanban",
  isAuthExternal,
  ExternalTagKanbanController.store
);

externalTagKanbanRoutes.put(
  "/tags-kanban/:id",
  isAuthExternal,
  ExternalTagKanbanController.update
);

externalTagKanbanRoutes.delete(
  "/tags-kanban/:id",
  isAuthExternal,
  ExternalTagKanbanController.remove
);

export default externalTagKanbanRoutes;
