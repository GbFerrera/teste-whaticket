import { Op } from "sequelize";
import CrmLead from "../../../models/CrmLead";
import CrmClient from "../../../models/CrmClient";
import CrmClientContact from "../../../models/CrmClientContact";
import CrmClientOwner from "../../../models/CrmClientOwner";
import Contact from "../../../models/Contact";

const sanitizeDigits = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : null;
};

const resolvePhoneCandidates = (phone?: string | null): string[] => {
  const digits = sanitizeDigits(phone);
  if (!digits) return [];
  const variants = [digits];
  if (digits.startsWith("55") && digits.length > 2) {
    variants.push(digits.slice(2));
  }
  return [...new Set(variants)];
};

const syncLeadToClient = async (lead: CrmLead): Promise<CrmClient | null> => {
  if (!lead) return null;

  let contact: Contact | null = null;
  if (lead.contactId) {
    contact = await Contact.findOne({
      where: { id: lead.contactId, companyId: lead.companyId }
    });
  }

  const normalizedDocument =
    sanitizeDigits(lead.document) || sanitizeDigits(contact?.cpfCnpj);
  const normalizedPhone =
    sanitizeDigits(lead.phone) || sanitizeDigits(contact?.number);
  const phoneCandidates = resolvePhoneCandidates(normalizedPhone || undefined);
  const email = lead.email || contact?.email || null;
  const name = lead.name || contact?.name || normalizedPhone || "Cliente";

  const orConditions: any[] = [];

  if (lead.contactId) {
    orConditions.push({ contactId: lead.contactId });
  }

  if (normalizedDocument) {
    orConditions.push({ document: normalizedDocument });
  }

  if (email) {
    orConditions.push({ email });
  }

  phoneCandidates.forEach(value => {
    orConditions.push({ phone: value });
  });

  let client: CrmClient | null = null;

  if (orConditions.length > 0) {
    client = await CrmClient.findOne({
      where: {
        companyId: lead.companyId,
        [Op.or]: orConditions
      }
    });
  }

  if (!client) {
    client = await CrmClient.create({
      companyId: lead.companyId,
      contactId: contact?.id || lead.contactId || null,
      type: "pf",
      name,
      companyName: lead.companyName,
      document: normalizedDocument || null,
      birthDate: lead.birthDate || contact?.birthday || null,
      email,
      phone: normalizedPhone || null,
      status: "active",
      clientSince: new Date(),
      ownerUserId: lead.ownerUserId,
      notes: lead.notes
    });

    // Vincular owner ao cliente através da tabela de relacionamento
    if (lead.ownerUserId) {
      await CrmClientOwner.findOrCreate({
        where: {
          clientId: client.id,
          userId: lead.ownerUserId
        },
        defaults: {
          clientId: client.id,
          userId: lead.ownerUserId
        }
      });
    }
  } else {
    const updates: Partial<CrmClient> = {};
    if (contact?.id && client.contactId !== contact.id) {
      updates.contactId = contact.id;
    } else if (!client.contactId && lead.contactId) {
      updates.contactId = lead.contactId;
    }
    if (normalizedDocument && normalizedDocument !== client.document) {
      updates.document = normalizedDocument;
    }
    if (email && email !== client.email) {
      updates.email = email;
    }
    if (normalizedPhone && normalizedPhone !== client.phone) {
      updates.phone = normalizedPhone;
    }
    if (!client.name && name) {
      updates.name = name;
    }
    if (lead.companyName && lead.companyName !== client.companyName) {
      updates.companyName = lead.companyName;
    }
    if (lead.birthDate && lead.birthDate !== client.birthDate) {
      updates.birthDate = lead.birthDate;
    }
    if (
      contact?.birthday &&
      !lead.birthDate &&
      contact.birthday !== client.birthDate
    ) {
      updates.birthDate = contact.birthday;
    }
    if (lead.ownerUserId && lead.ownerUserId !== client.ownerUserId) {
      updates.ownerUserId = lead.ownerUserId;
    }

    if (Object.keys(updates).length) {
      await client.update(updates);
    }
  }

  const effectiveContactId =
    contact?.id || lead.contactId || client.contactId || null;

  if (effectiveContactId) {
    await CrmClientContact.findOrCreate({
      where: {
        clientId: client.id,
        contactId: effectiveContactId
      },
      defaults: {
        clientId: client.id,
        contactId: effectiveContactId
      }
    });
  }

  await lead.update({
    contactId: effectiveContactId || lead.contactId || null,
    convertedClientId: client.id,
    convertedAt: new Date(),
    leadStatus: "convertido",
    document: normalizedDocument || lead.document || null,
    email: email && email !== "" ? email : lead.email,
    phone: normalizedPhone || lead.phone || null
  });

  return client;
};

export default syncLeadToClient;