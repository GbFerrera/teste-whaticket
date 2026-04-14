import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";
import Queue from "../../models/Queue";
import User from "../../models/User";

const ShowQueueService = async (
  queueId: number | string,
  companyId: number
): Promise<Queue> => {
  // Validar queueId para evitar erro de banco
  const parsedQueueId = parseInt(queueId as string);
  if (isNaN(parsedQueueId) || parsedQueueId <= 0) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  const queue = await Queue.findOne({
    where: {
      id: parsedQueueId,
      companyId
    },
    include: [{
      model: Chatbot,
      as: "chatbots",
      include: [
        {
          model: User,
          as: "user"
        },
      ]
    }
  ],
    order: [
      [{ model: Chatbot, as: "chatbots" }, "id", "asc"],
      ["id", "ASC"]
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
