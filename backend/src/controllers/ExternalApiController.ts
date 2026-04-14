import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ExternalAuthService from "../services/AuthServices/ExternalAuthService";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import User from "../models/User";

/**
 * API Externa de Login
 * POST /api/external/login
 * Body: { email: string, password: string }
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("ERR_MISSING_CREDENTIALS", 400);
  }

  const { user, token, refreshToken, expiresIn } = await ExternalAuthService({
    email,
    password
  });

  return res.status(200).json({
    success: true,
    data: {
      user,
      token,
      refreshToken,
      expiresIn
    }
  });
};

/**
 * API Externa de Refresh Token
 * POST /api/external/refresh
 * Body: { refreshToken: string }
 */
export const refresh = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("ERR_MISSING_REFRESH_TOKEN", 400);
  }

  try {
    const { user, newToken, refreshToken: newRefreshToken } = await RefreshTokenService(
      res,
      refreshToken
    );

    return res.status(200).json({
      success: true,
      data: {
        user,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
      }
    });
  } catch (error) {
    throw new AppError("ERR_INVALID_REFRESH_TOKEN", 401);
  }
};

/**
 * API Externa de Logout
 * POST /api/external/logout
 * Headers: Authorization: Bearer <token>
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;

  if (id) {
    const user = await User.findByPk(id);
    if (user) {
      await user.update({ online: false });
    }
  }

  return res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso"
  });
};

/**
 * API Externa de Verificação de Token
 * GET /api/external/verify
 * Headers: Authorization: Bearer <token>
 */
export const verify = async (req: Request, res: Response): Promise<Response> => {
  const { id, profile, companyId } = req.user;

  const user = await User.findByPk(id, {
    attributes: ["id", "name", "email", "profile", "companyId", "online"]
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      companyId: user.companyId,
      online: user.online
    }
  });
};
