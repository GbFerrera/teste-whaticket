import { FlowBuilderModel } from "../../models/FlowBuilder";
import AppError from "../../errors/AppError";

interface TestFlowData {
  flowId: number;
  message: string;
  contactNumber: string;
  contactName: string;
  companyId: number;
}

interface TestResult {
  success: boolean;
  response?: string;
  responses?: string[];
  error?: string;
  flowExecuted?: boolean;
  currentNode?: string;
}

const TestFlowBuilderService = async ({
  flowId,
  message,
  contactNumber,
  contactName,
  companyId
}: TestFlowData): Promise<TestResult> => {
  try {
    // 1. Buscar o fluxo no banco
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: flowId,
        company_id: companyId
      }
    });

    if (!flow) {
      throw new AppError("Fluxo não encontrado", 404);
    }

    console.log(`Fluxo encontrado: ${flow.name}`);

    // 2. Verificar se o fluxo está ativo
    if (!flow.active) {
      return {
        success: false,
        error: "Fluxo está inativo",
        flowExecuted: false
      };
    }

    // 3. Processar o fluxo REAL
    const flowData = flow.flow ? JSON.parse(JSON.stringify(flow.flow)) : {};
    
    if (!flowData.nodes || flowData.nodes.length === 0) {
      return {
        success: false,
        error: "Fluxo não possui nós configurados",
        flowExecuted: false
      };
    }

    console.log(`Processando ${flowData.nodes.length} nós do fluxo`);
    console.log(`Mensagem recebida: "${message}"`);

    // 4. Executar fluxo REAL baseado na mensagem do usuário
    const responses: string[] = [];
    
    // Encontrar o nó inicial
    const startNode = flowData.nodes.find((node: any) => node.type === "start");
    if (!startNode) {
      return {
        success: false,
        error: "Fluxo não possui nó inicial",
        flowExecuted: false
      };
    }

    // 5. Processar fluxo baseado na mensagem atual
    let currentNode = startNode;
    let processedNodes = 0;
    const maxNodes = 20; // Limite para evitar loops infinitos

    // Simular estado do fluxo (em produção, isso viria do banco)
    let flowState = {
      currentStep: 0,
      userMessage: message.toLowerCase().trim(),
      variables: flowData.variables || {},
      lastNodeProcessed: startNode.id
    };

    while (currentNode && processedNodes < maxNodes) {
      processedNodes++;
      
      console.log(`Processando nó: ${currentNode.type} - ID: ${currentNode.id}`);

      // Processar based on node type REAL
      switch (currentNode.type) {
        case "start":
          responses.push(`🤖 *Bem-vindo ao fluxo ${flow.name}!*\n\n${currentNode.data?.label || "Como posso ajudar?"}`);
          break;
          
        case "message":
          const messageText = currentNode.data?.label || "Mensagem padrão";
          // Substituir variáveis se existir
          const processedMessage = messageText.replace(/\{(\w+)\}/g, (match: string, varName: string) => {
            return flowState.variables[varName] || match;
          });
          responses.push(processedMessage);
          break;
          
        case "menu":
          const menuOptions = currentNode.data?.options || [];
          if (menuOptions.length > 0) {
            const menuText = menuOptions.map((opt: any, idx: number) => 
              `${idx + 1}. ${opt.text || opt.label}`
            ).join("\n");
            responses.push(`📋 *Menu de opções:*\n${menuText}\n\nDigite o número da opção desejada.`);
          } else {
            responses.push("📋 Menu sem opções configuradas.");
          }
          break;
          
        case "question":
          const questionText = currentNode.data?.question || currentNode.data?.label || "Por favor, responda:";
          responses.push(`❓ ${questionText}`);
          break;
          
        case "condition":
          // Avaliar condição REAL baseada na mensagem
          const condition = currentNode.data?.condition;
          let conditionMet = false;
          
          if (condition) {
            // Condições simples baseadas na mensagem
            if (condition.includes("sim") && flowState.userMessage.includes("sim")) {
              conditionMet = true;
            } else if (condition.includes("não") && flowState.userMessage.includes("nao")) {
              conditionMet = true;
            } else if (condition.includes("oi") && flowState.userMessage.includes("oi")) {
              conditionMet = true;
            } else if (condition.includes("1") && flowState.userMessage.includes("1")) {
              conditionMet = true;
            } else if (condition.includes("2") && flowState.userMessage.includes("2")) {
              conditionMet = true;
            }
          }
          
          responses.push(`🔍 *Condição avaliada:* ${condition}\n\n*Resultado:* ${conditionMet ? "✅ Verdadeiro" : "❌ Falso"}`);
          break;
          
        case "openai":
        case "directOpenai":
          const openAiPrompt = currentNode.data?.prompt || currentNode.data?.label || "Responda como assistente";
          responses.push(`🤖 *Agente IA ativado*\n\n*Prompt:* ${openAiPrompt}\n\n*Sua mensagem:* "${message}"\n\n*(Em produção, aqui seria a resposta real da OpenAI)*`);
          break;
          
        case "typebot":
          const typebotUrl = currentNode.data?.url || currentNode.data?.typebotId;
          responses.push(`🤖 *TypeBot integrado*\n\n*URL:* ${typebotUrl || "Não configurado"}\n\n*Sua mensagem:* "${message}"\n\n*(Em produção, aqui seria a resposta real do TypeBot)*`);
          break;
          
        case "file":
          const fileUrl = currentNode.data?.url || "Arquivo não disponível";
          responses.push(`📎 *Arquivo enviado*\n\n${currentNode.data?.label || "Arquivo"}\n\n*Link:* ${fileUrl}`);
          break;
          
        case "img":
        case "image":
          const imageUrl = currentNode.data?.url || "Imagem não disponível";
          responses.push(`🖼️ *Imagem enviada*\n\n${currentNode.data?.label || "Imagem"}\n\n*Link:* ${imageUrl}`);
          break;
          
        case "audio":
          const audioUrl = currentNode.data?.url || "Áudio não disponível";
          responses.push(`🎵 *Áudio enviado*\n\n${currentNode.data?.label || "Áudio"}\n\n*Link:* ${audioUrl}`);
          break;
          
        case "video":
          const videoUrl = currentNode.data?.url || "Vídeo não disponível";
          responses.push(`🎥 *Vídeo enviado*\n\n${currentNode.data?.label || "Vídeo"}\n\n*Link:* ${videoUrl}`);
          break;
          
        case "interval":
          const intervalTime = currentNode.data?.time || "5";
          responses.push(`⏱️ *Intervalo de ${intervalTime} segundos*\n\n*(Em produção, haveria uma pausa real)*`);
          break;
          
        case "randomizer":
          const randomOptions = currentNode.data?.options || ["Opção 1", "Opção 2"];
          const randomIndex = Math.floor(Math.random() * randomOptions.length);
          responses.push(`🎲 *Randomizador*\n\n*Opção selecionada:* ${randomOptions[randomIndex]}`);
          break;
          
        case "transferFlow":
          const targetFlow = currentNode.data?.flowId || "Não definido";
          responses.push(`🔄 *Transferência de fluxo*\n\n*Fluxo destino:* ${targetFlow}\n\n*(Em produção, transferiria para o fluxo especificado)*`);
          break;
          
        case "apiRequest":
          const apiUrl = currentNode.data?.url || "Não definido";
          responses.push(`🌐 *Requisição API*\n\n*URL:* ${apiUrl}\n\n*Method:* ${currentNode.data?.method || "GET"}\n\n*(Em produção, faria a requisição real)*`);
          break;
          
        case "addTag":
          const tagName = currentNode.data?.tag || "Não definida";
          responses.push(`🏷️ *Tag adicionada*\n\n*Tag:* ${tagName}\n\n*(Em produção, adicionaria a tag ao contato)*`);
          break;
          
        case "closeTicket":
          responses.push(`✅ *Ticket encerrado*\n\n*(Em produção, encerraria o ticket atual)*`);
          break;
          
        default:
          responses.push(`📝 *Nó processado: ${currentNode.type}*\n\n${currentNode.data?.label || "Sem configuração"}`);
          break;
      }

      // Encontrar próximo nó baseado nas edges
      const nextEdge = flowData.edges?.find((edge: any) => edge.source === currentNode.id);
      if (nextEdge) {
        currentNode = flowData.nodes.find((node: any) => node.id === nextEdge.target);
      } else {
        break; // Fim do fluxo
      }
    }

    // 6. Retornar resultado
    if (responses.length === 0) {
      return {
        success: false,
        error: "Fluxo executado mas não gerou respostas",
        flowExecuted: true
      };
    }

    return {
      success: true,
      responses: responses,
      flowExecuted: true,
      response: responses[responses.length - 1], // Última resposta como principal
      currentNode: currentNode?.id
    };

  } catch (error) {
    console.error("Erro em TestFlowBuilderService:", error);
    
    if (error instanceof AppError) {
      throw error;
    }

    return {
      success: false,
      error: error.message || "Erro interno ao processar fluxo",
      flowExecuted: false
    };
  }
};

export default TestFlowBuilderService;
