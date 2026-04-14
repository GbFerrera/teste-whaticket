import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";

const DeletePlanService = async (id: string): Promise<void> => {
  if (id === "1" || Number(id) === 1) {
    throw new AppError("O plano padrão não pode ser excluído.", 400);
  }

  const plan = await Plan.findOne({
    where: { id }
  });

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await plan.destroy();
};

export default DeletePlanService;
