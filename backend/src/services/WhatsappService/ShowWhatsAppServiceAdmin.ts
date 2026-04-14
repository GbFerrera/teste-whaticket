import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import { FindOptions } from "sequelize/types";
import Chatbot from "../../models/Chatbot";
import Prompt from "../../models/Prompt";
import PromptToolSetting from "../../models/PromptToolSetting";

const ShowWhatsAppServiceAdmin = async (
  id: string | number,
  session?: any
): Promise<Whatsapp> => {

  const findOptions: FindOptions = {
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage", "integrationId", "fileListId", "closeTicket"],
        include: [
          {
            model: Chatbot,
            as: "chatbots",
            attributes: ["id", "name", "greetingMessage", "closeTicket"]
          }
        ]
      },
      {
        model: Prompt,
        as: "prompt",
        include: [
          {
            model: PromptToolSetting,
            as: "toolSettings"
          }
        ]
      }
    ],
    order: [
      ["queues", "orderQueue", "ASC"],
      ["queues", "chatbots", "id", "ASC"]
    ]
  };

  if (session !== undefined && session == 0) {
    findOptions.attributes = { exclude: ["session"] };
  }

  const whatsapp = await Whatsapp.findByPk(id, findOptions);

  const prompt = (whatsapp as any)?.prompt;
  if (prompt?.toolSettings) {
    const toolsEnabled =
      prompt.toolSettings
        .filter((tool: PromptToolSetting) => tool?.enabled)
        .map((tool: PromptToolSetting) => tool.toolName) || [];
    (prompt as any).setDataValue("toolsEnabled", toolsEnabled);
  }

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppServiceAdmin;
