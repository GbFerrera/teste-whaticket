import { WebhookModel } from "../../models/Webhook";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import CreateWebHookService from "../WebhookService/CreateWebHookService";
import logger from "../../utils/logger";

interface Params {
  companyId: number;
  userId: number;
}

const ensureFlowBuilderWebhook = async ({
  companyId,
  userId
}: Params): Promise<void> => {
  try {
    logger.info(`[ensureFlowBuilderWebhook] Starting for company ${companyId}`);
    
    // Verifica se já existe uma integração com o flowbuilder PARA ESTA EMPRESA
    const existingWebhook = await WebhookModel.findOne({
      where: {
        company_id: companyId,
        name: "flowbuilder"
      }
    });

    if (existingWebhook) {
      logger.info(`[ensureFlowBuilderWebhook] Webhook already exists for company ${companyId}:`, {
        id: existingWebhook.id,
        name: existingWebhook.name,
        active: existingWebhook.active,
        hash_id: existingWebhook.hash_id
      });
      
      // Se o webhook existe mas está inativo, reativa
      if (!existingWebhook.active) {
        logger.info(`[ensureFlowBuilderWebhook] Reactivating webhook for company ${companyId}`);
        await existingWebhook.update({ active: true });
        logger.info(`[ensureFlowBuilderWebhook] Webhook reactivated successfully`);
      }
      
      return;
    }

    logger.info(`[ensureFlowBuilderWebhook] No existing webhook found for company ${companyId}, creating new one`);

    // Cria o webhook automaticamente para esta empresa
    const webhook = await CreateWebHookService({
      userId,
      name: "flowbuilder",
      companyId
    });

    logger.info(`[ensureFlowBuilderWebhook] CreateWebHookService returned:`, typeof webhook, webhook);

    if (typeof webhook === 'string') {
      if (webhook === 'exist') {
        logger.info(`[ensureFlowBuilderWebhook] Webhook already exists (returned 'exist') for company ${companyId}`);
      } else {
        logger.error(`[ensureFlowBuilderWebhook] Error creating webhook for company ${companyId}: ${webhook}`);
      }
      return;
    }

    logger.info(`[ensureFlowBuilderWebhook] Webhook created successfully for company ${companyId}:`, {
      id: webhook.id,
      name: webhook.name,
      active: webhook.active,
      hash_id: webhook.hash_id
    });
  } catch (error) {
    logger.error(`[ensureFlowBuilderWebhook] Error for company ${companyId}:`, error);
  }
};

export default ensureFlowBuilderWebhook;
