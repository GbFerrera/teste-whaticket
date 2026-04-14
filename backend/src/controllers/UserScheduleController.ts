import { Request, Response } from "express";
import CreateUserScheduleService from "../services/UserScheduleServices/CreateUserScheduleService";
import ListUserSchedulesService from "../services/UserScheduleServices/ListUserSchedulesService";
import ShowUserScheduleService from "../services/UserScheduleServices/ShowUserScheduleService";
import UpdateUserScheduleService from "../services/UserScheduleServices/UpdateUserScheduleService";
import DeleteUserScheduleService from "../services/UserScheduleServices/DeleteUserScheduleService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;
  const userType = (req.user as any).userType || "";
  const { searchParam, active, pageNumber } = req.query as Record<string, string>;

  const result = await ListUserSchedulesService({
    companyId: Number(companyId),
    userId: Number(userId),
    profile,
    userType,
    searchParam,
    active,
    pageNumber
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const schedule = await ShowUserScheduleService(id, Number(companyId));

  return res.json(schedule);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: currentUserId, profile } = req.user;
  const userType = (req.user as any).userType || "";
  const { name, description, active, userId } = req.body;

  // Se não for admin, só pode criar agenda para si mesmo
  let targetUserId = userId;
  if (profile !== "admin" && userType !== "admin") {
    targetUserId = Number(currentUserId);
  }

  const schedule = await CreateUserScheduleService({
    name,
    description,
    active,
    userId: targetUserId,
    companyId: Number(companyId)
  });

  return res.status(201).json(schedule);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { name, description, active } = req.body;

  const schedule = await UpdateUserScheduleService({
    id,
    name,
    description,
    active,
    companyId: Number(companyId)
  });

  return res.json(schedule);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteUserScheduleService(id, Number(companyId));

  return res.status(204).send();
};

export const linkGoogleIntegration = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id: scheduleId } = req.params;
  const { userGoogleCalendarIntegrationId } = req.body;

  try {
    // Verificar se a integração pertence ao usuário logado
    const UserGoogleCalendarIntegration = require("../models/UserGoogleCalendarIntegration").default;
    const UserSchedule = require("../models/UserSchedule").default;
    
    const integration = await UserGoogleCalendarIntegration.findOne({
      where: { 
        id: userGoogleCalendarIntegrationId,
        userId: userId
      }
    });

    if (!integration) {
      return res.status(404).json({ error: "Integração não encontrada ou não pertence ao usuário" });
    }

    // Verificar se a agenda pertence ao usuário ou se é admin
    const schedule = await UserSchedule.findOne({
      where: { id: scheduleId, companyId: companyId }
    });

    if (!schedule) {
      return res.status(404).json({ error: "Agenda não encontrada" });
    }

    // Vincular a integração à agenda
    await schedule.update({ userGoogleCalendarIntegrationId });

    return res.json({ 
      message: "Agenda vinculada ao Google Calendar com sucesso",
      schedule: schedule
    });
  } catch (error) {
    console.error("Erro ao vincular integração Google Calendar:", error);
    return res.status(500).json({ error: "Erro ao vincular integração" });
  }
};
