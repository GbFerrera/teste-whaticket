import { Router } from "express";
import isAuth from "../middleware/isAuth";
import FollowUpController from "../controllers/FollowUpController";

const router = Router();

router.post("/follow-up", isAuth, (req, res) => FollowUpController.create(req, res));
router.get("/follow-up/:ticketId", isAuth, (req, res) => FollowUpController.list(req, res));
router.delete("/follow-up/:followUpId", isAuth, (req, res) => FollowUpController.cancel(req, res));
router.post("/follow-up/:ticketId/reset", isAuth, (req, res) => FollowUpController.resetTicket(req, res));
router.post("/follow-up/process", isAuth, (req, res) => FollowUpController.processPending(req, res));

export default router;
