import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Prompt from "../../models/Prompt";
import PromptToolSetting from "../../models/PromptToolSetting";

interface Request {
  companyId: number;
  session?: number | string;
}

const ListWhatsAppsService = async ({
  session,
  companyId
}: Request): Promise<Whatsapp[]> => {
  const options: FindOptions = {
    where: {
      companyId
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
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
    ]
  };

  if (session !== undefined && session == 0) {
    options.attributes = { exclude: ["session"] };
  }

  const whatsapps = await Whatsapp.findAll(options);

  whatsapps.forEach(whatsapp => {
    const prompt = (whatsapp as any)?.prompt;
    if (prompt?.toolSettings) {
      const toolsEnabled =
        prompt.toolSettings
          .filter((tool: PromptToolSetting) => tool?.enabled)
          .map((tool: PromptToolSetting) => tool.toolName) || [];
      (prompt as any).setDataValue("toolsEnabled", toolsEnabled);
    }
  });

  return whatsapps;
};



export default ListWhatsAppsService;
