import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";
import User from "../models/User";
import { getIO } from "../libs/socket";

export const mobileLogin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError("ERR_TOKEN_REQUIRED", 401);
    }

    // Verificar e decodificar o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    
    // Buscar usuário pelo ID do token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }

    // Atualizar status online
    await user.update({ online: true });

    // Emitir evento para WebSocket
    const io = getIO();
    io.of(user.companyId.toString()).emit(`company-${user.companyId}-auth`, {
      action: "update",
      user: {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        online: true
      }
    });

    // Retornar dados do usuário para uso na WebView
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        companyId: user.companyId,
        online: true,
        userType: user.userType,
        whatsappId: user.whatsappId
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("ERR_INVALID_TOKEN", 401);
    }
    throw error;
  }
};

export const mobileWebViewAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError("ERR_TOKEN_REQUIRED", 401);
    }

    // Verificar e decodificar o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    
    // Buscar usuário pelo ID do token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }

    // Atualizar status online
    await user.update({ online: true });

    // Emitir evento para WebSocket
    const io = getIO();
    io.of(user.companyId.toString()).emit(`company-${user.companyId}-auth`, {
      action: "update",
      user: {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        online: true
      }
    });

    // Retornar sucesso para WebView
    return res.status(200).json({
      success: true,
      message: "WebView authenticated successfully"
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("ERR_INVALID_TOKEN", 401);
    }
    throw error;
  }
};
