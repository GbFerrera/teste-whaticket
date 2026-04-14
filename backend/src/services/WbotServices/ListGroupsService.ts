import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface GroupData {
  id: string;
  name: string;
  participants: number;
  subject: string;
  desc?: string;
  owner?: string;
  creation?: number;
}

const ListGroupsService = async (whatsappId: number, companyId: number): Promise<GroupData[]> => {
  try {
    const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
    if (!whatsapp) {
      throw new AppError("WhatsApp connection not found", 404);
    }

    const wbot: WASocket = getWbot(whatsappId);
    if (!wbot) {
      throw new AppError("WhatsApp session not found", 404);
    }

    console.log(`[ListGroups] Buscando grupos para WhatsApp ${whatsappId}`);

    // Buscar todos os contatos que são grupos no banco de dados
    const groupContacts = await Contact.findAll({
      where: {
        companyId: companyId,
        isGroup: true
      },
      order: [['name', 'ASC']]
    });

    console.log(`[ListGroups] Encontrados ${groupContacts.length} contatos de grupos no banco`);

    const groups: GroupData[] = [];
    const errors: string[] = [];

    // Para cada contato de grupo, obter metadados atualizados
    for (const contact of groupContacts) {
      try {
        const groupJid = `${contact.number}@g.us`;
        console.log(`[ListGroups] Obtendo metadados para: ${groupJid}`);
        
        // Obter metadados do grupo
        const groupMetadata = await wbot.groupMetadata(groupJid);
        
        const groupData: GroupData = {
          id: groupJid,
          name: groupMetadata.subject || contact.name,
          subject: groupMetadata.subject || contact.name,
          participants: groupMetadata.participants?.length || 0,
          desc: groupMetadata.desc,
          owner: groupMetadata.owner,
          creation: groupMetadata.creation
        };

        groups.push(groupData);
        console.log(`[ListGroups] Grupo adicionado: ${groupData.name} (${groupData.participants} participantes)`);

        // Atualizar nome do contato se estiver diferente
        if (contact.name !== groupData.name) {
          await contact.update({ name: groupData.name });
          console.log(`[ListGroups] Nome do contato atualizado: ${groupData.name}`);
        }

      } catch (error) {
        console.error(`[ListGroups] Erro ao obter metadados do grupo ${contact.name}:`, error);
        errors.push(`Grupo ${contact.name}: ${error.message}`);
        
        // Mesmo com erro, adicionar grupo com dados básicos do banco
        groups.push({
          id: `${contact.number}@g.us`,
          name: contact.name,
          subject: contact.name,
          participants: 0,
          desc: undefined,
          owner: undefined,
          creation: undefined
        });
      }
    }

    console.log(`[ListGroups] Total de grupos encontrados: ${groups.length}`);
    if (errors.length > 0) {
      console.log(`[ListGroups] Erros encontrados: ${errors.length}`);
      errors.forEach(error => console.log(`[ListGroups] - ${error}`));
    }

    return groups;

  } catch (error) {
    console.error(`[ListGroups] Erro ao listar grupos:`, error);
    throw new AppError(`Erro ao listar grupos: ${error.message}`, 500);
  }
};

export default ListGroupsService;
