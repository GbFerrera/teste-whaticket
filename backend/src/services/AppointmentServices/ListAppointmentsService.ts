import { Op } from "sequelize";
import Appointment from "../../models/Appointment";
import UserSchedule from "../../models/UserSchedule";
import User from "../../models/User";
import Servico from "../../models/Servico";
import CrmClient from "../../models/CrmClient";
import Contact from "../../models/Contact";

interface ListAppointmentsQuery {
  companyId: number;
  userId?: number;
  profile?: string;
  userType?: string;
  scheduleId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: string;
}

interface ListAppointmentsResponse {
  appointments: Appointment[];
  count: number;
  hasMore: boolean;
}

const ListAppointmentsService = async ({
  companyId,
  userId,
  profile,
  userType,
  scheduleId,
  status,
  startDate,
  endDate,
  pageNumber = "1"
}: ListAppointmentsQuery): Promise<ListAppointmentsResponse> => {
  const where: any = { companyId };

  const normalizedUserType = (userType || "").toLowerCase();
  const isRestrictedUserType = ["attendant", "professional"].includes(normalizedUserType);
  const canViewAllSchedules = profile === "admin" || normalizedUserType === "manager";
  const shouldRestrictByUser = !canViewAllSchedules;

  // Se não for admin OU for atendente/profissional, filtra apenas compromissos das agendas do próprio usuário
  if (shouldRestrictByUser && userId) {
    const userSchedules = await UserSchedule.findAll({
      where: { userId, companyId },
      attributes: ["id"]
    });
    const scheduleIds = userSchedules.map(s => s.id);

    if (!scheduleIds.length) {
      where.scheduleId = { [Op.in]: [] };
    } else
    if (scheduleId) {
      // Se especificou uma agenda, verifica se é do usuário
      if (scheduleIds.includes(Number(scheduleId))) {
        where.scheduleId = scheduleId;
      } else {
        // Não tem permissão, retorna vazio
        where.scheduleId = { [Op.in]: [] };
      }
    } else {
      where.scheduleId = { [Op.in]: scheduleIds };
    }
  } else if (scheduleId) {
    // Admin pode ver qualquer agenda
    where.scheduleId = scheduleId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.startDatetime = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    where.startDatetime = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    where.startDatetime = {
      [Op.lte]: new Date(endDate)
    };
  }

  const limit = 50;
  const offset = limit * (Number(pageNumber) - 1);

  const { rows, count } = await Appointment.findAndCountAll({
    where,
    include: [
      {
        model: UserSchedule,
        as: "schedule",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"]
          }
        ]
      },
      {
        model: Servico,
        as: "service",
        attributes: ["id", "nome", "valorOriginal", "valorComDesconto"]
      },
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"]
      }
    ],
    limit,
    offset,
    order: [["startDatetime", "ASC"]]
  });

  return {
    appointments: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListAppointmentsService;
