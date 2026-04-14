import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";
import User from "../../models/User";

interface Request {
  id: number | string;
  companyId: number;
}

const ShowCrmClientService = async ({
  id,
  companyId
}: Request): Promise<CrmClient> => {
  // Validar se id é um número válido
  const clientId = typeof id === 'string' ? Number(id) : id;
  
  if (!clientId || isNaN(clientId)) {
    throw new AppError("ID inválido.", 400);
  }

  const client = await CrmClient.findOne({
    where: { id: clientId, companyId },
    include: [
      {
        model: User,
        as: "owners",
        attributes: ["id", "name", "email"],
        through: { attributes: [] }
      }
    ]
  });

  if (!client) {
    throw new AppError("Cliente não encontrado.", 404);
  }

  return client;
};

export default ShowCrmClientService;
