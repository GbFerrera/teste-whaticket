import logger from "../../utils/logger";
import Contact from "../../models/Contact";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";

interface ScoreMessageParams {
  messageBody: string;
  contactId?: number;
  companyId?: number;
}

interface UpdateContactScoreParams {
  contactId: number;
  messageBody: string;
  companyId: number;
}

export const CalculatePotentialScore = (messageBody: string): number => {
  try {
    let score = 0;
    
    // Palavras-chave positivas que indicam interesse real
    const positiveKeywords = [
      'quero', 'gostaria', 'preciso', 'necessito', 'interesse',
      'preço', 'valor', 'custo', 'quanto', 'quanto custa', 'valor é',
      'contratar', 'contratação', 'serviço', 'servicos', 'atendimento',
      'produto', 'produtos', 'comprar', 'compra', 'adquirir',
      'orçamento', 'orcamento', 'cotação', 'cotacao',
      'agendar', 'agendamento', 'marcar', 'visitar', 'visita',
      'saber mais', 'informações', 'informacoes', 'detalhes',
      'como funciona', 'funciona', 'demonstração', 'demonstracao',
      'consulta', 'reunião', 'encontro', 'conversar'
    ];
    
    // Palavras de alta intenção
    const highIntentKeywords = [
      'quero contratar', 'quero comprar', 'quero orçamento',
      'quanto custa', 'qual o preço', 'agendar agora',
      'preciso de', 'necessito urgentemente'
    ];
    
    const messageText = messageBody.toLowerCase().trim();
    
    // +3 pontos para palavras de alta intenção
    highIntentKeywords.forEach(keyword => {
      if (messageText.includes(keyword)) {
        score += 3;
      }
    });
    
    // +2 pontos para cada palavra positiva
    positiveKeywords.forEach(keyword => {
      if (messageText.includes(keyword)) {
        score += 2;
      }
    });
    
    // +3 pontos se menciona dinheiro/valor específico
    if (messageText.includes('quanto custa') || 
        messageText.includes('qual o preço') ||
        messageText.includes('quanto vale') ||
        messageText.includes('valor é') ||
        messageText.includes('custa quanto')) {
      score += 3;
    }
    
    // +2 pontos se menciona tempo (indica urgência)
    if (messageText.includes('agora') || 
        messageText.includes('hoje') ||
        messageText.includes('urgente') ||
        messageText.includes('rápido')) {
      score += 2;
    }
    
    // +1 ponto se mensagem tem mais de 10 palavras (indica interesse)
    const wordCount = messageText.split(/\s+/).length;
    if (wordCount > 10) {
      score += 1;
    }
    
    // +2 pontos se horário comercial (8h-18h)
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 18) {
      score += 2;
    }
    
    // +1 ponto se tem números (indica interesse específico)
    if (/\d/.test(messageText)) {
      score += 1;
    }
    
    // -1 ponto se for mensagem muito curta sem intenção
    if (wordCount <= 2 && !positiveKeywords.some(kw => messageText.includes(kw))) {
      score = Math.max(0, score - 1);
    }
    
    // -2 pontos se contém palavras de baixo interesse
    const lowInterestKeywords = ['ok', 'oi', 'ola', 'bom dia', 'boa tarde', 'tchau'];
    if (lowInterestKeywords.some(kw => messageText === kw)) {
      score = Math.max(0, score - 2);
    }
    
    return Math.min(Math.max(score, 0), 10); // Limitar entre 0 e 10
    
  } catch (error) {
    logger.error("Error calculating potential score:", error);
    return 0;
  }
};

export const UpdateContactScore = async ({
  contactId,
  messageBody,
  companyId
}: UpdateContactScoreParams): Promise<void> => {
  try {
    const score = CalculatePotentialScore(messageBody);
    
    const [updatedRowsCount] = await Contact.update(
      { 
        potentialScore: score,
        isPotential: score >= 5
      },
      { 
        where: { 
          id: contactId, 
          companyId 
        } 
      }
    );
    
    if (updatedRowsCount > 0) {
      logger.info(`Contact ${contactId} score updated: ${score} (isPotential: ${score >= 5})`);
    } else {
      logger.warn(`Contact ${contactId} not found for score update`);
    }
    
  } catch (error) {
    logger.error("Error updating contact score:", error);
    throw error;
  }
};

export const GetContactStats = async (companyId: number): Promise<any> => {
  try {
    const stats = await Contact.findAll({
      where: { companyId },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalContacts'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "isPotential" = true THEN 1 END')), 'potentialContacts'],
        [Sequelize.fn('AVG', Sequelize.col('potentialScore')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "savedToPhone" = true THEN 1 END')), 'savedToPhone'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "lid" IS NOT NULL AND "lid" != \'\' THEN 1 END')), 'withLid']
      ]
    });
    
    const scoreDistribution = await Contact.findAll({
      where: { companyId },
      attributes: [
        'potentialScore',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['potentialScore'],
      order: [['potentialScore', 'ASC']]
    });
    
    const lidStabilityDistribution = await Contact.findAll({
      where: { companyId },
      attributes: [
        'lidStability',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['lidStability'],
      order: [['lidStability', 'ASC']]
    });
    
    return {
      totalContacts: parseInt(String(stats[0]?.get('totalContacts') || 0)),
      potentialContacts: parseInt(String(stats[0]?.get('potentialContacts') || 0)),
      averageScore: parseFloat(String(stats[0]?.get('averageScore') || 0)),
      savedToPhone: parseInt(String(stats[0]?.get('savedToPhone') || 0)),
      withLid: parseInt(String(stats[0]?.get('withLid') || 0)),
      scoreDistribution: scoreDistribution.map(item => ({
        score: item.potentialScore,
        count: parseInt(String(item.get('count')))
      })),
      lidStabilityDistribution: lidStabilityDistribution.map(item => ({
        stability: item.lidStability,
        count: parseInt(String(item.get('count')))
      }))
    };
    
  } catch (error) {
    logger.error("Error getting contact stats:", error);
    throw error;
  }
};

export const GetHighPotentialContacts = async (
  companyId: number,
  limit: number = 50
): Promise<Contact[]> => {
  try {
    const contacts = await Contact.findAll({
      where: {
        companyId,
        isPotential: true,
        potentialScore: { [Op.gte]: 7 }
      },
      order: [['potentialScore', 'DESC'], ['updatedAt', 'DESC']],
      limit
    });
    
    return contacts;
    
  } catch (error) {
    logger.error("Error getting high potential contacts:", error);
    throw error;
  }
};

export const BatchUpdateContactScores = async (
  contacts: Array<{ id: number; messageBody: string; companyId: number }>
): Promise<void> => {
  try {
    const updates = contacts.map(({ id, messageBody, companyId }) => {
      const score = CalculatePotentialScore(messageBody);
      
      return Contact.update(
        {
          potentialScore: score,
          isPotential: score >= 5
        },
        {
          where: { id, companyId }
        }
      );
    });
    
    await Promise.all(updates);
    
    logger.info(`Batch updated ${contacts.length} contact scores`);
    
  } catch (error) {
    logger.error("Error in batch contact score update:", error);
    throw error;
  }
};
