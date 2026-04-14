import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import logger from "../../utils/logger";
import { buildGeminiToolDeclarationsFromCatalog } from "./AiToolGenerators";
import type { ToolArgs, ToolResult } from "./OpenAiTools";
import { proto } from "@whiskeysockets/baileys";

// Definição das ferramentas para o Gemini (geradas a partir do catálogo)
export const geminiTools: FunctionDeclaration[] = buildGeminiToolDeclarationsFromCatalog();

// NOTA: As declarações das tools agora vêm do AiToolCatalog.ts (single source of truth)
// Para adicionar/modificar tools, edite AiToolCatalog.ts

// Função para executar as ferramentas do Gemini (reutiliza a lógica do OpenAI)
export async function executeGeminiTool(
  toolName: string,
  args: any,
  ticket: Ticket,
  contact: Contact,
  availableTags: string[],
  allQueues: Queue[],
  allowedTools?: string[] | null,
  wbot?: any,
  msg?: proto.IWebMessageInfo
): Promise<ToolResult> {
  const { executeOpenAiTool } = await import("./OpenAiTools");
  return executeOpenAiTool(toolName, args, ticket, contact, availableTags, allQueues, allowedTools, wbot, msg);
}

// Função para obter instruções sobre as ferramentas (formato Gemini)
export function getGeminiToolInstructions(availableTags: string[], queueNames: string[]): string {
  return `
FERRAMENTAS DISPONÍVEIS NO GEMINI:

1. FORMATAR MENSAGEM (format_message):
   - Use para personalizar mensagens com variáveis dinâmicas.
   - Variáveis disponíveis:
     * {{ms}} - Saudação automática (Bom dia/tarde/noite/madrugada)
     * {{name}} / {{firstName}} - Nome completo ou primeiro nome do contato
     * {{userName}} - Nome do atendente atual
     * {{date}} - Data atual
     * {{ticket_id}} - Número do chamado
     * {{queue}} - Nome da fila/setor (configuradas: ${queueNames.join(", ") || "nenhuma"})
     * {{connection}} - Nome da conexão WhatsApp
     * {{protocol}} - Protocolo único do atendimento
     * {{hora}} - Hora atual (HH:MM:SS)
   - Exemplo: "{{ms}} {{firstName}}! Seu protocolo é {{protocol}}"

2. EXECUTAR COMANDO (execute_command):
   - ÚNICA forma de transferir fila/usuário, adicionar tag ou encerrar tickets via Gemini.
   - Sempre use JSON entre #{ ... } com os IDs corretos:
     * Transferir fila: #{ "queueId":"5" }
     * Transferir para atendente: #{ "queueId":"5", "userId":"12" }
     * Transferência direta para usuário: #{ "userId":"12" }
     * Adicionar tag: #{ "tagId":"14" }
     * Encerrar ticket: #{ "closeTicket":"1" }
     * Combinado: #{ "queueId":"5", "userId":"12", "tagId":"14" }
   - Tags disponíveis: ${availableTags.join(", ") || "nenhuma"} (não invente novas).

3. ENVIAR PRODUTO (send_product):
   - Use para enviar informações de produtos ao cliente
   - Inclui imagem principal, galeria de imagens, nome, preço e descrição
   - Evite reenviar o MESMO produto várias vezes

4. OUTRAS FERRAMENTAS:
   - like_message: Envia reação/curtida
   - send_emoji: Envia emoji
   - send_contact_file: Envia arquivo do contato
   - get_company_schedule: Obtém horário de funcionamento
   - get_contact_schedules: Lista agendamentos
   - create_contact_schedule: Cria agendamento
   - update_contact_schedule: Atualiza agendamento
   - get_contact_info: Obtém dados do contato
   - update_contact_info: Atualiza dados do contato
   - get_company_groups: Lista grupos disponíveis
   - send_group_message: Envia mensagem para grupo
   - list_professionals: Lista profissionais disponíveis

REGRAS IMPORTANTES:
- Ferramentas antigas (transfer_queue, transfer_user, add_tag) foram removidas. Use execute_command com JSON.
- Utilize somente IDs confirmados nas instruções personalizadas ou no prompt.
- Se não tiver certeza do ID, peça confirmação antes de executar.
- Use format_message para textos; execute_command para QUALQUER ação administrativa.
`;
}

// Função para converter resposta do Gemini para o formato esperado
export function parseGeminiToolCall(functionCall: any): { name: string; args: any } {
  return {
    name: functionCall.name,
    args: functionCall.args || {}
  };
}

// Função para validar se uma ferramenta existe
export function isValidGeminiTool(toolName: string): boolean {
  return geminiTools.some(tool => tool.name === toolName);
}