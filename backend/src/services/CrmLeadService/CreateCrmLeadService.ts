import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import syncLeadToClient from "./helpers/syncLeadToClient";

interface Request {
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  document?: string;
  companyName?: string;
  position?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  status?: string;
  leadStatus?: string;
  score?: number;
  temperature?: string;
  ownerUserId?: number;
  notes?: string;
  lastActivityAt?: Date;
  contactId?: number;
  primaryTicketId?: number;
  // **METADADOS: Enviados via adMetadata para processar**
  adMetadata?: {
    platform: string;
    adTitle: string;
    adDescription: string;
    trackingUrl: string;
    trackingId: string;
  };
  // **USUÁRIO CRIADOR: Para vincular automaticamente como responsável**
  createdByUserId?: number;
}

const normalizeNumber = (phone?: string): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }

  return digits || null;
};

const resolveContactId = async (
  companyId: number,
  providedContactId?: number,
  phone?: string,
  name?: string,
  email?: string
): Promise<number | undefined> => {
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
    return undefined;
  }

  // **VERIFICA SE CONTATO JÁ EXISTE POR TELEFONE**
  let contact =
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

  // **SE NÃO EXISTIR, BUSCA POR EMAIL**
  if (!contact && email) {
    contact = await Contact.findOne({
      where: {
        companyId,
        email
      }
    });
  }

  // **SE NÃO EXISTIR, BUSCA POR NOME + TELEFONE**
  if (!contact && name) {
    contact = await Contact.findOne({
      where: {
        companyId,
        name,
        number: normalizedPhone
      }
    });
  }

  // **SE AINDA NÃO EXISTIR, CRIA NOVO CONTATO**
  if (!contact) {
    console.log("📝 Criando novo contato para o lead:", { name, phone: normalizedPhone, email });
    
    contact = await Contact.create({
      name: name || "Contato Lead",
      number: normalizedPhone,
      email: email || null,
      companyId,
      active: true,
      disableBot: false
    });
    
    console.log("✅ Contato criado com ID:", contact.id);
  }

  return contact.id;
};

const resolvePrimaryTicketId = async (
  companyId: number,
  primaryTicketId?: number
): Promise<number | undefined> => {
  if (!primaryTicketId) return undefined;

  const ticket = await Ticket.findOne({
    where: { id: primaryTicketId, companyId }
  });

  if (!ticket) {
    throw new AppError("Ticket informado não encontrado para esta empresa.");
  }

  return ticket.id;
};

const CreateCrmLeadService = async (data: Request): Promise<CrmLead> => {
  const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    name: Yup.string().required().min(2),
    email: Yup.string().email().nullable(),
    phone: Yup.string().nullable(),
    status: Yup.string()
      .oneOf(["new", "contacted", "qualified", "unqualified", "converted", "lost"])
      .default("new"),
    leadStatus: Yup.string().default("novo").nullable(),
    score: Yup.number().min(0).default(0),
    temperature: Yup.string().oneOf([null, "frio", "morno", "quente"]).nullable(),
    contactId: Yup.number().nullable(),
    primaryTicketId: Yup.number().nullable()
  });

  await schema.validate(data);

  if (data.email) {
    const existingLead = await CrmLead.findOne({
      where: {
        companyId: data.companyId,
        email: data.email
      }
    });

    if (existingLead) {
      throw new AppError("Lead já cadastrado com esse e-mail para esta empresa.");
    }
  }

  const contactId = await resolveContactId(
    data.companyId,
    data.contactId,
    data.phone,
    data.name,
    data.email
  );

  const primaryTicketId = await resolvePrimaryTicketId(
    data.companyId,
    data.primaryTicketId
  );

  // **ENRIQUECIMENTO: Usa campos existentes com metadados de anúncios**
  let enrichedData = { ...data };
  let score = data.score || 0;
  let notes = data.notes || "";

  // **GARANTE CAMPOS SOURCE/CAMPAIGN/MEDIUM SEJAM PREENCHIDOS**
  if (!enrichedData.source || enrichedData.source === '') {
    enrichedData.source = data.adMetadata?.platform || 'Facebook/Instagram Ads';
  }
  
  if (!enrichedData.campaign || enrichedData.campaign === '') {
    enrichedData.campaign = data.adMetadata?.adTitle || 'Anúncio Patrocinado';
  }
  
  if (!enrichedData.medium || enrichedData.medium === '') {
    enrichedData.medium = 'paid_social';
  }

  if (data.adMetadata) {
    // Aumenta score baseado na qualidade do anúncio
    if (data.adMetadata.adTitle && data.adMetadata.adDescription) {
      score = Math.min(score + 20, 100);
    }
    
    // Força sobreescrever com dados do anúncio se existirem
    if (data.adMetadata.platform) {
      enrichedData.source = data.adMetadata.platform;
    }
    if (data.adMetadata.adTitle) {
      enrichedData.campaign = data.adMetadata.adTitle;
    }
    
    // Adiciona insights aos notes (campo existente)
    const insights = `\n\n📊 Insights do Anúncio:\n` +
                   `• Plataforma: ${data.adMetadata.platform}\n` +
                   `• Título: ${data.adMetadata.adTitle}\n` +
                   `• Descrição: ${data.adMetadata.adDescription}\n` +
                   `• Tracking: ${data.adMetadata.trackingUrl}\n` +
                   `• Tracking ID: ${data.adMetadata.trackingId}`;
    notes = notes + insights;
  }

  // **VINCULAR USUÁRIO CRIADOR COMO RESPONSÁVEL**
  const ownerUserId = data.ownerUserId || data.createdByUserId;
  
  const lead = await CrmLead.create({
    ...enrichedData,
    contactId,
    primaryTicketId,
    leadStatus: data.leadStatus || "novo",
    score,
    notes,
    lastActivityAt: data.lastActivityAt || new Date(),
    ownerUserId // **VINCULAÇÃO AUTOMÁTICA**
  });

  console.log("✅ Lead criado com sucesso:", {
    id: lead.id,
    name: lead.name,
    ownerUserId: lead.ownerUserId,
    contactId: lead.contactId
  });

  if (lead.status === "converted" || lead.leadStatus === "convertido") {
    await syncLeadToClient(lead);
  }

  return lead;
};

export default CreateCrmLeadService;
