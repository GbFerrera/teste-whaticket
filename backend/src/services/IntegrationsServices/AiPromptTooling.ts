import { AI_TOOL_CATALOG } from "./AiToolCatalog";

export type AiToolingFerramenta = {
  nome: string;
  descricao?: string;
  metodo: string;
  url: string;
  placeholders?: string[];
};

export type BuildAiToolingPromptSectionArgs = {
  availableQueues: any[];
  availableTags: string[];
  availableUsers: any[];
  availableProdutos: any[];
  availableFerramentas: AiToolingFerramenta[];
  provider: string;
  getToolInstructions: (availableTags: string[], availableQueues: string[]) => string;
  getGeminiToolInstructions: (availableTags: string[], availableQueues: string[]) => string;
};

export const buildAiToolingPromptSection = (args: BuildAiToolingPromptSectionArgs): string => {
  const providerInstructions =
    args.provider === "gemini"
      ? args.getGeminiToolInstructions(args.availableTags, args.availableQueues)
      : args.getToolInstructions(args.availableTags, args.availableQueues);

  const ferramentasText = (args.availableFerramentas || [])
    .map(f => {
      const placeholders = Array.isArray(f.placeholders) ? f.placeholders : [];
      return `- Nome: ${f.nome} | Método: ${f.metodo} | URL: ${f.url} | Placeholders: ${JSON.stringify(placeholders)} | Descrição: ${f.descricao || "(sem descrição)"}`;
    })
    .join("\n");

  // Gerar instruções das tools dinamicamente a partir do catálogo
  const toolsInstructions = AI_TOOL_CATALOG
    .map((tool, index) => {
      return `${index + 1}) ${tool.name}
Quando usar: ${tool.whenToUse}
Como usar: ${tool.howToUse}`;
    })
    .join("\n\n");

  // Gerar lista detalhada de filas com IDs
  const queuesList = (args.availableQueues || [])
    .map((queue: any) => `- ID: ${queue.id} | Nome: "${queue.name}" | Cor: ${queue.color || "(sem cor)"}`)
    .join("\n");

  // Gerar lista detalhada de usuários com IDs
  const usersList = (args.availableUsers || [])
    .map((user: any) => `- ID: ${user.id} | Nome: "${user.name}" | Email: ${user.email || "(sem email)"}`)
    .join("\n");

  return `🔧 FERRAMENTAS DISPONÍVEIS (FUNCTIONS/TOOLS)

REGRAS GERAIS (OBRIGATÓRIO):
1) Você só pode executar UMA tool se a ação estiver permitida/solicitada nas INSTRUÇÕES PERSONALIZADAS do prompt (definidas no frontend). Se não estiver pedido lá, NÃO execute.
2) Se você executar uma tool, NUNCA informe o cliente que executou (isso é uma ação interna). Apenas continue a conversa normalmente.
3) Se a ação for necessária e estiver pedida/permitida nas instruções personalizadas, execute imediatamente (sem enrolar).
4) Nunca escreva "Ação:" ou "Estou executando…".
5) SE UM ID NÃO FOR ENCONTRADO, verifique nas listas abaixo o ID correto antes de tentar novamente.

TOOLS (quando usar / como usar):

${toolsInstructions}

📋 RECURSOS DISPONÍVEIS COM IDs:

FILAS (queueId):
${queuesList}

USUÁRIOS (userId):
${usersList}

Tags disponíveis: ${JSON.stringify(args.availableTags)}
Produtos disponíveis: ${JSON.stringify(args.availableProdutos)}
Ferramentas disponíveis (APIs externas):
${ferramentasText}

⚠️ IMPORTANTE: Use os IDs exatos das listas acima. Se não encontrar um ID, verifique se há um ID similar correto nas listas.

Observação: para horários de funcionamento e agendamentos do contato, utilize as funções get_company_schedule, get_contact_schedules, create_contact_schedule e update_contact_schedule quando necessário.

${providerInstructions}`;
};
