import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ProjectController from "../controllers/ProjectController";

const projectRoutes = Router();

// Projects CRUD
projectRoutes.get("/projects", isAuth, ProjectController.index);
projectRoutes.post("/projects", isAuth, ProjectController.store);
projectRoutes.get("/projects/:projectId", isAuth, ProjectController.show);
projectRoutes.put("/projects/:projectId", isAuth, ProjectController.update);
projectRoutes.delete("/projects/:projectId", isAuth, ProjectController.remove);

// Tasks
projectRoutes.post("/projects/:projectId/tasks", isAuth, ProjectController.storeTask);
projectRoutes.put("/projects/tasks/:taskId", isAuth, ProjectController.updateTask);
projectRoutes.delete("/projects/tasks/:taskId", isAuth, ProjectController.removeTask);

// Services
projectRoutes.post("/projects/:projectId/services", isAuth, ProjectController.addService);
projectRoutes.delete("/projects/:projectId/services/:serviceId", isAuth, ProjectController.removeService);

// Products
projectRoutes.post("/projects/:projectId/products", isAuth, ProjectController.addProduct);
projectRoutes.delete("/projects/:projectId/products/:productId", isAuth, ProjectController.removeProduct);

// Users
projectRoutes.post("/projects/:projectId/users", isAuth, ProjectController.addUser);
projectRoutes.delete("/projects/:projectId/users/:userId", isAuth, ProjectController.removeUser);

// Task Users
projectRoutes.post("/projects/tasks/:taskId/users", isAuth, ProjectController.addTaskUser);
projectRoutes.delete("/projects/tasks/:taskId/users/:userId", isAuth, ProjectController.removeTaskUser);

// User Tasks (tarefas atribuídas a um usuário)
projectRoutes.get("/users/:userId/tasks", isAuth, ProjectController.listUserTasks);

export default projectRoutes;
