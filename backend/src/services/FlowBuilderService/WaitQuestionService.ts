import Queue from "../../libs/queue";
import SendWhatsAppMediaFlow from "../WbotServices/SendWhatsAppMediaFlow";
import { SendMessage } from "../../helpers/SendMessage";
import Ticket from "../../models/Ticket";
import { ActionsWebhookService } from "../WebhookService/ActionsWebhookService";

interface WaitQuestionData {
  ticketId: number;
  question: string;
  mediaType?: string;
  mediaUrl?: string;
  mediaName?: string;
  optionX: {
    trigger: string;
    matchType: string;
    label: string;
    action: string;
  };
  optionY: {
    trigger: string;
    matchType: string;
    label: string;
    action: string;
  };
  delayMinutes: number;
  nodeId: string;
  companyId: number;
}

interface TimeoutData {
  ticketId: number;
  nodeId: string;
  timeoutMinutes: number;
  action: string;
  companyId: number;
  transferQueueId?: number;
}

class WaitQuestionService {
  // Agendar envio da pergunta
  static async scheduleQuestionWithFollowUp(data: WaitQuestionData) {
    const delay = data.delayMinutes * 60 * 1000; // Converter para milissegundos

    await Queue.add(
      "WaitQuestion/SendQuestion",
      {
        ticketId: data.ticketId,
        question: data.question,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        mediaName: data.mediaName,
        optionX: data.optionX,
        optionY: data.optionY,
        nodeId: data.nodeId,
        companyId: data.companyId
      },
      {
        delay,
        attempts: 3,
        backoff: "exponential",
        removeOnComplete: false
      }
    );

    console.log(`[WaitQuestion] Pergunta agendada para ticket ${data.ticketId} em ${data.delayMinutes} minutos`);
  }

  // Enviar a pergunta (executado pela queue)
  static async sendQuestion(data: WaitQuestionData) {
    try {
      const ticket = await Ticket.findByPk(data.ticketId);
      if (!ticket) {
        console.error(`[WaitQuestion] Ticket ${data.ticketId} não encontrado`);
        return;
      }

      // Enviar mídia primeiro (se existir)
      if (data.mediaType && data.mediaType !== "none" && data.mediaUrl) {
        try {
          await SendWhatsAppMediaFlow({
            ticket: ticket,
            media: data.mediaUrl,
            body: "",
            isFlow: true
          });
          console.log(`[WaitQuestion] Mídia enviada para ticket ${data.ticketId}`);
        } catch (error) {
          console.error(`[WaitQuestion] Erro ao enviar mídia:`, error);
        }
      }

      // Enviar a pergunta
      if (data.question) {
        await SendMessage(
          ticket.whatsapp,
          {
            number: ticket.contact.number,
            body: data.question,
            companyId: data.companyId
          }
        );
        console.log(`[WaitQuestion] Pergunta enviada para ticket ${data.ticketId}`);
      }

      // Atualizar estado do ticket
      await ticket.update({
        waitingQuestion: true,
        questionNodeId: data.nodeId,
        questionOptions: {
          optionX: data.optionX,
          optionY: data.optionY
        }
      });

    } catch (error) {
      console.error(`[WaitQuestion] Erro ao enviar pergunta:`, error);
    }
  }

  // Agendar timeout
  static async scheduleTimeoutAction(data: TimeoutData) {
    const delay = data.timeoutMinutes * 60 * 1000; // Converter para milissegundos

    await Queue.add(
      "WaitQuestion/TimeoutAction",
      {
        ticketId: data.ticketId,
        nodeId: data.nodeId,
        action: data.action,
        companyId: data.companyId,
        transferQueueId: data.transferQueueId
      },
      {
        delay,
        attempts: 3,
        backoff: "exponential",
        removeOnComplete: false
      }
    );

    console.log(`[WaitQuestion] Timeout agendado para ticket ${data.ticketId} em ${data.timeoutMinutes} minutos`);
  }

  // Executar ação de timeout
  static async executeTimeoutAction(data: TimeoutData) {
    try {
      const ticket = await Ticket.findByPk(data.ticketId);
      if (!ticket) {
        console.error(`[WaitQuestion] Ticket ${data.ticketId} não encontrado`);
        return;
      }

      // Verificar se ainda está esperando resposta
      if (!ticket.waitingQuestion || ticket.questionNodeId !== data.nodeId) {
        console.log(`[WaitQuestion] Ticket ${data.ticketId} não está mais aguardando resposta, ignorando timeout`);
        return;
      }

      // Limpar estado de espera
      await ticket.update({
        waitingQuestion: false,
        questionNodeId: null,
        questionOptions: null,
        timeoutEnabled: false,
        timeoutAt: null
      });

      console.log(`[WaitQuestion] Timeout executado para ticket ${data.ticketId}, ação: ${data.action}`);

      // Executar ação baseada no tipo
      switch (data.action) {
        case "close":
          await ticket.update({
            status: "closed"
          });
          console.log(`[WaitQuestion] Ticket ${data.ticketId} fechado por timeout`);
          break;

        case "transfer":
          if (data.transferQueueId) {
            await ticket.update({
              queueId: data.transferQueueId,
              userId: null // Remover atendente atual
            });
            console.log(`[WaitQuestion] Ticket ${data.ticketId} transferido para fila ${data.transferQueueId} por timeout`);
          }
          break;

        case "continue":
          // Continuar fluxo pelo handle de timeout (left)
          await ActionsWebhookService(
            ticket.whatsappId,
            0, // idFlowDb não necessário para continuar
            data.companyId,
            [], // nodes não necessário
            [], // connects não necessário
            data.nodeId, // nextStage = nodeId atual para usar conexão left
            ticket.dataWebhook || {},
            {},
            "",
            "",
            data.ticketId
          );
          console.log(`[WaitQuestion] Fluxo continuado pelo handle de timeout para ticket ${data.ticketId}`);
          break;

        default:
          console.log(`[WaitQuestion] Ação de timeout desconhecida: ${data.action}`);
      }

    } catch (error) {
      console.error(`[WaitQuestion] Erro ao executar timeout:`, error);
    }
  }

  // Normalizar texto para comparação
  static normalizeText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Verificar se resposta match com trigger
  static checkMatch(response: string, trigger: string, matchType: string): boolean {
    const normalizedResponse = this.normalizeText(response);
    const normalizedTrigger = this.normalizeText(trigger);

    if (matchType === "exact") {
      return normalizedResponse === normalizedTrigger;
    } else if (matchType === "contains") {
      return normalizedResponse.includes(normalizedTrigger);
    }

    return false;
  }

  // Processar resposta do usuário
  // Processar resposta do usuário
  static async processResponse(ticketId: number, response: string) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket || !ticket.waitingQuestion) {
        return null;
      }

      const questionOptions = ticket.questionOptions as any;
      if (!questionOptions || !questionOptions.optionX || !questionOptions.optionY) {
        return null;
      }

      // Salvar nodeId antes de limpar estado (clearWaitingState seta questionNodeId=null)
      const savedNodeId = ticket.questionNodeId;

      // Verificar match com opção X (suportar múltiplas palavras-chave)
      const optionXKeywords = questionOptions.optionX.keywords || [questionOptions.optionX.label || questionOptions.optionX.trigger].filter(k => k && k.trim());
      if (optionXKeywords.some(keyword => this.checkMatch(response, keyword, "contains"))) {
        await this.clearWaitingState(ticket);
        return {
          option: "x",
          action: questionOptions.optionX.action,
          nodeId: savedNodeId
        };
      }

      // Verificar match com opção Y (suportar múltiplas palavras-chave)
      const optionYKeywords = questionOptions.optionY.keywords || [questionOptions.optionY.label || questionOptions.optionY.trigger].filter(k => k && k.trim());
      if (optionYKeywords.some(keyword => this.checkMatch(response, keyword, "contains"))) {
        await this.clearWaitingState(ticket);
        return {
          option: "y",
          action: questionOptions.optionY.action,
          nodeId: savedNodeId
        };
      }

      // Nenhuma opção match - incrementar contador de tentativas
      const attemptCount = (ticket.questionAttempts || 0) + 1;
      await ticket.update({ questionAttempts: attemptCount });
      
      console.log(`[WaitQuestion] Resposta não reconhecida. Tentativa ${attemptCount} de ${ticket.maxQuestionAttempts || 3}`);
      
      // Verificar se atingiu limite de tentativas
      if (attemptCount >= (ticket.maxQuestionAttempts || 3)) {
        console.log(`[WaitQuestion] Limite de tentativas atingido. Encerrando espera.`);
        await this.clearWaitingState(ticket);
        return {
          option: "timeout",
          action: questionOptions.timeoutAction || "continue",
          nodeId: savedNodeId
        };
      }

      return null; // Continuar esperando
    } catch (error) {
      console.error("[WaitQuestion] Erro ao processar resposta:", error);
      return null;
    }
  }

  // Limpar estado de espera
  static async clearWaitingState(ticket: Ticket) {
    await ticket.update({
      waitingQuestion: false,
      questionNodeId: null,
      questionOptions: null,
      timeoutEnabled: false,
      timeoutAt: null,
      questionAttempts: 0
    });
  }
}

export default WaitQuestionService;
