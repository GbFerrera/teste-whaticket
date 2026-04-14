import AppError from "../../errors/AppError";
import { WebhookModel } from "../../models/Webhook";
import { sendMessageFlow } from "../../controllers/MessageController";
import { IConnections, INodes } from "./DispatchWebHookService";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Op } from "sequelize";
import CreateContactService from "../ContactServices/CreateContactService";
import Contact from "../../models/Contact";
import CreateTicketService from "../TicketServices/CreateTicketService";
import CreateTicketServiceWebhook from "../TicketServices/CreateTicketServiceWebhook";
import { SendMessage } from "../../helpers/SendMessage";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import fs from "fs";
import GetWhatsappWbot from "../../helpers/GetWhatsappWbot";
import path from "path";
import mime from "mime-types";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMediaFlow, {
  typeSimulation
} from "../WbotServices/SendWhatsAppMediaFlow";
import { randomizarCaminho } from "../../utils/randomizador";
import { SendMessageFlow } from "../../helpers/SendMessageFlow";
import formatBody from "../../helpers/Mustache";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ListFlowBuilderService from "../FlowBuilderService/ListFlowBuilderService";
import ShowPromptService from "../PromptServices/ShowPromptService";
import ListPromptToolSettingsService from "../PromptToolSettingService/ListPromptToolSettingsService";
import CreateMessageService, {
  MessageData
} from "../MessageServices/CreateMessageService";
import { randomString } from "../../utils/randomCode";
import ShowQueueService from "../QueueService/ShowQueueService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { getIO } from "../../libs/socket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import ShowTicketUUIDService from "../TicketServices/ShowTicketFromUUIDService";
import logger from "../../utils/logger";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import CompaniesSettings from "../../models/CompaniesSettings";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { delay } from "bluebird";
import typebotListener from "../TypebotServices/typebotListener";
import { getWbot } from "../../libs/wbot";
import { proto } from "@whiskeysockets/baileys";
import { handleOpenAi } from "../IntegrationsServices/OpenAiService";
import { IOpenAi } from "../../@types/openai";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import ContactTag from "../../models/ContactTag";
import TicketTraking from "../../models/TicketTraking";
import User from "../../models/User";
import axios from "axios";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import FollowUpNodeService from "../FlowBuilderService/FollowUpNodeService";
import WaitQuestionService from "../FlowBuilderService/WaitQuestionService";
import Message from "../../models/Message";

// Função para extrair valores de objetos JSON usando path
const getNestedValue = (obj: any, path: string): any => {
  if (!path || !obj) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
};
import { getAsaasSecondCopyByCpf } from "../PaymentGatewayService";
import { getBackendUrl } from "../SettingService/UrlService";
import { fetchPdfBufferFromUrl } from "../../helpers/pdfUtils";

// Buffer de mensagens para agrupar antes de enviar à IA
interface MessageBuffer {
  texts: string[];
  timeout?: NodeJS.Timeout;
  msg?: proto.IWebMessageInfo;
  openAiSettings?: IOpenAi;
  wbot?: any;
  ticket?: Ticket;
  contact?: Contact;
  ticketTraking?: TicketTraking;
}

const directOpenAiMessageBuffer: { [ticketId: number]: MessageBuffer } = {};

interface IAddContact {
  companyId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  dataMore?: any;
}

export const ActionsWebhookService = async (
  whatsappId: number,
  idFlowDb: number,
  companyId: number,
  nodes: INodes[],
  connects: IConnections[],
  nextStage: string,
  dataWebhook: any,
  details: any,
  hashWebhookId: string,
  pressKey?: string,
  idTicket?: number,
  numberPhrase: "" | { number: string; name: string; email: string } = "",
  msg?: proto.IWebMessageInfo
): Promise<string> => {
  try {
    const io = getIO();
    let next = nextStage;
    
    // BLOQUEAR VOLTAR AO NÓ START quando já está em progresso
    if (String(next) === '1') {
      // Verificar se já existe um ticket com fluxo ativo
      if (idTicket) {
        const activeTicket = await Ticket.findOne({
          where: { id: idTicket, flowWebhook: true, lastFlowId: { [Op.ne]: null } }
        });
        
        if (activeTicket && activeTicket.lastFlowId && String(activeTicket.lastFlowId) !== '1') {
          console.log(`🚫 BLOQUEADO: Impedindo volta ao nó start. Usando lastFlowId: ${activeTicket.lastFlowId}`);
          next = activeTicket.lastFlowId;
        }
      }
    }
    console.log(
      "ActionWebhookService | 53",
      idFlowDb,
      companyId,
      nodes,
      connects,
      nextStage,
      dataWebhook,
      details,
      hashWebhookId,
      pressKey,
      idTicket,
      numberPhrase
    );
    let createFieldJsonName = "";

    const connectStatic = connects;
    if (numberPhrase === "") {
      const nameInput = details.inputs.find(item => item.keyValue === "nome");
      if (nameInput && nameInput.data) {
        nameInput.data.split(",").map(dataN => {
          const lineToData = details.keysFull.find(item => item === dataN);
          let sumRes = "";
          if (!lineToData) {
            sumRes = dataN;
          } else {
            sumRes = constructJsonLine(lineToData, dataWebhook);
          }
          createFieldJsonName = createFieldJsonName + sumRes;
        });
      }
    } else {
      createFieldJsonName = numberPhrase.name;
    }

    let numberClient = "";

    if (numberPhrase === "") {
      const numberInput = details.inputs.find(
        item => item.keyValue === "celular"
      );

      if (numberInput && numberInput.data) {
        numberInput.data.split(",").map(dataN => {
          const lineToDataNumber = details.keysFull.find(item => item === dataN);
          let createFieldJsonNumber = "";
          if (!lineToDataNumber) {
            createFieldJsonNumber = dataN;
          } else {
            createFieldJsonNumber = constructJsonLine(lineToDataNumber, dataWebhook);
          }
          createFieldJsonNumber = createFieldJsonNumber + createFieldJsonNumber;
        });
      }
    } else {
      numberClient = numberPhrase.number;
    }

    numberClient = removerNaoLetrasNumeros(numberClient);

    if (numberClient.substring(0, 2) === "55") {
      if (parseInt(numberClient.substring(2, 4)) >= 31) {
        if (numberClient.length === 13) {
          numberClient =
            numberClient.substring(0, 4) + numberClient.substring(5, 13);
        }
      }
    }

    let createFieldJsonEmail = "";

    if (numberPhrase === "") {
      const emailInput = details.inputs.find(item => item.keyValue === "email");
      if (emailInput && emailInput.data) {
        emailInput.data.split(",").map(dataN => {
          const lineToDataEmail = details.keysFull.find(item =>
            item.endsWith("email")
          );

          let sumRes = "";
          if (!lineToDataEmail) {
            sumRes = dataN;
          } else {
          sumRes = constructJsonLine(lineToDataEmail, dataWebhook);
        }

        createFieldJsonEmail = createFieldJsonEmail + sumRes;
        });
      }
    } else {
      createFieldJsonEmail = numberPhrase.email || "";
    }

    const lengthLoop = nodes.length;
    const whatsapp = await GetDefaultWhatsApp(whatsappId, companyId);

    // Função para verificar se ticket tem usuário atribuído e encerrar se necessário
    const checkAndCloseTicketIfAssigned = async (ticketId: string) => {
      try {
        const ticket = await Ticket.findOne({
          where: { id: ticketId, whatsappId },
          include: [{ model: User, as: "user" }]
        });

        if (ticket && ticket.userId) {
          console.log(`Ticket ${ticketId} está com usuário ${ticket.user.name}, encerrando fluxo automático`);
          
          // Atualizar status para closed
          await ticket.update({
            status: "closed",
            closedAt: new Date()
          });

          // Emitir WebSocket para atualizar frontend
          const io = getIO();
          const ticketUpdated = await ShowTicketService(ticket.id, companyId);
          io.of(String(companyId))
            .emit(`company-${companyId}-ticket`, {
              action: "update",
              ticket: ticketUpdated
            });

          return true; // Indica que o fluxo deve parar
        }
        
        return false; // Continua o fluxo normalmente
      } catch (error) {
        console.error("Erro ao verificar status do ticket:", error);
        return false;
      }
    };

    if (whatsapp.status !== "CONNECTED") {
      return;
    }

    let execCount = 0;

    let execFn = "";

    let ticket = null;

    let noAlterNext = false;

    for (var i = 0; i < lengthLoop; i++) {
      let nodeSelected: any;
      let ticketInit: Ticket;

      // Verificar se ticket tem usuário atribuído e encerrar fluxo se necessário
      if (idTicket) {
        const shouldStop = await checkAndCloseTicketIfAssigned(idTicket.toString());
        if (shouldStop) {
          console.log("Fluxo encerrado pois ticket está com usuário atribuído");
          break;
        }
      }

      const awaitingAsaasResponse =
        !!pressKey &&
        dataWebhook?.asaasState?.awaiting === true &&
        dataWebhook?.asaasState?.nodeId === next;

      if (pressKey) {
        console.log("UPDATE2... pressKey:", pressKey);
        console.log("UPDATE2... execFn:", execFn);
        console.log("UPDATE2... next:", next);
        
        if (pressKey === "parar") {
          console.log("UPDATE3...");
          if (idTicket) {
            console.log("UPDATE4...");
            ticketInit = await Ticket.findOne({
              where: { id: idTicket, whatsappId }
            });
            await ticket.update({
              status: "closed"
            });
          }
          break;
        }

        if (awaitingAsaasResponse) {
          console.log("UPDATE5... ASAAS RESPONSE");
          nodeSelected = nodes.find(node => node.id === next);
        } else if (execFn === "") {
          console.log("UPDATE5... execFn está vazio, usando nó atual do menu");
          // Não criar menu vazio, usar o nó menu atual
          nodeSelected = nodes.find(node => node.id === next);
          if (!nodeSelected) {
            console.log("ERRO: Nó menu não encontrado com next:", next);
            break;
          }
        } else {
          console.log("UPDATE6... buscando nó com ID:", execFn);
          nodeSelected = nodes.filter(node => node.id === execFn)[0];
          if (!nodeSelected) {
            console.log("ERRO: Nó não encontrado com execFn:", execFn);
          }
        }
      } else {
        console.log("UPDATE7... sem pressKey, buscando next:", next);
        const otherNode = nodes.filter(node => node.id === next)[0];
        if (otherNode) {
          nodeSelected = otherNode;
        } else {
          console.log("ERRO: Nó não encontrado com ID:", next);
          console.log(
            "Nós disponíveis:",
            nodes.map(n => ({ id: n.id, type: n.type }))
          );
        }
      }

      // VALIDAÇÃO: Verificar se nodeSelected foi encontrado
      if (!nodeSelected) {
        console.log("ERRO: nodeSelected é undefined - pulando iteração");
        console.log("next:", next, "execFn:", execFn);
        continue;
      }

      if (nodeSelected.type === "message") {
        // Garantir que o ticket existe antes de acessar dataWebhook
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        let msg;

        const webhook = ticket?.dataWebhook;

        if (webhook && webhook.hasOwnProperty("variables")) {
          msg = {
            body: replaceMessages(webhook, nodeSelected.data.label)
          };
        } else {
          msg = {
            body: nodeSelected.data.label
          };
        }

        await SendMessage(whatsapp, {
          number: numberClient,
          body: msg.body
        });

        //TESTE BOTÃO
        //await SendMessageFlow(whatsapp, {
        //  number: numberClient,
        //  body: msg.body
        //} )
        await intervalWhats("1");
      }
      console.log("273");
      if (nodeSelected.type === "typebot") {
        console.log("275");
        const wbot = getWbot(whatsapp.id);
        await typebotListener({
          wbot: wbot,
          msg,
          ticket,
          typebot: nodeSelected.data.typebotIntegration
        });
      }

      if (nodeSelected.type === "menu") {
        // Garantir que o ticket existe antes de processar menu
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        console.log("650 menu");
        console.log("Menu data:", nodeSelected.data);
        console.log("PressKey:", pressKey);
        
        // Verificar se nodeSelected.data existe
        if (!nodeSelected.data || !nodeSelected.data.arrayOption) {
          console.log("ERRO: Menu não possui dados ou arrayOption", nodeSelected);
          break;
        }
        
        console.log("Array options:", nodeSelected.data.arrayOption);
        
        if (pressKey) {
          const selectedOption = nodeSelected.data.arrayOption.find(
            option => option.number == pressKey
          );
          
          if (selectedOption) {
            console.log("Opção selecionada:", selectedOption);
            next = selectedOption.next;
            console.log("Próximo nó definido:", next);
            
            // Se next não estiver definido, usar as conexões do flow
            if (!next && connects) {
              console.log("Next undefined, buscando nas conexões...");
              const optionIndex = nodeSelected.data.arrayOption.findIndex(
                opt => opt.number == pressKey
              );
              const sourceHandle = `a${optionIndex + 1}`;
              const connection = connects.find(conn => 
                conn.source === nodeSelected.id && conn.sourceHandle === sourceHandle
              );
              if (connection) {
                next = connection.target;
                console.log("Próximo nó encontrado via conexão:", next);
              }
            }
          } else {
            console.log("Opção não encontrada para:", pressKey);
          }
        } else {
          console.log("Nenhum pressKey fornecido");
        }
        
        // Se encontrou um próximo nó, processá-lo recursivamente
        if (next && next !== nodeSelected.id) {
          console.log("Menu: Processando próximo nó recursivamente:", next);
          const nextNode = nodes.find(n => n.id === next);
          if (nextNode) {
            // Chamar recursivamente com o próximo nó
            return await ActionsWebhookService(
              whatsappId,
              idFlowDb,
              companyId,
              nodes,
              connects,
              next,
              dataWebhook,
              details,
              hashWebhookId,
              pressKey,
              idTicket,
              numberPhrase,
              msg
            );
          }
        }
      }

      if (nodeSelected.type === "openai") {
        console.log(`=== PROCESSANDO NÓ openai (AGENTE IA) ===`);
        console.log(`OpenAI: nodeSelected.data=`, JSON.stringify(nodeSelected.data, null, 2));
        
        try {
          const cfg: any = nodeSelected.data.typebotIntegration || {};
          console.log(`OpenAI: Configuração extraída=`, JSON.stringify(cfg, null, 2));

          // VALIDAÇÃO INICIAL
          if (!cfg || Object.keys(cfg).length === 0) {
            console.error(`OpenAI: ERRO - Nenhuma configuração encontrada no nó`);
            continue;
          }

          let openAiSettings: any;

          const promptIdNumber = cfg.iaId ? Number(cfg.iaId) : NaN;
          console.log(`OpenAI: iaMode=${cfg.iaMode}, iaId=${cfg.iaId}, promptIdNumber=${promptIdNumber}`);

          if (cfg.iaMode === "system" && !Number.isNaN(promptIdNumber)) {
            console.log(`OpenAI: Buscando prompt do sistema ID=${promptIdNumber}`);
            
            const prompt = await ShowPromptService({
              promptId: promptIdNumber,
              companyId
            });

            if (!prompt) {
              console.error(`OpenAI: ERRO - Prompt ID=${promptIdNumber} não encontrado`);
              continue;
            }

            console.log(`OpenAI: Prompt encontrado="${prompt.name}"`);

            openAiSettings = {
              name: prompt.name,
              prompt: prompt.prompt,
              voice: prompt.voice,
              voiceKey: prompt.voiceKey,
              voiceRegion: prompt.voiceRegion,
              maxTokens: Number(prompt.maxTokens),
              temperature: Number(prompt.temperature),
              apiKey: prompt.apiKey,
              queueId: Number(prompt.queueId),
              maxMessages: Number(prompt.maxMessages),
              promptId: Number(prompt.id)
            };
          } else {
            let {
              name,
              prompt,
              voice,
              voiceKey,
              voiceRegion,
              maxTokens,
              temperature,
              apiKey,
              queueId,
              maxMessages
            } = cfg as IOpenAi;

            const normalizeNumeric = (value: string | number | null | undefined, fallback = 0) => {
              if (typeof value === "number") {
                return Number.isFinite(value) ? value : fallback;
              }
              if (typeof value === "string" && value.trim().length) {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : fallback;
              }
              return fallback;
            };

            openAiSettings = {
              name,
              prompt,
              voice,
              voiceKey,
              voiceRegion,
              maxTokens: normalizeNumeric(maxTokens, 800),
              temperature: normalizeNumeric(temperature, 1),
              apiKey,
              queueId: normalizeNumeric(queueId, 0),
              maxMessages: normalizeNumeric(maxMessages, 10),
              promptId: Number.isNaN(promptIdNumber) ? null : promptIdNumber
            };
          }

          try {
            const toolsEnabled = await ListPromptToolSettingsService({
              companyId,
              promptId: openAiSettings.promptId ?? null
            });
            openAiSettings.toolsEnabled = toolsEnabled;
            console.log(`OpenAI: ${toolsEnabled.length} ferramentas habilitadas`);
          } catch (error) {
            console.error("Erro ao carregar toolsEnabled (Webhook):", error);
          }

          // VALIDAÇÃO FINAL
          if (!openAiSettings.prompt || !openAiSettings.apiKey) {
            console.error(`OpenAI: ERRO - Configuração incompleta:`, {
              hasPrompt: !!openAiSettings.prompt,
              hasApiKey: !!openAiSettings.apiKey
            });
            continue;
          }

          console.log(`OpenAI: Configuração validada com sucesso - Iniciando processamento`);

          const contact = await Contact.findOne({
            where: { number: numberClient, companyId }
          });

          const wbot = getWbot(whatsapp.id);

          const ticketTraking = await FindOrCreateATicketTrakingService({
            ticketId: ticket.id,
            companyId,
            userId: null,
            whatsappId: whatsapp?.id
          });

          console.log(`OpenAI: Enviando para handleOpenAi...`);
          await handleOpenAi(
            openAiSettings,
            msg,
            wbot,
            ticket,
            contact,
            null,
            ticketTraking
          );
          
          console.log(`OpenAI: Processamento concluído com sucesso`);
        } catch (error: any) {
          console.error(`OpenAI: ERRO CRÍTICO NO PROCESSAMENTO:`, error);
          console.error(`OpenAI: Stack trace:`, error.stack);
          continue;
        }
      }

      if (nodeSelected.type === "directOpenai") {
        console.log(`=== PROCESSANDO NÓ directOpenai (AGENTE DIRETO) ===`);
        console.log(`DirectOpenAI: nodeSelected.data=`, JSON.stringify(nodeSelected.data, null, 2));
        
        try {
          const cfg = nodeSelected.data;
          console.log(`DirectOpenAI: Configuração extraída=`, JSON.stringify(cfg, null, 2));

          // VALIDAÇÃO INICIAL
          if (!cfg || Object.keys(cfg).length === 0) {
            console.error(`DirectOpenAI: ERRO - Nenhuma configuração encontrada no nó`);
            continue;
          }

          // Configuração direta do nó
          const openAiSettings: IOpenAi = {
            name: "Agente Direto",
            prompt: cfg.prompt || "",
            apiKey: cfg.apiKey || "",
            provider: cfg.provider || "openai",
            model: cfg.model || "gemini-2.0-flash",
            voice: "texto",
            voiceKey: "",
            voiceRegion: "",
            maxTokens: cfg.maxTokens || 1000,
            temperature: cfg.temperature || 0.7,
            queueId: null,
            maxMessages: 10,
            toolsEnabled: cfg.toolsEnabled || []
          };

          console.log(`DirectOpenAI: Configuração montada=`, JSON.stringify(openAiSettings, null, 2));

          // VALIDAÇÃO FINAL
          if (!openAiSettings.prompt || !openAiSettings.apiKey) {
            console.error(`DirectOpenAI: ERRO - Configuração incompleta:`, {
              hasPrompt: !!openAiSettings.prompt,
              hasApiKey: !!openAiSettings.apiKey
            });
            continue;
          }

          console.log(`DirectOpenAI: Configuração validada com sucesso - Iniciando processamento`);

          // Carregar ticket se não estiver carregado
          if (!ticket && idTicket) {
            ticket = await Ticket.findByPk(idTicket);
          }

          if (!ticket) {
            console.error(`DirectOpenAI: Ticket não encontrado (idTicket: ${idTicket})`);
            continue;
          }

          const contact = await Contact.findOne({
            where: { number: numberClient, companyId }
          });

          const ticketTraking = await FindOrCreateATicketTrakingService({
            ticketId: ticket.id,
            companyId,
            userId: null,
            whatsappId: whatsapp?.id
          });

          const wbot = getWbot(whatsapp.id);

          // Se houver mensagem do usuário (msg), processar com a IA
          if (msg) {
            // Verificar se é áudio ou imagem - envia direto sem buffer
            if (msg.message?.audioMessage || msg.message?.imageMessage) {
              console.log(`DirectOpenAI: Mídia detectada, enviando direto sem buffer`);
              await handleOpenAi(
                openAiSettings,
                msg,
                wbot,
                ticket,
                contact,
                null,
                ticketTraking
              );
              console.log(`DirectOpenAI: Processamento concluído com sucesso`);
              break;
            }

            // Buffer de mensagens de TEXTO para agrupar antes de enviar à IA
            const bodyMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
            if (!bodyMessage) {
              console.log(`DirectOpenAI: Mensagem sem texto, ignorando`);
              continue;
            }

            // Cria o buffer se ainda não existir
            if (!directOpenAiMessageBuffer[ticket.id]) {
              directOpenAiMessageBuffer[ticket.id] = { texts: [] };
            }

            // Adiciona o texto recebido ao buffer
            directOpenAiMessageBuffer[ticket.id].texts.push(bodyMessage);
            directOpenAiMessageBuffer[ticket.id].msg = msg;
            directOpenAiMessageBuffer[ticket.id].openAiSettings = openAiSettings;
            directOpenAiMessageBuffer[ticket.id].wbot = wbot;
            directOpenAiMessageBuffer[ticket.id].ticket = ticket;
            directOpenAiMessageBuffer[ticket.id].contact = contact;
            directOpenAiMessageBuffer[ticket.id].ticketTraking = ticketTraking;

            // Se já tiver um timeout ativo, cancela e reinicia
            if (directOpenAiMessageBuffer[ticket.id].timeout) {
              clearTimeout(directOpenAiMessageBuffer[ticket.id].timeout);
            }

            console.log(`DirectOpenAI: Mensagem adicionada ao buffer. Total: ${directOpenAiMessageBuffer[ticket.id].texts.length}`);

            // Define o novo timeout de 12 segundos
            directOpenAiMessageBuffer[ticket.id].timeout = setTimeout(async () => {
              try {
                const buffer = directOpenAiMessageBuffer[ticket.id];
                if (!buffer) return;

                // Junta todas as mensagens acumuladas
                const combinedText = buffer.texts.join(". ");
                delete directOpenAiMessageBuffer[ticket.id];

                // Clona a mensagem original e substitui o texto
                const combinedMsg = JSON.parse(JSON.stringify(buffer.msg));
                if (combinedMsg.message?.conversation) {
                  combinedMsg.message.conversation = combinedText;
                } else if (combinedMsg.message?.extendedTextMessage) {
                  combinedMsg.message.extendedTextMessage.text = combinedText;
                }

                console.log(`🧠 DirectOpenAI: Agrupando ${buffer.texts.length} mensagens em 12s: ${combinedText}`);

                // Chama a IA com o texto combinado
                console.log(`DirectOpenAI: Enviando para handleOpenAi...`);
                await handleOpenAi(
                  buffer.openAiSettings!,
                  combinedMsg,
                  buffer.wbot,
                  buffer.ticket!,
                  buffer.contact!,
                  null,
                  buffer.ticketTraking
                );
                
                console.log(`DirectOpenAI: Processamento concluído com sucesso`);
              } catch (error: any) {
                console.error(`DirectOpenAI: ERRO ao processar mensagens agrupadas:`, error);
                console.error(`DirectOpenAI: Stack trace:`, error.stack);
              }
            }, 12000); // 12 segundos
            
            break;
          }
          
          // Se NÃO houver mensagem (primeira execução do nó), apenas continua o fluxo
          console.log(`DirectOpenAI: Nó ativado, aguardando mensagens do usuário...`);

        } catch (error: any) {
          console.error(`DirectOpenAI: ERRO CRÍTICO NO PROCESSAMENTO:`, error);
          console.error(`DirectOpenAI: Stack trace:`, error.stack);
          continue;
        }
      }

      if (nodeSelected.type === "followUp") {
        console.log("FollowUp: processando nó", nodeSelected.id);

        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({ where: { id: idTicket, companyId } });
        }

        if (!ticket) {
          console.warn("FollowUp: ticket não encontrado, encerrando fluxo");
          break;
        }

        try {
          await FollowUpNodeService.executeFollowUpNode(
            nodeSelected.data,
            ticket.id,
            companyId,
            nodeSelected.id
          );
          console.log(
            `FollowUp: agendado com delay ${nodeSelected?.data?.delayMinutes} min para ticket ${ticket.id}`
          );
        } catch (error) {
          console.error("FollowUp: erro ao agendar follow-up", error);
        }

        console.log("FollowUp: aguardando próximo nó via conexões padrão");
      }

      if (nodeSelected.type === "waitQuestion") {
        console.log("WaitQuestion: processando nó", nodeSelected.id);

        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({ where: { id: idTicket, companyId } });
        }

        if (!ticket) {
          console.warn("WaitQuestion: ticket não encontrado, encerrando fluxo");
          break;
        }

        try {
          const { waitTime, waitUnit, question, mediaType, mediaUrl, mediaName, optionX, optionY, timeoutEnabled, timeoutTime, timeoutUnit } = nodeSelected.data;
          
          // Calcular tempo em segundos (igual ao interval)
          const totalSeconds = waitUnit === "hours" ? waitTime * 3600 : waitTime * 60;
          
          // Aguardar o tempo configurado (igual ao interval)
          console.log(`WaitQuestion: Aguardando ${totalSeconds} segundos...`);
          await new Promise((resolve) => {
            setTimeout(() => {
              console.log(`WaitQuestion: Tempo de espera finalizado.`);
              resolve(true);
            }, totalSeconds * 1000);
          });
          
          // Enviar mídia se existir
          if (mediaType && mediaType !== "none" && mediaUrl) {
            try {
              await SendWhatsAppMediaFlow({
                media: mediaUrl,
                ticket
              });
              console.log(`WaitQuestion: Mídia enviada para ticket ${ticket.id}`);
            } catch (mediaErr) {
              console.error(`WaitQuestion: Erro ao enviar mídia:`, mediaErr);
            }
          }
          
          // Enviar a pergunta (igual ao message)
          if (question) {
            await SendMessage(whatsapp, {
              number: numberClient,
              body: question
            });
            console.log(`WaitQuestion: Pergunta enviada para ticket ${ticket.id}`);
          }
          
          // Salvar estado de espera no ticket
          const totalMinutes = waitUnit === "hours" ? waitTime * 60 : waitTime;
          await ticket.update({
            waitingQuestion: true,
            questionNodeId: nodeSelected.id,
            questionOptions: { optionX, optionY },
            timeoutEnabled: !!timeoutEnabled,
            timeoutAt: timeoutEnabled ? new Date(Date.now() + ((timeoutUnit === "hours" ? timeoutTime * 60 : timeoutTime)) * 60000) : null,
            maxQuestionAttempts: 3, // Padrão 3 tentativas
            questionAttempts: 0
          });
          
          console.log(`WaitQuestion: Ticket ${ticket.id} aguardando resposta`);
          
          // Pausar fluxo - aguardar resposta do usuário
          next = null;
          
        } catch (error) {
          console.error("WaitQuestion: erro ao processar", error);
          next = null;
        }
      }

      if (nodeSelected.type === "question") {
        console.log("Question: Debug - idTicket:", idTicket);
        console.log("Question: Debug - ticket antes:", ticket?.id);
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          console.log("Question: Carregando ticket do banco...");
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
          console.log("Question: Ticket carregado:", ticket?.id);
        }
        
        const questionData = nodeSelected.data?.typebotIntegration || {};
        const { message } = questionData;
        const answerKey =
          questionData?.answerKey || `question_${nodeSelected.id}`;

        const currentWebhookData = ticket?.dataWebhook || {};
        const questionState = currentWebhookData?.questionState;
        const awaitingAnswer =
          questionState?.awaiting === true &&
          questionState?.nodeId === nodeSelected.id;

        if (awaitingAnswer) {
          console.log("Question: aguardando resposta do cliente");
          break;
        }

        // Verificar se ticket e contact existem antes de formatar mensagem
        console.log("Question: Debug - ticket existe:", !!ticket);
        console.log("Question: Debug - ticket.contact existe:", !!ticket?.contact);
        console.log("Question: Debug - ticket.contactId:", ticket?.contactId);
        
        if (!ticket || !ticket.contact) {
          console.log("Question: ticket ou contact é nulo, tentando carregar contact...");
          
          // Tentar carregar o contact separadamente
          if (ticket && ticket.contactId && !ticket.contact) {
            console.log("Question: Carregando contact do banco...");
            const Contact = require("../../models/Contact").default;
            ticket.contact = await Contact.findByPk(ticket.contactId);
            console.log("Question: Contact carregado:", !!ticket.contact);
          }
          
          if (!ticket.contact) {
            console.log("Question: Impossível continuar sem contact");
            break;
          }
        }
        
        const questionMessage = formatBody(`${message || ""}`, ticket.contact);
        const ticketDetails = await ShowTicketService(ticket.id, companyId);

        await typeSimulation(ticket, "composing");
        await delay(2000);
        await typeSimulation(ticket, "paused");

        console.log("ActionsWebhookService Node Question1: ", questionMessage);

        await SendWhatsAppMessage({
          body: questionMessage,
          ticket: ticketDetails,
          quotedMsg: null
        });

        SetTicketMessagesAsRead(ticketDetails);

        await ticketDetails.update({
          lastMessage: questionMessage
        });

        const updatedWebhookData = {
          ...currentWebhookData,
          questionState: {
            awaiting: true,
            nodeId: nodeSelected.id,
            answerKey
          }
        };

        await ticket.update({
          userId: null,
          companyId,
          flowWebhook: true,
          lastFlowId: nodeSelected.type === "directOpenai" ? ticket.lastFlowId : nodeSelected.id,
          dataWebhook: updatedWebhookData,
          hashFlowId: hashWebhookId,
          flowStopped: idFlowDb.toString()
        });

        const targetQueueId =
          nodeSelected?.data?.queueId ??
          nodeSelected?.data?.typebotIntegration?.queueId ??
          ticket.queueId;

        if (!targetQueueId) {
          console.warn(
            "ActionsWebhookService question node sem queueId definido; pulando atualização de fila."
          );
          break;
        }

        const queue = await ShowQueueService(Number(targetQueueId), companyId);

        await ticket.update({
          status: "pending",
          queueId: queue.id,
          userId: ticket.userId,
          companyId: companyId,
          flowWebhook: true,
          lastFlowId: nodeSelected.type === "directOpenai" ? ticket.lastFlowId : nodeSelected.id,
          hashFlowId: hashWebhookId,
          flowStopped: idFlowDb.toString()
        });

        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        });

        await UpdateTicketService({
          ticketData: {
            status: "pending",
            queueId: queue.id
          },
          ticketId: ticket.id,
          companyId
        });

        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "queue",
          queueId: queue.id
        });

        const settings = await CompaniesSettings.findOne({
          where: {
            companyId: companyId
          }
        });

        const enableQueuePosition = settings?.sendQueuePosition === "enabled";

        if (enableQueuePosition) {
          const count = await Ticket.findAndCountAll({
            where: {
              userId: null,
              status: "pending",
              companyId,
              queueId: queue.id,
              whatsappId: whatsapp.id,
              isGroup: false
            }
          });

          // Lógica para enviar posição da fila de atendimento
          const qtd = count.count === 0 ? 1 : count.count;

          const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;

          const ticketFilaDetails = await ShowTicketService(ticket.id, companyId);

          // Verificar se ticket.contact existe antes de formatar
          if (!ticket.contact) {
            console.log("Fila: ticket.contact é nulo, pulando mensagem");
            break;
          }
          
          const bodyFila = formatBody(`${msgFila}`, ticket.contact);

          await typeSimulation(ticket, "composing");
          await delay(2000);
          await typeSimulation(ticket, "paused");

          console.log("ActionsWebhookService Node Question2: ", bodyFila);

          await SendWhatsAppMessage({
            body: bodyFila,
            ticket: ticketFilaDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketFilaDetails);

          await ticketFilaDetails.update({
            lastMessage: bodyFila
          });
        }

        console.log("Question: aguardando resposta antes de continuar o fluxo");
        break;
      }

      if (nodeSelected.type === "singleBlock") {
        for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
          const elementNowSelected = nodeSelected.data.seq[iLoc];

          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });

          if (elementNowSelected.includes("message")) {
            const bodyFor = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;

            const ticketDetails = await ShowTicketService(idTicket, companyId);

            let msg;

            const webhook = ticket?.dataWebhook;

            if (webhook && webhook.hasOwnProperty("variables")) {
              msg = replaceMessages(webhook.variables, bodyFor);
            } else {
              msg = bodyFor;
            }

            await typeSimulation(ticket, "composing");
            await delay(2000);
            await typeSimulation(ticket, "paused");

            console.log("ActionsWebhookService Node Question3: ", msg);
            await SendWhatsAppMessage({
              body: msg,
              ticket: ticketDetails,
              quotedMsg: null
            });

            SetTicketMessagesAsRead(ticketDetails);

            // Verificar se ticket.contact existe antes de formatar
            if (!ticket.contact) {
              console.log("Question3: ticket.contact é nulo, usando mensagem original");
              await ticketDetails.update({
                lastMessage: bodyFor
              });
            } else {
              await ticketDetails.update({
                lastMessage: formatBody(bodyFor, ticket.contact)
              });
            }

            await intervalWhats("1");
          }
          if (elementNowSelected.includes("interval")) {
            await intervalWhats(
              nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].value
            );
          }

          if (elementNowSelected.includes("img")) {
            await typeSimulation(ticket, "composing");

            await SendMessage(whatsapp, {
              number: numberClient,
              body: "",
              mediaPath:
                (await getBackendUrl(companyId)) === "https://localhost:8090"
                  ? `${__dirname.split("src")[0].split("\\").join("/")}public/${
                      nodeSelected.data.elements.filter(
                        item => item.number === elementNowSelected
                      )[0].value
                    }`
                  : `${__dirname
                      .split("dist")[0]
                      .split("\\")
                      .join("/")}public/${
                      nodeSelected.data.elements.filter(
                        item => item.number === elementNowSelected
                      )[0].value
                    }`
            });
            await intervalWhats("1");
          }

          if (elementNowSelected.includes("audio")) {
            const mediaDirectory =
              (await getBackendUrl(companyId)) === "https://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${
                    nodeSelected.data.elements.filter(
                      item => item.number === elementNowSelected
                    )[0].value
                  }`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${
                    nodeSelected.data.elements.filter(
                      item => item.number === elementNowSelected
                    )[0].value
                  }`;
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, "recording");

            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt,
              isRecord: nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].record
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("video")) {
            const mediaDirectory =
              (await getBackendUrl(companyId)) === "https://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${
                    nodeSelected.data.elements.filter(
                      item => item.number === elementNowSelected
                    )[0].value
                  }`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${
                    nodeSelected.data.elements.filter(
                      item => item.number === elementNowSelected
                    )[0].value
                  }`;
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, "composing");

            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }

          if (
            elementNowSelected.includes("file") ||
            elementNowSelected.includes("doc") ||
            elementNowSelected.includes("arquivo") ||
            elementNowSelected.includes("documento")
          ) {
            const fileValue = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;

            const mediaDirectory = path.join(
              path.resolve(__dirname, "../../.."),
              "public",
              "uploads",
              fileValue
            );

            if (!fs.existsSync(mediaDirectory)) {
              console.error("Arquivo não encontrado:", mediaDirectory);
              continue;
            }

            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            const fileExtension = path.extname(mediaDirectory);
            const fileNameWithoutExtension = path.basename(
              mediaDirectory,
              fileExtension
            );
            const mimeType =
              mime.lookup(mediaDirectory) || "application/octet-stream";

            console.log(
              "Enviando arquivo:",
              fileNameWithoutExtension + fileExtension,
              "com tipo:",
              mimeType
            );

            await typeSimulation(ticket, "composing");

            try {
              await SendWhatsAppMediaFlow({
                media: mediaDirectory,
                ticket: ticketInt
              });
              console.log("Arquivo enviado com sucesso");
            } catch (error) {
              console.error("Erro ao enviar arquivo:", error);
            }

            await intervalWhats("1");
          }
        }
      }

      if (nodeSelected.type === "file") {
        if (!nodeSelected.data.url || nodeSelected.data.url === "undefined") {
          console.error("URL do arquivo não definida no nó do tipo file");
          console.log("nodeSelected.data:", nodeSelected.data);
          continue;
        }

        const mediaDirectory = path.join(
          path.resolve(__dirname, "../../.."),
          "public",
          "uploads",
          nodeSelected.data.url
        );

        const contact = await Contact.findOne({
          where: { number: numberClient, companyId }
        });

        if (!fs.existsSync(mediaDirectory)) {
          console.error("Arquivo não encontrado:", mediaDirectory);
          continue;
        }

        const fileExtension = path.extname(mediaDirectory);

        const fileNameWithoutExtension = path.basename(
          mediaDirectory,
          fileExtension
        );

        await typeSimulation(ticket, "composing");

        try {
          await SendWhatsAppMediaFlow({
            media: mediaDirectory,
            ticket: ticket
          });
          console.log("Arquivo enviado com sucesso");
        } catch (error) {
          console.error("Erro ao enviar arquivo:", error);
        }

        const ticketDetails = await ShowTicketService(ticket.id, companyId);

        await ticketDetails.update({
          lastMessage: formatBody(
            `${fileNameWithoutExtension}${fileExtension}`,
            ticket.contact
          )
        });

        await typeSimulation(ticket, "paused");
      }

            if (nodeSelected.type === "interval") {
        const timerSeconds = parseInt(nodeSelected.data.sec, 10);
        console.log(`Timer dedicado: Iniciando ${timerSeconds} segundos...`);
        
        await new Promise((resolve) => {
          setTimeout(() => {
            console.log(`Timer dedicado: ${timerSeconds} segundos finalizado.`);
            resolve(true);
          }, timerSeconds * 1000);
        });
        
        console.log(`Timer dedicado: Prosseguindo para próximo node...`);
      }

      // Nó: Transferir para outro Fluxo
      if (nodeSelected.type === "transferFlow") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const targetFlowId = nodeSelected.data?.data?.flowId || nodeSelected.data?.flowId;
        
        console.log(`TransferFlow: Dados do nó:`, JSON.stringify(nodeSelected.data, null, 2));
        console.log(`TransferFlow: targetFlowId extraído: ${targetFlowId}`);
        
        if (targetFlowId) {
          console.log(`TransferFlow: Transferindo para fluxo ID ${targetFlowId}`);
          
          const targetFlow = await FlowBuilderModel.findOne({
            where: { id: targetFlowId, company_id: companyId }
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
                // Gerar novo hash para o novo fluxo
                const newHashFlowId = randomString(42);
                
                console.log(`TransferFlow: Gerando novo hash: ${newHashFlowId}`);
                
                // Atualizar ticket com novo fluxo
                await ticket.update({
                  flowWebhook: true,
                  lastFlowId: startConnection.target,
                  hashFlowId: newHashFlowId,
                  flowStopped: targetFlowId.toString()
                });
                
                console.log(`TransferFlow: Ticket atualizado com sucesso!`);
                
                // Executar o novo fluxo recursivamente
                console.log(`TransferFlow: Executando novo fluxo recursivamente...`);
                await ActionsWebhookService(
                  whatsappId,
                  targetFlowId,
                  companyId,
                  newNodes,
                  newConnects,
                  startConnection.target,
                  dataWebhook,
                  details,
                  newHashFlowId,
                  null, // Limpar pressKey ao transferir para novo fluxo
                  idTicket,
                  {
                    number: numberClient,
                    name: createFieldJsonName,
                    email: ""
                  },
                  msg
                );
                
                console.log(`TransferFlow: Novo fluxo executado com sucesso!`);
                return;
              }
            }
          } else {
            console.log(`TransferFlow: Fluxo ${targetFlowId} não encontrado ou sem dados`);
            if (targetFlow) {
              console.log(`TransferFlow: Fluxo existe mas flow está vazio:`, targetFlow.flow);
            }
          }
        }
      }

      // Nó: Enviar Mensagem API Externa
      if (nodeSelected.type === "sendMessage") {
        console.log(`SendMessage: Processando envio de mensagem via API`);
        
        const messageData = nodeSelected.data?.data || nodeSelected.data;
        const apiToken = messageData?.apiToken;
        const message = messageData?.message;
        const phoneNumber = messageData?.phoneNumber;
        const queueId = messageData?.queueId || "";
        const sendSignature = messageData?.sendSignature || false;
        const closeTicket = messageData?.closeTicket || false;
        
        if (!apiToken || !message || !phoneNumber) {
          console.log(`SendMessage: Dados incompletos - apiToken: ${!!apiToken}, message: ${!!message}, phoneNumber: ${phoneNumber}`);
          return;
        }
        
        try {
          console.log(`SendMessage: Enviando mensagem para ${phoneNumber} via API externa`);
          
          // Buscar informações do contato e ticket para substituir variáveis
          let processedMessage = message;
          
          if (idTicket) {
            const ticket = await Ticket.findOne({
              where: { id: idTicket, companyId },
              include: [
                { model: Contact, as: "contact" },
                { model: User, as: "user" },
                { model: Queue, as: "queue" }
              ]
            });
            
            if (ticket) {
              const contact = ticket.contact;
              const user = ticket.user;
              const queue = ticket.queue;
              
              // Substituir variáveis padrão na mensagem
              processedMessage = message
                .replace(/\{\{name\}\}/g, contact?.name || "")
                .replace(/\{\{firstName\}\}/g, contact?.name?.split(" ")[0] || "")
                .replace(/\{\{userName\}\}/g, user?.name || "")
                .replace(/\{\{ticket_id\}\}/g, ticket.id.toString())
                .replace(/\{\{queue\}\}/g, queue?.name || "")
                .replace(/\{\{protocol\}\}/g, ticket.uuid || "")
                .replace(/\{\{connection\}\}/g, ticket.whatsapp?.name || "");
              
              // Adicionar saudação
              const hour = new Date().getHours();
              let greeting = "Boa madrugada";
              if (hour >= 5 && hour < 12) greeting = "Bom dia";
              else if (hour >= 12 && hour < 18) greeting = "Boa tarde";
              else if (hour >= 18 && hour < 24) greeting = "Boa noite";
              
              processedMessage = processedMessage.replace(/\{\{ms\}\}/g, greeting);
              
              // Adicionar data e hora
              const now = new Date();
              processedMessage = processedMessage
                .replace(/\{\{date\}\}/g, now.toLocaleDateString("pt-BR"))
                .replace(/\{\{hour\}\}/g, now.toLocaleTimeString("pt-BR"));
              
              // Substituir variáveis do dataWebhook (nós de pergunta e API)
              const dataWebhook = ticket?.dataWebhook as any;
              if (dataWebhook) {
                // Variáveis de respostas de perguntas
                if (dataWebhook.questionAnswers) {
                  Object.entries(dataWebhook.questionAnswers).forEach(([key, value]) => {
                    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    processedMessage = processedMessage.replace(regex, String(value || ""));
                  });
                }
                
                // Variáveis salvas de APIs e outras fontes
                if (dataWebhook.variables) {
                  Object.entries(dataWebhook.variables).forEach(([key, value]) => {
                    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    processedMessage = processedMessage.replace(regex, String(value || ""));
                  });
                }
                
                // Variáveis de estado específicas (ex: respostas recentes)
                if (dataWebhook.questionState && dataWebhook.questionState.answerValue) {
                  const answerKey = dataWebhook.questionState.answerKey;
                  if (answerKey) {
                    const regex = new RegExp(`\\{\\{${answerKey}\\}\\}`, 'g');
                    processedMessage = processedMessage.replace(regex, String(dataWebhook.questionState.answerValue || ""));
                  }
                }
              }
              
              console.log(`SendMessage: Mensagem processada com variáveis: ${processedMessage}`);
              console.log(`SendMessage: Variáveis disponíveis:`, dataWebhook?.variables || {});
              console.log(`SendMessage: Respostas de perguntas:`, dataWebhook?.questionAnswers || {});
            }
          }
          
          // Preparar body da requisição
          const requestBody = {
            number: phoneNumber,
            body: processedMessage,
            userId: "", // Não utilizado conforme solicitado
            queueId: queueId,
            sendSignature: sendSignature,
            closeTicket: closeTicket
          };
          
          // Enviar requisição para API externa
          const response = await fetch("https://api.faedeveloper.com.br/api/messages/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
          });
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
          }
          
          const responseData = await response.json();
          console.log(`SendMessage: Mensagem enviada com sucesso via API externa`, responseData);
          
        } catch (error) {
          console.error(`SendMessage: Erro ao enviar mensagem via API externa:`, error);
        }
      }

      // Nó: Requisição API
      if (nodeSelected.type === "apiRequest") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const apiData = nodeSelected.data?.data || nodeSelected.data;
        const method = apiData?.method || "GET";
        const url = apiData?.url;
        const headers = apiData?.headers;
        const body = apiData?.body;
        const saveResponse = apiData?.saveResponse;
        const savedVariables = apiData?.savedVariables || [];
        
        if (url) {
          console.log(`ApiRequest: ${method} ${url}`);
          
          try {
            // Substituir variáveis na URL e body
            let processedUrl = url;
            let processedBody = body;
            
            const contact = await Contact.findOne({
              where: { number: numberClient, companyId }
            });
            
            if (contact) {
              const variables: Record<string, string> = {
                "{{name}}": contact.name || "",
                "{{number}}": contact.number || "",
                "{{email}}": contact.email || "",
              };
              
              // Adicionar variáveis do webhook
              if (ticket?.dataWebhook?.variables) {
                Object.entries(ticket.dataWebhook.variables).forEach(([key, value]) => {
                  variables[`{{${key}}}`] = String(value);
                });
              }
              
              Object.entries(variables).forEach(([key, value]) => {
                // Usar split/join para substituição robusta
                processedUrl = processedUrl.split(key).join(value);
                if (processedBody) {
                  processedBody = processedBody.split(key).join(value);
                }
              });
            }
            
            // Parsear headers
            let parsedHeaders = {};
            if (headers) {
              try {
                parsedHeaders = JSON.parse(headers);
              } catch (e) {
                console.log("ApiRequest: Erro ao parsear headers", e);
              }
            }
            
            // Parsear body
            let parsedBody = undefined;
            if (processedBody && ["POST", "PUT", "PATCH"].includes(method)) {
              try {
                parsedBody = JSON.parse(processedBody);
              } catch (e) {
                parsedBody = processedBody;
              }
            }
            
            const response = await axios({
              method: method.toLowerCase(),
              url: processedUrl,
              headers: parsedHeaders,
              data: parsedBody,
              timeout: 30000
            });
            
            console.log(`ApiRequest: Resposta ${response.status}`);
            console.log(`ApiRequest: Salvando ${savedVariables.length} variáveis da resposta`);
            
            // Salvar variáveis extraídas da resposta
            if (savedVariables.length > 0 && ticket) {
              const currentWebhook = ticket.dataWebhook || {};
              const currentVariables = currentWebhook.variables || {};
              const newVariables = {};
              
              savedVariables.forEach(variable => {
                try {
                  // Extrair valor do JSON usando o path
                  const value = getNestedValue(response.data, variable.path);
                  if (value !== undefined) {
                    newVariables[variable.name] = value;
                    console.log(`ApiRequest: Variável ${variable.name} = ${value}`);
                  }
                } catch (error) {
                  console.log(`ApiRequest: Erro ao extrair variável ${variable.path}:`, error);
                }
              });
              
              // Salvar resposta completa se configurado
              if (saveResponse) {
                newVariables[saveResponse] = response.data;
              }
              
              await ticket.update({
                dataWebhook: {
                  ...currentWebhook,
                  variables: {
                    ...currentVariables,
                    ...newVariables
                  }
                }
              });
            }
            // Salvar apenas resposta completa se não tiver variáveis específicas
            else if (saveResponse && ticket) {
              const currentWebhook = ticket.dataWebhook || {};
              const currentVariables = currentWebhook.variables || {};
              
              await ticket.update({
                dataWebhook: {
                  ...currentWebhook,
                  variables: {
                    ...currentVariables,
                    [saveResponse]: response.data
                  }
                }
              });
            }
          } catch (error: any) {
            console.error(`ApiRequest: Erro na requisição`, error.message);
          }
        }
      }

      // Nó: Adicionar Tag (normal)
      if (nodeSelected.type === "addTag") {
        console.log(`=== PROCESSANDO NÓ addTag (TAG NORMAL) ===`);
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const tagData = nodeSelected.data?.data || nodeSelected.data;
        const tagId = tagData?.id;
        
        console.log(`addTag: tagId=${tagId}, ticketId=${ticket?.id}`);
        
        if (tagId && ticket) {
          console.log(`AddTag: Adicionando tag NORMAL ${tagId} ao ticket ${ticket.id}`);
          
          try {
            // Verificar se a tag normal existe (com filtro kanban: 0)
            const tag = await Tag.findOne({
              where: { id: tagId, companyId, kanban: 0 }
            });
            
            console.log(`addTag: Tag NORMAL encontrada:`, tag ? { id: tag.id, name: tag.name, kanban: tag.kanban } : null);
            
            if (tag) {
              // Verificar se a tag já está associada ao ticket
              const existingTag = await TicketTag.findOne({
                where: { ticketId: ticket.id, tagId: tag.id }
              });
              
              console.log(`addTag: Tag já existe?`, existingTag ? 'SIM' : 'NÃO');
              
              if (!existingTag) {
                console.log(`addTag: Criando ContactTag (como o frontend)...`);
                try {
                  // Criar ContactTag diretamente (como o frontend faz)
                  const newContactTag = await ContactTag.create({
                    contactId: ticket.contactId,
                    tagId: tag.id,
                    companyId: companyId
                  });
                  
                  console.log(`addTag: ContactTag criada com ID:`, newContactTag?.id);
                  console.log(`addTag: ContactTag completa:`, JSON.stringify(newContactTag, null, 2));
                  
                  // Também criar TicketTag para consistência
                  const newTicketTag = await TicketTag.create({
                    ticketId: ticket.id,
                    tagId: tag.id
                  });
                  console.log(`addTag: TicketTag criada com ID:`, newTicketTag?.id);
                  console.log(`AddTag: Tag NORMAL "${tag.name}" adicionada com sucesso`);
                  
                } catch (createError: any) {
                  console.error(`addTag: Erro ao criar tags:`, createError.message);
                  console.error(`addTag: Stack:`, createError.stack);
                }
                
                // Emitir evento de atualização
                const io = getIO();
                const ticketUpdated = await ShowTicketService(ticket.id, companyId);
                console.log(`addTag: Ticket atualizado com tags:`, ticketUpdated.tags?.map(t => ({ id: t.id, name: t.name })));
                io.of(String(companyId))
                  .emit(`company-${companyId}-ticket`, {
                    action: "update",
                    ticket: ticketUpdated
                  });
              } else {
                console.log(`AddTag: Tag NORMAL "${tag.name}" já está associada ao ticket`);
              }
            } else {
              console.log(`AddTag: Tag NORMAL ${tagId} não encontrada`);
            }
          } catch (error: any) {
            console.error(`AddTag: Erro ao adicionar tag NORMAL`, error.message);
            console.error(`AddTag: Stack:`, error.stack);
          }
        }
      }

      // Nó: Adicionar Tag Kanban
      if (nodeSelected.type === "addTagKanban") {
        console.log(`=== PROCESSANDO NÓ addTagKanban (TAG KANBAN) ===`);
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const tagData = nodeSelected.data?.data || nodeSelected.data;
        const tagId = tagData?.id;
        
        console.log(`addTagKanban: tagId=${tagId}, ticketId=${ticket?.id}`);
        
        if (tagId && ticket) {
          console.log(`AddTagKanban: Adicionando tag KANBAN ${tagId} ao ticket ${ticket.id}`);
          
          try {
            // Verificar se a tag kanban existe (com filtro kanban: 1)
            const tag = await Tag.findOne({
              where: { id: tagId, companyId, kanban: 1 }
            });
            
            console.log(`addTagKanban: Tag Kanban encontrada:`, tag ? { id: tag.id, name: tag.name, kanban: tag.kanban } : null);
            
            if (tag) {
              // Remover tags kanban anteriores
              const existingKanbanTags = await TicketTag.findAll({
                where: { ticketId: ticket.id },
                include: [{
                  model: Tag,
                  where: { kanban: 1 }
                }]
              });
              
              console.log(`addTagKanban: Removendo ${existingKanbanTags.length} tags kanban anteriores`);
              
              for (const existingTag of existingKanbanTags) {
                await existingTag.destroy();
              }
              
              // Adicionar nova tag kanban
              await TicketTag.create({
                ticketId: ticket.id,
                tagId: tag.id
              });
              
              console.log(`AddTagKanban: Tag KANBAN "${tag.name}" adicionada com sucesso`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
            } else {
              console.log(`AddTagKanban: Tag KANBAN ${tagId} não encontrada (deve ter kanban=1)`);
            }
          } catch (error: any) {
            console.error(`AddTagKanban: Erro ao adicionar tag KANBAN`, error.message);
          }
        }
      }

      // Nó: Transferir para Fila
      if (nodeSelected.type === "transferQueue") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const queueData = nodeSelected.data?.data || nodeSelected.data;
        const queueId = queueData?.queueId;
        
        if (queueId && ticket) {
          console.log(`TransferQueue: Transferindo ticket ${ticket.id} para fila ${queueId}`);
          
          try {
            // Verificar se a fila existe
            const queue = await ShowQueueService(queueId, companyId);
            
            if (queue) {
              // Atualizar ticket com nova fila
              await UpdateTicketService({
                ticketData: {
                  queueId: queueId,
                  userId: null // Remove usuário ao transferir para fila
                },
                ticketId: ticket.id,
                companyId
              });
              
              // Criar log da transferência
              await CreateLogTicketService({
                ticketId: ticket.id,
                type: "queue",
                queueId: queueId
              });
              
              console.log(`TransferQueue: Ticket transferido para fila ${queue.name}`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
            } else {
              console.log(`TransferQueue: Fila ${queueId} não encontrada`);
            }
          } catch (error: any) {
            console.error(`TransferQueue: Erro ao transferir para fila`, error.message);
          }
        }
      }

      // Nó: Ticket (transferência para fila)
      if (nodeSelected.type === "ticket") {
        console.log(`=== PROCESSANDO NÓ ticket (TRANSFERÊNCIA PARA FILA) ===`);
        console.log(`ticket: nodeSelected.data=`, JSON.stringify(nodeSelected.data, null, 2));
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const ticketData = nodeSelected.data?.data || nodeSelected.data;
        const queueId = ticketData?.id; // O queueId está em .id não .queueId
        
        console.log(`ticket: queueId=${queueId}, ticketId=${ticket?.id}`);
        
        if (queueId && ticket) {
          console.log(`Ticket: Transferindo ticket ${ticket.id} para fila ${queueId}`);
          
          try {
            // Verificar se a fila existe
            const queue = await ShowQueueService(queueId, companyId);
            
            if (queue) {
              console.log(`Ticket: Status ANTES da transferência: ${ticket.status}`);
              
              // Usar a mesma lógica da IA: só atualiza queueId, não remove usuário
              await UpdateTicketService({
                ticketData: { 
                  queueId: queueId,
                  status: "pending" // Mudar status para "aguardando" ao transferir para fila
                },
                ticketId: ticket.id,
                companyId
              });
              
              // Sair do modo fluxo/automação
              await ticket.update({
                flowWebhook: false, // Sair do modo fluxo/automação
                flowStopped: null // Limpar parada do fluxo
              });
              
              // Verificar status após atualização
              const ticketAfterUpdate = await ShowTicketService(ticket.id, companyId);
              console.log(`Ticket: Status DEPOIS da transferência: ${ticketAfterUpdate.status}`);
              
              // Criar log da transferência
              await CreateLogTicketService({
                ticketId: ticket.id,
                type: "queue",
                queueId: queueId
              });
              
              console.log(`Ticket: Ticket transferido para fila ${queue.name} (mantendo usuário)`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
            } else {
              console.log(`Ticket: Fila ${queueId} não encontrada`);
            }
          } catch (error: any) {
            console.error(`Ticket: Erro ao transferir para fila`, error.message);
          }
        }
      }

      // Nó: Transferir para Usuário
      if (nodeSelected.type === "transferUser") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const userData = nodeSelected.data?.data || nodeSelected.data;
        const userId = userData?.userId;
        
        if (userId && ticket) {
          console.log(`TransferUser: Transferindo ticket ${ticket.id} para usuário ${userId}`);
          
          try {
            // Verificar se o usuário existe
            const user = await User.findOne({
              where: { id: userId, companyId }
            });
            
            if (user) {
              // Atualizar ticket com novo usuário
              await UpdateTicketService({
                ticketData: {
                  userId: userId,
                  status: "open" // Mudar status para "open" ao transferir para usuário
                },
                ticketId: ticket.id,
                companyId
              });
              
              // Criar log da transferência
              await CreateLogTicketService({
                ticketId: ticket.id,
                type: "userDefine",
                userId: userId
              });
              
              console.log(`TransferUser: Ticket transferido para usuário ${user.name}`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
              
              // Enviar mensagem de notificação
              const notificationMessage = `Ticket transferido para ${user.name}`;
              await SendWhatsAppMessage({
                body: notificationMessage,
                ticket: ticketUpdated,
                quotedMsg: null
              });
            } else {
              console.log(`TransferUser: Usuário ${userId} não encontrado`);
            }
          } catch (error: any) {
            console.error(`TransferUser: Erro ao transferir para usuário`, error.message);
          }
        }
      }

      // Nó: Adicionar Tag
      if (nodeSelected.type === "addTag") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const tagData = nodeSelected.data?.data || nodeSelected.data;
        const tagId = tagData?.tagId;
        
        if (tagId && ticket) {
          console.log(`addTag: Adicionando tag ${tagId} ao ticket ${ticket.id}`);
          
          try {
            // Verificar se a tag existe
            const tag = await Tag.findOne({
              where: { id: tagId, companyId }
            });
            
            if (tag) {
              // Remover tags anteriores do contato
              await TicketTag.destroy({
                where: { ticketId: ticket.id }
              });
              
              // Adicionar nova tag ao ticket
              await TicketTag.create({
                ticketId: ticket.id,
                tagId: tagId
              });
              
              // Adicionar tag ao contato também
              await ContactTag.create({
                contactId: ticket.contactId,
                tagId: tagId
              });
              
              console.log(`addTag: Tag "${tag.name}" adicionada com sucesso`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
            } else {
              console.log(`addTag: Tag ${tagId} não encontrada`);
            }
          } catch (error: any) {
            console.error(`addTag: Erro ao adicionar tag`, error.message);
          }
        }
      }

      // Nó: Etapa Kanban
      if (nodeSelected.type === "kanbanStage") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const kanbanData = nodeSelected.data?.data || nodeSelected.data;
        const tagId = kanbanData?.tagId;
        
        if (tagId && ticket) {
          console.log(`KanbanStage: Definindo etapa kanban ${tagId} para ticket ${ticket.id}`);
          
          try {
            // Verificar se a tag kanban existe
            const tag = await Tag.findOne({
              where: { id: tagId, companyId, kanban: 1 }
            });
            
            if (tag) {
              // Remover todas as tags kanban anteriores
              const existingKanbanTags = await TicketTag.findAll({
                where: { ticketId: ticket.id },
                include: [{
                  model: Tag,
                  where: { kanban: 1 }
                }]
              });
              
              for (const existingTag of existingKanbanTags) {
                await existingTag.destroy();
              }
              
              // Adicionar nova tag kanban
              await TicketTag.create({
                ticketId: ticket.id,
                tagId: tag.id
              });
              
              console.log(`KanbanStage: Etapa ${tag.name} definida com sucesso`);
              
              // Emitir evento de atualização
              const io = getIO();
              const ticketUpdated = await ShowTicketService(ticket.id, companyId);
              io.of(String(companyId))
                .emit(`company-${companyId}-ticket`, {
                  action: "update",
                  ticket: ticketUpdated
                });
            } else {
              console.log(`KanbanStage: Tag kanban ${tagId} não encontrada`);
            }
          } catch (error: any) {
            console.error(`KanbanStage: Erro ao definir etapa kanban`, error.message);
          }
        }
      }

      // Nó: Condição
      let isCondition: boolean = false;
      const normalizeVariableKey = (rawValue?: string) => {
        if (!rawValue) return "";
        return rawValue.replace(/^[\s{]+/, "").replace(/[\s}]+$/, "").trim();
      };

      if (nodeSelected.type === "condition") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const conditionData = nodeSelected.data?.data || nodeSelected.data;
        const key = conditionData?.key;
        const normalizedKey = normalizeVariableKey(key);
        const condition = conditionData?.condition;
        const value = conditionData?.value;
        
        console.log(`Condition: Avaliando ${normalizedKey || key} ${condition} ${value}`);
        
        // Obter valor da variável
        let variableValue: any = "";
        
        if (ticket?.dataWebhook?.variables) {
          if (normalizedKey && ticket.dataWebhook.variables[normalizedKey] !== undefined) {
            variableValue = ticket.dataWebhook.variables[normalizedKey];
          } else if (key && ticket.dataWebhook.variables[key] !== undefined) {
            variableValue = ticket.dataWebhook.variables[key];
          }
        }
        
        // Avaliar condição
        let conditionResult = false;
        
        switch (parseInt(condition)) {
          case 1: // ==
            conditionResult = String(variableValue) === String(value);
            break;
          case 6: // contains (substring)
            conditionResult = String(variableValue || "")
              .toLowerCase()
              .includes(String(value || "").toLowerCase());
            break;
          case 2: // >=
            conditionResult = parseFloat(variableValue) >= parseFloat(value);
            break;
          case 3: // <=
            conditionResult = parseFloat(variableValue) <= parseFloat(value);
            break;
          case 4: // <
            conditionResult = parseFloat(variableValue) < parseFloat(value);
            break;
          case 5: // >
            conditionResult = parseFloat(variableValue) > parseFloat(value);
            break;
          default:
            conditionResult = String(variableValue) === String(value);
        }
        
        console.log(`Condition: Resultado = ${conditionResult}`);
        
        // Encontrar a conexão correta baseada no resultado
        const resultConnect = connects.filter(
          connect => connect.source === nodeSelected.id
        );
        
        if (conditionResult) {
          // Caminho "true" (Sim)
          const trueConnection = resultConnect.find(item => item.sourceHandle === "true");
          if (trueConnection) {
            next = trueConnection.target;
            noAlterNext = true;
          }
        } else {
          // Caminho "false" (Não)
          const falseConnection = resultConnect.find(item => item.sourceHandle === "false");
          if (falseConnection) {
            next = falseConnection.target;
            noAlterNext = true;
          }
        }
        
        isCondition = true;
      }

      // Nó: 2ª Via Boleto Asaas
      let isAsaas: boolean = false;
      if (nodeSelected.type === "asaas") {
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        const asaasData = nodeSelected.data?.data || nodeSelected.data;
        const message = asaasData?.message || "Por favor, informe seu CPF para buscarmos seu boleto:";
        const successMessage = asaasData?.successMessage || "Encontramos seu boleto! Enviando os dados...";
        const errorMessage = asaasData?.errorMessage || "Desculpe, não encontramos nenhum boleto pendente para este CPF.";
        
        console.log(`Asaas: Iniciando fluxo de 2ª via de boleto`);
        
        const currentWebhookData = ticket?.dataWebhook || {};
        const asaasState = currentWebhookData?.asaasState || {};
        const awaitingCpf =
          asaasState?.awaiting === true &&
          asaasState?.nodeId === nodeSelected.id;

        if (!awaitingCpf) {
          // Enviar mensagem solicitando CPF e marcar estado de espera
          await SendMessageFlow(
            whatsapp,
            {
              number: numberClient,
              body: message
            },
            ticket?.id,
            ticket
          );

          if (ticket) {
            const updatedWebhook = { ...currentWebhookData, asaasState: { awaiting: true, nodeId: nodeSelected.id } };
            await ticket.update({
              queueId: ticket.queueId ? ticket.queueId : null,
              userId: null,
              companyId: companyId,
              flowWebhook: true,
              lastFlowId: nodeSelected.type === "directOpenai" ? ticket.lastFlowId : nodeSelected.id,
              dataWebhook: updatedWebhook,
              hashFlowId: hashWebhookId,
              flowStopped: idFlowDb.toString()
            });
            ticket.dataWebhook = updatedWebhook;
          }

          console.log(`Asaas: Aguardando CPF do cliente`);
          break;
        }

       
        
        if (pressKey && pressKey !== "999") {
          // Cliente respondeu com o CPF
          const cpf = pressKey.replace(/\D/g, ''); // Remove caracteres não numéricos
          console.log(`Asaas: CPF recebido: ${cpf}`);
          
          const resultConnect = connects.filter(
            connect => connect.source === nodeSelected.id
          );
          
          try {
            const boletoData = await getAsaasSecondCopyByCpf(companyId, cpf);
            if (ticket?.dataWebhook?.asaasState) {
              const updatedWebhook = { ...(ticket.dataWebhook || {}) };
              delete updatedWebhook.asaasState;
              await ticket.update({ dataWebhook: updatedWebhook });
              ticket.dataWebhook = updatedWebhook;
            }
            
            // Não enviar mensagem de sucesso aqui, apenas o resumo abaixo
            // await SendMessageFlow(whatsapp, {
            //   number: numberClient,
            //   body: successMessage
            // }, ticket?.id, ticket);
            
            const boletoFileSources = [
              boletoData.invoicePdfUrl,
              boletoData.bankSlipUrl,
              boletoData.invoiceUrl
            ].filter(Boolean);

            const boletoLink = boletoFileSources[0] || null;
            const boletoFileSource = boletoLink;
            const wbot = getWbot(whatsapp.id);
            const contactNumber = `${ticket?.contact?.number || numberClient}${
              ticket?.isGroup ? "@g.us" : "@s.whatsapp.net"
            }`;
            
            // Enviar PDF do boleto se disponível
            if (boletoFileSource) {
              try {
                console.log(`Asaas: Tentando enviar PDF do boleto: ${boletoFileSource}`);
                
                const { buffer: pdfBuffer, contentType } = await fetchPdfBufferFromUrl(
                  boletoFileSource
                );
                
                const fileName = `boleto-${boletoData.paymentId || "asaas"}.pdf`;
                
                // Garantir mimetype compatível com Android
                const mimetype = "application/pdf";
                
                console.log(`Asaas: Enviando PDF - Tamanho: ${pdfBuffer.length} bytes, ContentType: ${mimetype}`);
                
                const messagePayload = {
                  document: pdfBuffer,
                  fileName,
                  mimetype
                };
                
                await wbot.sendMessage(contactNumber, messagePayload);
                console.log(`Asaas: PDF enviado com sucesso`);
                
              } catch (pdfError: any) {
                console.error(`Asaas: Erro ao enviar PDF do boleto`, pdfError.message);
                
                // Fallback: enviar link do boleto se PDF falhar
                try {
                  console.log(`Asaas: Enviando link do boleto como fallback`);
                  await wbot.sendMessage(contactNumber, {
                    text: `📄 Boleto - Vencimento: ${boletoData.dueDate || "N/A"} - Valor: R$ ${
                      boletoData.value?.toFixed(2) || "0.00"
                    }\n\n🔗 Link para o boleto: ${boletoFileSource}\n\n💡 Copie e cole o link no navegador para baixar o PDF.`
                  });
                } catch (linkError: any) {
                  console.error(`Asaas: Erro ao enviar link do boleto`, linkError.message);
                }
              }
            }
            
            // Enviar mensagem curta com código PIX e link
            const pixMessage = [];
            if (boletoData.pixCopyPaste) {
              pixMessage.push(`💠 PIX: ${boletoData.pixCopyPaste}`);
            }
            if (boletoLink) {
              pixMessage.push(`🔗 Link: ${boletoLink}`);
            }
            
            if (pixMessage.length > 0) {
              await SendMessageFlow(whatsapp, {
                number: numberClient,
                body: pixMessage.join('\n')
              }, ticket?.id, ticket);
            }
            
            // Enviar imagem do QR Code PIX se disponível
            if (boletoData.pixQrCodeImage) {
              try {
                const imageBuffer = Buffer.from(boletoData.pixQrCodeImage, "base64");
                await wbot.sendMessage(contactNumber, {
                  image: imageBuffer
                });
              } catch (err) {
                console.error("Asaas: Falha ao enviar imagem do QR Code PIX", err);
              }
            }
            
            console.log(`Asaas: Boleto enviado com sucesso`);
            
            // Seguir caminho de sucesso
            const successConnection = resultConnect.find(item => item.sourceHandle === "success");
            if (successConnection) {
              next = successConnection.target;
              noAlterNext = true;
            }
            pressKey = "999";
          } catch (error: any) {
            console.error(`Asaas: Erro ao buscar boleto`, error.message);
            if (ticket?.dataWebhook?.asaasState) {
              const updatedWebhook = { ...(ticket.dataWebhook || {}) };
              delete updatedWebhook.asaasState;
              await ticket.update({ dataWebhook: updatedWebhook });
              ticket.dataWebhook = updatedWebhook;
            }
            
            // Enviar mensagem de erro
            await SendMessageFlow(whatsapp, {
              number: numberClient,
              body: errorMessage
            }, ticket?.id, ticket);
            
            // Seguir caminho de erro
            const errorConnection = resultConnect.find(item => item.sourceHandle === "error");
            if (errorConnection) {
              next = errorConnection.target;
              noAlterNext = true;
            }
            pressKey = "999";
          }
          
          isAsaas = true;
        } else {
          // Aguardando resposta do cliente - pausar fluxo
          console.log(`Asaas: Aguardando CPF do cliente`);
          break;
        }
      }

      let isRandomizer: boolean;
      if (nodeSelected.type === "randomizer") {
        const selectedRandom = randomizarCaminho(
          nodeSelected.data.percent / 100
        );

        const resultConnect = connects.filter(
          connect => connect.source === nodeSelected.id
        );
        if (selectedRandom === "A") {
          next = resultConnect.filter(item => item.sourceHandle === "a")[0]
            .target;
          noAlterNext = true;
        } else {
          next = resultConnect.filter(item => item.sourceHandle === "b")[0]
            .target;
          noAlterNext = true;
        }
        isRandomizer = true;
      }

      // Nó: Envio de Email SMTP
      if (nodeSelected.type === "smtp") {
        console.log("SMTP: Iniciando envio de email");
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
        }
        
        if (!ticket) {
          console.log("SMTP: Ticket não encontrado");
          break;
        }
        
        const smtpConfig = nodeSelected.data?.smtpConfig || {};
        const emailConfig = nodeSelected.data?.emailConfig || {};
        
        // Obter conexões para caminhos de erro
        const resultConnect = connects.filter(
          connect => connect.source === nodeSelected.id
        );
        
        // Extrair variáveis do dataWebhook
        const variables = ticket?.dataWebhook?.variables || {};
        console.log("SMTP: Variáveis disponíveis:", variables);
        
        // Formatar mensagem com variáveis
        let emailBody = emailConfig?.content || emailConfig?.body || "";
        let emailSubject = emailConfig?.subject || "";
        let recipientEmail = emailConfig?.to || "";
        
        // Substituir variáveis no conteúdo
        console.log("SMTP: Antes da substituição - recipientEmail:", JSON.stringify(recipientEmail));
        console.log("SMTP: Variáveis disponíveis:", JSON.stringify(variables));
        
        Object.keys(variables).forEach(key => {
          const placeholder = `{{${key}}}`;
          const value = variables[key];
          console.log(`SMTP: Substituindo ${placeholder} por ${value}`);
          console.log(`SMTP: recipientEmail antes: ${JSON.stringify(recipientEmail)}`);
          
          // Verificar se o placeholder existe na string
          if (recipientEmail.includes(placeholder)) {
            console.log(`SMTP: Placeholder ${placeholder} encontrado!`);
            // Usar replaceAll em vez de replace com regex para evitar problemas
            recipientEmail = recipientEmail.split(placeholder).join(value);
            console.log(`SMTP: recipientEmail depois: ${JSON.stringify(recipientEmail)}`);
          } else {
            console.log(`SMTP: Placeholder ${placeholder} NÃO encontrado em ${JSON.stringify(recipientEmail)}`);
          }
          
          emailBody = emailBody.split(placeholder).join(value);
          emailSubject = emailSubject.split(placeholder).join(value);
        });
        console.log("SMTP: Após substituição - recipientEmail:", JSON.stringify(recipientEmail));
        
        console.log("SMTP: Enviando email para:", recipientEmail);
        console.log("SMTP: Assunto:", emailSubject);
        
        try {
          // Importar serviço de email
          const nodemailer = require('nodemailer');
          
          // Configurar transporter - MÉTODO CORRETO: createTransport
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: smtpConfig.useTLS || false, // usar useTLS do formulário
            auth: {
              user: smtpConfig.username, // usar username do formulário
              pass: smtpConfig.password  // usar password do formulário
            }
          });
          
          // Enviar email
          await transporter.sendMail({
            from: smtpConfig.fromEmail || smtpConfig.username, // usar fromEmail do formulário
            to: recipientEmail,
            subject: emailSubject,
            html: emailBody,
            text: emailBody.replace(/<[^>]*>/g, '') // Versão texto
          });
          
          console.log("SMTP: Email enviado com sucesso");
          
          // Enviar confirmação para o WhatsApp - VERIFICAR SE EXISTE CONTACT
          if (ticket && ticket.contact && ticket.contact.number) {
            const confirmationMessage = `✅ Email enviado com sucesso para ${recipientEmail}`;
            await SendMessageFlow(whatsapp, {
              number: `${ticket.contact.number}@s.whatsapp.net`,
              body: confirmationMessage
            }, ticket?.id, ticket);
          } else {
            console.log("SMTP: Contact não disponível para enviar confirmação");
          }
          
        } catch (error) {
          console.error("SMTP: Erro ao enviar email:", error);
          
          // Enviar mensagem de erro para o WhatsApp - VERIFICAR SE EXISTE CONTACT
          if (ticket && ticket.contact && ticket.contact.number) {
            const errorMessage = `❌ Falha ao enviar email. Tente novamente mais tarde.`;
            await SendMessageFlow(whatsapp, {
              number: `${ticket.contact.number}@s.whatsapp.net`,
              body: errorMessage
            }, ticket?.id, ticket);
          } else {
            console.log("SMTP: Contact não disponível para enviar mensagem de erro");
          }
          
          // Seguir caminho de erro se existir
          const errorConnection = resultConnect.find(item => item.sourceHandle === "error");
          if (errorConnection) {
            next = errorConnection.target;
            noAlterNext = true;
          }
        }
      }

      // Nó: Encerrar Ticket
      if (nodeSelected.type === "closeTicket") {
        console.log(`=== PROCESSANDO NÓ closeTicket (ENCERRAR TICKET) ===`);
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: {
              id: idTicket,
              whatsappId: whatsappId,
              companyId: companyId
            }
          });
        }

        // Nó: Google Sheets
        if (nodeSelected.type === "googleSheets") {
          console.log("GoogleSheets: Iniciando operação");
          
          // Garantir que o ticket existe
          if (!ticket && idTicket) {
            ticket = await ShowTicketService(idTicket, companyId);
          }
          
          if (!ticket) {
            console.log("GoogleSheets: Ticket não encontrado");
            break;
          }
          
          const sheetsConfig = nodeSelected.data?.sheetsConfig || {};
          const operation = nodeSelected.data?.operation || "list";
          
          // Obter conexões para caminhos de erro
          const resultConnect = connects.filter(
            (connect) => connect.source === nodeSelected.id && connect.sourceHandle === "error"
          );
          
          // Extrair variáveis do dataWebhook
          const variables = ticket?.dataWebhook?.variables || {};
          console.log("GoogleSheets: Variáveis disponíveis:", variables);
          
          try {
            // Importar serviço Google Sheets
            const GoogleSheetsService = require("../GoogleSheetsService").default;
            const sheetsService = new GoogleSheetsService();
            
            let result;
            
            switch (operation) {
              case "list":
                result = await sheetsService.listData(sheetsConfig, variables);
                break;
                
              case "add":
                result = await sheetsService.addRow(sheetsConfig, nodeSelected.data?.rowData || {}, variables);
                break;
                
              case "edit":
                result = await sheetsService.editRow(
                  sheetsConfig, 
                  nodeSelected.data?.searchColumn || "",
                  nodeSelected.data?.searchValue || "",
                  nodeSelected.data?.rowData || {},
                  variables
                );
                break;
                
              case "delete":
                result = await sheetsService.deleteRow(
                  sheetsConfig,
                  nodeSelected.data?.searchColumn || "",
                  nodeSelected.data?.searchValue || "",
                  variables
                );
                break;
                
              case "search":
                result = await sheetsService.searchData(
                  sheetsConfig,
                  nodeSelected.data?.searchColumn || "",
                  nodeSelected.data?.searchValue || "",
                  variables
                );
                break;
                
              default:
                throw new Error(`Operação "${operation}" não suportada`);
            }
            
            console.log("GoogleSheets: Operação executada com sucesso:", result);
            
            // Armazenar resultado na variável de saída se especificada
            const outputVariable = nodeSelected.data?.outputVariable;
            if (outputVariable && ticket?.dataWebhook) {
              ticket.dataWebhook.variables[outputVariable] = JSON.stringify(result);
              await ticket.save();
            }
            
            // Enviar confirmação para o WhatsApp
            if (ticket && ticket.contact && ticket.contact.number) {
              const confirmationMessage = `✅ Operação "${operation}" no Google Sheets executada com sucesso!`;
              await SendMessageFlow(whatsapp, {
                number: `${ticket.contact.number}@s.whatsapp.net`,
                body: confirmationMessage
              }, ticket?.id, ticket);
            }
            
          } catch (error) {
            console.error("GoogleSheets: Erro na operação:", error);
            
            // Enviar mensagem de erro para o WhatsApp
            if (ticket && ticket.contact && ticket.contact.number) {
              const errorMessage = `❌ Erro na operação do Google Sheets: ${error.message}`;
              await SendMessageFlow(whatsapp, {
                number: `${ticket.contact.number}@s.whatsapp.net`,
                body: errorMessage
              }, ticket?.id, ticket);
            }
            
            // Seguir caminho de erro se existir
            if (resultConnect.length > 0) {
              const nextNode = nodes.find(
                (node) => node.id === resultConnect[0].target
              );
              if (nextNode) {
                await ActionsWebhookService(
                  whatsappId,
                  idFlowDb,
                  companyId,
                  nodes,
                  connects,
                  nextNode.id,
                  dataWebhook,
                  details,
                  hashWebhookId,
                  pressKey,
                  idTicket,
                  numberPhrase,
                  msg
                );
              }
            }
            
            break;
          }
        }

        if (ticket) {
          // Enviar mensagem de encerramento se configurada
          const message = nodeSelected.data?.message;
          if (message) {
            console.log(`closeTicket: Enviando mensagem de encerramento: ${message}`);
            
            // Substituir variáveis na mensagem
            let processedMessage = message;
            const contact = await Contact.findOne({
              where: { number: numberClient, companyId }
            });
            
            if (contact) {
              const variables: Record<string, string> = {
                "{{name}}": contact.name || "",
                "{{number}}": contact.number || "",
                "{{email}}": contact.email || "",
              };
              
              // Adicionar variáveis do webhook
              if (ticket?.dataWebhook?.variables) {
                Object.entries(ticket.dataWebhook.variables).forEach(([key, value]) => {
                  variables[`{{${key}}}`] = String(value);
                });
              }
              
              Object.entries(variables).forEach(([key, value]) => {
                processedMessage = processedMessage.split(key).join(value);
              });
            }
            
            // Enviar mensagem
            const wbot = getWbot(whatsapp.id);
            await wbot.sendMessage(`${numberClient}@s.whatsapp.net`, {
              text: processedMessage
            });
            
            // Criar registro da mensagem
            const messageData: MessageData = {
              wid: randomString(50),
              ticketId: ticket.id,
              body: processedMessage,
              fromMe: true,
              read: true
            };
            await CreateMessageService({ messageData: messageData, companyId });
          }
          
          // Encerrar o ticket
          console.log(`closeTicket: Encerrando ticket ${ticket.id}`);
          console.log(`closeTicket: Status antes: ${ticket.status}`);
          
          // Tentar método alternativo direto
          console.log(`closeTicket: Tentando método alternativo...`);
          ticket.status = "closed";
          ticket.queueId = null;
          ticket.userId = null;
          ticket.flowWebhook = true;
          ticket.lastFlowId = nodeSelected.type === "directOpenai" ? ticket.lastFlowId : nodeSelected.id;
          ticket.hashFlowId = hashWebhookId;
          ticket.flowStopped = idFlowDb.toString();
          
          await ticket.save();
          
          // Forçar reload para verificar
          await ticket.reload();
          console.log(`closeTicket: Status depois: ${ticket.status}`);
          console.log(`closeTicket: Ticket ${ticket.id} encerrado com sucesso`);
          
          // Emitir WebSocket para atualizar frontend
          const io = getIO();
          const ticketUpdated = await ShowTicketService(ticket.id, companyId);
          io.of(String(companyId))
            .emit(`company-${companyId}-ticket`, {
              action: "update",
              ticket: ticketUpdated
            });
          
          console.log(`closeTicket: WebSocket emitido para ticket ${ticket.id}`);
        }
      }

      // Nó: Lista de Produtos
      if (nodeSelected.type === "productList") {
        console.log(`=== PROCESSANDO NÓ productList (LISTA DE PRODUTOS) ===`);
        
        // Garantir que o ticket existe
        if (!ticket && idTicket) {
          ticket = await Ticket.findOne({
            where: { id: idTicket, whatsappId }
          });
        }
        
        if (!ticket) {
          console.error("productList: Ticket não encontrado");
          return;
        }

        try {
          const title = nodeSelected.data.title || "🛍️ Nossos Produtos e Serviços";
          const listType = nodeSelected.data.listType || "all";
          const selectedItems = nodeSelected.data.selectedItems || [];
          
          console.log(`productList: Título="${title}", Tipo=${listType}, Itens selecionados=${selectedItems.length}`);
          
          // Buscar produtos diretamente do banco
          let products = [];
          if (listType === "all" || selectedItems.some(id => id.startsWith("product_"))) {
            const Produto = require("../../models/Produto").default;
            products = await Produto.findAll({ 
              where: { companyId: ticket.companyId },
              order: [['nome', 'ASC']]
            });
          }
          
          // Buscar serviços diretamente do banco
          let services = [];
          if (listType === "all" || selectedItems.some(id => id.startsWith("service_"))) {
            const Servico = require("../../models/Servico").default;
            services = await Servico.findAll({ 
              where: { companyId: ticket.companyId },
              order: [['nome', 'ASC']]
            });
          }
          
          // Montar mensagem com título personalizado
          let message = `${title}\n\n`;
          
          // Adicionar produtos
          const filteredProducts = listType === "all" 
            ? products 
            : products.filter(p => selectedItems.includes(`product_${p.id}`));
            
          if (filteredProducts.length > 0) {
            message += "*📦 Produtos:*\n";
            filteredProducts.forEach((product, index) => {
              const name = product.nome || "Produto sem nome";
              const price = product.valor ? `R$ ${parseFloat(product.valor).toFixed(2)}` : "Preço não definido";
              message += `${index + 1}. ${name} - ${price}\n`;
            });
            message += "\n";
          }
          
          // Adicionar serviços
          const filteredServices = listType === "all" 
            ? services 
            : services.filter(s => selectedItems.includes(`service_${s.id}`));
            
          if (filteredServices.length > 0) {
            message += "*🔧 Serviços:*\n";
            filteredServices.forEach((service, index) => {
              const name = service.nome || "Serviço sem nome";
              let price = "Preço não definido";
              
              if (service.possuiDesconto && service.valorComDesconto) {
                price = `R$ ${parseFloat(service.valorComDesconto).toFixed(2)} (com desconto)`;
              } else if (service.valorOriginal) {
                price = `R$ ${parseFloat(service.valorOriginal).toFixed(2)}`;
              }
              
              message += `${index + 1}. ${name} - ${price}\n`;
            });
          }
          
          if (filteredProducts.length === 0 && filteredServices.length === 0) {
            message = "🛍️ No momento não temos produtos ou serviços disponíveis.";
          }
          
          // Enviar mensagem
          await SendMessage(whatsapp, {
            number: numberClient,
            body: message
          });
          
          await intervalWhats("1");
          
          console.log(`productList: Mensagem enviada com ${filteredProducts.length} produtos e ${filteredServices.length} serviços`);
          
        } catch (error) {
          console.error("productList: Erro ao processar lista de produtos:", error);
          
          await SendMessage(whatsapp, {
            number: numberClient,
            body: "❌ Ocorreu um erro ao carregar nossos produtos. Tente novamente mais tarde."
          });
        }
      }

      let isMenu: boolean;

      if (nodeSelected.type === "menu") {
        // Garantir que o ticket existe antes de processar menu (segundo bloco)
        if (!ticket && idTicket) {
          console.log("Menu (segundo bloco): Carregando ticket...");
          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });
          console.log("Menu (segundo bloco): Ticket carregado:", ticket?.id);
        }
        
        console.log(650, "menu");
        if (pressKey) {
          const filterOne = connectStatic.filter(
            confil => confil.source === next
          );
          const filterTwo = filterOne.filter(
            filt2 => filt2.sourceHandle === "a" + pressKey
          );
          if (filterTwo.length > 0) {
            execFn = filterTwo[0].target;
          } else {
            execFn = undefined;
          }
          // execFn =
          //   connectStatic
          //     .filter(confil => confil.source === next)
          //     .filter(filt2 => filt2.sourceHandle === "a" + pressKey)[0]?.target ??
          //   undefined;
          if (execFn === undefined) {
            break;
          }
          pressKey = "999";

          const isNodeExist = nodes.filter(item => item.id === execFn);
          console.log(674, "menu");
          if (isNodeExist.length > 0) {
            isMenu = isNodeExist[0].type === "menu" ? true : false;
          } else {
            isMenu = false;
          }
        } else {
          console.log(681, "menu");
          let optionsMenu = "";
          nodeSelected.data.arrayOption.map(item => {
            optionsMenu += `[${item.number}] ${item.value}\n`;
          });

          const menuCreate = `${nodeSelected.data.message}\n\n${optionsMenu}`;

          const webhook = ticket?.dataWebhook;

          let msg;
          if (webhook && webhook.hasOwnProperty("variables")) {
            msg = {
              body: replaceMessages(webhook, menuCreate),
              number: numberClient,
              companyId: companyId
            };
          } else {
            msg = {
              body: menuCreate,
              number: numberClient,
              companyId: companyId
            };
          }

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          const messageData: MessageData = {
            wid: randomString(50),
            ticketId: ticket.id,
            body: msg.body,
            fromMe: true,
            read: true
          };

          //await CreateMessageService({ messageData: messageData, companyId });

          //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })

          // await SendMessage(whatsapp, {
          //   number: numberClient,
          //   body: msg.body
          // });

          await typeSimulation(ticket, "composing");
          await delay(2000);
          await typeSimulation(ticket, "paused");

          console.log("ActionsWebhookService Node Question4: ", msg);

          const settingsMenu: any = await (CompaniesSettings as any).findOne({
            where: {
              companyId: companyId
            }
          });

          const typeBotMenu = settingsMenu?.chatBotType || "text";

          if (typeBotMenu === "list") {
            const wbot = getWbot(whatsapp.id);

            const sections = [
              {
                title: "Opções de atendimento",
                rows: nodeSelected.data.arrayOption.map(item => ({
                  rowId: String(item.number),
                  title: item.value,
                  description: ""
                }))
              }
            ];

            const listPayload = {
              text: formatBody(nodeSelected.data.message, ticket.contact),
              buttonText: "Escolher opção",
              sections
            };

            await wbot.sendMessage(
              `${numberClient}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              listPayload
            );
          } else {
            await SendWhatsAppMessage({
              body: msg.body,
              ticket: ticketDetails,
              quotedMsg: null
            });
          }

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: formatBody(msg.body, ticket.contact)
          });
          await intervalWhats("1");

          if (ticket) {
            ticket = await Ticket.findOne({
              where: {
                id: ticket.id,
                whatsappId: whatsappId,
                companyId: companyId
              }
            });
          } else {
            ticket = await Ticket.findOne({
              where: {
                id: idTicket,
                whatsappId: whatsappId,
                companyId: companyId
              }
            });
          }

          if (ticket) {
            await ticket.update({
              queueId: ticket.queueId ? ticket.queueId : null,
              userId: null,
              companyId: companyId,
              flowWebhook: true,
              lastFlowId: nodeSelected.id, // Sempre usar o ID do nó atual para menu
              dataWebhook: dataWebhook,
              hashFlowId: hashWebhookId,
              flowStopped: idFlowDb.toString()
            });
            console.log(`Menu: Ticket atualizado com lastFlowId=${nodeSelected.id} para aguardar resposta`);
          }

          break;
        }
      }

      let isContinue = false;

      if (pressKey === "999" && execCount > 0) {
        console.log(587, "ActionsWebhookService | 587");

        pressKey = undefined;
        let result = connects.filter(connect => connect.source === execFn)[0];
        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      } else {
        let result;

        if (isMenu) {
          result = { target: execFn };
          isContinue = true;
          pressKey = undefined;
        } else if (isRandomizer) {
          isRandomizer = false;
          result = next;
        } else if (isCondition) {
          isCondition = false;
          result = next;
        } else {
          result = connects.filter(connect => connect.source === next)[0];
        }

        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
        console.log(619, "ActionsWebhookService");
      }

      if (!pressKey && !isContinue) {
        const nextNodeConnection = connects.find(
          connect => connect.source === nodeSelected.id
        );

        console.log(626, "ActionsWebhookService");

        // Se não há próximo nó, finalizar fluxo
        if (!nextNodeConnection) {
          console.log(654, "ActionsWebhookService - Sem próximo nó, finalizando fluxo");

          await Ticket.findOne({
            where: { id: idTicket, whatsappId, companyId: companyId }
          });
          await ticket.update({
            lastFlowId: nodeSelected.type === "directOpenai" ? ticket.lastFlowId : nodeSelected.id,
            hashFlowId: null,
            flowWebhook: false,
            flowStopped: idFlowDb.toString()
          });
          break;
        }
      }

      isContinue = false;

      if (next === "") {
        break;
      }

      console.log(678, "ActionsWebhookService");

      console.log("UPDATE10...");
      ticket = await Ticket.findOne({
        where: { id: idTicket, whatsappId, companyId: companyId }
      });

      if (ticket.status === "closed") {
        io.of(String(companyId))
          // .to(oldStatus)
          // .to(ticketId.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "delete",
            ticketId: ticket.id
          });
      }

      console.log("UPDATE12...");

      const hasNextNodes =
        connects.filter(connect => connect.source === nodeSelected.id).length >
        0;

      console.log("Conexões para nó atual:", hasNextNodes ? "SIM" : "NÃO");
      console.log("Próximo nó:", next);

      // Sempre atualizar flowStopped para garantir que o fluxo correto seja usado
      // Mas não atualizar lastFlowId para nó directOpenai (deve continuar no mesmo nó)
      const updateData: any = {
        whatsappId: whatsappId,
        queueId: ticket?.queueId,
        userId: null,
        companyId: companyId,
        flowWebhook: true,
        hashFlowId: hashWebhookId,
        flowStopped: idFlowDb.toString()
      };
      
      // Só atualizar lastFlowId se não for nó directOpenai
      if (nodeSelected.type !== "directOpenai") {
        updateData.lastFlowId = nodeSelected.id;
      }
      
      await ticket.update(updateData);
      
      if (!hasNextNodes) {
        console.log(
          "Finalizando fluxo no nó",
          nodeSelected.type,
          "sem próximos nós"
        );
      }

      noAlterNext = false;
      execCount++;
    }

    return "ds";
  } catch (error) {
    logger.error(error);
  }
};

const constructJsonLine = (line: string, json: any) => {
  let valor = json;
  const chaves = line.split(".");

  if (chaves.length === 1) {
    return valor[chaves[0]];
  }

  for (const chave of chaves) {
    valor = valor[chave];
  }
  return valor;
};

function removerNaoLetrasNumeros(texto: string) {
  // Substitui todos os caracteres que não são letras ou números por vazio
  return texto.replace(/[^a-zA-Z0-9]/g, "");
}

const sendMessageWhats = async (
  whatsId: number,
  msg: any,
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
) => {
  sendMessageFlow(whatsId, msg, req);
  return Promise.resolve();
};

const intervalWhats = (time: string) => {
  const seconds = parseInt(time) * 1000;
  return new Promise(resolve => setTimeout(resolve, seconds));
};

const replaceMessages = (variables, message) => {
  return message.replace(
    /{{\s*([^{}\s]+)\s*}}/g,
    (match, key) => variables[key] || ""
  );
};

const replaceMessagesOld = (
  message: string,
  details: any,
  dataWebhook: any,
  dataNoWebhook?: any
) => {
  const matches = message.match(/\{([^}]+)\}/g);

  if (dataWebhook) {
    let newTxt = message.replace(/{+nome}+/, dataNoWebhook.nome);
    newTxt = newTxt.replace(/{+numero}+/, dataNoWebhook.numero);
    newTxt = newTxt.replace(/{+email}+/, dataNoWebhook.email);
    return newTxt;
  }

  if (matches && matches.includes("inputs")) {
    const placeholders = matches.map(match => match.replace(/\{|\}/g, ""));
    let newText = message;
    placeholders.map(item => {
      const value = details["inputs"].find(
        itemLocal => itemLocal.keyValue === item
      );
      const lineToData = details["keysFull"].find(itemLocal =>
        itemLocal.endsWith(`.${value.data}`)
      );
      const createFieldJson = constructJsonLine(lineToData, dataWebhook);
      newText = newText.replace(`{${item}}`, createFieldJson);
    });
    return newText;
  } else {
    return message;
  }
};
