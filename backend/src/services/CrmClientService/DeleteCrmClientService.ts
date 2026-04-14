import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import CrmLead from "../../models/CrmLead";
import Contact from "../../models/Contact";
import CrmClientContact from "../../models/CrmClientContact";
import sequelize from "../../database";

interface Request {
  id: number | string;
  companyId: number;
}

const DeleteCrmClientService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const client = await CrmClient.findOne({
    where: { id, companyId }
  });

  if (!client) {
    throw new AppError("Cliente não encontrado.", 404);
  }

  const transaction = await sequelize.transaction();

  try {
    const pivotContacts = await CrmClientContact.findAll({
      where: { clientId: client.id },
      transaction
    });

    const contactIds = Array.from(
      new Set(
        [
          client.contactId,
          ...pivotContacts.map(pivot => pivot.contactId)
        ].filter(Boolean) as number[]
      )
    );

    if (pivotContacts.length) {
      await CrmClientContact.destroy({
        where: { clientId: client.id },
        transaction
      });
    }

    await CrmLead.destroy({
      where: {
        companyId,
        [Op.or]: [
          { convertedClientId: client.id },
          ...(contactIds.length ? [{ contactId: { [Op.in]: contactIds } }] : [])
        ]
      },
      transaction
    });

    if (contactIds.length) {
      await Contact.destroy({
        where: {
          companyId,
          id: { [Op.in]: contactIds }
        },
        transaction
      });
    }

    await client.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default DeleteCrmClientService;
