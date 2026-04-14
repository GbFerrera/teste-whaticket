import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketTag from "../models/TicketTag";
import Tag from "../models/Tag";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import { getIO } from "../libs/socket";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;

  try {
    // Garante que o ticket tenha no máximo UMA tag Kanban
    // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      throw new AppError("ERR_NO_TAG_FOUND", 404);
    }

    if (tag.kanban === 1) {
      // Busca todas as tags já vinculadas ao ticket
      // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
      const existingTicketTags = await TicketTag.findAll({ where: { ticketId } });
      const existingTagIds = existingTicketTags.map(tt => tt.tagId);

      if (existingTagIds.length) {
        // Filtra somente as tags com kanban = 1 entre as já vinculadas
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        const existingKanbanTags = await Tag.findAll({
          where: {
            id: existingTagIds,
            kanban: 1,
          },
        });

        const existingKanbanTagIds = existingKanbanTags
          .map(t => t.id)
          // evita remover a própria tag que está sendo adicionada
          .filter(id => String(id) !== String(tagId));

        if (existingKanbanTagIds.length) {
          // @ts-ignore: Sequelize aceita array em where.tagId
          await TicketTag.destroy({ where: { ticketId, tagId: existingKanbanTagIds } });
        }
      }
    }

    // @ts-ignore: Sequelize dynamic method
    const ticketTag = await TicketTag.create({ ticketId, tagId });

    // Recarrega o ticket com tags e contact.tags para refletir no frontend
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
          include: ["extraInfo", "tags"],
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    if (ticket) {
      const io = getIO();
      io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
      });
    }

    return res.status(201).json(ticketTag);
  } catch (error: any) {
    console.error("[TicketTagController.store] Error storing ticket tag", {
      ticketId,
      tagId,
      error: error?.message || error,
    });
    return res.status(500).json({
      error: "Failed to store ticket tag.",
      details: error?.message || String(error),
    });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  try {
    // Remoção manual de TODAS as tags vinculadas ao ticket (inclusive Kanban)
    // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
    await TicketTag.destroy({ where: { ticketId } });

    // Recarrega o ticket para refletir remoção das tags
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
          include: ["extraInfo", "tags"],
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    if (ticket) {
      const io = getIO();
      io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
      });
    }

    return res.status(200).json({ message: "Ticket tags removed successfully." });
  } catch (error: any) {
    console.error("[TicketTagController.remove] Error removing ticket tags", {
      ticketId,
      error: error?.message || error,
    });
    return res.status(500).json({
      error: "Failed to remove ticket tags.",
      details: error?.message || String(error),
    });
  }
};