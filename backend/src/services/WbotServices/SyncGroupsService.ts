import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { Op } from "sequelize";
import { getWbot } from "../../libs/wbot";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface GroupData {
  id: string;
  name: string;
  participants: number;
}

interface SyncGroupsResponse {
  groups: GroupData[];
  ticketsCreated: number;
  errors: string[];
}

const SyncGroupsService = async (whatsappId: number, companyId: number): Promise<SyncGroupsResponse> => {
  try {
    const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
    if (!whatsapp) {
      throw new AppError("WhatsApp connection not found", 404);
    }

    const wbot: WASocket = getWbot(whatsappId);
    if (!wbot) {
      throw new AppError("WhatsApp session not found", 404);
    }

    console.log(`[SyncGroups] Iniciando sincronização de grupos para WhatsApp ${whatsappId}`);

    // Obter todos os grupos do WhatsApp
    const groups: GroupData[] = [];
    const errors: string[] = [];
    let ticketsCreated = 0;

    try {
      // Primeiro: buscar todos os contatos que são grupos no banco
      const contacts = await Contact.findAll({
        where: {
          companyId: companyId,
          isGroup: true
        }
      });

      console.log(`[SyncGroups] Encontrados ${contacts.length} contatos de grupos no banco`);

      // Para cada contato de grupo, obter metadados e garantir que tenha ticket
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        console.log(`[SyncGroups] Processando contato ${i + 1}/${contacts.length}: ${contact.name}`);
        
        try {
          const groupJid = `${contact.number}@g.us`;
          console.log(`[SyncGroups] Obtendo metadados para: ${groupJid}`);
          
          const groupMetadata = await wbot.groupMetadata(groupJid);
          console.log(`[SyncGroups] Metadados obtidos para: ${groupMetadata.subject}`);
          
          const groupData: GroupData = {
            id: groupJid,
            name: groupMetadata.subject || contact.name,
            participants: groupMetadata.participants?.length || 0
          };

          groups.push(groupData);
          console.log(`[SyncGroups] Grupo adicionado: ${groupData.name} (${groupData.participants} participantes)`);

          // Atualizar nome do contato se estiver diferente
          if (contact.name !== groupData.name) {
            await contact.update({ name: groupData.name });
            console.log(`[SyncGroups] Nome do contato atualizado: ${groupData.name}`);
          }

          // **MUDANÇA CRÍTICA: Sempre criar ticket para grupos, mesmo que já exista**
          console.log(`[SyncGroups] Criando/Garantindo ticket para: ${groupData.name}`);
          
          try {
            // Verificar se já existe ticket antes de criar
            const existingTicket = await Ticket.findOne({
              where: {
                whatsappId: whatsappId,
                companyId: companyId,
                contactId: contact.id
              }
            });

            let ticket;
            if (!existingTicket) {
              // Criar novo ticket
              ticket = await FindOrCreateTicketService(
                contact,
                whatsapp,
                0, // unreadMessages
                companyId,
                null, // queueId
                null, // userId
                null, // groupContact
                "whatsapp", // channel
                false, // isImported
                false, // isForward
                null, // settings
                false, // isTransfered
                false // isCampaign
              );
              ticketsCreated++;
              console.log(`[SyncGroups] NOVO ticket criado para grupo: ${groupData.name}`);
            } else {
              // Usar ticket existente
              ticket = existingTicket;
              console.log(`[SyncGroups] Ticket existente encontrado para: ${groupData.name}`);
            }

            // Se o ticket existe mas não está com status "group", atualizar
            if (ticket.status !== "group") {
              await ticket.update({ status: "group" });
              console.log(`[SyncGroups] Status do ticket atualizado para "group": ${groupData.name}`);
            }

            // Se o ticket não está marcado como grupo, atualizar
            if (!ticket.isGroup) {
              await ticket.update({ isGroup: true });
              console.log(`[SyncGroups] Ticket marcado como grupo: ${groupData.name}`);
            }

            console.log(`[SyncGroups] Ticket garantido para grupo: ${groupData.name}`);
            
          } catch (ticketError) {
            console.error(`[SyncGroups] Erro ao criar ticket para ${groupData.name}:`, ticketError.message);
            errors.push(`Erro ao criar ticket para ${groupData.name}: ${ticketError.message}`);
          }

        } catch (groupError) {
          const error = `Erro ao processar grupo ${contact.name}: ${groupError.message}`;
          errors.push(error);
          console.error(`[SyncGroups] ${error}`);
        }
        
        console.log(`[SyncGroups] Contato ${i + 1}/${contacts.length} processado`);
      }

      // Segundo: buscar tickets de grupos existentes para garantir nenhum perdido
      const existingGroupTickets = await Ticket.findAll({
        where: {
          whatsappId: whatsappId,
          companyId: companyId,
          isGroup: true
        },
        include: [
          {
            model: Contact,
            as: "contact",
            required: true
          }
        ]
      });

      console.log(`[SyncGroups] Verificando ${existingGroupTickets.length} tickets de grupos existentes`);

      // Para cada ticket de grupo, garantir que está na lista
      for (const ticket of existingGroupTickets) {
        const groupJid = `${ticket.contact.number}@g.us`;
        
        // Se não está na lista de grupos, tentar adicionar
        if (!groups.find(g => g.id === groupJid)) {
          try {
            const groupMetadata = await wbot.groupMetadata(groupJid);
            
            const groupData: GroupData = {
              id: groupJid,
              name: groupMetadata.subject || ticket.contact.name,
              participants: groupMetadata.participants?.length || 0
            };

            groups.push(groupData);
            console.log(`[SyncGroups] Grupo adicionado via ticket: ${groupData.name}`);
          } catch (groupError) {
            console.error(`[SyncGroups] Erro ao obter metadados do grupo ${ticket.contact.name}: ${groupError.message}`);
          }
        }
      }

    } catch (error) {
      console.error("[SyncGroups] Erro ao buscar grupos:", error);
      errors.push(`Erro ao buscar grupos: ${error.message}`);
    }

    console.log(`[SyncGroups] Sincronização concluída: ${groups.length} grupos encontrados, ${ticketsCreated} tickets criados`);

    return {
      groups,
      ticketsCreated,
      errors
    };

  } catch (error) {
    console.error("[SyncGroups] Erro geral:", error);
    throw new AppError(`Erro ao sincronizar grupos: ${error.message}`, 500);
  }
};

export default SyncGroupsService;
