import { Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import * as NotificationController from "../controllers/NotificationController";

// Middleware para registrar dispositivo móvel
export const registerMobileDevice = async (req: Request, res: Response) => {
  try {
    const { deviceToken, platform } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!deviceToken || !platform) {
      return res.status(400).json({ error: "Device token and platform are required" });
    }

    await NotificationController.registerDevice(req, res);
  } catch (error) {
    console.error("Error registering mobile device:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware para remover dispositivo móvel
export const unregisterMobileDevice = async (req: Request, res: Response) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    await NotificationController.unregisterDevice(req, res);
  } catch (error) {
    console.error("Error unregistering mobile device:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
