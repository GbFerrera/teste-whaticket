// @ts-nocheck
import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import fs from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import { isNil } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import * as Sentry from "@sentry/node";
import { Op } from "sequelize";
import syncContactToLead from "../CrmLeadService/helpers/syncContactToLead";
import relinkContactToExistingRecords from "./relinkContactToExistingRecords";
import {
  buildRemoteJidFromNumber,
  normalizePhoneNumber,
  resolveContactNumber,
  sanitizeRemoteJid
} from "../../helpers/normalizeContactNumber";
import { FindDuplicateContact, MergeContacts } from "./ContactDeduplicationService";
import { CalculatePotentialScore, UpdateContactScore } from "./ContactScoringService";

const axios = require('axios');

// Função local para detectar LID (Linked ID) do WhatsApp Business API
// LIDs geralmente começam com 120 e têm 15+ dígitos
const isLidNumber = (digits: string): boolean => {
  if (!digits) return false;
  if (digits.startsWith("120") && digits.length >= 15) {
    return true;
  }
  if (digits.length > 15) {
    return true;
  }
  return false;
};

const TEMP_LID_PREFIX = "lid-";
const TEMP_RANDOM_PREFIX = "temp-";

const extractLidDigits = (jid?: string | null): string => {
  if (!jid || !jid.includes("@lid")) return "";
  const [lidValue] = jid.split("@");
  return (lidValue || "").replace(/\D/g, "");
};

const buildTempNumberFromLid = (lidDigits: string): string =>
  `${TEMP_LID_PREFIX}${lidDigits}`;

const isTemporaryNumber = (value?: string | null): boolean =>
  Boolean(value && (value.startsWith(TEMP_LID_PREFIX) || value.startsWith(TEMP_RANDOM_PREFIX)));

const isRealPhoneNumber = (value?: string | null): boolean => {
  if (!value || isTemporaryNumber(value)) return false;
  const digits = value.replace(/\D/g, "");
  if (!digits) return false;
  return !isLidNumber(digits);
};

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  remoteJidAlt?: string;
  whatsappId?: number;
  wbot?: any;
  lid?: string;
  addressingMode?: string;
  msgBody?: string;
}

const downloadProfileImage = async ({
  profilePicUrl,
  companyId,
  contact
}) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.chmodSync(folder, 0o777);
  }

  try {
    const response = await axios.get(profilePicUrl, {
      responseType: 'arraybuffer'
    });

    const filename = `${new Date().getTime()}.jpeg`;
    fs.writeFileSync(join(folder, filename), response.data);
    return filename;
  } catch (error) {
    logger.error("Error downloading profile image:", error);
    return null;
  }
};

const DEFAULT_FALLBACK_NAME = "Contato sem nome";

const sanitizeName = (value?: string | null): string => (value || "").trim();

const hasMeaningfulName = (
  value?: string | null,
  referenceNumber?: string | null,
  referenceLid?: string | null
): boolean => {
  const normalized = sanitizeName(value);
  if (!normalized) return false;
  if (referenceNumber && normalized === referenceNumber) return false;
  if (referenceLid && normalized === referenceLid) return false;
  if (/^lid[-\s]?/i.test(normalized)) return false;
  return true;
};

const ensureFallbackName = async (contact: Contact): Promise<void> => {
  if (!hasMeaningfulName(contact.name, contact.number, contact.lid)) {
    const fallbackName = `${DEFAULT_FALLBACK_NAME} ${contact.id}`;
    if (contact.name !== fallbackName) {
      contact.name = fallbackName;
      await contact.save();
    }
  }
};

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = [],
  remoteJid = "",
  remoteJidAlt,
  whatsappId,
  wbot,
  lid,
  addressingMode,
  msgBody
}: Request): Promise<Contact> => {
  logger.info("=== CREATE OR UPDATE CONTACT SERVICE START ===");
  logger.info("Input data:", { rawNumber, remoteJid, remoteJidAlt, name, lid, addressingMode });
  
  try {
    let createContact = false;
    const sanitizedIncomingName = sanitizeName(name);
    const incomingNameIsMeaningful = hasMeaningfulName(
      sanitizedIncomingName,
      rawNumber,
      lid
    );
    
    // Prioriza remoteJidAlt (número real) sobre remoteJid (pode ser LID)
    let number = resolveContactNumber({
      rawNumber,
      remoteJid,
      remoteJidAlt,
      isGroup  // Passar isGroup para resolver ID do grupo corretamente
    });

    const remoteLidDigits = extractLidDigits(remoteJid);
    const remoteAltLidDigits = extractLidDigits(remoteJidAlt);
    
    // Se não conseguiu resolver o número e temos um rawNumber que parece LID,
    // usa o rawNumber temporariamente mas marca como LID
    const rawDigits = rawNumber ? rawNumber.replace(/\D/g, "") : "";
    const isRawLid = isLidNumber(rawDigits);
    
    const bestLidDigits = remoteLidDigits || remoteAltLidDigits || (isRawLid ? rawDigits : "");

    if (!number && bestLidDigits) {
      logger.warn(`Contact identified only by LID: ${bestLidDigits}`);
      number = buildTempNumberFromLid(bestLidDigits);
    }

    if (!number) {
      number = `${TEMP_RANDOM_PREFIX}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    
    const io = getIO();
    
    // **CORREÇÃO: Para grupos, usar remoteJid original sem sanitizar**
    let sanitizedRemoteJid: string;
    if (isGroup) {
      sanitizedRemoteJid = remoteJid || remoteJidAlt || "";
      logger.info(`[GRUPO] Usando remoteJid original sem sanitizar: ${sanitizedRemoteJid}`);
    } else {
      const jidToSanitize = remoteJidAlt || remoteJid;
      sanitizedRemoteJid = sanitizeRemoteJid(jidToSanitize, number, isGroup);
    }

    // Se o remoteJid é um LID (pelo sufixo ou pelo número), verifica se já existe contato com esse LID no banco
    const remoteJidDigits = remoteJid ? remoteJid.replace(/\D/g, "") : "";
    const isLidJid = (remoteJid && remoteJid.includes("@lid")) || isLidNumber(remoteJidDigits);
    let contact: Contact | null = null;

    if (isLidJid) {
      // Primeiro tenta encontrar pelo LID
      contact = await Contact.findOne({
        where: {
          companyId,
          [Op.or]: [
            { remoteJid },
            { lid: remoteJid.split("@")[0] }
          ]
        }
      });

      if (contact) {
        logger.info(`Found existing contact by LID: ${contact.id}, updating with real number: ${number}`);
      }
    }

    // Se não encontrou pelo LID, busca por número ou remoteJidAlt
    if (!contact) {
      
      const orConditions: any[] = [];
      
      // Busca pelo número normalizado
      if (number) {
        orConditions.push({ number });
        orConditions.push({ number: number.replace(/^55/, "") });
      }
      
      // Busca pelo remoteJidAlt
      if (remoteJidAlt) {
        orConditions.push({ remoteJid: remoteJidAlt });
      }
      
      // Busca pelo remoteJid se não for LID
      if (remoteJid && !isLidJid) {
        orConditions.push({ remoteJid });
      }
      
      // Busca por contatos que foram criados com o número LID incorretamente
      if (isRawLid) {
        orConditions.push({ number: rawDigits });
        logger.info(`Also searching for contact with LID number: ${rawDigits}`);
      }
      
      if (orConditions.length > 0) {
        contact = await Contact.findOne({
          where: {
            companyId,
            [Op.or]: orConditions
          }
        });
      }
    }

    if (contact && isRealPhoneNumber(number)) {
      const duplicateContact = await Contact.findOne({
        where: {
          companyId,
          number,
          id: {
            [Op.ne]: contact.id
          }
        }
      });

      if (duplicateContact) {
        logger.warn(
          `Merging contact ID ${contact.id} (LID) into existing contact ID ${duplicateContact.id} with number ${number}`
        );

        if (bestLidDigits && (!duplicateContact.lid || duplicateContact.lid !== bestLidDigits)) {
          duplicateContact.lid = bestLidDigits;
        }

        if (
          sanitizedRemoteJid &&
          !sanitizedRemoteJid.includes("@lid") &&
          sanitizedRemoteJid !== duplicateContact.remoteJid
        ) {
          duplicateContact.remoteJid = sanitizedRemoteJid;
        }

        if (
          profilePicUrl &&
          profilePicUrl !== "" &&
          !profilePicUrl.includes("nopicture.png") &&
          profilePicUrl !== duplicateContact.profilePicUrl
        ) {
          duplicateContact.profilePicUrl = profilePicUrl;
        }

        if (name && name !== number && name !== duplicateContact.name) {
          duplicateContact.name = name;
        }

        if (addressingMode && !duplicateContact.addressingMode) {
          duplicateContact.addressingMode = addressingMode;
        }

        if (!duplicateContact.whatsappId && whatsappId) {
          duplicateContact.whatsappId = whatsappId;
        }

        duplicateContact.isLid = false;
        await duplicateContact.save();

        contact = duplicateContact;
      }
    }

    if (contact) {
      logger.info(`Updating existing contact ID: ${contact.id}, current number: ${contact.number}`);
      
      // Verifica se o número atual do contato é um LID
      const currentNumberIsLid = isLidNumber(contact.number || "");
      const newNumberIsReal = isRealPhoneNumber(number);
      
      // Atualiza o número se:
      // 1. O número atual é um LID e temos um número real
      // 2. Ou se o número é diferente e não é um LID
      if ((currentNumberIsLid && newNumberIsReal) || (number !== contact.number && !isLidNumber(number))) {
        logger.info(`Updating contact number from ${contact.number} to ${number}`);
        contact.number = number;
      }
      
      if (profilePicUrl && profilePicUrl !== "" && !profilePicUrl.includes("nopicture.png")) {
        contact.profilePicUrl = profilePicUrl;
      }
      
      if (incomingNameIsMeaningful && sanitizedIncomingName !== contact.name) {
        contact.name = sanitizedIncomingName;
      }
      
      // Prioriza remoteJidAlt (número real) para o remoteJid salvo
      if (sanitizedRemoteJid && sanitizedRemoteJid !== contact.remoteJid && !sanitizedRemoteJid.includes("@lid")) {
        contact.remoteJid = sanitizedRemoteJid;
        logger.info(`Updated remoteJid to: ${sanitizedRemoteJid}`);
      }
      
      // **CORREÇÃO ESPECÍFICA PARA GRUPOS: Atualizar temp- para remoteJid real**
      if (isGroup && remoteJid && !remoteJid.startsWith("temp-") && contact.remoteJid !== remoteJid) {
        logger.info(`[GRUPO] Atualizando remoteJid de ${contact.remoteJid} para ${remoteJid}`);
        contact.remoteJid = remoteJid;
      }
      
      // **CORREÇÃO: Atualizar número do grupo também se estiver com temp-**
      if (isGroup && number && !number.startsWith("temp-") && contact.number !== number) {
        // Verificar se outro contato já tem esse número
        const existingContactWithNumber = await Contact.findOne({
          where: {
            companyId,
            number,
            id: { [Op.ne]: contact.id }
          }
        });
        
        if (existingContactWithNumber) {
          logger.warn(`[GRUPO] Número ${number} já existe no contato ${existingContactWithNumber.id}. Fazendo merge...`);
          contact = await MergeContacts({
            originalContact: existingContactWithNumber,
            duplicateContact: contact,
            companyId
          });
          // **IMPORTANTE: Após merge, não tentar atualizar o contato novamente**
          // O contato agora é o original (existingContactWithNumber), então retornamos
          logger.info(`[GRUPO] Merge completo. Usando contato ${contact.id} (já atualizado)`);
          
          // Emite evento para o contato mergeado
          io.of(String(companyId)).emit(`company-${companyId}-contact`, {
            action: "update",
            contact
          });
          
          await syncContactToLead({ contact, companyId });
          await ensureFallbackName(contact);
          
          logger.info("=== CREATE OR UPDATE CONTACT SERVICE END (after merge) ===");
          return contact;
        } else {
          logger.info(`[GRUPO] Atualizando number de ${contact.number} para ${number}`);
          contact.number = number;
        }
      }
      
      // Salva o LID original para referência futura
      if (bestLidDigits && contact.lid !== bestLidDigits) {
        contact.lid = bestLidDigits;
      }
      
      if (lid) {
        contact.lid = lid;
      }
      
      if (addressingMode) {
        contact.addressingMode = addressingMode;
      }

      await contact.save();
      logger.info(`Contact ${contact.id} updated`);
    } else {
      // Cria novo contato
      const settings = await CompaniesSettings.findOne({ where: { companyId } });
      const { acceptAudioMessageContact } = settings;
      
      let profileUrl = profilePicUrl || `${process.env.FRONTEND_URL}/nopicture.png`;
      
      if (!profileUrl && wbot && ['whatsapp'].includes(channel)) {
        try {
          profileUrl = await wbot.profilePictureUrl(remoteJid, "image");
        } catch (e) {
          Sentry.captureException(e);
          profileUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
        }
      }

      // **CORREÇÃO: Para grupos, usar remoteJid original sem sanitizar**
      let newRemoteJid: string;
      if (isGroup) {
        newRemoteJid = remoteJid || remoteJidAlt || buildRemoteJidFromNumber(number, isGroup);
        logger.info(`[GRUPO - NOVO CONTATO] Usando remoteJid: ${newRemoteJid}`);
      } else {
        const jidToSanitize = remoteJidAlt || remoteJid;
        newRemoteJid = sanitizeRemoteJid(jidToSanitize, number, isGroup) || buildRemoteJidFromNumber(number, isGroup);
      }
      
      // Salva o LID original para referência futura
      const lidToSave = isLidJid ? remoteJidDigits : lid;

      const initialName = incomingNameIsMeaningful ? sanitizedIncomingName : DEFAULT_FALLBACK_NAME;

      logger.info("Creating new contact:", { name: initialName, number, newRemoteJid, lid: lidToSave, addressingMode });
      
      contact = await Contact.create({
        name: initialName,
        number,
        email,
        isGroup,
        companyId,
        channel,
        acceptAudioMessage: acceptAudioMessageContact === 'enabled',
        remoteJid: newRemoteJid,
        profilePicUrl: profileUrl,
        urlPicture: "",
        whatsappId,
        lid: lidToSave,
        addressingMode,
        // Campos novos para deduplicação e scoring
        potentialScore: 0,
        isPotential: false,
        savedToPhone: false,
        lidStability: "unknown"
      });

      createContact = true;
      logger.info(`Contact ${contact.id} created`);
    }

    // Download imagem de perfil se necessário
    if (profilePicUrl && profilePicUrl !== "" && !profilePicUrl.includes("nopicture.png")) {
      const filename = await downloadProfileImage({
        profilePicUrl,
        companyId,
        contact
      });

      if (filename) {
        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });
      }
    }

    // 🔍 Verificar duplicação ANTES de emitir eventos
    if (contact) {
      // Buscar contatos duplicados
      const duplicate = await FindDuplicateContact({
        number: contact.number,
        lid: contact.lid,
        remoteJid: contact.remoteJid,
        companyId,
        excludeId: contact.id
      });
      
      // Se encontrou duplicado, fazer merge
      if (duplicate && duplicate.id !== contact.id) {
        logger.warn(`Duplicate contact found: ${duplicate.id}, merging...`);
        contact = await MergeContacts({
          originalContact: duplicate,
          duplicateContact: contact,
          companyId
        });
      }
      
      // 📊 Calcular score se tiver mensagem
      if (msgBody && typeof msgBody === 'string') {
        const score = CalculatePotentialScore(msgBody);
        await contact.update({
          potentialScore: score,
          isPotential: score >= 5
        });
        logger.info(`Contact ${contact.id} score updated: ${score}`);
      }
    }

    // Emite evento
    io.of(String(companyId)).emit(`company-${companyId}-contact`, {
      action: createContact ? "create" : "update",
      contact
    });

    // Cria lead se necessário
    await syncContactToLead({ contact, companyId });

    await ensureFallbackName(contact);

    logger.info("=== CREATE OR UPDATE CONTACT SERVICE END ===");
    return contact;
  } catch (error) {
    logger.error("CreateOrUpdateContactService error:", error);
    throw error;
  }
};

export default CreateOrUpdateContactService;