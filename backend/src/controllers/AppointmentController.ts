import { Request, Response } from "express";
import CreateAppointmentService from "../services/AppointmentServices/CreateAppointmentService";
import ListAppointmentsService from "../services/AppointmentServices/ListAppointmentsService";
import ShowAppointmentService from "../services/AppointmentServices/ShowAppointmentService";
import UpdateAppointmentService from "../services/AppointmentServices/UpdateAppointmentService";
import DeleteAppointmentService from "../services/AppointmentServices/DeleteAppointmentService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;
  const userType = (req.user as any).userType;
  const { scheduleId, status, startDate, endDate, pageNumber } = req.query as Record<string, string>;

  const result = await ListAppointmentsService({
    companyId: Number(companyId),
    userId: Number(userId),
    profile,
    userType,
    scheduleId,
    status,
    startDate,
    endDate,
    pageNumber
  });

  return res.json(result);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const appointment = await ShowAppointmentService(id, Number(companyId));

  return res.json(appointment);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    title,
    description,
    startDatetime,
    durationMinutes,
    status,
    scheduleId,
    serviceId,
    clientId,
    contactId
  } = req.body;

  console.log("Creating appointment:", {
    title,
    startDatetime,
    durationMinutes,
    scheduleId,
    companyId
  });

  try {
    const appointment = await CreateAppointmentService({
      title,
      description,
      startDatetime,
      durationMinutes: Number(durationMinutes),
      status,
      scheduleId: Number(scheduleId),
      serviceId: serviceId ? Number(serviceId) : undefined,
      clientId: clientId ? Number(clientId) : undefined,
      contactId: contactId ? Number(contactId) : undefined,
      companyId: Number(companyId)
    });

    return res.status(201).json(appointment);
  } catch (err: any) {
    console.error("Error creating appointment:", err);
    throw err;
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const {
    title,
    description,
    startDatetime,
    durationMinutes,
    status,
    serviceId,
    clientId,
    contactId
  } = req.body;

  const appointment = await UpdateAppointmentService({
    id,
    title,
    description,
    startDatetime,
    durationMinutes,
    status,
    serviceId,
    clientId,
    contactId,
    companyId: Number(companyId)
  });

  return res.json(appointment);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteAppointmentService(id, Number(companyId));

  return res.status(204).send();
};
