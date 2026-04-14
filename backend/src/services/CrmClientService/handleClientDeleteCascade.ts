import CrmClient from "../../models/CrmClient";
import Contact from "../../models/Contact";
import CrmLead from "../../models/CrmLead";
import logger from "../../utils/logger";

interface Params {
  client: CrmClient;
  companyId: number;
}

const handleClientDeleteCascade = async ({
  client,
  companyId
}: Params): Promise<void> => {
  // Se o cliente tem um contato associado, apaga o contato e o lead
  if (client.contactId) {
    const contact = await Contact.findOne({
      where: {
        id: client.contactId,
        companyId
      }
    });

    if (contact) {
      // Busca e apaga o lead associado a este contato
      const lead = await CrmLead.findOne({
        where: {
          companyId,
          contactId: contact.id
        }
      });

      if (lead) {
        logger.info(`Cascade deleting Lead ${lead.id} due to Client ${client.id} deletion`);
        await lead.destroy();
      }

      // Apaga o contato
      logger.info(`Cascade deleting Contact ${contact.id} due to Client ${client.id} deletion`);
      await contact.destroy();
    }
  }

  // Se não tem contato direto, mas tem leads, apaga apenas os leads
  const leads = await CrmLead.findAll({
    where: {
      companyId,
      convertedClientId: client.id
    }
  });

  for (const lead of leads) {
    logger.info(`Cascade deleting Lead ${lead.id} due to Client ${client.id} deletion`);
    await lead.destroy();
  }
};

export default handleClientDeleteCascade;
