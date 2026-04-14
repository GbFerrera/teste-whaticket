import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import CrmClientOwner from "../../models/CrmClientOwner";
import Contact from "../../models/Contact";

export interface CreateCrmClientRequest {
  companyId: number;
  type?: "pf" | "pj";
  name: string;
  companyName?: string;
  document?: string;
  birthDate?: Date;
  email?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status?: "active" | "inactive" | "blocked";
  clientSince?: Date;
  ownerUserId?: number;
  ownerUserIds?: number[];
  notes?: string;
  // **USUÁRIO CRIADOR: Para vincular automaticamente como responsável**
  createdByUserId?: number;
}

const normalizePhone = (phone?: string): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }

  return digits || null;
};

const resolveOrCreateContact = async (
  companyId: number,
  name: string,
  phone?: string,
  email?: string
): Promise<number | undefined> => {
  const normalizedPhone = normalizePhone(phone);

  // **VERIFICA SE CONTATO JÁ EXISTE POR TELEFONE**
  let contact;
  if (normalizedPhone) {
    contact =
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
  }

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
  if (!contact && name && normalizedPhone) {
    contact = await Contact.findOne({
      where: {
        companyId,
        name,
        number: normalizedPhone
      }
    });
  }

  // **SE AINDA NÃO EXISTIR, CRIA NOVO CONTATO**
  if (!contact && (normalizedPhone || email)) {
    console.log("📝 Criando novo contato para o cliente:", { name, phone: normalizedPhone, email });
    
    contact = await Contact.create({
      name: name || "Contato Cliente",
      number: normalizedPhone,
      email: email || null,
      companyId,
      active: true,
      disableBot: false
    });
    
    console.log("✅ Contato criado com ID:", contact.id);
  }

  return contact?.id;
};

const CreateCrmClientService = async (
  data: CreateCrmClientRequest
): Promise<CrmClient> => {
  const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    type: Yup.string().oneOf(["pf", "pj"]).default("pf"),
    name: Yup.string().required().min(2),
    email: Yup.string().email().nullable(),
    status: Yup.string()
      .oneOf(["active", "inactive", "blocked"])
      .default("active"),
    state: Yup.string().transform((value) => value === "" ? null : value).length(2).nullable()
  });

  await schema.validate(data);

  // Verificação de duplicatas por documento, email ou telefone
  const duplicateConditions: any[] = [];

  if (data.document) {
    duplicateConditions.push({ document: data.document });
  }

  if (data.email) {
    duplicateConditions.push({ email: data.email });
  }

  if (data.phone) {
    const sanitizedPhone = data.phone.replace(/\D/g, "");
    if (sanitizedPhone) {
      duplicateConditions.push({ phone: sanitizedPhone });
    }
  }

  if (duplicateConditions.length > 0) {
    const { Op } = require("sequelize");
    const existingClient = await CrmClient.findOne({
      where: {
        companyId: data.companyId,
        [Op.or]: duplicateConditions
      }
    });

    if (existingClient) {
      let duplicateField = "";
      if (data.document && existingClient.document === data.document) {
        duplicateField = "documento";
      } else if (data.email && existingClient.email === data.email) {
        duplicateField = "email";
      } else if (data.phone) {
        const sanitizedPhone = data.phone.replace(/\D/g, "");
        if (existingClient.phone === sanitizedPhone) {
          duplicateField = "telefone";
        }
      }
      throw new AppError(`Cliente já cadastrado com este ${duplicateField} nesta empresa.`);
    }
  }

  // Sanitiza o telefone antes de criar
  const clientData = {
    ...data,
    type: data.type || "pf",
    status: data.status || "active",
    phone: data.phone ? data.phone.replace(/\D/g, "") : undefined
  };

  const client = await CrmClient.create(clientData);

  // **CRIAR CONTATO AUTOMATICAMENTE**
  const contactId = await resolveOrCreateContact(
    data.companyId,
    data.name,
    data.phone,
    data.email
  );

  // **VINCULAR USUÁRIO CRIADOR COMO RESPONSÁVEL**
  const ownerUserId = data.ownerUserId || data.createdByUserId;
  const ownerIds = data.ownerUserIds || (ownerUserId ? [ownerUserId] : []);
  
  if (ownerIds && ownerIds.length > 0) {
    await Promise.all(
      ownerIds.map(userId =>
        CrmClientOwner.create({
          clientId: client.id,
          userId
        })
      )
    );
    
    // **ATUALIZAR CAMPO ownerUserId principal**
    await client.update({ ownerUserId });
  }

  // **ATUALIZAR CLIENTE COM O CONTACTID**
  if (contactId) {
    await client.update({ contactId });
  }

  console.log("✅ Cliente criado com sucesso:", {
    id: client.id,
    name: client.name,
    ownerUserId: client.ownerUserId,
    contactId: client.contactId
  });

  return client;
};

export default CreateCrmClientService;
