import { Request, Response } from "express";
import CreateScheduledDispatcherService from "../services/ScheduledDispatcherService/CreateScheduledDispatcherService";
import ListScheduledDispatchersService from "../services/ScheduledDispatcherService/ListScheduledDispatchersService";
import ShowScheduledDispatcherService from "../services/ScheduledDispatcherService/ShowScheduledDispatcherService";
import UpdateScheduledDispatcherService from "../services/ScheduledDispatcherService/UpdateScheduledDispatcherService";
import DeleteScheduledDispatcherService from "../services/ScheduledDispatcherService/DeleteScheduledDispatcherService";
import ToggleScheduledDispatcherService from "../services/ScheduledDispatcherService/ToggleScheduledDispatcherService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const dispatchers = await ListScheduledDispatchersService({ companyId });
  return res.json(dispatchers);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const dispatcher = await ShowScheduledDispatcherService({
    id: Number(id),
    companyId
  });

  return res.json(dispatcher);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const payload = {
    companyId,
    title: req.body.title,
    messageTemplate: req.body.messageTemplate,
    eventType: req.body.eventType,
    whatsappId: req.body.whatsappId ?? null,
    startTime: req.body.startTime,
    sendIntervalSeconds: req.body.sendIntervalSeconds,
    daysBeforeDue: req.body.daysBeforeDue,
    daysAfterDue: req.body.daysAfterDue,
    active: req.body.active
  };

  const dispatcher = await CreateScheduledDispatcherService(payload);

  return res.status(201).json(dispatcher);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const dispatcher = await UpdateScheduledDispatcherService({
    dispatcherId: Number(id),
    companyId,
    title: req.body.title,
    messageTemplate: req.body.messageTemplate,
    eventType: req.body.eventType,
    whatsappId: req.body.whatsappId,
    startTime: req.body.startTime,
    sendIntervalSeconds: req.body.sendIntervalSeconds,
    daysBeforeDue: req.body.daysBeforeDue,
    daysAfterDue: req.body.daysAfterDue,
    active: req.body.active
  });

  return res.json(dispatcher);
};

export const toggle = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { active } = req.body;

  const dispatcher = await ToggleScheduledDispatcherService({
    dispatcherId: Number(id),
    companyId,
    active
  });

  return res.json(dispatcher);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteScheduledDispatcherService({
    dispatcherId: Number(id),
    companyId
  });

  return res.status(204).send();
};
