// @ts-nocheck
import AppError from "../../errors/AppError";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import logger from "../../utils/logger";
import ContactWallet from "../../models/ContactWallet";
import CreateOrUpdateContactService from "./CreateOrUpdateContactService";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Wallet {
  walletId: number | string;
  contactId: number | string;
  companyId: number | string;
}
interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  companyId: number;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  wallets?: null | number[] | string[];
  cpfCnpj?: string;
  address?: string;
  info?: string;
  birthday?: Date | string;
  anniversary?: Date | string;
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = [],
  remoteJid = "",
  wallets,
  cpfCnpj,
  address,
  info,
  birthday,
  anniversary
}: Request): Promise<Contact> => {

  const numberExists = await Contact.findOne({
    where: { number, companyId }
  });
  if (numberExists) {

    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const settings = await CompaniesSettings.findOne({
    where: {
      companyId
    }
  })

  const { acceptAudioMessageContact } = settings;

  const contact = await CreateOrUpdateContactService({
    name,
    number,
    email,
    isGroup: false,
    companyId,
    extraInfo,
    remoteJid,
    acceptAudioMessage: acceptAudioMessage ?? (acceptAudioMessageContact === "enabled"),
    active,
    cpfCnpj,
    address,
    info,
    channel: "whatsapp",
    profilePicUrl: "",
    birthday,
    anniversary
  });

  if (wallets) {
    await ContactWallet.destroy({
      where: {
        companyId,
        contactId: contact.id
      }
    });

    const contactWallets: Wallet[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallets.forEach((wallet: any) => {
      contactWallets.push({
        walletId: !wallet.id ? wallet : wallet.id,
        contactId: contact.id,
        companyId
      });
    });

    await ContactWallet.bulkCreate(contactWallets);
  }
  return contact;

};

export default CreateContactService;
