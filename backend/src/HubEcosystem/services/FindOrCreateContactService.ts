import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import CreateOrUpdateContactService from "../../services/ContactServices/CreateOrUpdateContactService";

interface HubContact {
  name: string;
  firstName: string;
  lastName: string;
  picture: string;
  from: string;
  connection: Whatsapp;
}

const FindOrCreateContactService = async (
  contact: HubContact
): Promise<Contact> => {
  const { name, picture, from, connection, firstName, lastName } = contact;

  const existingContact = await Contact.findOne({
    where: {
      number: from,
      companyId: connection.companyId
    }
  });

  if (existingContact) {
    return existingContact;
  }

  const normalizedName = name || firstName || lastName || from;

  return CreateOrUpdateContactService({
    name: normalizedName,
    number: from,
    profilePicUrl: picture,
    isGroup: false,
    channel: connection.channel,
    companyId: connection.companyId,
    remoteJid: `${from}@s.whatsapp.net`,
    whatsappId: connection.id
  });
};

export default FindOrCreateContactService;
