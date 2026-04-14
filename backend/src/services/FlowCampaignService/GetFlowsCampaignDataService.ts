import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";

interface Request {
  companyId: number;
  idFlow:number
}

interface Response {
  details: FlowCampaignModel
}

const GetFlowsCampaignDataService = async ({
  companyId,
  idFlow
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        const { count, rows } = await FlowCampaignModel.findAndCountAll({
          where: {
            id: idFlow
          }
        });
        
        let hook = rows[0];

        if (hook) {
          // converter phrases de JSON string para array se necessário
          const anyHook: any = hook as any;
          const rawPhrases = anyHook.phrases;
          try {
            if (typeof rawPhrases === "string" && rawPhrases.trim().length) {
              anyHook.phrases = JSON.parse(rawPhrases);
            }
          } catch (e) {
            anyHook.phrases = [];
          }

          if (!anyHook.matchType) {
            anyHook.matchType = "contains";
          }
        }

        return {
            details: hook
        }
      } catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
      }
};

export default GetFlowsCampaignDataService;
