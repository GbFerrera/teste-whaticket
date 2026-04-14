import CrmLead from "../../../models/CrmLead";
import Contact from "../../../models/Contact";
import { Op } from "sequelize";

interface Params {
  contact: Contact;
  companyId: number;
}

const normalizeDocument = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : null;
};

const findOrCreateLeadByContact = async ({
  contact,
  companyId
}: Params): Promise<CrmLead | null> => {
  if (!contact || contact.isGroup) {
    return null;
  }

  const normalizedDocument = normalizeDocument(contact.cpfCnpj);
  const normalizedPhone = contact.number || null;
  const email = contact.email || null;
  const name = contact.name || normalizedPhone || "Lead";

  // Primeiro, tenta encontrar um lead vinculado a este contactId
  let lead = await CrmLead.findOne({
    where: {
      companyId,
      contactId: contact.id
    }
  });

  // Se não encontrou por contactId, busca por número de telefone ou lid
  if (!lead && (normalizedPhone || normalizedDocument)) {
    const whereConditions: any[] = [];
    
    if (normalizedPhone) {
      whereConditions.push({ phone: normalizedPhone });
    }
    
    if (normalizedDocument) {
      whereConditions.push({ lid: normalizedDocument });
    }

    if (whereConditions.length > 0) {
      lead = await CrmLead.findOne({
        where: {
          companyId,
          [Op.or]: whereConditions
        }
      });

      // Se encontrou um lead existente, vincula ao novo contato
      if (lead && lead.contactId !== contact.id) {
        await lead.update({ contactId: contact.id });
      }
    }
  }

  if (!lead) {
    // Cria um novo lead apenas se não encontrou nenhum existente
    lead = await CrmLead.create({
      companyId,
      contactId: contact.id,
      name,
      email,
      phone: normalizedPhone,
      lid: normalizedDocument,
      document: normalizedDocument,
      status: "new",
      leadStatus: "novo",
      lastActivityAt: new Date()
    });
  } else {
    // Atualiza as informações do lead existente
    const updates: Partial<CrmLead> = {};
    if (normalizedPhone && normalizedPhone !== lead.phone) {
      updates.phone = normalizedPhone;
    }
    if (email && email !== lead.email) {
      updates.email = email;
    }
    if (contact.name && (!lead.name || lead.name === "Lead")) {
      updates.name = contact.name;
    }
    if (normalizedDocument && normalizedDocument !== lead.document) {
      updates.document = normalizedDocument;
    }
    if (normalizedDocument && normalizedDocument !== lead.lid) {
      updates.lid = normalizedDocument;
    }
    updates.lastActivityAt = new Date();

    if (Object.keys(updates).length) {
      await lead.update(updates);
    }
  }

  return lead;
};

export default findOrCreateLeadByContact;
