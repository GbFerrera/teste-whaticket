import AppError from "../../errors/AppError";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";

interface Request {
  dispatcherId: number;
  companyId: number;
}

const DeleteScheduledDispatcherService = async ({
  dispatcherId,
  companyId
}: Request): Promise<void> => {
  const dispatcher = await ScheduledDispatcher.findOne({
    where: { id: dispatcherId, companyId }
  });

  if (!dispatcher) {
    throw new AppError("Scheduled dispatcher not found", 404);
  }

  await dispatcher.destroy();
};

export default DeleteScheduledDispatcherService;
