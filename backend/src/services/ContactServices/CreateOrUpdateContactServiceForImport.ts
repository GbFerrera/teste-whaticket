import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "./CreateOrUpdateContactService";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  commandBot?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  companyId: number;
}

const CreateOrUpdateContactServiceForImport = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  commandBot = "",
  extraInfo = [], companyId
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number , companyId } });

  if (contact) {
    if (contact.companyId === null)
      await contact.update({ name ,profilePicUrl, companyId })
    else
      await contact.update({ name , profilePicUrl });

      io.of(String(companyId))
  .emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });
  } else {
    contact = await CreateOrUpdateContactService({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      companyId,
      channel: "whatsapp",
      extraInfo: extraInfo as any,
      remoteJid: isGroup ? `${number}@g.us` : `${number}@s.whatsapp.net`
    });

    io.of(String(companyId))
  .emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactServiceForImport;
