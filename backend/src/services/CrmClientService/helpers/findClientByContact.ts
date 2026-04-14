import CrmClient from "../../../models/CrmClient";
import CrmClientContact from "../../../models/CrmClientContact";

const findClientByContact = async (
  contactId: number,
  companyId: number
): Promise<CrmClient | null> => {
  if (!contactId) {
    return null;
  }

  let client = await CrmClient.findOne({
    where: {
      companyId,
      contactId
    }
  });

  if (client) {
    return client;
  }

  const pivot = await CrmClientContact.findOne({
    where: { contactId },
    order: [["created_at", "DESC"]]
  });

  if (pivot) {
    client = await CrmClient.findOne({
      where: {
        companyId,
        id: pivot.clientId
      }
    });
  }

  return client;
};

export default findClientByContact;
