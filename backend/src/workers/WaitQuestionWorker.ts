import WaitQuestionService from "../services/FlowBuilderService/WaitQuestionService";

// Worker para enviar perguntas do waitQuestion
const waitQuestionSendQuestion = {
  key: "WaitQuestion/SendQuestion",
  async handle({ data }) {
    try {
      console.log(`[WaitQuestionWorker] Enviando pergunta para ticket ${data.ticketId}`);
      await WaitQuestionService.sendQuestion(data);
      console.log(`[WaitQuestionWorker] Pergunta enviada com sucesso para ticket ${data.ticketId}`);
    } catch (error) {
      console.error(`[WaitQuestionWorker] Erro ao enviar pergunta:`, error);
      throw error;
    }
  }
};

// Worker para executar ações de timeout
const waitQuestionTimeoutAction = {
  key: "WaitQuestion/TimeoutAction",
  async handle({ data }) {
    try {
      console.log(`[WaitQuestionWorker] Executando timeout para ticket ${data.ticketId}`);
      await WaitQuestionService.executeTimeoutAction(data);
      console.log(`[WaitQuestionWorker] Timeout executado com sucesso para ticket ${data.ticketId}`);
    } catch (error) {
      console.error(`[WaitQuestionWorker] Erro ao executar timeout:`, error);
      throw error;
    }
  }
};

export default waitQuestionSendQuestion;
export { waitQuestionSendQuestion, waitQuestionTimeoutAction };
