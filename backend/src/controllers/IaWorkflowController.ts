import { Request, Response } from "express";
import IaWorkflow from "../models/IaWorkflow";
import Prompt from "../models/Prompt";
import ListIaWorkflowsByPromptService from "../services/IaWorkflowService/ListIaWorkflowsByPromptService";
import logger from "../utils/logger";

interface IaWorkflowData {
  name: string;
  description?: string;
  orchestratorPromptId: number;
  agents: Array<{
    agentPromptId: number;
    alias: string;
  }>;
  flowData?: any;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { orchestratorPromptId } = req.query;
  logger.info({
    message: "[IaWorkflowController] index called",
    companyId,
    orchestratorPromptId
  });

  try {
    if (orchestratorPromptId) {
      // Listar workflows por prompt orquestrador
      const workflows = await ListIaWorkflowsByPromptService({
        companyId,
        orchestratorPromptId: Number(orchestratorPromptId)
      });
      return res.json(workflows);
    } else {
      // Listar todos os workflows da empresa (agrupados por orquestrador)
      const workflows = await IaWorkflow.findAll({
        where: { companyId },
        order: [["createdAt", "DESC"]]
      });

      // Buscar nomes dos prompts orquestradores
      const orchestratorIds = [...new Set(workflows.map(w => w.orchestratorPromptId))];
      const orchestratorPrompts = await Prompt.findAll({
        where: { id: orchestratorIds },
        attributes: ['id', 'name']
      });

      // Agrupar por orquestrador e criar estrutura para a listagem
      const groupedWorkflows = workflows.reduce((acc: any, workflow: any) => {
        const key = workflow.orchestratorPromptId;
        if (!acc[key]) {
          const orchestratorPrompt = orchestratorPrompts.find(p => p.id === workflow.orchestratorPromptId);
          acc[key] = {
            id: workflow.orchestratorPromptId,
            orchestratorPromptId: workflow.orchestratorPromptId,
            name: orchestratorPrompt ? `Workflow - ${orchestratorPrompt.name}` : `Workflow - Orquestrador ${workflow.orchestratorPromptId}`,
            description: `Workflow multi-agente com IA orquestradora`,
            agents: [],
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt
          };
        }
        acc[key].agents.push({
          id: workflow.id,
          agentPromptId: workflow.agentPromptId,
          alias: workflow.alias,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt
        });
        return acc;
      }, {});

      const workflowList = Object.values(groupedWorkflows).map((group: any) => ({
        ...group,
        connections: group.agents,
        agentCount: group.agents.length
      }));

      logger.info({
        message: "[IaWorkflowController] index returning grouped workflows",
        companyId,
        count: workflowList.length
      });
      return res.json(workflowList);
    }
  } catch (error) {
    logger.error({
      message: "[IaWorkflowController] Error listing workflows",
      error,
      companyId,
      orchestratorPromptId
    });
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  logger.info({
    message: "[IaWorkflowController] show called",
    companyId,
    orchestratorPromptId: id
  });

  try {
    // Buscar todos os workflows do orquestrador
    const workflows = await IaWorkflow.findAll({
      where: { 
        companyId,
        orchestratorPromptId: id
      }
    });

    if (workflows.length === 0) {
      return res.status(404).json({ error: "Workflow não encontrado" });
    }

    // Buscar nome do prompt orquestrador para usar como nome do workflow
    const orchestratorPrompt = await Prompt.findByPk(id, {
      attributes: ['id', 'name']
    });

    const workflowData = {
      name: orchestratorPrompt ? `Workflow - ${orchestratorPrompt.name}` : `Workflow - Orquestrador ${id}`,
      description: `Workflow multi-agente com ${workflows.length} IA${workflows.length > 1 ? 's' : ''} especializada${workflows.length > 1 ? 's' : ''}`,
      orchestratorPromptId: Number(id),
      agents: workflows.map(w => ({
        id: w.id,
        agentPromptId: w.agentPromptId,
        alias: w.alias
      }))
    };

    logger.info({
      message: "[IaWorkflowController] show returning workflow",
      companyId,
      orchestratorPromptId: id,
      agents: workflowData.agents.length
    });
    return res.json(workflowData);
  } catch (error) {
    logger.error({
      message: "[IaWorkflowController] Error showing workflow",
      error,
      companyId,
      orchestratorPromptId: id
    });
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const workflowData: IaWorkflowData = req.body;
  logger.info({
    message: "[IaWorkflowController] store called",
    companyId,
    workflowData
  });

  try {
    const { orchestratorPromptId, agents } = workflowData;

    if (!orchestratorPromptId || !agents || agents.length === 0) {
      return res.status(400).json({ 
        error: "orchestratorPromptId e agents são obrigatórios" 
      });
    }

    // Remover workflows existentes do orquestrador
    await IaWorkflow.destroy({
      where: {
        companyId,
        orchestratorPromptId
      }
    });

    // Criar novos workflows
    const createdWorkflows = [];
    for (const agent of agents) {
      const workflow = await IaWorkflow.create({
        companyId,
        orchestratorPromptId,
        agentPromptId: agent.agentPromptId,
        alias: agent.alias
      });
      createdWorkflows.push(workflow);
    }

    logger.info({
      message: "[IaWorkflowController] Workflow created",
      companyId,
      orchestratorPromptId,
      agentsCreated: createdWorkflows.length
    });
    return res.status(201).json({
      message: "Workflow criado com sucesso",
      workflows: createdWorkflows
    });
  } catch (error) {
    logger.error({
      message: "[IaWorkflowController] Error creating workflow",
      error,
      companyId,
      workflowData
    });
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const workflowData: IaWorkflowData = req.body;
  logger.info({
    message: "[IaWorkflowController] update called",
    companyId,
    orchestratorPromptId: id,
    workflowData
  });

  try {
    const { agents } = workflowData;

    if (!agents || agents.length === 0) {
      return res.status(400).json({ 
        error: "agents é obrigatório" 
      });
    }

    // Remover workflows existentes do orquestrador
    await IaWorkflow.destroy({
      where: {
        companyId,
        orchestratorPromptId: id
      }
    });

    // Criar novos workflows
    const updatedWorkflows = [];
    for (const agent of agents) {
      const workflow = await IaWorkflow.create({
        companyId,
        orchestratorPromptId: Number(id),
        agentPromptId: agent.agentPromptId,
        alias: agent.alias
      });
      updatedWorkflows.push(workflow);
    }

    logger.info({
      message: "[IaWorkflowController] Workflow updated",
      companyId,
      orchestratorPromptId: id,
      agentsUpdated: updatedWorkflows.length
    });
    return res.json({
      message: "Workflow atualizado com sucesso",
      workflows: updatedWorkflows
    });
  } catch (error) {
    logger.error({
      message: "[IaWorkflowController] Error updating workflow",
      error,
      companyId,
      orchestratorPromptId: id,
      workflowData
    });
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  logger.info({
    message: "[IaWorkflowController] remove called",
    companyId,
    orchestratorPromptId: id
  });

  try {
    const deletedCount = await IaWorkflow.destroy({
      where: {
        companyId,
        orchestratorPromptId: id
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Workflow não encontrado" });
    }

    logger.info({
      message: "[IaWorkflowController] Workflow removed",
      companyId,
      orchestratorPromptId: id,
      deletedCount
    });
    return res.json({ message: "Workflow removido com sucesso" });
  } catch (error) {
    logger.error({
      message: "[IaWorkflowController] Error removing workflow",
      error,
      companyId,
      orchestratorPromptId: id
    });
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
