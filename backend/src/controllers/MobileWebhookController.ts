import { Request, Response } from "express";
import axios from "axios";
import MobileWebhook from "../models/MobileWebhook";
import { getIO } from "../libs/socket";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    companyId: number;
    profile: string;
  };
}

// Registrar webhook para notificações mobile
export const registerWebhook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { webhookUrl, deviceToken, platform } = req.body;
    const { user } = req;

    if (!webhookUrl || !deviceToken || !platform) {
      return res.status(400).json({
        error: "webhookUrl, deviceToken e platform são obrigatórios"
      });
    }

    // Verificar se já existe um webhook para este usuário e dispositivo
    const existingWebhook = await MobileWebhook.findOne({
      where: {
        userId: user.id,
        companyId: user.companyId,
        deviceToken
      }
    });

    if (existingWebhook) {
      // Atualizar webhook existente
      await existingWebhook.update({
        webhookUrl,
        platform,
        isActive: true
      });

      return res.status(200).json({
        message: "Webhook atualizado com sucesso",
        webhook: existingWebhook
      });
    }

    // Criar novo webhook
    const webhook = await MobileWebhook.create({
      userId: user.id,
      companyId: user.companyId,
      webhookUrl,
      deviceToken,
      platform,
      isActive: true
    });

    return res.status(201).json({
      message: "Webhook registrado com sucesso",
      webhook
    });
  } catch (error) {
    console.error("Erro ao registrar webhook:", error);
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

// Remover webhook
export const unregisterWebhook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { deviceToken } = req.body;
    const { user } = req;

    if (!deviceToken) {
      return res.status(400).json({
        error: "deviceToken é obrigatório"
      });
    }

    const webhook = await MobileWebhook.findOne({
      where: {
        userId: user.id,
        companyId: user.companyId,
        deviceToken
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: "Webhook não encontrado"
      });
    }

    await webhook.update({ isActive: false });

    return res.status(200).json({
      message: "Webhook removido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao remover webhook:", error);
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

// Listar webhooks do usuário
export const listWebhooks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { user } = req;

    const webhooks = await MobileWebhook.findAll({
      where: {
        userId: user.id,
        companyId: user.companyId,
        isActive: true
      }
    });

    return res.status(200).json({
      webhooks
    });
  } catch (error) {
    console.error("Erro ao listar webhooks:", error);
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

// Testar webhook
export const testWebhook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { deviceToken } = req.body;
    const { user } = req;

    if (!deviceToken) {
      return res.status(400).json({
        error: "deviceToken é obrigatório"
      });
    }

    const webhook = await MobileWebhook.findOne({
      where: {
        userId: user.id,
        companyId: user.companyId,
        deviceToken,
        isActive: true
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: "Webhook não encontrado"
      });
    }

    // Enviar notificação de teste
    const testNotification = {
      type: "test",
      title: "Teste de Notificação",
      message: "Este é um teste do sistema de notificações mobile",
      timestamp: new Date().toISOString(),
      userId: user.id,
      companyId: user.companyId
    };

    try {
      await axios.post(webhook.webhookUrl, testNotification, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Whaticket-Mobile-Webhook/1.0'
        }
      });

      return res.status(200).json({
        message: "Notificação de teste enviada com sucesso"
      });
    } catch (webhookError) {
      console.error("Erro ao enviar webhook de teste:", webhookError);
      return res.status(400).json({
        error: "Falha ao enviar notificação de teste",
        details: webhookError.message
      });
    }
  } catch (error) {
    console.error("Erro ao testar webhook:", error);
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

// Função para enviar notificação de nova mensagem
export const sendMessageNotification = async (
  messageData: any,
  companyId: number,
  ticketUserId?: number
): Promise<void> => {
  try {
    // Buscar webhooks ativos para a empresa
    const whereClause: any = {
      companyId,
      isActive: true
    };

    // Se a mensagem tem um usuário específico, filtrar apenas para ele
    if (ticketUserId) {
      whereClause.userId = ticketUserId;
    }

    const webhooks = await MobileWebhook.findAll({
      where: whereClause
    });

    if (webhooks.length === 0) {
      return;
    }

    // Preparar dados da notificação
    const notification = {
      type: "new_message",
      title: `Nova mensagem - ${messageData.contact?.name || "Contato"}`,
      message: messageData.body || "Nova mensagem recebida",
      timestamp: new Date().toISOString(),
      companyId,
      ticketId: messageData.ticketId,
      contactId: messageData.contactId,
      contactName: messageData.contact?.name,
      fromMe: messageData.fromMe,
      messageId: messageData.id,
      queueId: messageData.queueId
    };

    // Enviar notificação para todos os webhooks
    const promises = webhooks.map(async (webhook) => {
      try {
        await axios.post(webhook.webhookUrl, notification, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Whaticket-Mobile-Webhook/1.0'
          }
        });
        console.log(`Notificação enviada para webhook ${webhook.id}`);
      } catch (error) {
        console.error(`Erro ao enviar notificação para webhook ${webhook.id}:`, error.message);
        
        // Se o webhook falhar múltiplas vezes, desativar
        webhook.failureCount = (webhook.failureCount || 0) + 1;
        if (webhook.failureCount >= 5) {
          await webhook.update({ isActive: false });
          console.log(`Webhook ${webhook.id} desativado após múltiplas falhas`);
        } else {
          await webhook.update({ failureCount: webhook.failureCount });
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Erro ao enviar notificações mobile:", error);
  }
};
