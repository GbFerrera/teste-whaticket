import { Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import { GetContactStats, GetHighPotentialContacts } from "../services/ContactServices/ContactScoringService";
import { GetPhoneSavingStats } from "../services/ContactServices/ContactPhoneService";
import Contact from "../models/Contact";
import { Op } from "sequelize";
import { fn, col, literal } from "sequelize";

export const getContactStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query;

    const whereClause: any = { companyId };
    
    // Adicionar filtro de datas se fornecido
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    // Estatísticas gerais
    const totalStats = await Contact.findAll({
      where: whereClause,
      attributes: [
        [fn('COUNT', col('id')), 'totalContacts'],
        [fn('COUNT', literal('CASE WHEN "isPotential" = true THEN 1 END')), 'potentialContacts'],
        [fn('AVG', col('potentialScore')), 'averageScore'],
        [fn('COUNT', literal('CASE WHEN "savedToPhone" = true THEN 1 END')), 'savedToPhone'],
        [fn('COUNT', literal('CASE WHEN "lid" IS NOT NULL AND "lid" != \'\' THEN 1 END')), 'withLid'],
        [fn('COUNT', literal('CASE WHEN "lidStability" = \'high\' THEN 1 END')), 'highStability'],
        [fn('COUNT', literal('CASE WHEN "lidStability" = \'medium\' THEN 1 END')), 'mediumStability'],
        [fn('COUNT', literal('CASE WHEN "lidStability" = \'low\' THEN 1 END')), 'lowStability']
      ]
    });

    // Distribuição de scores
    const scoreDistribution = await Contact.findAll({
      where: whereClause,
      attributes: [
        'potentialScore',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['potentialScore'],
      order: [['potentialScore', 'ASC']]
    });

    // Distribuição de estabilidade do LID
    const stabilityDistribution = await Contact.findAll({
      where: whereClause,
      attributes: [
        'lidStability',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['lidStability'],
      order: [['lidStability', 'ASC']]
    });

    // Evolução temporal (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const temporalEvolution = await Contact.findAll({
      where: {
        companyId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'created'],
        [fn('COUNT', literal('CASE WHEN "isPotential" = true THEN 1 END')), 'potential'],
        [fn('COUNT', literal('CASE WHEN "savedToPhone" = true THEN 1 END')), 'savedToPhone']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    return res.status(200).json({
      summary: {
        totalContacts: parseInt(String(totalStats[0]?.get('totalContacts') || 0)),
        potentialContacts: parseInt(String(totalStats[0]?.get('potentialContacts') || 0)),
        averageScore: parseFloat(String(totalStats[0]?.get('averageScore') || 0)),
        savedToPhone: parseInt(String(totalStats[0]?.get('savedToPhone') || 0)),
        withLid: parseInt(String(totalStats[0]?.get('withLid') || 0)),
        lidStability: {
          high: parseInt(String(totalStats[0]?.get('highStability') || 0)),
          medium: parseInt(String(totalStats[0]?.get('mediumStability') || 0)),
          low: parseInt(String(totalStats[0]?.get('lowStability') || 0))
        }
      },
      scoreDistribution: scoreDistribution.map(item => ({
        score: item.potentialScore,
        count: parseInt(String(item.get('count')))
      })),
      stabilityDistribution: stabilityDistribution.map(item => ({
        stability: item.lidStability,
        count: parseInt(String(item.get('count')))
      })),
      temporalEvolution: temporalEvolution.map(item => ({
        date: item.get('date'),
        created: parseInt(String(item.get('created'))),
        potential: parseInt(String(item.get('potential'))),
        savedToPhone: parseInt(String(item.get('savedToPhone')))
      }))
    });

  } catch (error) {
    logger.error("Error getting contact stats:", error);
    throw new AppError("ERR_GET_CONTACT_STATS", 500);
  }
};

export const getDeduplicationReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { limit = 50 } = req.query;

    // Buscar contatos com múltiplas correspondências (potencial duplicação)
    const duplicateAnalysis = await Contact.findAll({
      where: { companyId },
      attributes: ['number', 'lid', 'remoteJid', 'name', 'potentialScore', 'savedToPhone', 'lidStability', 'createdAt']
    });

    // Análise de duplicados (mesmo número com diferentes LIDs)
    const numberGroups: { [key: string]: any[] } = {};
    
    duplicateAnalysis.forEach(contact => {
      const cleanNumber = contact.number?.replace(/\D/g, '') || '';
      if (cleanNumber) {
        if (!numberGroups[cleanNumber]) {
          numberGroups[cleanNumber] = [];
        }
        numberGroups[cleanNumber].push(contact);
      }
    });

    // Identificar grupos com duplicação
    const duplicateGroups = Object.entries(numberGroups)
      .filter(([_, contacts]) => contacts.length > 1)
      .map(([number, contacts]) => ({
        number,
        contacts: contacts.map(c => ({
          id: c.id,
          name: c.name,
          lid: c.lid,
          remoteJid: c.remoteJid,
          potentialScore: c.potentialScore,
          savedToPhone: c.savedToPhone,
          lidStability: c.lidStability,
          createdAt: c.createdAt
        })),
        count: contacts.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(String(limit)));

    // Estatísticas de duplicação
    const totalNumbers = Object.keys(numberGroups).length;
    const duplicatedNumbers = duplicateGroups.length;
    const duplicateRate = totalNumbers > 0 ? (duplicatedNumbers / totalNumbers) * 100 : 0;

    // Contatos com LID instável
    const unstableLidContacts = await Contact.findAll({
      where: {
        companyId,
        lidStability: 'low',
        lid: { [Op.ne]: null }
      },
      limit: 20,
      order: [['potentialScore', 'DESC'], ['createdAt', 'DESC']]
    });

    return res.status(200).json({
      summary: {
        totalNumbers,
        duplicatedNumbers,
        duplicateRate: parseFloat(duplicateRate.toFixed(2)),
        totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0)
      },
      duplicateGroups,
      unstableLidContacts: unstableLidContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        lid: contact.lid,
        lidStability: contact.lidStability,
        potentialScore: contact.potentialScore,
        createdAt: contact.createdAt
      }))
    });

  } catch (error) {
    logger.error("Error getting deduplication report:", error);
    throw new AppError("ERR_GET_DEDUPLICATION_REPORT", 500);
  }
};

export const getSavingReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { period = '7d' } = req.query; // 7d, 30d, 90d

    // Calcular período
    let daysAgo = 7;
    if (period === '30d') daysAgo = 30;
    if (period === '90d') daysAgo = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Estatísticas de salvamento no período
    const savingStats = await Contact.findAll({
      where: {
        companyId,
        savedToPhone: true,
        savedToPhoneAt: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE', col('savedToPhoneAt')), 'date'],
        [fn('COUNT', col('id')), 'saved'],
        [fn('COUNT', literal('CASE WHEN "potentialScore" >= 7 THEN 1 END')), 'highPotential'],
        [fn('COUNT', literal('CASE WHEN "potentialScore" >= 5 AND "potentialScore" < 7 THEN 1 END')), 'mediumPotential'],
        [fn('COUNT', literal('CASE WHEN "potentialScore" < 5 THEN 1 END')), 'lowPotential']
      ],
      group: [fn('DATE', col('savedToPhoneAt'))],
      order: [[fn('DATE', col('savedToPhoneAt')), 'ASC']]
    });

    // Salvamentos recentes
    const recentSaves = await Contact.findAll({
      where: {
        companyId,
        savedToPhone: true,
        savedToPhoneAt: { [Op.gte]: startDate }
      },
      order: [['savedToPhoneAt', 'DESC']],
      limit: 50
    });

    // Taxa de conversão (potencial -> salvo)
    const totalPotential = await Contact.count({
      where: {
        companyId,
        isPotential: true,
        createdAt: { [Op.gte]: startDate }
      }
    });

    const totalSaved = await Contact.count({
      where: {
        companyId,
        savedToPhone: true,
        savedToPhoneAt: { [Op.gte]: startDate }
      }
    });

    const conversionRate = totalPotential > 0 ? (totalSaved / totalPotential) * 100 : 0;

    return res.status(200).json({
      period: {
        type: period,
        days: daysAgo,
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      summary: {
        totalPotential,
        totalSaved,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averagePerDay: parseFloat((totalSaved / daysAgo).toFixed(2))
      },
      dailyStats: savingStats.map(item => ({
        date: item.get('date'),
        saved: parseInt(String(item.get('saved'))),
        highPotential: parseInt(String(item.get('highPotential'))),
        mediumPotential: parseInt(String(item.get('mediumPotential'))),
        lowPotential: parseInt(String(item.get('lowPotential')))
      })),
      recentSaves: recentSaves.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        potentialScore: contact.potentialScore,
        savedToPhoneReason: contact.savedToPhoneReason,
        savedToPhoneAt: contact.savedToPhoneAt
      }))
    });

  } catch (error) {
    logger.error("Error getting saving report:", error);
    throw new AppError("ERR_GET_SAVING_REPORT", 500);
  }
};

export const getTopContacts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { type = 'potential', limit = 20 } = req.query;

    let contacts;
    let orderBy: any[] = [];

    switch (type) {
      case 'potential':
        contacts = await GetHighPotentialContacts(companyId, parseInt(String(limit)));
        break;
      case 'saved':
        contacts = await Contact.findAll({
          where: {
            companyId,
            savedToPhone: true
          },
          order: [['savedToPhoneAt', 'DESC'], ['potentialScore', 'DESC']],
          limit: parseInt(String(limit))
        });
        break;
      case 'recent':
        contacts = await Contact.findAll({
          where: { companyId },
          order: [['createdAt', 'DESC']],
          limit: parseInt(String(limit))
        });
        break;
      default:
        contacts = await GetHighPotentialContacts(companyId, parseInt(String(limit)));
    }

    return res.status(200).json({
      type,
      contacts: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        email: contact.email,
        potentialScore: contact.potentialScore,
        isPotential: contact.isPotential,
        savedToPhone: contact.savedToPhone,
        savedToPhoneAt: contact.savedToPhoneAt,
        savedToPhoneReason: contact.savedToPhoneReason,
        lidStability: contact.lidStability,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }))
    });

  } catch (error) {
    logger.error("Error getting top contacts:", error);
    throw new AppError("ERR_GET_TOP_CONTACTS", 500);
  }
};

export const exportData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { format = 'json' } = req.query;

    const contacts = await Contact.findAll({
      where: { companyId },
      attributes: [
        'id', 'name', 'number', 'email', 'potentialScore', 'isPotential',
        'savedToPhone', 'savedToPhoneAt', 'savedToPhoneReason',
        'lid', 'lidStability', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Converter para CSV
      const csvHeader = 'ID,Nome,Numero,Email,Score,É Potencial,Salvo no Celular,Data Salvamento,Motivo,LID,Estabilidade LID,Criação,Atualização\n';
      const csvData = contacts.map(contact => 
        `${contact.id},"${contact.name || ''}","${contact.number}","${contact.email || ''}",${contact.potentialScore},${contact.isPotential},${contact.savedToPhone},"${contact.savedToPhoneAt || ''}","${contact.savedToPhoneReason || ''}","${contact.lid || ''}","${contact.lidStability || ''}","${contact.createdAt}","${contact.updatedAt}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="contacts_${companyId}.csv"`);
      return res.send(csvHeader + csvData);
    }

    // Default: JSON
    return res.status(200).json({
      total: contacts.length,
      exportedAt: new Date().toISOString(),
      contacts
    });

  } catch (error) {
    logger.error("Error exporting contact data:", error);
    throw new AppError("ERR_EXPORT_CONTACT_DATA", 500);
  }
};
