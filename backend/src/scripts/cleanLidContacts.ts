import "../bootstrap";
import "../database";

import { runCleanLidContacts } from "../services/ContactServices/CleanLidContactsRunner";
import logger from "../utils/logger";

runCleanLidContacts().then(() => {
  process.exit(0);
}).catch(err => {
  logger.error("[cleanLidContacts] Erro ao processar contatos", err);
  process.exit(1);
});
