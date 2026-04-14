import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import AppError from "../../errors/AppError";

interface ActionData {
  id?: number;
  actionType: string;
  actionConfig: any;
  order: number;
  delayMinutes?: number;
}

interface UpdateAutomationData {
  id: number;
  companyId: number;
  name?: string;
  description?: string;
  triggerType?: string;
  triggerConfig?: any;
  isActive?: boolean;
  actions?: ActionData[];
}

const UpdateAutomationService = async (data: UpdateAutomationData): Promise<Automation> => {
  const { id, companyId, actions, ...updateData } = data;

  const automation = await Automation.findOne({
    where: { id, companyId }
  });

  if (!automation) {
    throw new AppError("ERR_AUTOMATION_NOT_FOUND", 404);
  }

  await automation.update(updateData);

  if (actions !== undefined) {
    // Remove ações existentes
    await AutomationAction.destroy({
      where: { automationId: automation.id }
    });

    // Cria novas ações
    if (actions.length > 0) {
      const actionsToCreate = actions.map((action, index) => ({
        automationId: automation.id,
        actionType: action.actionType,
        actionConfig: action.actionConfig || {},
        order: action.order || index + 1,
        delayMinutes: action.delayMinutes || 0
      }));

      await AutomationAction.bulkCreate(actionsToCreate);
    }
  }

  await automation.reload({
    include: [{ model: AutomationAction, as: "actions" }]
  });

  return automation;
};

export default UpdateAutomationService;
