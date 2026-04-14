import { Request, Response } from "express";
import AppError from "../errors/AppError";
import SyncGroupsService from "../services/WbotServices/SyncGroupsService";
import { getIO } from "../libs/socket";

export const syncGroups = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { whatsappId } = req.params;
    const { companyId } = req.user;

    console.log(`[SyncGroupsController] Iniciando sincronização para WhatsApp ${whatsappId}, Company ${companyId}`);

    const result = await SyncGroupsService(Number(whatsappId), companyId);

    // Emitir evento para atualizar frontend
    const io = getIO();
    io.to(`company-${companyId}`).emit(`company${companyId}-syncGroups`, {
      action: "completed",
      result: {
        groupsFound: result.groups.length,
        ticketsCreated: result.ticketsCreated,
        errors: result.errors.length
      }
    });

    return res.status(200).json({
      message: "Sincronização de grupos concluída",
      groupsFound: result.groups.length,
      ticketsCreated: result.ticketsCreated,
      errors: result.errors,
      groups: result.groups
    });

  } catch (error) {
    console.error("[SyncGroupsController] Erro:", error);
    
    // Emitir evento de erro para frontend
    const io = getIO();
    io.to(`company-${req.user.companyId}`).emit(`company${req.user.companyId}-syncGroups`, {
      action: "error",
      error: error.message
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Erro ao sincronizar grupos" });
  }
};
