import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  companyId: number;
  name: string;
  flowId: number;
  phrase: string;
  phrases?: string[];
  matchType?: string;
  id: number;
  status: boolean;
}

const UpdateFlowCampaignService = async ({
  companyId,
  name,
  flowId,
  phrase,
  phrases,
  matchType,
  id,
  status
}: Request): Promise<String> => {
  try {
    const phrasesJson = phrases && phrases.length ? JSON.stringify(phrases) : null;
    const matchTypeValue = matchType || "contains";

    // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
    const flow = await FlowCampaignModel.update({ name, phrase, phrases: phrasesJson, matchType: matchTypeValue, flowId, status }, {
      where: {id: id}
    });

    return 'ok';
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default UpdateFlowCampaignService;
