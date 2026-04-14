import AppError from "../../errors/AppError";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";

interface Request {
  dispatcherId: number;
  companyId: number;
  active?: boolean;
}

const ToggleScheduledDispatcherService = async ({
  dispatcherId,
  companyId,
  active
}: Request): Promise<ScheduledDispatcher> => {
  const dispatcher = await ScheduledDispatcher.findOne({
    where: { id: dispatcherId, companyId }
  });

  if (!dispatcher) {
    throw new AppError("Scheduled dispatcher not found", 404);
  }

  const nextStatus = typeof active === "boolean" ? active : !dispatcher.active;

  await dispatcher.update({ active: nextStatus });

  return dispatcher;
};

export default ToggleScheduledDispatcherService;
