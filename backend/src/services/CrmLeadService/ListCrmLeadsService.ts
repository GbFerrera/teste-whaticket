import { Op, WhereOptions } from "sequelize";
import CrmLead from "../../models/CrmLead";

interface Request {
  companyId: number;
  searchParam?: string;
  status?: string;
  ownerUserId?: number;
  pageNumber?: number;
  limit?: number;
  requestingUserId?: number; // **NOVO: Para controle de permissão**
  requestingUserType?: string;  // **NOVO: admin, manager, professional**
}

const ListCrmLeadsService = async ({
  companyId,
  searchParam,
  status,
  ownerUserId,
  requestingUserId,
  requestingUserType,
  pageNumber = 1,
  limit = 20
}: Request) => {
  const where: WhereOptions = {
    companyId
  };

  if (status) {
    where.status = status;
  }

  // **REGRAS DE VISIBILIDADE PARA LEADS SEM RESPONSÁVEL**
  if (!ownerUserId && requestingUserId && requestingUserType && !isNaN(requestingUserId)) {
    const userCanSeeAllLeads = requestingUserType === "admin" || requestingUserType === "administrador" || requestingUserType === "manager" || requestingUserType === "gerente";
    
    if (!userCanSeeAllLeads) {
      // **Profissional só pode ver leads com responsável ou os seus próprios**
      (where as any)[Op.or] = [
        { ownerUserId: requestingUserId }, // Leads deste usuário
        { ownerUserId: { [Op.is]: null } }   // Leads sem responsável
      ];
    }
  }

  if (ownerUserId && !isNaN(ownerUserId)) {
    where.ownerUserId = ownerUserId;
  }

  if (searchParam) {
    const like = { [Op.iLike]: `%${searchParam}%` };
    (where as any)[Op.or] = [
      { name: like },
      { email: like },
      { phone: like },
      { companyName: like }
    ];
  }

  const offset = (pageNumber - 1) * limit;

  const { rows, count } = await CrmLead.findAndCountAll({
    where,
    order: [["updatedAt", "DESC"]],
    limit,
    offset
  });

  return {
    leads: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListCrmLeadsService;
