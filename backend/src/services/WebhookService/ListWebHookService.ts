import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import ensureFlowBuilderIntegration from "./ensureFlowBuilderIntegration";
import logger from "../../utils/logger";

interface Request {
  companyId: number;
  userId?: number; // Adicionado para garantir a criação do webhook flowbuilder
}

interface Response {
  webhooks: WebhookModel[];
  count: number;
  hasMore: boolean;
}

const ListWebHookService = async ({
  companyId,
  userId
}: Request): Promise<Response> => {
  
    try {
      // Garante que exista integração flowbuilder se houver flows
      if (userId) {
        await ensureFlowBuilderIntegration({
          companyId,
          userId
        });
      }
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await WebhookModel.findAndCountAll({
          where: {
            company_id: companyId
          }
        });
    
        const hooks = []
        rows.forEach((usuario) => {
            hooks.push(usuario.toJSON());
        });

        return {
            webhooks: hooks,
            hasMore: true,
            count: count
        }
      } catch (error) {
        console.error('Erro ao consultar usuários:', error);
      }
};

export default ListWebHookService;
