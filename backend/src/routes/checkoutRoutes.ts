import express from "express";
import * as CheckoutController from "../controllers/CheckoutController";

const checkoutRoutes = express.Router();

checkoutRoutes.get("/public/checkout/:token", CheckoutController.showCheckout);
checkoutRoutes.get("/checkout/:token", CheckoutController.showCheckout);

export default checkoutRoutes;
