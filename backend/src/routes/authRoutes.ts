import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import * as MobileAuthController from "../controllers/MobileAuthController";
import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";
import Company from "../models/Company";

const authRoutes = Router();

authRoutes.get("/check-first-signup", async (req, res) => {
  try {
    const companyCount = await Company.count();
    return res.json({ isFirstSignup: companyCount === 0 });
  } catch (error) {
    return res.json({ isFirstSignup: false });
  }
});

authRoutes.get("/check-affiliate/:code", require("../controllers/AuthController").checkAffiliate);

authRoutes.post("/signup", UserController.store);
authRoutes.get("/check-email", UserController.checkEmail);
authRoutes.post("/login", SessionController.store);
authRoutes.post("/verify-2fa", SessionController.verify2FA);
authRoutes.post("/refresh_token", SessionController.update);
authRoutes.delete("/logout", isAuth, SessionController.remove);
authRoutes.get("/me", isAuth, SessionController.me);
authRoutes.post("/mobile-login", MobileAuthController.mobileLogin);
authRoutes.post("/mobile/auth/webview", MobileAuthController.mobileWebViewAuth);

export default authRoutes;
