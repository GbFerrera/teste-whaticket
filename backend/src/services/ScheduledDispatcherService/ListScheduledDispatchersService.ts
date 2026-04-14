import ScheduledDispatcher from "../../models/ScheduledDispatcher";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
}

const ListScheduledDispatchersService = async ({ companyId }: Request) => {
  const dispatchers = await ScheduledDispatcher.findAll({
    where: { companyId },
    include: [
      {
        model: Whatsapp,
        attributes: ["id", "name", "channel"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return dispatchers;
};

export default ListScheduledDispatchersService;
