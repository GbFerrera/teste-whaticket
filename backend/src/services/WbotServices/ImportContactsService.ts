import * as Sentry from "@sentry/node";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import logger from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";
import { isString, isArray } from "lodash";
import path from "path";
import fs from 'fs';

const ImportContactsService = async (companyId?: number, whatsappId?: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(whatsappId, companyId);
  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    logger.info(`🔄 Buscando contatos do WhatsApp ${wbot.id}...`);
    
    // **Buscar contatos do banco Baileys (salvos pelo evento contacts.upsert)**
    const baileysData = await ShowBaileysService(wbot.id);
    
    if (!baileysData.contacts) {
      logger.warn(`No contacts found in Baileys data for whatsapp ${wbot.id}`);
      logger.error('❌ Nenhum contato encontrado!');
      logger.error('💡 Os contatos são sincronizados automaticamente quando você conecta o WhatsApp.');
      logger.error('💡 Se acabou de conectar, aguarde alguns minutos e tente novamente.');
      return;
    }
    
    // **CORREÇÃO: Verificar se contacts é JSONB (objeto) ou STRING**
    let contactsData = baileysData.contacts;
    
    // Se for string, fazer parse
    if (typeof contactsData === 'string') {
      const contactsString = contactsData.trim();
      if (contactsString === '' || contactsString === 'null' || contactsString === 'undefined') {
        logger.warn(`Contacts field is empty string for whatsapp ${wbot.id}`);
        logger.error('❌ Campo de contatos está vazio!');
        return;
      }
      
      try {
        phoneContacts = JSON.parse(contactsString);
      } catch (parseError) {
        logger.error(`Failed to parse contacts JSON for whatsapp ${wbot.id}: ${parseError}`);
        return;
      }
    } else {
      // Se já for objeto/array (JSONB), usar diretamente
      phoneContacts = contactsData;
    }
    
    // Validar se é array
    if (!Array.isArray(phoneContacts)) {
      logger.warn(`Contacts is not an array for whatsapp ${wbot.id}`);
      logger.warn(`Contacts type: ${typeof phoneContacts}`);
      return;
    }
    
    if (phoneContacts.length === 0) {
      logger.warn(`No contacts in array for whatsapp ${wbot.id}`);
      logger.error('❌ Nenhum contato encontrado no array!');
      return;
    }
    
    logger.info(`📋 ${phoneContacts.length} contatos encontrados no Baileys`);

    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const beforeFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_antes.txt');
    fs.writeFile(beforeFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
      if (err) {
        logger.error(`Failed to write contacts to file: ${err}`);
        throw err;
      }
      // console.log('O arquivo contatos_antes.txt foi criado!');
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
    // **CORREÇÃO: Retornar early se falhar ao buscar contatos**
    return;
  }

  // **CORREÇÃO: Verificar se phoneContacts existe antes de usar**
  if (!phoneContacts) {
    logger.warn('phoneContacts is undefined, skipping import');
    return;
  }

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const afterFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_depois.txt');
  fs.writeFile(afterFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
    if (err) {
      logger.error(`Failed to write contacts to file: ${err}`);
      throw err;
    }
    // console.log('O arquivo contatos_depois.txt foi criado!');
  });

  const phoneContactsList = isString(phoneContacts)
    ? JSON.parse(phoneContacts)
    : phoneContacts;

  if (isArray(phoneContactsList)) {
    phoneContactsList.forEach(async ({ id, name, notify }) => {
      if (id === "status@broadcast" || id.includes("g.us")) return;
      const number = id.replace(/\D/g, "");

      const existingContact = await Contact.findOne({
        where: { number, companyId }
      });

      if (existingContact) {
        // Atualiza o nome do contato existente
        existingContact.name = name || notify;
        await existingContact.save();
      } else {
        // Criar um novo contato
        try {
          await CreateContactService({
            number,
            name: name || notify,
            companyId
          });
        } catch (error) {
          Sentry.captureException(error);
          logger.warn(
            `Could not get whatsapp contacts from phone. Err: ${error}`
          );
        }
      }
    });
  }
};

export default ImportContactsService;