import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";
import AutomationLog from "../../models/AutomationLog";
import AppError from "../../errors/AppError";

interface ShowAutomationData {
  id: number;
  companyId: number;
}

const ShowAutomationService = async (data: ShowAutomationData): Promise<Automation> => {
  const { id, companyId } = data;

  const automation = await Automation.findOne({
    where: { id, companyId },
    include: [
      {
        model: AutomationAction,
        as: "actions",
        separate: true,
        order: [["order", "ASC"]]
      },
      {
        model: AutomationLog,
        as: "logs",
        separate: true,
        limit: 50,
        order: [["createdAt", "DESC"]]
      }
    ]
  });

  if (!automation) {
    throw new AppError("ERR_AUTOMATION_NOT_FOUND", 404);
  }

  return automation;
};

export default ShowAutomationService;
