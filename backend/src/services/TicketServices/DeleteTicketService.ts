import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import TicketTag from "../../models/TicketTag";
import TicketNote from "../../models/TicketNote";

const DeleteTicketService = async (
	id: string,
	userId: string,
	companyId: number
): Promise<Ticket> => {
	const ticket = await (Ticket as any).findOne({
		where: { id, companyId }
	});

	if (!ticket) {
		throw new AppError("ERR_NO_TICKET_FOUND", 404);
	}

	// Apagar mensagens ligadas a este ticket
	await (Message as any).destroy({
		where: { ticketId: ticket.id, companyId }
	});

	// Apagar rastreamento deste ticket
	await (TicketTraking as any).destroy({
		where: { ticketId: ticket.id, companyId }
	});

	// Apagar tags deste ticket
	await (TicketTag as any).destroy({
		where: { ticketId: ticket.id }
	});

	// Apagar notas deste ticket
	await (TicketNote as any).destroy({
		where: { ticketId: ticket.id }
	});

	// Finalmente, apagar o ticket
	await ticket.destroy();

	return ticket;
};

export default DeleteTicketService;
