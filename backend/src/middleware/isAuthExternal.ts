import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import CompanyApiKey from "../models/CompanyApiKey";

const isAuthExternal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }

  const apiKey = await CompanyApiKey.findOne({
    where: { token, active: true }
  });

  if (!apiKey) {
    throw new AppError("ERR_EXTERNAL_AUTH_INVALID", 401);
  }

  req.externalAuth = {
    companyId: apiKey.companyId,
    apiKeyId: apiKey.id,
    webhookUrl: apiKey.webhookUrl,
    webhookSecret: apiKey.webhookSecret,
    token: apiKey.token
  };

  apiKey.lastUsedAt = new Date();
  await apiKey.save();

  return next();
};

export default isAuthExternal;
