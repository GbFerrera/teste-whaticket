import Contact from "../../models/Contact";
import CrmLead from "../../models/CrmLead";
import CrmClient from "../../models/CrmClient";
import logger from "../../utils/logger";
import { Op } from "sequelize";

interface Params {
  contact: Contact;
  companyId: number;
}

const relinkContactToExistingRecords = async ({
  contact,
  companyId
}: Params): Promise<void> => {
  // Se não tem número nem lid, não pode re-linkar
  if (!contact.number && !contact.lid) {
    return;
  }

  // Busca por leads e clientes que possam estar associados a este contato
  // baseado no número ou lid
  const orConditions: any[] = [];

  if (contact.number) {
    orConditions.push({ phone: contact.number });
    orConditions.push({ phone: contact.number.replace(/^55/, "") });
  }

  if (contact.lid) {
    orConditions.push({ lid: contact.lid });
  }

  if (orConditions.length === 0) {
    return;
  }

  // Busca leads sem contato associado
  const orphanLeads = await CrmLead.findAll({
    where: {
      companyId,
      [Op.or]: orConditions,
      contactId: null
    }
  });

  // Busca clientes sem contato associado
  const orphanClients = await CrmClient.findAll({
    where: {
      companyId,
      [Op.or]: orConditions,
      contactId: null
    }
  });

  // Re-linka leads
  for (const lead of orphanLeads) {
    logger.info(`Relinking Lead ${lead.id} to Contact ${contact.id}`);
    await lead.update({ contactId: contact.id });
  }

  // Re-linka clientes
  for (const client of orphanClients) {
    logger.info(`Relinking Client ${client.id} to Contact ${contact.id}`);
    await client.update({ contactId: contact.id });
  }

  // Se encontrou algum registro, também marca o contato como não sendo LID
  if (orphanLeads.length > 0 || orphanClients.length > 0) {
    if (contact.isLid) {
      logger.info(`Marking Contact ${contact.id} as not LID after relinking`);
      await contact.update({ isLid: false });
    }
  }
};

export default relinkContactToExistingRecords;
