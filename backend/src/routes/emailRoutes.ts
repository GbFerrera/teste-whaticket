import express from "express";
import { sendCrmEmail } from "../controllers/EmailController";

const emailRoutes = express.Router();

emailRoutes.post("/send-crm-email", sendCrmEmail);

export default emailRoutes;
