import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import ContactTag from "../../models/ContactTag";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";
import CrmLead from "../../models/CrmLead";
import CrmClientContact from "../../models/CrmClientContact";
import AppError from "../../errors/AppError";
import sequelize from "../../database";

const DeleteContactService = async (id: string): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  // Iniciar transação para exclusão em cascata
  const transaction = await sequelize.transaction();

  try {
    // 1. Apagar mensagens dos tickets do contato
    const tickets = await Ticket.findAll({
      where: { contactId: contact.id },
      transaction
    });

    for (const ticket of tickets) {
      await Message.destroy({
        where: { ticketId: ticket.id },
        transaction
      });
    }

    // 2. Apagar tickets do contato
    await Ticket.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 3. Apagar tags do contato
    await ContactTag.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 4. Apagar campos customizados do contato
    await ContactCustomField.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 5. Apagar wallets do contato
    await ContactWallet.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 6. Apagar leads vinculados ao contato
    await CrmLead.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 7. Apagar vínculos com clientes
    await CrmClientContact.destroy({
      where: { contactId: contact.id },
      transaction
    });

    // 8. Finalmente apagar o contato
    await contact.destroy({ transaction });

    // Commit da transação
    await transaction.commit();

  } catch (error) {
    // Rollback em caso de erro
    await transaction.rollback();
    console.error("Error deleting contact:", error);
    throw new AppError("ERR_DELETE_CONTACT", 500);
  }
};

export default DeleteContactService;
