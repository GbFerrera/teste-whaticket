import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as FacebookOAuthController from "../controllers/FacebookOAuthController";

const facebookOAuthRoutes = Router();

facebookOAuthRoutes.get("/facebook-callback", FacebookOAuthController.facebookCallback);
facebookOAuthRoutes.get("/instagram-callback", FacebookOAuthController.instagramCallback);

export default facebookOAuthRoutes;
