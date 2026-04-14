import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";
import CrmClient from "../../models/CrmClient";
import syncLeadToClient from "./helpers/syncLeadToClient";
import {
  resolveLeadContactId,
  resolveLeadPrimaryTicketId
} from "./helpers/resolveLeadRelations";

interface Request {
  leadId: number;
  companyId: number;
  contactId?: number;
  phone?: string;
  primaryTicketId?: number;
}

interface Response {
  lead: CrmLead;
  client: CrmClient | null;
}

const ConvertCrmLeadService = async ({
  leadId,
  companyId,
  contactId,
  phone,
  primaryTicketId
}: Request): Promise<Response> => {
  const lead = await CrmLead.findOne({
    where: { id: leadId, companyId }
  });

  if (!lead) {
    throw new AppError("Lead não encontrado.", 404);
  }

  const resolvedContactId = await resolveLeadContactId({
    companyId,
    providedContactId: contactId,
    phone,
    currentContactId: lead.contactId
  });

  if (!resolvedContactId) {
    throw new AppError(
      "Para converter um lead é necessário ter um contato vinculado.",
      400
    );
  }

  const resolvedTicketId = await resolveLeadPrimaryTicketId({
    companyId,
    providedPrimaryTicketId: primaryTicketId,
    currentPrimaryTicketId: lead.primaryTicketId
  });

  await lead.update({
    contactId: resolvedContactId,
    primaryTicketId: resolvedTicketId,
    status: "converted",
    leadStatus: "convertido"
  });

  const client = await syncLeadToClient(lead);

  return {
    lead,
    client
  };
};

export default ConvertCrmLeadService;
