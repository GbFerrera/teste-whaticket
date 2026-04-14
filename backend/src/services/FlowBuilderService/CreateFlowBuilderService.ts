import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import ensureFlowBuilderWebhook from "./ensureFlowBuilderWebhook";
import logger from "../../utils/logger";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const CreateFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowBuilderModel | string> => {
  try {
    logger.info(`[CreateFlowBuilderService] Starting for company ${companyId}, user ${userId}, flow name: ${name}`);
    
    const nameExist = await FlowBuilderModel.findOne({
      where: {
        name,
        company_id: companyId
      }
    })

    if(nameExist){
      logger.info(`[CreateFlowBuilderService] Flow with name "${name}" already exists for company ${companyId}`);
      return 'exist'
    }

    const flow = await FlowBuilderModel.create({
      user_id: userId,
      company_id: companyId,
      name: name,
    });

    logger.info(`[CreateFlowBuilderService] Flow created with ID: ${flow.id}`);

    // Verifica se é o primeiro flow e cria webhook se necessário
    const totalFlows = await FlowBuilderModel.count({
      where: {
        company_id: companyId
      }
    });

    logger.info(`[CreateFlowBuilderService] Total flows for company ${companyId}: ${totalFlows}`);

    if (totalFlows === 1) {
      logger.info(`[CreateFlowBuilderService] First flow detected, ensuring FlowBuilder webhook exists`);
      await ensureFlowBuilderWebhook({
        companyId,
        userId
      });
    } else {
      logger.info(`[CreateFlowBuilderService] Not the first flow, skipping webhook creation`);
    }

    return flow;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default CreateFlowBuilderService;
