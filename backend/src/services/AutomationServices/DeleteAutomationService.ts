import Automation from "../../models/Automation";
import AppError from "../../errors/AppError";

interface DeleteAutomationData {
  id: number;
  companyId: number;
}

const DeleteAutomationService = async (data: DeleteAutomationData): Promise<void> => {
  const { id, companyId } = data;

  const automation = await Automation.findOne({
    where: { id, companyId }
  });

  if (!automation) {
    throw new AppError("ERR_AUTOMATION_NOT_FOUND", 404);
  }

  await automation.destroy();
};

export default DeleteAutomationService;
