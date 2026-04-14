import { Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import CompaniesSettings from "../models/CompaniesSettings";
import { getIO } from "../libs/socket";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import { GetContactStats, GetHighPotentialContacts } from "../services/ContactServices/ContactScoringService";
import { GetPhoneSavingStats, BatchSaveContactsToPhone } from "../services/ContactServices/ContactPhoneService";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;

    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    if (!settings) {
      // Criar configurações padrão se não existir
      const defaultSettings = await CompaniesSettings.create({
        companyId,
        autoSaveContacts: "disabled",
        autoSaveContactsScore: 7,
        autoSaveContactsReason: "high_potential"
      });

      return res.status(200).json({
        autoSaveContacts: defaultSettings.autoSaveContacts,
        autoSaveContactsScore: defaultSettings.autoSaveContactsScore,
        autoSaveContactsReason: defaultSettings.autoSaveContactsReason
      });
    }

    return res.status(200).json({
      autoSaveContacts: settings.autoSaveContacts,
      autoSaveContactsScore: settings.autoSaveContactsScore,
      autoSaveContactsReason: settings.autoSaveContactsReason
    });

  } catch (error) {
    logger.error("Error getting contact settings:", error);
    throw new AppError("ERR_GET_CONTACT_SETTINGS", 500);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const {
      autoSaveContacts,
      autoSaveContactsScore,
      autoSaveContactsReason
    } = req.body;

    logger.info("=== UPDATE CONTACT SETTINGS START ===");
    logger.info("Request body:", {
      autoSaveContacts,
      autoSaveContactsScore,
      autoSaveContactsReason,
      companyId
    });

    // Validações
    if (autoSaveContacts && !["disabled", "enabled", "all", "important"].includes(autoSaveContacts)) {
      throw new AppError("Invalid autoSaveContacts value", 400);
    }

    if (autoSaveContactsScore && (autoSaveContactsScore < 0 || autoSaveContactsScore > 10)) {
      throw new AppError("autoSaveContactsScore must be between 0 and 10", 400);
    }

    if (autoSaveContactsReason && !["high_potential", "message_analysis", "business_hours"].includes(autoSaveContactsReason)) {
      throw new AppError("Invalid autoSaveContactsReason value", 400);
    }

    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    if (!settings) {
      // Criar se não existir
      const newSettings = await CompaniesSettings.create({
        companyId,
        autoSaveContacts: autoSaveContacts || "enabled",
        autoSaveContactsScore: autoSaveContactsScore || 7,
        autoSaveContactsReason: autoSaveContactsReason || "high_potential"
      });
    } else {
      // Atualizar se existir
      logger.info("Updating existing settings");
      await settings.update({
        autoSaveContacts: autoSaveContacts,
        autoSaveContactsScore: autoSaveContactsScore,
        autoSaveContactsReason: autoSaveContactsReason
      });
      logger.info("Settings updated in database");
    }

    // Emitir evento para atualização em tempo real
    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-contactSettings`, {
      action: "update",
      settings: {
        autoSaveContacts,
        autoSaveContactsScore,
        autoSaveContactsReason
      }
    });

    logger.info(`Contact settings updated for company ${companyId}`);

    // Retornar o objeto settings completo atualizado
    const updatedSettings = await CompaniesSettings.findOne({
      where: { companyId }
    });
    
    logger.info("Updated settings from database:", updatedSettings?.get());

    return res.status(200).json({
      message: "Settings updated successfully",
      settings: updatedSettings
    });

  } catch (error) {
    logger.error("Error updating contact settings:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_UPDATE_CONTACT_SETTINGS", 500);
  }
};

export const getStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;

    // Buscar configurações da empresa
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    // Buscar estatísticas de contatos
    const contactStats = await GetContactStats(companyId);

    // Buscar estatísticas de salvamento no celular
    const phoneStats = await GetPhoneSavingStats(companyId);

    // Buscar contatos de alto potencial
    const highPotentialContacts = await GetHighPotentialContacts(companyId, 10);

    return res.status(200).json({
      settings: {
        autoSaveContacts: settings?.autoSaveContacts || "disabled",
        autoSaveContactsScore: settings?.autoSaveContactsScore || 7,
        autoSaveContactsReason: settings?.autoSaveContactsReason || "high_potential"
      },
      contactStats,
      phoneStats,
      highPotentialContacts: highPotentialContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        potentialScore: contact.potentialScore,
        isPotential: contact.isPotential,
        savedToPhone: contact.savedToPhone,
        createdAt: contact.createdAt
      }))
    });

  } catch (error) {
    logger.error("Error getting contact stats:", error);
    throw new AppError("ERR_GET_CONTACT_STATS", 500);
  }
};

export const batchSaveToPhone = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      throw new AppError("contactIds must be an array", 400);
    }

    if (contactIds.length === 0) {
      throw new AppError("contactIds cannot be empty", 400);
    }

    if (contactIds.length > 100) {
      throw new AppError("Maximum 100 contacts per batch", 400);
    }

    // Buscar contatos
    const contacts = await Contact.findAll({
      where: {
        id: contactIds,
        companyId,
        savedToPhone: false // Apenas contatos não salvos
      }
    });

    if (contacts.length === 0) {
      return res.status(200).json({
        message: "No contacts to save (all already saved or not found)",
        success: 0,
        failed: 0
      });
    }

    // Obter whatsappId padrão usando método padrão do sistema
    const defaultWhatsapp = await Whatsapp.findOne({
      where: {
        companyId,
        isDefault: true
      }
    });

    if (!defaultWhatsapp) {
      throw new AppError("No default WhatsApp connection found", 400);
    }

    const whatsappId = defaultWhatsapp.id;

    // Salvar contatos em lote
    const result = await BatchSaveContactsToPhone(contacts, whatsappId, companyId);

    logger.info(`Batch save completed for company ${companyId}: ${result.success} success, ${result.failed} failed`);

    return res.status(200).json({
      message: "Batch save completed",
      success: result.success,
      failed: result.failed,
      total: contacts.length
    });

  } catch (error) {
    logger.error("Error in batch save to phone:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_BATCH_SAVE_TO_PHONE", 500);
  }
};

export const testConfiguration = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { testMessage } = req.body;

    if (!testMessage) {
      throw new AppError("testMessage is required", 400);
    }

    // Importar CalculatePotentialScore para teste
    const { CalculatePotentialScore } = await import("../services/ContactServices/ContactScoringService");
    
    const score = CalculatePotentialScore(testMessage);
    const isPotential = score >= 5;

    // Buscar configurações atuais
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    const wouldSave = settings?.autoSaveContacts === "enabled" && score >= (settings?.autoSaveContactsScore || 7);

    return res.status(200).json({
      testMessage,
      score,
      isPotential,
      wouldSave,
      currentSettings: {
        autoSaveContacts: settings?.autoSaveContacts || "enabled",
        autoSaveContactsScore: settings?.autoSaveContactsScore || 7,
        autoSaveContactsReason: settings?.autoSaveContactsReason || "high_potential"
      }
    });

  } catch (error) {
    logger.error("Error testing configuration:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_TEST_CONFIGURATION", 500);
  }
};

export const resetSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;

    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    if (!settings) {
      throw new AppError("Settings not found", 404);
    }

    // Resetar para valores padrão
    await settings.update({
      autoSaveContacts: "enabled",
      autoSaveContactsScore: 7,
      autoSaveContactsReason: "high_potential"
    });

    // Emitir evento de atualização
    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-contactSettings`, {
      action: "reset",
      settings: {
        autoSaveContacts: "enabled",
        autoSaveContactsScore: 7,
        autoSaveContactsReason: "high_potential"
      }
    });

    logger.info(`Contact settings reset for company ${companyId}`);

    return res.status(200).json({
      message: "Settings reset to default values",
      autoSaveContacts: "enabled",
      autoSaveContactsScore: 7,
      autoSaveContactsReason: "high_potential"
    });

  } catch (error) {
    logger.error("Error resetting contact settings:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_RESET_CONTACT_SETTINGS", 500);
  }
};
