import CrmLead from "../../../models/CrmLead";
import Contact from "../../../models/Contact";
import logger from "../../../utils/logger";

interface Params {
  contact: Contact;
  companyId: number;
}

const normalizeDocument = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : null;
};

const syncContactToLead = async ({
  contact,
  companyId
}: Params): Promise<void> => {
  if (contact.isGroup) {
    return;
  }

  let lead = await CrmLead.findOne({
    where: {
      companyId,
      contactId: contact.id
    }
  });

  if (!lead) {
    // Se não existe Lead, cria um
    const normalizedDocument = normalizeDocument(contact.cpfCnpj);
    const normalizedPhone = contact.number || null;
    const email = contact.email || null;
    const name = contact.name || normalizedPhone || "Lead";

    lead = await CrmLead.create({
      companyId,
      contactId: contact.id,
      name,
      email,
      phone: normalizedPhone,
      document: normalizedDocument,
      status: "new",
      leadStatus: "novo",
      lastActivityAt: new Date()
    });

    logger.info(`Created new Lead ${lead.id} for Contact ${contact.id}`);
  } else {
    // Se existe, atualiza se necessário
    const updates: Partial<CrmLead> = {};
    const normalizedDocument = normalizeDocument(contact.cpfCnpj);

    if (contact.number && contact.number !== lead.phone) {
      updates.phone = contact.number;
    }

    if (contact.email && contact.email !== lead.email) {
      updates.email = contact.email;
    }

    if (contact.name && contact.name !== lead.name) {
      updates.name = contact.name;
    }

    if (normalizedDocument && normalizedDocument !== lead.document) {
      updates.document = normalizedDocument;
    }

    if (Object.keys(updates).length > 0) {
      logger.info(`Syncing Contact ${contact.id} changes to Lead ${lead.id}:`, updates);
      await lead.update(updates);
    }
  }
};

export default syncContactToLead;
