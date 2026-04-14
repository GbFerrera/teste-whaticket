import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import Queue from "../../models/Queue";
import PromptToolSetting from "../../models/PromptToolSetting";

interface Data {
  promptId: string | number;
  companyId: string | number;
}
const ShowPromptService = async ({ promptId, companyId }: Data): Promise<Prompt> => {

  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      companyId
    },
    include: [
      {
        model: Queue,
        as: "queue"
      },
      {
        model: PromptToolSetting,
        as: "toolSettings"
      }
    ]
  });

  if (!prompt) {
    throw new AppError("ERR_NO_PROMPT_FOUND", 404);
  }

  const toolsEnabled =
    prompt.toolSettings
      ?.filter(tool => tool?.enabled)
      .map(tool => tool.toolName) || [];

  (prompt as any).setDataValue("toolsEnabled", toolsEnabled);
  (prompt as any).setDataValue("knowledgeBase", prompt.knowledgeBase || []);

  return prompt;
};
export default ShowPromptService;
