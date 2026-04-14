import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { Op } from "sequelize";
import { getWbot } from "../../libs/wbot";

interface GroupParticipant {
  id: string;
  name: string | null;
  number: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface ExportGroupContactsResponse {
  participants: GroupParticipant[];
  totalParticipants: number;
  groupName: string;
  errors: string[];
}

const ExportGroupContactsService = async (ticketId: number, companyId: number): Promise<ExportGroupContactsResponse> => {
  try {
    // Buscar o ticket do grupo
    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        companyId: companyId,
        isGroup: true
      },
      include: [
        {
          model: Contact,
          as: "contact",
          required: true
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          required: true
        }
      ]
    });

    if (!ticket) {
      throw new AppError("Grupo não encontrado", 404);
    }

    console.log(`[ExportGroupContacts] Iniciando exportação para grupo: ${ticket.contact.name}`);

    // Obter a instância do WhatsApp
    const wbot: WASocket = getWbot(ticket.whatsappId);
    if (!wbot) {
      throw new AppError("Sessão WhatsApp não encontrada", 404);
    }

    console.log(`[ExportGroupContacts] Sessão WhatsApp obtida para: ${ticket.whatsapp.name}`);

    // Obter metadados do grupo
    const groupJid = `${ticket.contact.number}@g.us`;
    console.log(`[ExportGroupContacts] Buscando metadados para: ${groupJid}`);
    
    try {
      const groupMetadata = await wbot.groupMetadata(groupJid);
      console.log(`[ExportGroupContacts] Grupo encontrado: ${groupMetadata.subject}`);
      console.log(`[ExportGroupContacts] Total de participantes: ${groupMetadata.participants?.length || 0}`);
      console.log(`[ExportGroupContacts] Estrutura de participantes:`, Object.keys(groupMetadata.participants?.[0] || {}));

      const participants: GroupParticipant[] = [];
      const errors: string[] = [];

      try {
        // Processar cada participante
        if (groupMetadata.participants) {
          console.log(`[ExportGroupContacts] Iniciando processamento de ${groupMetadata.participants.length} participantes`);
          
          for (let i = 0; i < groupMetadata.participants.length; i++) {
            const participant = groupMetadata.participants[i];
            console.log(`[ExportGroupContacts] Processando participante ${i + 1}/${groupMetadata.participants.length}: ${participant.id}`);
            
            try {
            // Abordagem final: buscar informações de diferentes fontes
            let realNumber = null;
            let contactName = null;
            
            console.log(`[ExportGroupContacts] Processando participante: ${participant.id}`);
            
            // 1. Se for @s.whatsapp.net, usar diretamente
            if (participant.id.includes('@s.whatsapp.net')) {
              realNumber = participant.id.replace('@s.whatsapp.net', '');
              console.log(`[ExportGroupContacts] Número real @s.whatsapp.net: ${realNumber}`);
            }
            // 2. Se for @lid, tentar buscar no banco
            else if (participant.id.includes('@lid')) {
              console.log(`[ExportGroupContacts] @lid detectado, buscando no banco: ${participant.id}`);
              
              // Buscar por remoteJid
              const contactByRemoteJid = await Contact.findOne({
                where: {
                  companyId: companyId,
                  remoteJid: participant.id
                }
              });
              
              if (contactByRemoteJid && contactByRemoteJid.number) {
                realNumber = contactByRemoteJid.number;
                contactName = contactByRemoteJid.name;
                console.log(`[ExportGroupContacts] Encontrado via remoteJid: ${realNumber}`);
              } else {
                // Buscar por número (tentativa)
                const extractedNumber = participant.id.replace('@lid', '');
                const contactByNumber = await Contact.findOne({
                  where: {
                    companyId: companyId,
                    number: extractedNumber
                  }
                });
                
                if (contactByNumber) {
                  realNumber = contactByNumber.number;
                  contactName = contactByNumber.name;
                  console.log(`[ExportGroupContacts] Encontrado via número: ${realNumber}`);
                } else {
                  console.log(`[ExportGroupContacts] @lid não mapeado, pulando: ${participant.id}`);
                  continue; // Pular se não encontrar
                }
              }
            }
            
            // Validar número
            if (!realNumber || !realNumber.match(/^\d+$/)) {
              console.log(`[ExportGroupContacts] Número inválido, pulando: ${realNumber}`);
              continue;
            }
            
            // Buscar nome se não tiver
            if (!contactName) {
              const nameContact = await Contact.findOne({
                where: {
                  number: realNumber,
                  companyId: companyId
                }
              });
              
              if (nameContact && nameContact.name) {
                contactName = nameContact.name;
              }
            }
            
            console.log(`[ExportGroupContacts] Adicionando: ${contactName || 'Sem Nome'} - ${realNumber}`);
              
            const participantData: GroupParticipant = {
              id: participant.id,
              name: contactName,
              number: realNumber,
              isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
              isSuperAdmin: participant.admin === 'superadmin'
            };

            participants.push(participantData);

            } catch (participantError) {
              const error = `Erro ao processar participante ${participant.id}: ${participantError.message}`;
              errors.push(error);
              console.error(`[ExportGroupContacts] ${error}`);
            }
            
            console.log(`[ExportGroupContacts] Participante ${i + 1}/${groupMetadata.participants.length} processado`);
          }
        }

        console.log(`[ExportGroupContacts] Processamento concluído: ${participants.length} participantes, ${errors.length} erros`);

      } catch (processingError) {
        console.error(`[ExportGroupContacts] Erro ao processar participantes:`, processingError);
        throw new AppError(`Erro ao processar participantes: ${processingError.message}`, 500);
      }

      return {
        participants,
        totalParticipants: participants.length,
        groupName: groupMetadata.subject || ticket.contact.name,
        errors
      };

    } catch (metadataError) {
      console.error(`[ExportGroupContacts] Erro ao obter metadados do grupo:`, metadataError);
      throw new AppError(`Erro ao obter metadados do grupo: ${metadataError.message}`, 500);
    }

  } catch (error) {
    console.error("[ExportGroupContacts] Erro geral:", error);
    throw new AppError(`Erro ao exportar contatos do grupo: ${error.message}`, 500);
  }
};

export default ExportGroupContactsService;
