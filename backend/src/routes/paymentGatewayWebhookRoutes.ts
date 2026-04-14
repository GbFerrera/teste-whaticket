import { Router } from "express";
import {
  asaasWebhook,
  mercadoPagoWebhook
} from "../controllers/PaymentGatewayWebhookController";

const paymentGatewayWebhookRoutes = Router();

paymentGatewayWebhookRoutes.post(
  "/webhook/payments/mercadopago",
  mercadoPagoWebhook
);

paymentGatewayWebhookRoutes.post("/webhook/payments/asaas", asaasWebhook);

export default paymentGatewayWebhookRoutes;
