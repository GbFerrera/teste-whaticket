import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import AppError from "../../errors/AppError";

interface ActionData {
  actionType: string;
  actionConfig: any;
  order: number;
  delayMinutes?: number;
}

interface CreateAutomationData {
  companyId: number;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: any;
  isActive?: boolean;
  actions?: ActionData[];
}

const CreateAutomationService = async (data: CreateAutomationData): Promise<Automation> => {
  const { companyId, name, description, triggerType, triggerConfig, isActive, actions } = data;

  if (!name || !triggerType) {
    throw new AppError("ERR_AUTOMATION_REQUIRED_FIELDS", 400);
  }

  const automation = await Automation.create({
    companyId,
    name,
    description,
    triggerType,
    triggerConfig: triggerConfig || {},
    isActive: isActive !== undefined ? isActive : true
  });

  if (actions && actions.length > 0) {
    const actionsToCreate = actions.map((action, index) => ({
      automationId: automation.id,
      actionType: action.actionType,
      actionConfig: action.actionConfig || {},
      order: action.order || index + 1,
      delayMinutes: action.delayMinutes || 0
    }));

    await AutomationAction.bulkCreate(actionsToCreate);
  }

  await automation.reload({
    include: [{ model: AutomationAction, as: "actions" }]
  });

  return automation;
};

export default CreateAutomationService;
