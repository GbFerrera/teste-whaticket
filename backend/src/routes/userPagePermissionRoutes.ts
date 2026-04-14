import { Router } from "express";
import UserPagePermissionController from "../controllers/UserPagePermissionController";
import isAuth from "../middleware/isAuth";

const router = Router();

// Lista todas as páginas disponíveis no sistema
router.get(
  "/pages/list",
  isAuth,
  UserPagePermissionController.listAvailablePages
);

// Obtém permissões de um usuário específico
router.get(
  "/users/:userId/page-permissions",
  isAuth,
  UserPagePermissionController.getUserPermissions
);

// Define permissões de um usuário
router.post(
  "/users/:userId/page-permissions",
  isAuth,
  UserPagePermissionController.setUserPermissions
);

// Verifica se o usuário atual tem acesso a uma página específica
router.get(
  "/check-page-access",
  isAuth,
  UserPagePermissionController.checkPageAccess
);

// Obtém páginas que o usuário atual pode acessar (para montar o menu)
router.get(
  "/user-accessible-pages",
  isAuth,
  UserPagePermissionController.getUserAccessiblePages
);

export default router;
