import { Op, WhereOptions, literal } from "sequelize";
import CrmClient from "../../models/CrmClient";
import CrmClientOwner from "../../models/CrmClientOwner";
import User from "../../models/User";

interface Request {
  companyId: number;
  searchParam?: string;
  status?: "active" | "inactive" | "blocked";
  type?: "pf" | "pj";
  ownerUserId?: number;
  pageNumber?: number;
  limit?: number;
  requestingUserId?: number; // **NOVO: Para controle de permissão**
  requestingUserType?: string;  // **NOVO: admin, manager, professional**
}

const ListCrmClientsService = async ({
  companyId,
  searchParam,
  status,
  type,
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

  if (type) {
    where.type = type;
  }

  // Filtro por ownerUserId agora usa a tabela de relacionamento
  let include: any[] = [];
  
  if (ownerUserId && !isNaN(ownerUserId)) {
    include.push({
      model: User,
      as: "owners",
      attributes: [],
      through: {
        where: { userId: ownerUserId },
        attributes: []
      },
      required: true
    });
  }

  // **REGRAS DE VISIBILIDADE PARA CLIENTES**
  if (!ownerUserId && requestingUserId && requestingUserType) {
    const userCanSeeAllClients = requestingUserType === "admin" || requestingUserType === "administrador" || requestingUserType === "manager" || requestingUserType === "gerente";
    
    console.log("[CRM-CLIENTS-SERVICE] 🔐 Verificando permissões:", {
      requestingUserType,
      userCanSeeAllClients,
      ownerUserId,
      requestingUserId
    });
    
    if (userCanSeeAllClients) {
      console.log("[CRM-CLIENTS-SERVICE] ✅ Admin/Gerente - VENDO TODOS OS CLIENTES SEM FILTRO NECESSÁRIO");
      // **Admin/Gerente vê TODOS os clientes - sem exceção, sem filtro**
      // Não aplica nenhum filtro - mostra tudo
    } else if (requestingUserId && !isNaN(requestingUserId)) {
      console.log("[CRM-CLIENTS-SERVICE] ⚠️ Aplicando filtro de profissional - apenas clientes vinculados");
      // **Profissional só pode ver clientes onde é responsável (diretamente ou por relacionamento)**
      (where as any)[Op.or] = [
        { ownerUserId: requestingUserId }, // Clientes com owner direto (convertidos de leads)
        {
          [Op.and]: [
            // Clientes com owner por relacionamento através da tabela CrmClientOwner
            literal(`EXISTS (
              SELECT 1 FROM "crm_client_owners" 
              WHERE "crm_client_owners"."client_id" = "CrmClient"."id" 
              AND "crm_client_owners"."user_id" = ${requestingUserId}
            )`)
          ]
        }
      ];
    }
  }

  if (searchParam) {
    const like = { [Op.iLike]: `%${searchParam}%` };
    (where as any)[Op.or] = [
      { name: like },
      { companyName: like },
      { email: like },
      { phone: like },
      { document: like },
      { city: like }
    ];
  }

  const offset = (pageNumber - 1) * limit;

  const { rows, count } = await CrmClient.findAndCountAll({
    where,
    include: include.length > 0 ? include : undefined,
    order: [["updatedAt", "DESC"]],
    limit,
    offset,
    distinct: true
  });

  console.log("[CRM-CLIENTS-SERVICE] 📋 Resultado da consulta:", {
    totalClientes: count,
    clientesRetornados: rows.length,
    hasMore: count > offset + rows.length
  });

  return {
    clients: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListCrmClientsService;
