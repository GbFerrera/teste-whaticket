import FollowUp from "../../models/FollowUp";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import { Op } from "sequelize";
import moment from "moment";
import logger from "../../utils/logger";
import { ActionsWebhookService } from "../WebhookService/ActionsWebhookService";
import { proto } from "@whiskeysockets/baileys";
import ShowTicketService from "../TicketServices/ShowTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

interface FollowUpData {
  delayMinutes: number;
  action: {
    type: string;
    payload: any;
  };
  ticketId: number;
  companyId: number;
  flowNodeId?: string;
}

class ScheduleFollowUpService {
  
  constructor() {
  }

  public async scheduleFollowUp(data: FollowUpData): Promise<FollowUp> {
    const { delayMinutes, action, ticketId, companyId, flowNodeId } = data;
    
    const scheduledAt = moment().add(delayMinutes, 'minutes').toDate();
    
    const followUp = await FollowUp.create({
      ticketId,
      companyId,
      flowNodeId,
      actionType: action.type,
      actionPayload: action.payload,
      scheduledAt,
      status: 'pending'
    });

    logger.info(`Follow-up scheduled: ${followUp.id} for ticket ${ticketId} at ${scheduledAt}`);
    
    return followUp;
  }

  public async processPendingFollowUps(): Promise<void> {
    try {
      const now = moment().toDate();
      
      const pendingFollowUps = await FollowUp.findAll({
        where: {
          status: 'pending',
          scheduledAt: {
            [Op.lte]: now
          }
        },
        include: [
          {
            model: Ticket,
            as: 'ticket',
            include: [
              {
                model: Contact,
                as: 'contact'
              },
              {
                model: Whatsapp,
                as: 'whatsapp'
              },
              {
                model: Queue,
                as: 'queue'
              }
            ]
          }
        ]
      });

      logger.info(`Processing ${pendingFollowUps.length} pending follow-ups`);

      for (const followUp of pendingFollowUps) {
        try {
          await this.executeFollowUp(followUp);
          await followUp.update({ status: 'completed', executedAt: new Date() });
          logger.info(`Follow-up ${followUp.id} executed successfully`);
        } catch (error) {
          await followUp.update({ 
            status: 'failed', 
            executedAt: new Date(),
            error: error.message 
          });
          logger.error(`Failed to execute follow-up ${followUp.id}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`Error processing pending follow-ups: ${error.message}`);
    }
  }

  private async executeFollowUp(followUp: FollowUp): Promise<void> {
    const { ticket, actionType, actionPayload } = followUp;
    
    if (!ticket) {
      throw new Error('Ticket not found for follow-up');
    }

    const actionData = {
      ticket,
      contact: ticket.contact,
      whatsapp: ticket.whatsapp,
      queue: ticket.queue,
      companyId: ticket.companyId,
      ...actionPayload
    };

    switch (actionType) {
      case 'sendMessageFlow':
      case 'sendMessageFlowWithMenu': {
        const messageText = (actionPayload?.text || actionPayload?.body || "").toString().trim();

        if (!messageText) {
          logger.warn(`Follow-up ${followUp.id} sem texto para enviar.`);
          break;
        }

        try {
          const ticketDetails = await ShowTicketService(ticket.id, ticket.companyId);

          await SendWhatsAppMessage({
            body: messageText,
            ticket: ticketDetails,
            quotedMsg: null
          });

          await ticketDetails.update({ lastMessage: messageText });
          logger.info(`Follow-up ${followUp.id} enviou mensagem para ticket ${ticket.id}`);
        } catch (error) {
          logger.error(`Erro ao enviar mensagem do follow-up ${followUp.id}: ${error.message}`);
          throw error;
        }

        break;
      }
      
      case 'addTag':
        // Implement addTag logic - Adicionar tags normais
        if (actionPayload.tags && Array.isArray(actionPayload.tags)) {
          const Tag = require("../../models/Tag").default;
          const TicketTag = require("../../models/TicketTag").default;
          const ContactTag = require("../../models/ContactTag").default;
          
          for (const tagId of actionPayload.tags) {
            try {
              const tag = await Tag.findByPk(tagId);
              if (tag && tag.kanban === 0) { // Apenas tags normais
                // Adicionar tag ao ticket
                await TicketTag.findOrCreate({
                  where: { ticketId: ticket.id, tagId },
                  defaults: { ticketId: ticket.id, tagId }
                });
                
                // Adicionar tag ao contato
                await ContactTag.findOrCreate({
                  where: { contactId: ticket.contactId, tagId },
                  defaults: { contactId: ticket.contactId, tagId }
                });
                
                logger.info(`Tag ${tag.name} added to ticket ${ticket.id}`);
              }
            } catch (error) {
              logger.error(`Error adding tag ${tagId} to ticket ${ticket.id}:`, error);
            }
          }
        }
        break;
      
      case 'addTagKanban':
        // Implement addTagKanban logic - Adicionar tag kanban (substitui todas)
        if (actionPayload.kanbanTagId) {
          const Tag = require("../../models/Tag").default;
          const TicketTag = require("../../models/TicketTag").default;
          const ContactTag = require("../../models/ContactTag").default;
          
          try {
            const kanbanTag = await Tag.findByPk(actionPayload.kanbanTagId);
            if (kanbanTag && kanbanTag.kanban === 1) { // Apenas tags kanban
              
              // Remover todas as tags kanban existentes do ticket
              const existingKanbanTags = await Tag.findAll({
                where: { kanban: 1 },
                include: [{
                  model: TicketTag,
                  where: { ticketId: ticket.id },
                  required: true
                }]
              });
              
              for (const existingTag of existingKanbanTags) {
                await TicketTag.destroy({
                  where: { ticketId: ticket.id, tagId: existingTag.id }
                });
                await ContactTag.destroy({
                  where: { contactId: ticket.contactId, tagId: existingTag.id }
                });
              }
              
              // Adicionar nova tag kanban
              await TicketTag.findOrCreate({
                where: { ticketId: ticket.id, tagId: kanbanTag.id },
                defaults: { ticketId: ticket.id, tagId: kanbanTag.id }
              });
              
              await ContactTag.findOrCreate({
                where: { contactId: ticket.contactId, tagId: kanbanTag.id },
                defaults: { contactId: ticket.contactId, tagId: kanbanTag.id }
              });
              
              logger.info(`Kanban tag ${kanbanTag.name} set for ticket ${ticket.id}`);
            }
          } catch (error) {
            logger.error(`Error setting kanban tag for ticket ${ticket.id}:`, error);
          }
        }
        break;
      
      case 'transferQueue':
        // Implement transferQueue logic - Transferir para fila
        if (actionPayload.queueId) {
          const Queue = require("../../models/Queue").default;
          
          try {
            const queue = await Queue.findByPk(actionPayload.queueId);
            if (queue) {
              await ticket.update({
                queueId: queue.id,
                userId: null // Limpa usuário ao transferir para fila
              });
              
              logger.info(`Ticket ${ticket.id} transferred to queue ${queue.name}`);
            }
          } catch (error) {
            logger.error(`Error transferring ticket ${ticket.id} to queue ${actionPayload.queueId}:`, error);
          }
        }
        break;
      
      case 'closeTicket':
        // Implement closeTicket logic - Fechar ticket
        try {
          await ticket.update({
            status: 'closed',
            closedAt: new Date()
          });
          
          logger.info(`Ticket ${ticket.id} closed`);
        } catch (error) {
          logger.error(`Error closing ticket ${ticket.id}:`, error);
        }
        break;
      
      case 'transferFlow':
        // Implement transferFlow logic - Transferir para outro fluxo
        if (actionPayload.flowId) {
          // TODO: Implementar transferência de fluxo
          // Isso pode precisar de integração com o Flow Builder
          logger.info(`Transfer flow action for ticket ${ticket.id} to flow ${actionPayload.flowId}`);
        }
        break;
      
      default:
        throw new Error(`Unsupported action type: ${actionType}`);
    }
  }

  public async cancelFollowUp(followUpId: number, companyId: number): Promise<void> {
    const followUp = await FollowUp.findOne({
      where: {
        id: followUpId,
        companyId,
        status: 'pending'
      }
    });

    if (!followUp) {
      throw new Error('Pending follow-up not found');
    }

    await followUp.update({ status: 'cancelled' });
    logger.info(`Follow-up ${followUpId} cancelled`);
  }

  public async getFollowUpsByTicket(ticketId: number, companyId: number): Promise<FollowUp[]> {
    return await FollowUp.findAll({
      where: {
        ticketId,
        companyId
      },
      order: [['createdAt', 'DESC']]
    });
  }

  public async resetFollowUpVariables(ticketId: number, companyId: number): Promise<void> {
    const followUps = await FollowUp.findAll({
      where: {
        ticketId,
        companyId,
        status: ['pending', 'failed']
      }
    });

    for (const followUp of followUps) {
      await followUp.update({ status: 'cancelled' });
    }

    logger.info(`Reset ${followUps.length} follow-ups for ticket ${ticketId}`);
  }
}

export default ScheduleFollowUpService;
