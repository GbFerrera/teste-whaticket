import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CouponController from "../controllers/CouponController";

const couponRoutes = Router();

// Rotas públicas
couponRoutes.get("/validate/:code", CouponController.validateCoupon);

// Rotas do super admin
couponRoutes.get("/", isAuth, CouponController.listCoupons);
couponRoutes.post("/", isAuth, CouponController.createCoupon);
couponRoutes.put("/:id", isAuth, CouponController.updateCoupon);
couponRoutes.delete("/:id", isAuth, CouponController.deleteCoupon);

export default couponRoutes;
