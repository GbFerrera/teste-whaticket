import { Request, Response } from "express";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import { Op } from "sequelize";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    console.log("🔍 [GroupController] Buscando grupos da empresa:", companyId);
    
    // Busca todos os contatos que são grupos da empresa
    const groups = await Contact.findAll({
      where: {
        companyId,
        isGroup: true
      },
      include: [
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name", "status"]
        }
      ],
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "name",
        "number",
        "profilePicUrl",
        "isGroup",
        "whatsappId",
        "createdAt",
        "updatedAt"
      ]
    });

    console.log(`✅ [GroupController] Encontrados ${groups.length} grupos`);

    // Formata os dados para o frontend
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      number: group.number,
      profilePicUrl: group.profilePicUrl,
      whatsappId: group.whatsappId,
      whatsappName: group.whatsapp?.name || "—",
      whatsappStatus: group.whatsapp?.status || "DISCONNECTED",
      isActive: group.whatsapp?.status === "CONNECTED",
      participants: 0, // Pode ser implementado futuramente
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    }));

    console.log(`📤 [GroupController] Retornando ${formattedGroups.length} grupos formatados`);

    return res.json({
      groups: formattedGroups,
      count: formattedGroups.length
    });
  } catch (error) {
    console.error("❌ [GroupController] Error fetching groups:", error);
    return res.status(500).json({ error: "Error fetching groups" });
  }
};
