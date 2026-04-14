import { WebhookModel } from "../../models/Webhook";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import CreateWebHookService from "./CreateWebHookService";
import logger from "../../utils/logger";

interface Params {
  companyId: number;
  userId: number;
}

/**
 * Garante que exista uma integração flowbuilder para a empresa
 * Usado quando o usuário acessa a página de integrações
 */
const ensureFlowBuilderIntegration = async ({
  companyId,
  userId
}: Params): Promise<void> => {
  try {
    logger.info(`[ensureFlowBuilderIntegration] Checking for company ${companyId}`);
    
    // Verifica se já existe uma integração com o flowbuilder
    const existingWebhook = await WebhookModel.findOne({
      where: {
        company_id: companyId,
        name: "flowbuilder"
      }
    });

    if (existingWebhook) {
      logger.info(`[ensureFlowBuilderIntegration] Webhook already exists for company ${companyId}`);
      return;
    }

    // Verifica se existe algum flow criado nesta empresa
    const flowCount = await FlowBuilderModel.count({
      where: {
        company_id: companyId
      }
    });

    // Se não há flows, não cria webhook
    if (flowCount === 0) {
      logger.info(`[ensureFlowBuilderIntegration] No flows found for company ${companyId}, skipping webhook creation`);
      return;
    }

    logger.info(`[ensureFlowBuilderIntegration] Creating webhook for company ${companyId} (found ${flowCount} flows)`);

    // Cria o webhook automaticamente
    const webhook = await CreateWebHookService({
      userId,
      name: "flowbuilder",
      companyId
    });

    if (typeof webhook === 'string') {
      if (webhook === 'exist') {
        logger.info(`[ensureFlowBuilderIntegration] Webhook already exists for company ${companyId}`);
      } else {
        logger.error(`[ensureFlowBuilderIntegration] Error creating webhook for company ${companyId}: ${webhook}`);
      }
      return;
    }

    logger.info(`[ensureFlowBuilderIntegration] Webhook created successfully for company ${companyId}, ID: ${webhook.id}`);
  } catch (error) {
    logger.error(`[ensureFlowBuilderIntegration] Error for company ${companyId}:`, error);
  }
};

export default ensureFlowBuilderIntegration;
