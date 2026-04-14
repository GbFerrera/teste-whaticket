import { Op } from "sequelize";
import Contact from "../../models/Contact";
import logger from "../../utils/logger";
import {
  resolveContactNumber,
  sanitizeRemoteJid,
  buildRemoteJidFromNumber
} from "../../helpers/normalizeContactNumber";

const BATCH_SIZE = 200;

const buildWhereClause = () => ({
  [Op.or]: [
    { remoteJid: { [Op.like]: "%@lid%" } },
    { isLid: true },
    { number: { [Op.like]: "%:%" } },
    { number: { [Op.like]: "%@%" } },
    { number: { [Op.like]: "% %%" } }
  ]
});

const sanitizeContact = async (contact: Contact) => {
  const normalizedNumber =
    resolveContactNumber({
      rawNumber: contact.number,
      remoteJid: contact.remoteJid,
      remoteJidAlt: contact.remoteJid
    }) || contact.number?.replace(/\D/g, "");

  if (!normalizedNumber) {
    logger.warn(
      `[cleanLidContacts] Ignorando contato ${contact.id} — não foi possível extrair número válido`,
      { remoteJid: contact.remoteJid }
    );
    return { updated: false };
  }

  const sanitizedRemoteJid =
    sanitizeRemoteJid(contact.remoteJid, normalizedNumber, contact.isGroup) ||
    buildRemoteJidFromNumber(normalizedNumber, contact.isGroup);

  let hasChanges = false;

  if (contact.number !== normalizedNumber) {
    contact.number = normalizedNumber;
    hasChanges = true;
  }

  if (sanitizedRemoteJid && contact.remoteJid !== sanitizedRemoteJid) {
    contact.remoteJid = sanitizedRemoteJid;
    hasChanges = true;
  }

  if (contact.isLid) {
    contact.isLid = false;
    hasChanges = true;
  }

  if (hasChanges) {
    await contact.save();
  }

  return { updated: hasChanges };
};

export const runCleanLidContacts = async (): Promise<void> => {
  logger.info("[cleanLidContacts] Iniciando saneamento de contatos com @lid");
  let offset = 0;
  let updatedCount = 0;
  let processed = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const contacts = await Contact.findAll({
      where: buildWhereClause(),
      limit: BATCH_SIZE,
      offset,
      order: [["id", "ASC"]]
    });

    if (contacts.length === 0) {
      break;
    }

    for (const contact of contacts) {
      const { updated } = await sanitizeContact(contact);
      if (updated) {
        updatedCount += 1;
      }
    }

    processed += contacts.length;
    offset += BATCH_SIZE;
    logger.info(`[cleanLidContacts] Processados ${processed} contatos...`);
  }

  logger.info(
    `[cleanLidContacts] Finalizado! Contatos analisados: ${processed}. Contatos atualizados: ${updatedCount}.`
  );
};
