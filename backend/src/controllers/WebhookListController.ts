import { Request, Response } from "express";
import ListWebHookService from "../services/WebhookService/ListWebHookService";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    companyId: number;
    profile: string;
  };
}

// Listar todas as integrações (webhooks) da empresa
export const list = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const userId = parseInt(req.user.id);

    const webhooks = await ListWebHookService({
      companyId,
      userId
    });

    return res.status(200).json(webhooks);
  } catch (error) {
    console.error("Erro ao listar webhooks:", error);
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};
