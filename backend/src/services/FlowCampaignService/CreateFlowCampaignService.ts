import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  userId: number;
  name: string;
  companyId: number
  flowId: number;
  phrase: string;
  phrases?: string[];
  matchType?: string;
  whatsappId: string;
}

const CreateFlowCampaignService = async ({
  userId,
  name,
  companyId,
  phrase,
  phrases,
  matchType,
  whatsappId,
  flowId
}: Request): Promise<FlowCampaignModel> => {
  try {
    const phrasesJson = phrases && phrases.length ? JSON.stringify(phrases) : null;
    const matchTypeValue = matchType || "contains";

    const flow = await FlowCampaignModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
      phrase: phrase,
      phrases: phrasesJson,
      matchType: matchTypeValue,
      flowId: flowId,
      whatsappId: whatsappId
    });

    return flow;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default CreateFlowCampaignService;
