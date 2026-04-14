import Company from "../../models/Company";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Plan from "../../models/Plan";
import { IChannel } from "../controllers/ChannelController";

interface Request {
  companyId: number;
  channels: IChannel[];
}

interface Response {
  whatsapps: Whatsapp[];
}

const CreateChannelsService = async ({
  companyId,
  channels = []
}: Request): Promise<Response> => {
  const company = await Company.findOne({
    where: {
      id: companyId
    },
    include: [{ model: Plan, as: "plan" }]
  });

  if (company !== null) {
    let whatsappCount = await Whatsapp.count({
      where: {
        companyId
      }
    });

    whatsappCount += channels.length;

    if (whatsappCount >= company.plan.connections) {
      throw new AppError(
        `Número máximo de conexões já alcançado: ${whatsappCount}`
      );
    }
  }

  channels = channels.map(channel => {
    return {
      ...channel,
      status: "CONNECTED",
      companyId,
      notificameHub: true,
    };
  });

  const whatsapps = await Whatsapp.bulkCreate(channels, {
    include: ["queues"]
  });

  return { whatsapps };
};

export default CreateChannelsService;
