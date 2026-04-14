import CrmLead from "../../../models/CrmLead";
import CrmClient from "../../../models/CrmClient";
import logger from "../../../utils/logger";

interface Params {
  client: CrmClient;
  companyId: number;
}

const normalizeDocument = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : null;
};

const syncClientToLead = async ({
  client,
  companyId
}: Params): Promise<void> => {
  // Busca todos os leads associados a este cliente
  const leads = await CrmLead.findAll({
    where: {
      companyId,
      convertedClientId: client.id
    }
  });

  if (leads.length === 0) {
    logger.warn(`No leads found for Client ${client.id}`);
    return;
  }

  // Para cada lead, verifica se precisa sincronizar
  for (const lead of leads) {
    const updates: Partial<CrmLead> = {};
    const normalizedDocument = normalizeDocument(client.document);

    if (client.email && client.email !== lead.email) {
      updates.email = client.email;
    }

    if (client.phone && client.phone !== lead.phone) {
      updates.phone = client.phone;
    }

    if (client.name && client.name !== lead.name) {
      updates.name = client.name;
    }

    if (client.companyName && client.companyName !== lead.companyName) {
      updates.companyName = client.companyName;
    }

    if (normalizedDocument && normalizedDocument !== lead.document) {
      updates.document = normalizedDocument;
    }

    // Se há atualizações, aplica ao lead
    if (Object.keys(updates).length > 0) {
      logger.info(`Syncing Client ${client.id} changes to Lead ${lead.id}:`, updates);
      await lead.update(updates);
    }
  }
};

export default syncClientToLead;
