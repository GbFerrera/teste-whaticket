import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import CrmClient from "../../models/CrmClient";
import CrmClientContact from "../../models/CrmClientContact";

const ShowContactService = async (
  id: string | number,
  companyId: number
): Promise<Contact> => {
  const contact = await Contact.findByPk(id, {
    include: [
      "extraInfo", 
      "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
      },
      {
        model: CrmClient,
        as: "crmClients",
        through: { attributes: [] },
        attributes: ["id", "name", "document", "email", "phone", "status"]
      }
    ]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  if (contact.companyId !== companyId) {
    throw new AppError("Não é possível consultar registro de outra empresa");
  }

  return contact;
};

export default ShowContactService;
