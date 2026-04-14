import CrmLead from "../../../models/CrmLead";
import CrmClient from "../../../models/CrmClient";
import logger from "../../../utils/logger";

interface Params {
  lead: CrmLead;
  companyId: number;
}

const normalizeDocument = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : null;
};

const syncLeadToClient = async ({
  lead,
  companyId
}: Params): Promise<void> => {
  if (!lead.convertedClientId) {
    // Lead não foi convertido para cliente ainda
    return;
  }

  const client = await CrmClient.findOne({
    where: {
      id: lead.convertedClientId,
      companyId
    }
  });

  if (!client) {
    logger.warn(`Client ${lead.convertedClientId} not found for Lead ${lead.id}`);
    return;
  }

  const updates: Partial<CrmClient> = {};

  // Sincroniza campos relevantes do Lead para o Client
  if (lead.email && lead.email !== client.email) {
    updates.email = lead.email;
  }

  if (lead.phone && lead.phone !== client.phone) {
    updates.phone = lead.phone;
  }

  if (lead.name && lead.name !== client.name) {
    updates.name = lead.name;
  }

  if (lead.companyName && lead.companyName !== client.companyName) {
    updates.companyName = lead.companyName;
  }

  const normalizedDocument = normalizeDocument(lead.document);
  if (normalizedDocument && normalizedDocument !== client.document) {
    updates.document = normalizedDocument;
  }

  // Se há atualizações, aplica ao cliente
  if (Object.keys(updates).length > 0) {
    logger.info(`Syncing Lead ${lead.id} changes to Client ${client.id}:`, updates);
    await client.update(updates);
  }
};

export default syncLeadToClient;
