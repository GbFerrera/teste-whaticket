import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import CrmClientOwner from "../../models/CrmClientOwner";

interface Request {
  id: number | string;
  companyId: number;
  type?: "pf" | "pj";
  name?: string;
  companyName?: string;
  document?: string;
  birthDate?: Date;
  email?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status?: "active" | "inactive" | "blocked";
  clientSince?: Date;
  ownerUserId?: number;
  ownerUserIds?: number[];
  notes?: string;
}

const UpdateCrmClientService = async ({
  id,
  companyId,
  ...data
}: Request): Promise<CrmClient> => {
  const client = await CrmClient.findOne({
    where: { id, companyId }
  });

  if (!client) {
    throw new AppError("Cliente não encontrado.", 404);
  }

  const schema = Yup.object().shape({
    type: Yup.string().oneOf(["pf", "pj"]),
    name: Yup.string().min(2),
    email: Yup.string().email().nullable(),
    status: Yup.string().oneOf(["active", "inactive", "blocked"]).nullable(),
    state: Yup.string().transform((value) => value === "" ? null : value).length(2).nullable()
  });

  await schema.validate(data);

  // Verificação de duplicatas por documento, email ou telefone
  const duplicateConditions: any[] = [];

  if (data.document) {
    duplicateConditions.push({ document: data.document });
  }

  if (data.email) {
    duplicateConditions.push({ email: data.email });
  }

  if (data.phone) {
    const sanitizedPhone = data.phone.replace(/\D/g, "");
    if (sanitizedPhone) {
      duplicateConditions.push({ phone: sanitizedPhone });
    }
  }

  if (duplicateConditions.length > 0) {
    const existingClient = await CrmClient.findOne({
      where: {
        companyId,
        id: { [Op.ne]: id },
        [Op.or]: duplicateConditions
      }
    });

    if (existingClient) {
      let duplicateField = "";
      if (data.document && existingClient.document === data.document) {
        duplicateField = "documento";
      } else if (data.email && existingClient.email === data.email) {
        duplicateField = "email";
      } else if (data.phone) {
        const sanitizedPhone = data.phone.replace(/\D/g, "");
        if (existingClient.phone === sanitizedPhone) {
          duplicateField = "telefone";
        }
      }
      throw new AppError(`Outro cliente já usa este ${duplicateField} nesta empresa.`);
    }
  }

  // Sanitiza o telefone antes de atualizar
  const updateData = {
    ...data,
    phone: data.phone ? data.phone.replace(/\D/g, "") : data.phone
  };

  await client.update(updateData);

  // Atualizar relacionamentos com múltiplos responsáveis
  const ownerIds = data.ownerUserIds || (data.ownerUserId !== undefined ? [data.ownerUserId] : null);
  if (ownerIds !== null) {
    // Remover responsáveis antigos
    await CrmClientOwner.destroy({
      where: { clientId: client.id }
    });
    
    // Adicionar novos responsáveis
    if (ownerIds.length > 0) {
      await Promise.all(
        ownerIds.map(userId =>
          CrmClientOwner.create({
            clientId: client.id,
            userId
          })
        )
      );
    }
  }

  return client;
};

export default UpdateCrmClientService;
