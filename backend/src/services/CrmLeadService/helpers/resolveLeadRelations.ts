import AppError from "../../../errors/AppError";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";

const normalizeNumber = (phone?: string): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }

  return digits || null;
};

interface ResolveContactParams {
  companyId: number;
  providedContactId?: number;
  phone?: string;
  currentContactId?: number;
}

export const resolveLeadContactId = async ({
  companyId,
  providedContactId,
  phone,
  currentContactId
}: ResolveContactParams): Promise<number | undefined> => {
  if (providedContactId) {
    const contact = await Contact.findOne({
      where: { id: providedContactId, companyId }
    });

    if (!contact) {
      throw new AppError("Contato informado não encontrado para esta empresa.");
    }

    return contact.id;
  }

  const normalizedPhone = normalizeNumber(phone);

  if (!normalizedPhone) {
    return currentContactId;
  }

  const contact =
    (await Contact.findOne({
      where: {
        companyId,
        number: normalizedPhone
      }
    })) ||
    (await Contact.findOne({
      where: {
        companyId,
        number: normalizedPhone.replace(/^55/, "")
      }
    }));

  return contact?.id || currentContactId;
};

interface ResolveTicketParams {
  companyId: number;
  providedPrimaryTicketId?: number;
  currentPrimaryTicketId?: number;
}

export const resolveLeadPrimaryTicketId = async ({
  companyId,
  providedPrimaryTicketId,
  currentPrimaryTicketId
}: ResolveTicketParams): Promise<number | undefined> => {
  if (!providedPrimaryTicketId) {
    return currentPrimaryTicketId;
  }

  const ticket = await Ticket.findOne({
    where: { id: providedPrimaryTicketId, companyId }
  });

  if (!ticket) {
    throw new AppError("Ticket informado não encontrado para esta empresa.");
  }

  return ticket.id;
};
