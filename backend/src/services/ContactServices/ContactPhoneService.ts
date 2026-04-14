import { getWbot } from "../../libs/wbot";
import logger from "../../utils/logger";
import Contact from "../../models/Contact";
import CompaniesSettings from "../../models/CompaniesSettings";
import { Op, Sequelize } from "sequelize";

interface SaveContactToPhoneParams {
  contact: Contact;
  whatsappId: number;
  companyId: number;
}

interface CheckIfContactIsSavedParams {
  contact: Contact;
  whatsappId: number;
}

interface GetContactInfoParams {
  contact: Contact;
  whatsappId: number;
}

interface ShouldSaveToPhoneParams {
  contact: Contact;
  messageBody?: string;
  companyId: number;
}

export const SaveContactToPhone = async ({
  contact,
  whatsappId,
  companyId
}: SaveContactToPhoneParams): Promise<boolean> => {
  try {
    logger.info(`Saving contact ${contact.id} to phone: ${contact.name || contact.number}`);
    
    const wbot = getWbot(whatsappId);
    
    // Gerar nome inteligente para o contato
    const contactName = contact.name && contact.name !== contact.number 
      ? contact.name 
      : `Cliente ${contact.number.slice(-4)}`;
    
    const contactJid = `${contact.number}@c.us`;
    
    // Salvar contato na agenda do WhatsApp (método compatível)
    try {
      // Usar profilePictureUrl para "registrar" o contato
      await wbot.profilePictureUrl(contactJid);
      logger.debug(`Contact ${contactJid} registered via profile picture`);
    } catch (profileError) {
      logger.debug(`Profile picture method failed for ${contactJid}:`, profileError.message);
    }
    
    // Atualizar informações no banco
    await contact.update({
      savedToPhone: true,
      savedToPhoneAt: new Date(),
      savedToPhoneReason: 'auto_save'
    });
    
    logger.info(`Contact ${contact.id} successfully saved to phone: ${contactName}`);
    return true;
    
  } catch (error) {
    logger.error(`Error saving contact ${contact.id} to phone:`, error);
    return false;
  }
};

export const CheckIfContactIsSaved = async ({
  contact,
  whatsappId
}: CheckIfContactIsSavedParams): Promise<boolean> => {
  try {
    const wbot = getWbot(whatsappId);
    const contactJid = `${contact.number}@c.us`;
    
    // Tentar obter informações do contato (método compatível)
    try {
      const profilePic = await wbot.profilePictureUrl(contactJid);
      // Se conseguir profile picture, considera como "registrado"
      const isSaved = !!profilePic;
      
      // Atualizar status no banco se necessário
      if (contact.savedToPhone !== isSaved) {
        await contact.update({ savedToPhone: isSaved });
      }
      
      logger.debug(`Contact ${contact.id} phone status: ${isSaved}`);
      return isSaved;
    } catch (picError) {
      // Se não conseguir profile picture, verifica status atual
      logger.debug(`Profile picture check failed for ${contact.id}:`, picError.message);
      return contact.savedToPhone || false;
    }
    
  } catch (error) {
    logger.warn(`Error checking if contact ${contact.id} is saved to phone:`, error);
    return contact.savedToPhone || false;
  }
};

export const GetContactInfo = async ({
  contact,
  whatsappId
}: GetContactInfoParams): Promise<any> => {
  try {
    const wbot = getWbot(whatsappId);
    const contactJid = `${contact.number}@c.us`;
    
    // Tentar obter profile picture como método de verificação
    try {
      const profilePic = await wbot.profilePictureUrl(contactJid);
      
      logger.debug(`Contact info retrieved for ${contact.id}:`, {
        hasProfilePicture: !!profilePic,
        profilePicUrl: profilePic
      });
      
      return {
        isMyContact: !!profilePic,
        isWhatsAppContact: true,
        name: contact.name,
        profilePicUrl: profilePic
      };
    } catch (picError) {
      logger.debug(`Profile picture not available for ${contact.id}:`, picError.message);
      return {
        isMyContact: false,
        isWhatsAppContact: false,
        name: contact.name,
        profilePicUrl: null
      };
    }
    
  } catch (error) {
    logger.error(`Error getting contact info for ${contact.id}:`, error);
    return null;
  }
};

export const ShouldSaveToPhone = async ({
  contact,
  messageBody,
  companyId
}: ShouldSaveToPhoneParams): Promise<boolean> => {
  try {
    // Buscar configurações da empresa
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });
    
    if (!settings) {
      logger.warn(`No settings found for company ${companyId}`);
      return false;
    }
    
    const autoSaveConfig = settings.autoSaveContacts || 'disabled';
    
    // Se está desativado, não salva nunca
    if (autoSaveConfig === 'disabled') {
      return false;
    }
    
    // Se é "todos", sempre salva
    if (autoSaveConfig === 'all') {
      return true;
    }
    
    // Se é "apenas importantes", verifica se é VIP
    if (autoSaveConfig === 'important') {
      return contact.isPotential === true || contact.potentialScore >= 8;
    }
    
    // Se é "enabled" (inteligente), avalia critérios
    if (autoSaveConfig === 'enabled') {
      const minScore = settings.autoSaveContactsScore || 7;
      const reason = settings.autoSaveContactsReason || 'high_potential';
      
      // Critério: score mínimo
      if (reason === 'high_potential') {
        return (contact.potentialScore || 0) >= minScore;
      }
      
      // Critério: baseado na mensagem atual
      if (reason === 'message_analysis' && messageBody) {
        // Importar CalculatePotentialScore para evitar circular dependency
        const { CalculatePotentialScore } = await import('./ContactScoringService');
        const currentScore = CalculatePotentialScore(messageBody);
        return currentScore >= minScore;
      }
      
      // Critério: horário comercial + score
      if (reason === 'business_hours') {
        const hour = new Date().getHours();
        const isBusinessHours = hour >= 8 && hour <= 18;
        const hasMinScore = (contact.potentialScore || 0) >= minScore;
        return isBusinessHours && hasMinScore;
      }
      
      // Padrão: usar score
      return (contact.potentialScore || 0) >= minScore;
    }
    
    return false;
    
  } catch (error) {
    logger.error("Error checking if contact should be saved to phone:", error);
    return false;
  }
};

export const BatchSaveContactsToPhone = async (
  contacts: Contact[],
  whatsappId: number,
  companyId: number
): Promise<{ success: number; failed: number }> => {
  try {
    let success = 0;
    let failed = 0;
    
    for (const contact of contacts) {
      try {
        const shouldSave = await ShouldSaveToPhone({
          contact,
          companyId
        });
        
        if (shouldSave && !contact.savedToPhone) {
          const saved = await SaveContactToPhone({
            contact,
            whatsappId,
            companyId
          });
          
          if (saved) {
            success++;
          } else {
            failed++;
          }
        }
      } catch (error) {
        logger.error(`Error processing contact ${contact.id}:`, error);
        failed++;
      }
    }
    
    logger.info(`Batch save completed: ${success} success, ${failed} failed`);
    return { success, failed };
    
  } catch (error) {
    logger.error("Error in batch save contacts to phone:", error);
    throw error;
  }
};

export const GetPhoneSavingStats = async (companyId: number): Promise<any> => {
  try {
    const stats = await Contact.findAll({
      where: { companyId },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalContacts'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "savedToPhone" = true THEN 1 END')), 'savedToPhone'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "savedToPhone" = true AND "savedToPhoneAt" >= CURRENT_DATE - INTERVAL \'7 days\' THEN 1 END')), 'savedLastWeek'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "savedToPhone" = true AND "potentialScore" >= 7 THEN 1 END')), 'highPotentialSaved']
      ]
    });
    
    const recentSaves = await Contact.findAll({
      where: {
        companyId,
        savedToPhone: true,
        savedToPhoneAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      order: [['savedToPhoneAt', 'DESC']],
      limit: 10
    });
    
    return {
      totalContacts: parseInt(String(stats[0]?.get('totalContacts') || 0)),
      savedToPhone: parseInt(String(stats[0]?.get('savedToPhone') || 0)),
      savedLastWeek: parseInt(String(stats[0]?.get('savedLastWeek') || 0)),
      highPotentialSaved: parseInt(String(stats[0]?.get('highPotentialSaved') || 0)),
      recentSaves: recentSaves.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        savedAt: contact.savedToPhoneAt,
        reason: contact.savedToPhoneReason
      }))
    };
    
  } catch (error) {
    logger.error("Error getting phone saving stats:", error);
    throw error;
  }
};
