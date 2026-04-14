import { Request, Response } from "express";
import CreateAutomationService from "../services/AutomationServices/CreateAutomationService";
import UpdateAutomationService from "../services/AutomationServices/UpdateAutomationService";
import DeleteAutomationService from "../services/AutomationServices/DeleteAutomationService";
import ListAutomationsService from "../services/AutomationServices/ListAutomationsService";
import ShowAutomationService from "../services/AutomationServices/ShowAutomationService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, triggerType, isActive, pageNumber } = req.query;

  const { automations, count, hasMore } = await ListAutomationsService({
    companyId,
    searchParam: searchParam as string,
    triggerType: triggerType as string,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    pageNumber: pageNumber as string
  });

  return res.json({ automations, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { automationId } = req.params;

  const automation = await ShowAutomationService({
    id: Number(automationId),
    companyId
  });

  return res.json(automation);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, description, triggerType, triggerConfig, isActive, actions } = req.body;

  const automation = await CreateAutomationService({
    companyId,
    name,
    description,
    triggerType,
    triggerConfig,
    isActive,
    actions
  });

  return res.status(201).json(automation);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { automationId } = req.params;
  const { name, description, triggerType, triggerConfig, isActive, actions } = req.body;

  const automation = await UpdateAutomationService({
    id: Number(automationId),
    companyId,
    name,
    description,
    triggerType,
    triggerConfig,
    isActive,
    actions
  });

  return res.json(automation);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { automationId } = req.params;

  await DeleteAutomationService({
    id: Number(automationId),
    companyId
  });

  return res.status(200).json({ message: "Automação removida com sucesso" });
};

export const toggleActive = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { automationId } = req.params;
  const { isActive } = req.body;

  const automation = await UpdateAutomationService({
    id: Number(automationId),
    companyId,
    isActive
  });

  return res.json(automation);
};
