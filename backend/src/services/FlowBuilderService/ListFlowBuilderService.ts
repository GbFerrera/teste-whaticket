import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import AttachToolsEnabledToFlow from "./AttachToolsEnabledToFlow";

interface Request {
  companyId: number;
}

interface Response {
  flows: FlowBuilderModel[];
}

const ListFlowBuilderService = async ({
  companyId,
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowBuilderModel.findAndCountAll({
          where: {
            company_id: companyId
          }
        });
    
        await Promise.all(
          rows.map(flow => AttachToolsEnabledToFlow(flow, companyId))
        );

        return {
            flows: rows,
        }
      } catch (error) {
        console.error('Erro ao consultar usuários:', error);
      }
};

export default ListFlowBuilderService;
