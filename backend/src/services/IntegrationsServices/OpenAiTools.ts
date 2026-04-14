import Tag from "../../models/Tag";
import Queue from "../../models/Queue";
import TicketTag from "../../models/TicketTag";
import ContactTag from "../../models/ContactTag";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Ferramenta from "../../models/Ferramenta";

import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import ListProfissionaisService from "../ProfissionalService/ListProfissionaisService";
import { buildOpenAiToolDeclarationsFromCatalog } from "./AiToolGenerators";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { getWbot } from "../../libs/wbot";
import { proto } from "@whiskeysockets/baileys";

// Definição das ferramentas disponíveis para a IA (geradas a partir do catálogo)
export const openAiTools = buildOpenAiToolDeclarationsFromCatalog();

// NOTA: As declarações das tools agora vêm do AiToolCatalog.ts (single source of truth)
// Para adicionar/modificar tools, edite AiToolCatalog.ts

// Interface para os argumentos das ferramentas
export interface ToolArgs {
  message?: string;
  variables?: Record<string, any>;
  command?: string;
  queueId?: string;
  userId?: string;
  tagId?: string;
  closeTicket?: boolean;
  commands?: any[];
  service_name?: string;
  weekday?: string;
  only_active?: boolean;
  limit?: number;
  productId?: number;
  quantity?: number;
  ferramentaNome?: string;
  placeholders?: Record<string, any>;
  emoji?: string;
  filename?: string;
  scope?: string;
  contact_id?: number;
  search?: string;
  page?: number;
  datetime?: string;
  schedule_id?: number;
  name?: string;
  email?: string;
  number?: string;
  cpfCnpj?: string;
  address?: string;
  birthday?: string;
  anniversary?: string;
  info?: string;
  extra_info?: Array<{ name: string; value: string }>;
  group_id?: string;
  alias?: string;
  pergunta?: string;
  pauseBot?: string | number;
  sendLocation?: string;
  latitude?: string;
  longitude?: string;
  locationName?: string;
  jumpToNode?: string;
  notifyUser?: string | number;
  notifyMessage?: string;
  validateCPF?: string;
  validateEmail?: string;
  validatePhone?: string;
  scheduleMessage?: string;
  messageText?: string;
  [key: string]: any;
}

// Interface para o resultado da execução
export interface ToolResult {
  success: boolean;
  queue?: string;
  tags?: string[];
  note?: string | null;
  reason?: string;
  error?: string;
  formattedMessage?: string;
  originalMessage?: string;
  user?: string;
  message?: string;
  commandExecuted?: any;
  professionals?: any[];
  [key: string]: any;
}

// Funções auxiliares de validação
const validateCPFCNPJ = (value: string): { valid: boolean; type: string; formatted: string } => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // Validar CPF
    if (/^(\d)\1{10}$/.test(cleaned)) return { valid: false, type: 'CPF', formatted: value };
    
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cleaned.charAt(i)) * (10 - i);
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return { valid: false, type: 'CPF', formatted: value };
    
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleaned.charAt(i)) * (11 - i);
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return { valid: false, type: 'CPF', formatted: value };
    
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return { valid: true, type: 'CPF', formatted };
  } else if (cleaned.length === 14) {
    // Validar CNPJ
    if (/^(\d)\1{13}$/.test(cleaned)) return { valid: false, type: 'CNPJ', formatted: value };
    
    let sum = 0;
    let pos = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(12))) return { valid: false, type: 'CNPJ', formatted: value };
    
    sum = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(13))) return { valid: false, type: 'CNPJ', formatted: value };
    
    const formatted = cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return { valid: true, type: 'CNPJ', formatted };
  }
  
  return { valid: false, type: 'UNKNOWN', formatted: value };
};

const validateEmailAddress = (email: string): { valid: boolean; email: string } => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { valid: regex.test(email), email };
};

const validatePhoneNumber = (phone: string): { valid: boolean; formatted: string; ddd: string } => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Validar formato brasileiro: DDD (2 dígitos) + número (8 ou 9 dígitos)
  if (cleaned.length === 10 || cleaned.length === 11) {
    const ddd = cleaned.substring(0, 2);
    const number = cleaned.substring(2);
    
    let formatted = '';
    if (cleaned.length === 11) {
      formatted = `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
    } else {
      formatted = `(${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`;
    }
    
    return { valid: true, formatted, ddd };
  }
  
  return { valid: false, formatted: phone, ddd: '' };
};

// Função para executar as ferramentas
const normalizeToolName = (name?: string | null): string | null =>
  name ? name.trim().toLowerCase() : null;

const buildAllowedToolSet = (allowedTools?: string[] | null): Set<string> | null => {
  if (!allowedTools || allowedTools.length === 0) {
    return null;
  }
  const normalized = allowedTools
    .map(tool => normalizeToolName(tool))
    .filter(Boolean) as string[];
  return new Set(normalized);
};

export async function executeOpenAiTool(
  toolName: string,
  args: ToolArgs,
  ticket: Ticket,
  contact: Contact,
  availableTags: string[],
  allQueues: Queue[],
  allowedTools?: string[] | null,
  wbot?: any,
  msg?: proto.IWebMessageInfo
): Promise<ToolResult> {
  let result: ToolResult = { success: false };
  const allowedSet = buildAllowedToolSet(allowedTools);
  const normalizedToolName = normalizeToolName(toolName);

  try {
    if (allowedSet && (!normalizedToolName || !allowedSet.has(normalizedToolName))) {
      logger.warn(
        `[TOOLS] Execução bloqueada para tool "${toolName}" no ticket ${ticket.id} (companyId=${ticket.companyId})`
      );
      return {
        success: false,
        reason: "Ferramenta desabilitada para este prompt/empresa"
      };
    }

    switch (toolName) {
      case "execute_command":
        try {
          let commandData: any = {};
          
          if (args.command) {
            const commandMatch = args.command.match(/#\{([^}]+)\}/);
            if (commandMatch) {
              try {
                commandData = JSON.parse(`{${commandMatch[1]}}`);
              } catch (parseError) {
                logger.error(`Erro ao fazer parse do comando: ${args.command}`, parseError);
                result = { success: false, error: "Formato de comando inválido" };
                break;
              }
            }
          }
          
          if (args.queueId) commandData.queueId = args.queueId;
          if (args.userId) commandData.userId = args.userId;
          if (args.tagId) commandData.tagId = args.tagId;
          if (args.closeTicket) commandData.closeTicket = "1";
          
          const results: string[] = [];
          
          // Processar userId direto (transferência para usuário sem fila)
          if (commandData.userId && !commandData.queueId) {
            const userId = parseInt(commandData.userId);
            const user = await User.findOne({
              where: { id: userId, companyId: ticket.companyId }
            });
            
            if (user) {
              ticket.userId = userId;
              // Mantém status como "pending" - só muda para "open" quando usuário aceitar manualmente
              // ticket.status = "open"; // REMOVIDO: não muda status automaticamente
              await ticket.save();
              results.push(`Transferido para ${user.name} (aguardando aceitação)`);
              
              getIO()
                .of(String(ticket.companyId))
                .emit(`company-${ticket.companyId}-ticket`, {
                  action: "update",
                  ticket
                });
            } else {
              results.push(`Usuário ID ${userId} não encontrado`);
            }
          }
          
          if (commandData.queueId) {
            const queueId = parseInt(commandData.queueId);
            const queue = allQueues.find(q => q.id === queueId && q.companyId === ticket.companyId);
            
            if (queue) {
              // Não sobrescrever flowStopped se já foi definido por call_flow_builder
              if (!ticket.flowStopped) {
                ticket.queueId = queueId;
              }
              results.push(`Fila alterada para ${queue.name}`);
              
              if (commandData.userId) {
                const userId = parseInt(commandData.userId);
                const user = await User.findOne({
                  where: { id: userId, companyId: ticket.companyId }
                });
                
                if (user) {
                  ticket.userId = userId;
                  results.push(`Atendente alterado para ${user.name}`);
                } else {
                  results.push(`Usuário ID ${userId} não encontrado`);
                }
              }
              
              await ticket.save();
              
              getIO()
                .of(String(ticket.companyId))
                .emit(`company-${ticket.companyId}-ticket`, {
                  action: "update",
                  ticket
                });
            } else {
              results.push(`Fila ID ${queueId} não encontrada`);
            }
          }
          
          if (commandData.tagId) {
            const tagId = parseInt(commandData.tagId);
            const tag = await Tag.findOne({
              where: { id: tagId, companyId: ticket.companyId }
            });
            
            if (tag) {
              await TicketTag.findOrCreate({
                where: { ticketId: ticket.id, tagId: tag.id }
              });
              await ContactTag.findOrCreate({
                where: { contactId: contact.id, tagId: tag.id }
              });
              results.push(`Tag "${tag.name}" adicionada`);
              
              const updatedTicket = await Ticket.findByPk(ticket.id, {
                include: [
                  { model: Tag, as: "tags", attributes: ["id", "name", "color"] },
                  { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
                  { model: User, as: "user", attributes: ["id", "name"] },
                  { model: Queue, as: "queue", attributes: ["id", "name", "color"] }
                ]
              });
              
              if (updatedTicket) {
                const ticketJSON = updatedTicket.toJSON() as any;
                if (!ticketJSON.tags) ticketJSON.tags = [];
                ticketJSON.tags = ticketJSON.tags.filter((tag: any) => tag && tag.name);
                
                getIO()
                  .of(String(ticket.companyId))
                  .emit(`company-${ticket.companyId}-ticket`, {
                    action: "update",
                    ticket: ticketJSON
                  });
              }
            } else {
              results.push(`Tag ID ${tagId} não encontrada`);
            }
          }
          
          if (commandData.closeTicket === "1" || commandData.closeTicket === true) {
            ticket.status = "closed";
            await ticket.save();
            results.push("Atendimento finalizado");
            
            getIO()
              .of(String(ticket.companyId))
              .emit(`company-${ticket.companyId}-ticket`, {
                action: "delete",
                ticketId: ticket.id
              });
          }
          
          result = {
            success: results.length > 0 && !results.some(r => r.includes("não encontrado")),
            message: results.join(", "),
            commandExecuted: commandData
          };
          
          logger.info(`Comando executado: ${JSON.stringify(commandData)}`);
        } catch (error) {
          logger.error(`Erro ao executar comando:`, error);
          result = {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao executar comando"
          };
        }
        break;

      case "execute_multiple_commands":
        try {
          if (!args.commands || !Array.isArray(args.commands)) {
            result = { success: false, error: "commands deve ser um array" };
            break;
          }

          const allResults: string[] = [];
          let allSuccessful = true;

          for (const cmd of args.commands) {
            const cmdResult = await executeOpenAiTool(
              "execute_command",
              cmd,
              ticket,
              contact,
              availableTags,
              allQueues,
              allowedTools,
              wbot,
              msg
            );

            if (cmdResult.message) {
              allResults.push(cmdResult.message);
            }

            if (!cmdResult.success) {
              allSuccessful = false;
            }
          }

          result = {
            success: allSuccessful,
            message: allResults.join("; "),
            commandsExecuted: args.commands.length
          };

          logger.info(`Múltiplos comandos executados: ${args.commands.length} comandos`);
        } catch (error) {
          logger.error(`Erro ao executar múltiplos comandos:`, error);
          result = {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao executar múltiplos comandos"
          };
        }
        break;

      case "list_available_tools":
        try {
          const activeTools = await Ferramenta.findAll({
            where: { 
              companyId: ticket.companyId,
              status: 'ativo'
            },
            order: [["nome", "ASC"]]
          });

          const normalizePlaceholderList = (rawValue: any): string[] => {
            if (!rawValue) return [];
            
            if (Array.isArray(rawValue)) {
              return rawValue
                .map(item => {
                  if (typeof item === 'string') return item.trim();
                  if (item && typeof item === 'object') {
                    return item.key || item.name || item.placeholder || '';
                  }
                  return '';
                })
                .filter(Boolean);
            }
            
            if (typeof rawValue === 'object') {
              return Object.keys(rawValue).filter(key => key.trim());
            }
            
            return [];
          };

          const toolsList = activeTools.map(t => ({
            nome: t.nome,
            descricao: t.descricao || 'Sem descrição',
            metodo: t.metodo,
            placeholders: normalizePlaceholderList(t.placeholders)
          }));

          result = {
            success: true,
            tools: toolsList,
            count: toolsList.length,
            message: `${toolsList.length} ferramenta(s) disponível(is)`
          };

          logger.info(`[TOOLS] Listadas ${toolsList.length} ferramentas ativas para companyId ${ticket.companyId}`);
        } catch (error) {
          logger.error(`[TOOLS] Erro ao listar ferramentas:`, error);
          result = {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao listar ferramentas"
          };
        }
        break;

      case "call_prompt_agent":
        if (!args.alias || !args.pergunta) {
          result = {
            success: false,
            reason: "Parâmetros 'alias' e 'pergunta' são obrigatórios"
          };
        } else {
          logger.info(
            `call_prompt_agent solicitado com alias=${args.alias} para ticket ${ticket.id}`
          );
          result = {
            success: true,
            message: "Solicitação registrada. Será tratada pelo orquestrador de IA."
          } as any;
        }
        break;

      case "call_flow_builder":
        try {
          const flowId = parseInt(args.flowId);
          
          if (!flowId || isNaN(flowId)) {
            result = { success: false, error: "flowId inválido ou não fornecido" };
            break;
          }

          // Implementação exata como o nó transferFlow
          console.log(`TransferFlow: Transferindo para fluxo ID ${flowId}`);
          
          const { FlowBuilderModel } = await import("../../models/FlowBuilder");
          const targetFlow = await FlowBuilderModel.findOne({
            where: { id: flowId, company_id: ticket.companyId }
          });
          
          if (targetFlow && targetFlow.flow) {
            console.log(`TransferFlow: Fluxo encontrado, processando dados...`);
            const flowData = typeof targetFlow.flow === 'string' 
              ? JSON.parse(targetFlow.flow) 
              : targetFlow.flow;
            
            const newNodes = flowData.nodes || [];
            const newConnects = flowData.connections || [];
            
            console.log(`TransferFlow: Nó encontrados: ${newNodes.length}, Conexões: ${newConnects.length}`);
            
            // Encontrar o nó de início do novo fluxo
            const startNode = newNodes.find((n: any) => n.type === "start");
            
            console.log(`TransferFlow: Nó start encontrado: ${startNode ? startNode.id : 'NÃO'}`);
            
            if (startNode) {
              // Encontrar a conexão que sai do start
              const startConnection = newConnects.find((c: any) => c.source === startNode.id);
              
              console.log(`TransferFlow: Conexão start encontrada: ${startConnection ? startConnection.target : 'NÃO'}`);
              
              if (startConnection) {
                // Gerar hash do fluxo
                const crypto = require('crypto');
                const hashWebhookId = crypto.randomBytes(6).toString('hex');
                
                // Atualizar ticket com novo fluxo (exatamente como o nó)
                await ticket.update({
                  flowWebhook: true,
                  lastFlowId: startConnection.target,  // Próximo nó do fluxo
                  hashFlowId: hashWebhookId,           // Hash do fluxo
                  flowStopped: flowId.toString()
                });
                
                // Criar details com estrutura correta para ActionsWebhookService
                const flowDetails = {
                  inputs: [],
                  keysFull: []
                };
                
                // Executar o novo fluxo recursivamente (como o nó)
                const { ActionsWebhookService } = await import("../WebhookService/ActionsWebhookService");
                await ActionsWebhookService(
                  ticket.whatsappId,
                  flowId,
                  ticket.companyId,
                  newNodes,
                  newConnects,
                  startConnection.target,
                  {},
                  flowDetails,
                  hashWebhookId,
                  undefined,
                  ticket.id,
                  "",
                  msg
                );
                
                // Retornar sucesso silencioso
                result = { 
                  success: true,
                  silent: true,
                  message: `TransferFlow: Cliente transferido para o flow builder ${flowId}`
                };
                
                console.log(`TransferFlow: Cliente transferido para o flow builder ${flowId}`);
              } else {
                result = { success: false, error: "Conexão de início não encontrada no fluxo" };
              }
            } else {
              result = { success: false, error: "Nó de início não encontrado no fluxo" };
            }
          } else {
            result = { success: false, error: "Fluxo não encontrado" };
          }
        } catch (error) {
          console.error(`TransferFlow: Erro ao transferir para flow builder:`, error);
          result = { success: false, error: "Erro ao transferir para fluxo" };
        }
        break;

      case "pause_bot":
        try {
          const pauseMinutes = parseInt(String(args.pauseBot));
          const pauseUntil = new Date(Date.now() + pauseMinutes * 60 * 1000);
          
          await ticket.update({
            isBot: false,
            botPausedUntil: pauseUntil
          });
          
          result = {
            success: true,
            message: `Bot pausado por ${pauseMinutes} minutos até ${pauseUntil.toLocaleTimeString('pt-BR')}`
          };
          
          logger.info(`Bot pausado para ticket ${ticket.id} por ${pauseMinutes} minutos`);
        } catch (error) {
          logger.error(`Erro ao pausar bot:`, error);
          result = { success: false, error: "Erro ao pausar bot" };
        }
        break;

      case "send_location":
        try {
          if (!wbot) {
            result = { success: false, error: "WhatsApp bot não disponível" };
            break;
          }
          
          const locationData = args.sendLocation || "";
          const [lat, lng, name] = locationData.split(",").map(s => s.trim());
          
          if (!lat || !lng) {
            result = { success: false, error: "Latitude e longitude são obrigatórias" };
            break;
          }
          
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          
          if (isNaN(latitude) || isNaN(longitude)) {
            result = { success: false, error: "Latitude ou longitude inválidas" };
            break;
          }
          
          await wbot.sendMessage(msg?.key.remoteJid!, {
            location: {
              degreesLatitude: latitude,
              degreesLongitude: longitude,
              name: name || "Localização"
            }
          });
          
          result = {
            success: true,
            message: `Localização enviada: ${name || "Localização"}`,
            latitude,
            longitude
          };
          
          logger.info(`Localização enviada para ticket ${ticket.id}`);
        } catch (error) {
          logger.error(`Erro ao enviar localização:`, error);
          result = { success: false, error: "Erro ao enviar localização" };
        }
        break;

      case "jump_to_node":
        try {
          const nodeId = args.jumpToNode;
          
          if (!nodeId) {
            result = { success: false, error: "ID do nó não fornecido" };
            break;
          }
          
          await ticket.update({
            lastFlowId: nodeId
          });
          
          result = {
            success: true,
            message: `Fluxo redirecionado para nó ${nodeId}`,
            nodeId
          };
          
          logger.info(`Fluxo redirecionado para nó ${nodeId} no ticket ${ticket.id}`);
        } catch (error) {
          logger.error(`Erro ao pular para nó:`, error);
          result = { success: false, error: "Erro ao redirecionar fluxo" };
        }
        break;

      case "notify_user":
        try {
          const notifyUserId = parseInt(String(args.notifyUser));
          const notifyMsg = args.notifyMessage || "Notificação do sistema";
          
          const userToNotify = await User.findOne({
            where: { id: notifyUserId, companyId: ticket.companyId }
          });
          
          if (!userToNotify) {
            result = { success: false, error: `Usuário ID ${notifyUserId} não encontrado` };
            break;
          }
          
          getIO()
            .of(String(ticket.companyId))
            .to(`user-${notifyUserId}`)
            .emit(`company-${ticket.companyId}-notification`, {
              action: "notify",
              ticketId: ticket.id,
              userId: notifyUserId,
              message: notifyMsg,
              timestamp: new Date()
            });
          
          result = {
            success: true,
            message: `Notificação enviada para ${userToNotify.name}`,
            userId: notifyUserId
          };
          
          logger.info(`Notificação enviada para usuário ${notifyUserId} sobre ticket ${ticket.id}`);
        } catch (error) {
          logger.error(`Erro ao notificar usuário:`, error);
          result = { success: false, error: "Erro ao enviar notificação" };
        }
        break;

      case "validate_cpf":
        try {
          const cpfValue = args.validateCPF || "";
          const validation = validateCPFCNPJ(cpfValue);
          
          result = {
            success: true,
            valid: validation.valid,
            type: validation.type,
            formatted: validation.formatted,
            message: validation.valid 
              ? `${validation.type} válido: ${validation.formatted}` 
              : `${validation.type} inválido`
          };
          
          logger.info(`Validação de CPF/CNPJ: ${validation.valid ? 'válido' : 'inválido'}`);
        } catch (error) {
          logger.error(`Erro ao validar CPF/CNPJ:`, error);
          result = { success: false, error: "Erro ao validar CPF/CNPJ" };
        }
        break;

      case "validate_email":
        try {
          const emailValue = args.validateEmail || "";
          const validation = validateEmailAddress(emailValue);
          
          result = {
            success: true,
            valid: validation.valid,
            email: validation.email,
            message: validation.valid 
              ? `Email válido: ${validation.email}` 
              : `Email inválido: ${validation.email}`
          };
          
          logger.info(`Validação de email: ${validation.valid ? 'válido' : 'inválido'}`);
        } catch (error) {
          logger.error(`Erro ao validar email:`, error);
          result = { success: false, error: "Erro ao validar email" };
        }
        break;

      case "validate_phone":
        try {
          const phoneValue = args.validatePhone || "";
          const validation = validatePhoneNumber(phoneValue);
          
          result = {
            success: true,
            valid: validation.valid,
            formatted: validation.formatted,
            ddd: validation.ddd,
            message: validation.valid 
              ? `Telefone válido: ${validation.formatted}` 
              : `Telefone inválido: ${validation.formatted}`
          };
          
          logger.info(`Validação de telefone: ${validation.valid ? 'válido' : 'inválido'}`);
        } catch (error) {
          logger.error(`Erro ao validar telefone:`, error);
          result = { success: false, error: "Erro ao validar telefone" };
        }
        break;

      case "schedule_message":
        try {
          const scheduleTime = args.scheduleMessage;
          const messageContent = args.messageText;
          
          if (!scheduleTime || !messageContent) {
            result = { success: false, error: "Data/hora e mensagem são obrigatórias" };
            break;
          }
          
          const scheduledDate = new Date(scheduleTime);
          
          if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
            result = { success: false, error: "Data/hora inválida ou no passado" };
            break;
          }
          
          // TODO: Implementar tabela de agendamentos ou usar job scheduler
          // Por enquanto, apenas retorna sucesso com informações
          result = {
            success: true,
            message: `Mensagem agendada para ${scheduledDate.toLocaleString('pt-BR')}`,
            scheduledFor: scheduledDate.toISOString(),
            messageText: messageContent,
            note: "Funcionalidade de agendamento em desenvolvimento"
          };
          
          logger.info(`Mensagem agendada para ${scheduledDate.toISOString()} no ticket ${ticket.id}`);
        } catch (error) {
          logger.error(`Erro ao agendar mensagem:`, error);
          result = { success: false, error: "Erro ao agendar mensagem" };
        }
        break;

      case "send_product":
      case "execute_tool":
      case "like_message":
      case "send_contact_file":
      case "send_emoji":
      case "get_company_schedule":
      case "get_contact_schedules":
      case "create_contact_schedule":
      case "update_contact_schedule":
      case "get_contact_info":
      case "update_contact_info":
      case "get_company_groups":
      case "send_group_message":
      case "allow_product_resend":
        result = {
          success: false,
          reason: `${toolName} precisa ser executado no contexto do OpenAiService`
        };
        logger.info(`Ferramenta ${toolName} chamada - delegada ao contexto principal`);
        break;

      default:
        result = { 
          success: false, 
          reason: `Ferramenta desconhecida: ${toolName}` 
        };
    }
  } catch (error) {
    logger.error(`Erro ao executar ferramenta ${toolName}:`, error);
    result = { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }

  return result;
}

export function getToolInstructions(availableTags: string[], queueNames: string[]): string {
  return `
FERRAMENTAS DISPONÍVEIS:

1. TRANSFERIR PARA FLUXO (call_flow_builder):
   - Transfere o cliente para um fluxo automatizado específico
   - Parâmetro: flowId (ID do fluxo)
   - Exemplo: flowId: 31

2. FORMATAR MENSAGEM (format_message):
   - Personaliza mensagens com variáveis dinâmicas
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
   - Exemplo: "{{ms}}  {{firstName}}! Seu protocolo é {{protocol}}"

3. EXECUTAR COMANDO (execute_command):
   - Executa comandos administrativos (transferências, tags, etc.)
   - Formato: JSON entre #{ ... }
   - Exemplos:
     * Transferir fila: #{ "queueId":"5" }
     * Transferir para atendente: #{ "queueId":"5", "userId":"12" }
     * Adicionar tag: #{ "tagId":"14" }
     * Encerrar ticket: #{ "closeTicket":"1" }
   - Tags disponíveis: ${availableTags.join(", ") || "nenhuma"}

4. LISTAR FERRAMENTAS (list_available_tools):
   - Lista todas as ferramentas/APIs pré-configuradas e ativas
   - Use ANTES de executar qualquer ferramenta para saber quais estão disponíveis
   - Retorna: nome, descrição, método e placeholders necessários
   - Não requer parâmetros

5. EXECUTAR FERRAMENTA (execute_tool):
   - Executa ferramentas/APIs pré-configuradas no sistema
   - IMPORTANTE: Use list_available_tools primeiro para ver ferramentas disponíveis
   - Preencha APENAS os placeholders necessários (não altere URL/headers/método)
   - Parâmetros: ferramentaNome e placeholders (ex: {cep: "01001000"})
   
   INTERPRETAÇÃO DE RESPOSTAS (CRÍTICO):
   - NUNCA mostre JSON cru da API ao usuário
   - SEMPRE interprete a resposta e responda de forma natural
   - Adapte o tom conforme o contexto da conversa
   
   Exemplos corretos:
   * API: {"status": "success", "id": 8472}
     Você: "Seu cadastro foi realizado com sucesso! "
   
   * API: {"status": "error", "message": "CPF inválido"}
     Você: "O CPF informado parece ser inválido. Pode conferir e me enviar novamente?"
   
   Exemplo ERRADO:
   * Você: {"status": "success", "id": 8472} 

REGRAS IMPORTANTES:
- Utilize apenas IDs confirmados nas instruções personalizadas ou no prompt.
- Se não tiver certeza do ID correto, peça confirmação antes de executar.
- Para ferramentas: liste primeiro, execute depois, interprete sempre.
- NUNCA exponha JSON cru ao usuário - sempre traduza para linguagem natural.
`;
}

export function isValidTag(tagName: string, availableTags: string[]): boolean {
  return availableTags.includes(tagName);
}

export function isValidQueue(queueName: string, allQueues: Queue[], companyId: number): boolean {
  return allQueues.some(q => q.name === queueName && q.companyId === companyId);
}

export function formatMessageWithVariables(
  message: string,
  ticket?: Ticket,
  contact?: Contact,
  user?: User,
  queue?: Queue,
  customVariables?: Record<string, any>
): string {
  let formattedMessage = message;
  
  const hour = new Date().getHours();
  let greeting = "Boa noite";
  if (hour >= 5 && hour < 12) greeting = "Bom dia";
  else if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  else if (hour >= 0 && hour < 5) greeting = "Boa madrugada";
  formattedMessage = formattedMessage.replace(/\{\{ms\}\}/g, greeting);
  
  if (contact?.name) {
    formattedMessage = formattedMessage.replace(/\{\{name\}\}/g, contact.name);
    const firstName = contact.name.split(' ')[0];
    formattedMessage = formattedMessage.replace(/\{\{firstName\}\}/g, firstName);
  }
  
  if (user?.name) {
    formattedMessage = formattedMessage.replace(/\{\{userName\}\}/g, user.name);
  }
  
  const date = new Date().toLocaleDateString('pt-BR');
  formattedMessage = formattedMessage.replace(/\{\{date\}\}/g, date);
  
  if (ticket?.id) {
    formattedMessage = formattedMessage.replace(/\{\{ticket_id\}\}/g, ticket.id.toString());
  }
  
  if (queue?.name || (ticket as any)?.queue?.name) {
    const queueName = queue?.name || (ticket as any)?.queue?.name || "Sem fila";
    formattedMessage = formattedMessage.replace(/\{\{queue\}\}/g, queueName);
  }
  
  if ((ticket as any)?.whatsapp?.name) {
    formattedMessage = formattedMessage.replace(/\{\{connection\}\}/g, (ticket as any).whatsapp.name);
  }
  
  if (ticket?.id && ticket?.createdAt) {
    const protocol = `${ticket.id}${new Date(ticket.createdAt).getTime()}`;
    formattedMessage = formattedMessage.replace(/\{\{protocol\}\}/g, protocol);
  }
  
  const hora = new Date().toLocaleTimeString('pt-BR');
  formattedMessage = formattedMessage.replace(/\{\{hora\}\}/g, hora);
  
  if (customVariables) {
    Object.keys(customVariables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      formattedMessage = formattedMessage.replace(regex, customVariables[key]);
    });
  }
  
  return formattedMessage;
}