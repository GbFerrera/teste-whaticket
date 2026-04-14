import { Router } from "express";
import isAuth from "../middleware/isAuth";
import { list } from "../controllers/WebhookListController";

const router = Router();

router.get("/webhooks", isAuth, list);

export default router;
