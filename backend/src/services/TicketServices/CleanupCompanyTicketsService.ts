// @ts-nocheck
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import TicketTag from "../../models/TicketTag";
import TicketNote from "../../models/TicketNote";

interface Request {
  companyId: number;
}

const CleanupCompanyTicketsService = async ({ companyId }: Request): Promise<void> => {
  // Apagar mensagens ligadas aos tickets da empresa
  await Message.destroy({
    where: {
      ticketId: {
        [Op.in]: Ticket.sequelize.literal(
          `(SELECT id FROM Tickets WHERE companyId = ${companyId})`
        ) as any
      }
    } as any
  });

  // Apagar rastreamento de tickets
  await TicketTraking.destroy({
    where: {
      ticketId: {
        [Op.in]: Ticket.sequelize.literal(
          `(SELECT id FROM Tickets WHERE companyId = ${companyId})`
        ) as any
      },
      companyId
    } as any
  });

  // Apagar tags de tickets
  await TicketTag.destroy({
    where: {
      ticketId: {
        [Op.in]: Ticket.sequelize.literal(
          `(SELECT id FROM Tickets WHERE companyId = ${companyId})`
        ) as any
      }
    } as any
  });

  // Apagar notas de tickets
  await TicketNote.destroy({
    where: {
      ticketId: {
        [Op.in]: Ticket.sequelize.literal(
          `(SELECT id FROM Tickets WHERE companyId = ${companyId})`
        ) as any
      }
    } as any
  });

  // Finalmente, apagar os tickets da empresa
  await Ticket.destroy({ where: { companyId } });
};

export default CleanupCompanyTicketsService;
