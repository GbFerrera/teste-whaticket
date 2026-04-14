import Contact from "../../../models/Contact";
import findOrCreateLeadByContact from "../../CrmLeadService/helpers/findOrCreateLeadByContact";
import findClientByContact from "../../CrmClientService/helpers/findClientByContact";

interface Result {
  leadId?: number;
  clientId?: number;
}

const resolveLeadClientForContact = async (
  contactId: number,
  companyId: number
): Promise<Result> => {
  if (!contactId) {
    return {};
  }

  const contact = await Contact.findOne({
    where: { id: contactId, companyId }
  });

  if (!contact) {
    return {};
  }

  const lead = await findOrCreateLeadByContact({ contact, companyId });
  const client = await findClientByContact(contact.id, companyId);

  return {
    leadId: lead?.id,
    clientId: client?.id
  };
};

export default resolveLeadClientForContact;
