import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ExportGroupContactsService from "../services/WbotServices/ExportGroupContactsService";

export const exportGroupContacts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user;

    console.log(`[ExportGroupContactsController] Iniciando exportação para ticket ${ticketId}, Company ${companyId}`);

    const result = await ExportGroupContactsService(Number(ticketId), companyId);

    // Gerar conteúdo CSV
    let csvContent = "Nome,Número,Administrador\n";
    
    result.participants.forEach(participant => {
      const name = participant.name || "Sem Nome";
      const adminStatus = participant.isSuperAdmin ? "Super Admin" : participant.isAdmin ? "Admin" : "Membro";
      csvContent += `"${name}",${participant.number},"${adminStatus}"\n`;
    });

    // Configurar headers para download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contatos_${result.groupName.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);

    return res.status(200).send(csvContent);

  } catch (error) {
    console.error("[ExportGroupContactsController] Erro:", error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Erro ao exportar contatos do grupo" });
  }
};
