import AppError from "../../errors/AppError";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  id: number;
  companyId: number;
}

const ShowScheduledDispatcherService = async ({
  id,
  companyId
}: Request): Promise<ScheduledDispatcher> => {
  const dispatcher = await ScheduledDispatcher.findOne({
    where: { id, companyId },
    include: [
      {
        model: Whatsapp,
        attributes: ["id", "name", "channel"]
      }
    ]
  });

  if (!dispatcher) {
    throw new AppError("Scheduled dispatcher not found", 404);
  }

  return dispatcher;
};

export default ShowScheduledDispatcherService;
